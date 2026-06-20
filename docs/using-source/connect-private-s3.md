---
title: Connect a Private S3 Bucket
id: connect-private-s3
slug: /connect-private-s3
sidebar_position: 4
---

:::info Beta
Federated backends are rolling out. Source provisions your data connection and
gives you its **connection ID**; you create the AWS resources below and send the
**role ARN** back. To get started, contact [hello@source.coop](mailto:hello@source.coop).
:::

Source can serve data from a **private** S3 bucket you own — without ever holding
your bucket credentials. Instead of handing Source long-lived access keys, you
create an IAM role that the Source data proxy assumes on demand via OpenID
Connect (OIDC) federation. Source stores only the role's ARN; there is no secret
at rest, on either side.

## How it works

1. The Source data proxy (`https://data.source.coop`) is an OIDC identity provider.
2. When a request needs your bucket, the proxy mints a short-lived OIDC token
   whose **subject** identifies the Source connection, account, and product.
3. The proxy calls `sts:AssumeRoleWithWebIdentity` on your role. Your role's
   **trust policy** decides whether to allow it; its **permission policy** caps
   what it can read.
4. AWS returns temporary, prefix-scoped credentials that the proxy uses to read
   your objects. Nothing long-lived is stored.

You stay in control: the trust policy says *who* (which Source connection) may
assume the role, and the permission policy says *what* (which bucket and prefix)
they may read.

## What you'll need

- An AWS account containing the private S3 bucket.
- Your **connection ID** from Source (for example, `acme-private`). If you have
  admin access to the connection in Source, it's shown on the connection's page
  along with the exact subject pattern; otherwise Source provides it.
- The bucket name and the key prefix Source should read under.

## The federation contract

The proxy presents these values; your AWS resources must match them exactly.

| Field | Value |
| --- | --- |
| OIDC provider URL (issuer) | `https://data.source.coop` |
| Audience (`aud`) | `source-coop-data-proxy` |
| Subject (`sub`) | `scv1:conn:<connection-id>:<account>/<product>` |

Because the subject is product-grained, your trust policy matches it with a
wildcard at the connection level: `scv1:conn:<connection-id>:*`. This lets the
proxy assume the role for any product served by that one connection, and nothing
else.

## Step 1 — Create the OIDC identity provider

You need exactly **one** OIDC provider for `https://data.source.coop` per AWS
account, no matter how many buckets you connect. The CLI and console retrieve the
TLS thumbprint automatically:

```bash
aws iam create-open-id-connect-provider \
  --url https://data.source.coop \
  --client-id-list source-coop-data-proxy
```

This returns the provider ARN
(`arn:aws:iam::<account-id>:oidc-provider/data.source.coop`), which you'll
reference below. If the provider already exists, reuse it.

## Step 2 — Create the IAM role

Create a role with the **trust policy** below. Replace `<ACCOUNT_ID>` with your
AWS account ID and `<CONNECTION_ID>` with your Source connection ID.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<ACCOUNT_ID>:oidc-provider/data.source.coop"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "data.source.coop:aud": "source-coop-data-proxy"
        },
        "StringLike": {
          "data.source.coop:sub": "scv1:conn:<CONNECTION_ID>:*"
        }
      }
    }
  ]
}
```

Attach a **permission policy** scoping read access to your bucket and prefix.
Replace `<BUCKET>` and `<PREFIX>` (leave `<PREFIX>` empty to allow the whole
bucket). This is your blast-radius cap — Source can never read outside it.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ListBucketPrefix",
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::<BUCKET>",
      "Condition": { "StringLike": { "s3:prefix": "<PREFIX>*" } }
    },
    {
      "Sid": "GetObjects",
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::<BUCKET>/<PREFIX>*"
    }
  ]
}
```

## Step 3 — Give Source the role ARN

Send the role ARN to Source. If you manage the connection yourself, paste it into
the connection's **Role ARN** field in the admin UI. Source fills in the rest;
no key or secret is ever exchanged.

## Infrastructure as code

Both templates create the IAM role and its policies, parameterized by connection
ID, bucket, and prefix.

### CloudFormation

This template creates the role and takes the OIDC provider ARN from Step 1 as a
parameter (so the provider — one per account — is managed separately).

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Description: IAM role for Source Cooperative federated read access to a private S3 bucket.

Parameters:
  ConnectionId:
    Type: String
    Description: Your Source data connection ID (provided by Source).
  BucketName:
    Type: String
    Description: The private S3 bucket Source should read.
  Prefix:
    Type: String
    Default: ""
    Description: Key prefix Source may read under (leave blank for the whole bucket).
  OidcProviderArn:
    Type: String
    Description: ARN of the data.source.coop OIDC provider in this account (see Step 1).

Resources:
  SourceFederatedRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Effect: Allow
            Principal:
              Federated: !Ref OidcProviderArn
            Action: sts:AssumeRoleWithWebIdentity
            Condition:
              StringEquals:
                "data.source.coop:aud": "source-coop-data-proxy"
              StringLike:
                "data.source.coop:sub": !Sub "scv1:conn:${ConnectionId}:*"
      Policies:
        - PolicyName: SourceReadAccess
          PolicyDocument:
            Version: "2012-10-17"
            Statement:
              - Sid: ListBucketPrefix
                Effect: Allow
                Action: s3:ListBucket
                Resource: !Sub "arn:aws:s3:::${BucketName}"
                Condition:
                  StringLike:
                    "s3:prefix": !Sub "${Prefix}*"
              - Sid: GetObjects
                Effect: Allow
                Action: s3:GetObject
                Resource: !Sub "arn:aws:s3:::${BucketName}/${Prefix}*"

Outputs:
  RoleArn:
    Description: Send this ARN to Source.
    Value: !GetAtt SourceFederatedRole.Arn
```

### Terraform

This creates the OIDC provider too (fetching the TLS thumbprint via the `tls`
provider). If the provider already exists in your account, drop the
`aws_iam_openid_connect_provider` resource and reference the existing one.

```hcl
variable "connection_id" { type = string }
variable "bucket_name"   { type = string }
variable "prefix" {
  type    = string
  default = ""
}

data "tls_certificate" "source" {
  url = "https://data.source.coop"
}

resource "aws_iam_openid_connect_provider" "source" {
  url             = "https://data.source.coop"
  client_id_list  = ["source-coop-data-proxy"]
  thumbprint_list = [data.tls_certificate.source.certificates[0].sha1_fingerprint]
}

data "aws_iam_policy_document" "trust" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]
    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.source.arn]
    }
    condition {
      test     = "StringEquals"
      variable = "data.source.coop:aud"
      values   = ["source-coop-data-proxy"]
    }
    condition {
      test     = "StringLike"
      variable = "data.source.coop:sub"
      values   = ["scv1:conn:${var.connection_id}:*"]
    }
  }
}

data "aws_iam_policy_document" "read" {
  statement {
    sid       = "ListBucketPrefix"
    effect    = "Allow"
    actions   = ["s3:ListBucket"]
    resources = ["arn:aws:s3:::${var.bucket_name}"]
    condition {
      test     = "StringLike"
      variable = "s3:prefix"
      values   = ["${var.prefix}*"]
    }
  }
  statement {
    sid       = "GetObjects"
    effect    = "Allow"
    actions   = ["s3:GetObject"]
    resources = ["arn:aws:s3:::${var.bucket_name}/${var.prefix}*"]
  }
}

resource "aws_iam_role" "source_federated" {
  name               = "source-coop-${var.connection_id}"
  assume_role_policy = data.aws_iam_policy_document.trust.json
}

resource "aws_iam_role_policy" "read" {
  name   = "source-read-access"
  role   = aws_iam_role.source_federated.id
  policy = data.aws_iam_policy_document.read.json
}

output "role_arn" {
  description = "Send this ARN to Source."
  value       = aws_iam_role.source_federated.arn
}
```

## Troubleshooting

- **`AccessDenied` on assume:** the `data.source.coop:sub` or
  `data.source.coop:aud` condition doesn't match. Confirm the connection ID in
  your `sub` wildcard matches the one Source gave you, and that the audience is
  exactly `source-coop-data-proxy`.
- **`AccessDenied` reading objects:** the permission policy's bucket or prefix
  doesn't cover the requested keys. Check `<BUCKET>` and `<PREFIX>`.
- **Provider already exists:** an account can have only one OIDC provider per
  URL. Reuse the existing `data.source.coop` provider rather than creating
  another.
