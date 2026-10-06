---
title: Direct Uploads with Your Own AWS Identity
sidebar_label: Direct Uploads (Deprecated)
id: direct-uploads
slug: /direct-uploads
---

:::warning Deprecated

This method is deprecated. New pipelines should use a
[service account](/automated-access) instead, which works for every product,
needs no AWS account, and doesn't need us to change a bucket policy. These
instructions stay here for pipelines already set up this way; contact
[hello@source.coop](mailto:hello@source.coop) for help moving one to a service
account.

:::

You can use an IAM role in your own AWS account to write to the Source
Cooperative bucket.

This bypasses the [data proxy](/data-proxy). You write directly to Source
Cooperative's Amazon S3 bucket (e.g. `us-west-2.opendata.source.coop`,
`eu-west-1.opendata.source.coop`) using an identity in **your own AWS
account**. It only applies to products stored in that bucket.

## How this works

- You create an IAM role (or use an existing IAM user/account) in **your own** AWS account
- You send us its ARN, and we grant it write access to your account's prefix in the Source Cooperative bucket

No credentials are shared, and no role chaining is required.

---

## Step 1: Create an IAM role (or pick an identity to use)

Which identity you send us depends on what is doing the uploading:

| Uploading from | Send us |
| --- | --- |
| A service (ingestion pipeline, ECS task, Lambda, EC2, GitHub Actions with OIDC) | An **IAM role** ARN |
| A person running the AWS CLI locally | An **IAM user** ARN |
| Many identities in one account | The **AWS account** ARN (we trust the whole account; your account controls who may use it) |

For a service, create a role in your account with a trust policy for whatever assumes it, then attach a policy granting it read/write access under your account prefix. Replace `your-org` with your Source Cooperative account ID.

:::tip

The [IAM policy wizard](/tools/iam-policy-wizard) generates this policy for you — enter your account ID and, optionally, a product ID.

:::

<details>
<summary>Example trust policy (ECS tasks)</summary>

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "ecs-tasks.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

</details>

<details>
<summary>Example access policy</summary>

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:AbortMultipartUpload",
        "s3:ListMultipartUploadParts"
      ],
      "Resource": "arn:aws:s3:::us-west-2.opendata.source.coop/your-org/*"
    },
    {
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::us-west-2.opendata.source.coop",
      "Condition": {
        "StringLike": { "s3:prefix": "your-org/*" }
      }
    }
  ]
}
```

`s3:AbortMultipartUpload` and `s3:ListMultipartUploadParts` cover the multipart
uploads the AWS CLI and SDKs use automatically for large files. `s3:PutObject`
alone authorizes starting an upload and sending its parts, but without those two
a failed or resumed transfer cannot clean up after itself. Both are object-level
actions, so the prefix in `Resource` scopes them like the rest.

:::note

This policy deliberately omits `s3:ListBucketMultipartUploads`, which lists
in-progress uploads across the *whole* bucket. AWS does not support the
`s3:prefix` condition key on it, so it cannot be limited to your data, and no
upload path needs it — incomplete uploads are cleaned up automatically after 7
days. Only `aws s3api list-multipart-uploads` requires it; contact us if you
have a workflow that requires this policy.

:::

</details>

<details>
<summary>Creating the role with the AWS CLI</summary>

```bash
aws iam create-role --role-name source-coop-upload --assume-role-policy-document file://trust-policy.json
aws iam put-role-policy --role-name source-coop-upload --policy-name source-coop-write --policy-document file://s3-policy.json
```

</details>

:::note

This policy only grants permission on *your* side. Uploads will still fail with `AccessDenied` until we grant the same role access on the bucket side (Step 2).

:::

---

## Step 2: Send us the ARN

Email [hello@source.coop](mailto:hello@source.coop) with:

- The ARN of the role, user, or account you want us to trust, for example:
  - Role: `arn:aws:iam::123456789012:role/source-coop-upload`
  - User: `arn:aws:iam::123456789012:user/data-uploader`
  - Account: `arn:aws:iam::123456789012:root`
- Your Source Cooperative account ID and product ID (the `your-org/your-product` prefix you will write to)
- A short description of the workflow (e.g. "nightly ingestion pipeline running on ECS")

We will add the ARN to the bucket policy and confirm when it is active.

---

## Step 3: Upload using that identity

Once we confirm, upload with credentials for that role, user, or account:

```bash
aws s3 cp mydata.csv s3://us-west-2.opendata.source.coop/your-org/your-product/mydata.csv
```

Services that already run as the role (ECS tasks, Lambda, EC2 instance profiles) need no assume-role step — the SDK picks up the role automatically.

<details>
<summary>Uploading a directory</summary>

```bash
aws s3 sync ./data s3://us-west-2.opendata.source.coop/your-org/your-product/
```

</details>

<details>
<summary>Assuming the role from a workstation or CI job</summary>

Let the AWS CLI do the assume-role for you — add a profile to `~/.aws/config` (`%USERPROFILE%\.aws\config` on Windows):

```ini
[profile source-coop-upload]
role_arn = arn:aws:iam::123456789012:role/source-coop-upload
source_profile = default
region = us-west-2
```

```bash
aws s3 sync ./data s3://us-west-2.opendata.source.coop/your-org/your-product/ --profile source-coop-upload
```

</details>

<details>
<summary>Uploading with boto3</summary>

```python
import boto3

s3 = boto3.client("s3")
s3.upload_file(
    "mydata.csv",
    "us-west-2.opendata.source.coop",
    "your-org/your-product/mydata.csv",
)
```

</details>
