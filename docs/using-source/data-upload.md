---
title: Upload Your Data
id: data-upload
slug: /data-upload
sidebar_position: 2
---

This guide explains how to deliver your data to Source Cooperative in a secure and simple way.
It is written for data providers and does not require an Amazon Web Services (AWS) account or deep cloud storage knowledge.

If you do not see the option to upload (for example, Edit Mode or View Credentials on your product page under the lock icon), contact [hello@source.coop](mailto:hello@source.coop) to request upload access.

---

## How uploads work: the Source data proxy

Unless you set up [direct bucket access](#option-3-longstanding-or-automated-access-advanced),
every upload goes through the **Source data proxy** at `https://data.source.coop`.
The proxy speaks the **S3 API**, the object storage protocol that Amazon S3
introduced and that most storage tools now support. It is not itself an AWS service.

Behind the proxy, a product's data may be stored with any of several object
storage providers: Amazon S3, Google Cloud Storage, Azure Blob Storage,
Cloudflare R2, and others. You don't need to know which one. You always
upload to the same proxy address, and the proxy writes to the right place.

That is why this guide uses AWS tools:

- **The AWS CLI and AWS SDKs (boto3, etc.) are used only as S3 clients.** You
  point them at `https://data.source.coop` instead of AWS. Any S3-compatible
  client that lets you set a custom endpoint URL will work.
- **Your upload credentials come from Source Cooperative, not AWS.** They use
  the AWS credential format (access key ID, secret access key, session token)
  because S3 clients expect it, but they are only valid at the Source data proxy.
- **Addresses are proxy addresses.** `s3://your-org/your-product/` means the
  `your-product` product in the `your-org` account on Source Cooperative. It
  is not an Amazon S3 bucket. Where your data is physically stored doesn't change it.

The one exception is [Option 3](#option-3-longstanding-or-automated-access-advanced),
which writes straight to Source's Amazon S3 bucket with your own AWS identity.
In that section, "AWS" really does mean AWS.

---

## The short version (what you need to do)

You have two main ways to upload data:

1. **Upload directly in the Source Cooperative User Interface (UI)** (drag-and-drop or file selector), or
2. **Use temporary Source credentials** to upload through the data proxy with an S3 client such as the AWS Command Line Interface (CLI) or an AWS Software Development Kit (SDK)

For long‑term or automated access, contact the Source Cooperative team at `hello@source.coop`.

---

## Option 1: Upload directly in the UI (Easiest)

If you prefer not to use command-line tools, you can upload files directly in the web interface.

### How to upload via the UI

1. Go to your product page in Source Cooperative (e.g. `https://source.coop/your-org/your-product`)
2. In the top-right corner of the Product Contents card, click on the lock icon to open the dropdown menu and enable edit mode by clicking on `Edit Mode`.
3. Either:
   - Drag‑and‑drop files to the `Product Contents` card
   - Use `Upload Files` or `Upload Directory` options in dropdown menu to upload files via operating system's file selector

Your files will be uploaded automatically to your product.

This option is ideal for:

- Small or medium uploads
- One‑time deliveries
- Non‑technical users

---

## Option 2: Upload through the data proxy with temporary credentials (recommended for larger uploads)

For larger uploads, scripting, or programmatic access, use temporary credentials
issued by Source Cooperative with an S3 client pointed at the data proxy.

### Get credentials with the Source CLI (recommended)

The [Source CLI](https://github.com/source-cooperative/source-coop-cli) authenticates you with Source Cooperative and provides temporary credentials automatically, so you don't have to copy expiring credentials out of the UI. Once configured as an AWS CLI profile, the AWS CLI and SDKs refresh credentials for you, and you'll only need to re-authenticate every 30 days.

**1. Install the CLI**

Follow the install instructions in the [CLI README](https://github.com/source-cooperative/source-coop-cli).

**2. Log in**

```bash
source-coop login
```

This opens your browser to authenticate and caches short‑lived credentials in your OS keyring.

**3. Configure an AWS CLI profile**

Add a profile to `~/.aws/config` that calls the Source CLI to fetch credentials on demand and sends requests to the data proxy:

```ini
[profile source-coop]
credential_process = source-coop creds
endpoint_url = https://data.source.coop
```

The `endpoint_url` line is what sends requests to the Source data proxy instead of AWS.

**4. Use standard S3 commands with the profile**

Pass the profile per command with `--profile`:

```bash
aws s3 cp mydata.csv s3://your-org/your-product/mydata.csv --profile source-coop
aws s3 sync ./data s3://your-org/your-product/ --profile source-coop
```

Or set it once for your shell session with the `AWS_PROFILE` environment variable:

```bash
export AWS_PROFILE=source-coop
aws s3 cp mydata.csv s3://your-org/your-product/mydata.csv
aws s3 sync ./data s3://your-org/your-product/
```

:::tip

`AWS_PROFILE` is also picked up automatically by the AWS SDKs (boto3, JavaScript, Go, etc.), so your scripts can use the default credential chain instead of hardcoding access keys or endpoint details.

:::

The AWS CLI will refresh credentials automatically; re-run `source-coop login` when your session expires. Your upload permissions are scoped to the products you have access to.

### Get credentials from the UI

1. Go to your product page
2. In the `Product Contents` card, open the dropdown (click on lock icon in top‑right corner)
3. Select `View Credentials`
4. Choose:
   - `JSON (SDK)` credentials, or
   - `Environment Variables` (shell)

You will also see:

- `Expiration`: the expiration time of the credentials (a specific date and time)
- `Bucket`: the bucket name on the data proxy, which is your account ID (`your-org`)
- `Prefix`: the prefix (folder) you are allowed to write to (e.g. `your-product/`)

---

## What the credentials look like

These are Source Cooperative credentials in the AWS credential format. They
only work against the data proxy, so always set the endpoint to
`https://data.source.coop`. The region value is required by S3 clients; it does
not say where your data is stored.

### For SDK clients (boto3, AWS SDKs, etc.)

```json
{
  "aws_access_key_id": "ASIA...",
  "aws_secret_access_key": "pwEV...",
  "aws_session_token": "IQoJ...",
  "region_name": "us-west-2"
}
```

With boto3, pass the endpoint when creating the client:

```python
import boto3

s3 = boto3.client("s3", endpoint_url="https://data.source.coop", **credentials)
s3.upload_file("mydata.csv", "your-org", "your-product/mydata.csv")
```

---

### For terminal / shell usage

```bash
export AWS_ACCESS_KEY_ID="ASIA..."
export AWS_SECRET_ACCESS_KEY="pwEV..."
export AWS_SESSION_TOKEN="IQoJ..."
export AWS_DEFAULT_REGION="us-west-2"
export AWS_ENDPOINT_URL="https://data.source.coop"  # add this: send requests to the data proxy
```

These credentials are:

- Temporary
- Scoped to your product
- Automatically revoked when they expire

---

## Where to upload your data

You may upload only to your product's prefix on the data proxy, for example:

```
s3://your-org/your-product/
```

This matches your product page URL, `https://source.coop/your-org/your-product`.

You may upload:

- Files
- Folders
- Multiple objects

You may not upload outside this path.

---

## Example: Upload using the AWS CLI

```bash
aws s3 cp mydata.csv s3://your-org/your-product/mydata.csv --endpoint-url https://data.source.coop
```

Or upload a full directory:

```bash
aws s3 sync ./data s3://your-org/your-product/ --endpoint-url https://data.source.coop
```

`--endpoint-url` isn't needed if you set `AWS_ENDPOINT_URL` or use the `source-coop` profile above.

---

## Option 3: Long‑standing or automated access (ADVANCED)

If you need:

- Continuous uploads
- Scheduled pipelines
- Integration from your own AWS account

You can use your own IAM role to write to the Source Cooperative bucket.

:::info This option really is AWS

Unlike Options 1 and 2, this option bypasses the data proxy. You write
directly to Source Cooperative's Amazon S3 bucket (e.g. `us-west-2.opendata.source.coop`, `eu-west-1.opendata.source.coop`)
using an identity in **your own AWS account**. It only applies to products stored
in that bucket. If your product is stored with another provider, or you don't have
an AWS account, use [Option 2](#option-2-upload-through-the-data-proxy-with-temporary-credentials-recommended-for-larger-uploads)
or contact us.

:::

### How this works

- You create an IAM role (or use an existing IAM user/account) in **your own** AWS account
- You send us its ARN, and we grant it write access to your account's prefix in the Source Cooperative bucket

No credentials are shared, and no role chaining is required.

---

### Step 1: Create an IAM role (or pick an identity to use)

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
        "s3:PutObjectAcl",
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
aws iam create-role \
  --role-name source-coop-upload \
  --assume-role-policy-document file://trust-policy.json

aws iam put-role-policy \
  --role-name source-coop-upload \
  --policy-name source-coop-write \
  --policy-document file://s3-policy.json
```

</details>

:::note

This policy only grants permission on *your* side. Uploads will still fail with `AccessDenied` until we grant the same role access on the bucket side (Step 2).

:::

---

### Step 2: Send us the ARN

Email [hello@source.coop](mailto:hello@source.coop) with:

- The ARN of the role, user, or account you want us to trust, for example:
  - Role: `arn:aws:iam::123456789012:role/source-coop-upload`
  - User: `arn:aws:iam::123456789012:user/data-uploader`
  - Account: `arn:aws:iam::123456789012:root`
- Your Source Cooperative account ID and product ID (the `your-org/your-product` prefix you will write to)
- A short description of the workflow (e.g. "nightly ingestion pipeline running on ECS")

We will add the ARN to the bucket policy and confirm when it is active.

---

### Step 3: Upload using that identity

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

Let the AWS CLI do the assume-role for you — add a profile to `~/.aws/config`:

```ini
[profile source-coop-upload]
role_arn = arn:aws:iam::123456789012:role/source-coop-upload
source_profile = default
region = us-west-2
```

```bash
aws s3 sync ./data s3://us-west-2.opendata.source.coop/your-org/your-product/ \
  --profile source-coop-upload
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

---

## Why we use these controls

These controls prevent accidental or unauthorized access and ensure:

- Clear ownership of uploaded data
- No accidental access to other providers’ data
- Secure handling without sharing permanent credentials

This protects both you and Source Cooperative.

---

## What not to do

Please do not:

- Request permanent access keys
- Ask for full bucket access
- Upload outside your assigned prefix
- Reuse expired temporary credentials

---

## Need help?

If you’re unsure which option is right for you, or need help setting up automated access, contact the Source Cooperative team at `hello@source.coop`, and we will help you choose the best approach for your use case.

---

Thank you for contributing data to Source Cooperative.
