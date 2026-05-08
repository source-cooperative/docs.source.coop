---
title: Upload Your Data
id: data-upload
slug: /data-upload
sidebar_position: 2
---

This guide explains how to deliver your data to Source Cooperative in a secure and simple way.  
It is written for data providers and does not require deep Amazon Web Service (AWS) knowledge.

If you do not see the option to upload (for example, Edit Mode or View Credentials on your product page under the lock icon), contact [hello@source.coop](mailto:hello@source.coop) to request upload access.

---

## The short version (what you need to do)

You have two main ways to upload data:

1. **Upload directly in the Source Cooperative User Interface (UI)** (drag-and-drop or file selector), or  
2. **Use temporary AWS credentials** to upload via the AWS Command Line Interface (CLI) or Software Development Kits (SDKs)

For long‑term or automated access, contact the Source Cooperative team at `hello@source.coop`.

---

## Option 1: Upload directly in the UI (Easiest)

If you prefer not to use AWS tools, you can upload files directly in the web interface.

### How to upload via the UI

1. Go to your product page in Source Cooperative (e.g. `https://source.coop/your-org/your-product`)
2. In the top-right corner of the Product Contents card, click on the lock icon to open the dropdown menu and enable edit mode by clicking on `Edit Mode`.
3. Either:
   - Drag‑and‑drop files to the `Product Contents` card
   - Use `Upload Files` or `Upload Directory` options in dropdown menu to upload files via operating system's file selectory

Your files will be uploaded automatically to your product.

This option is ideal for:

- Small or medium uploads
- One‑time deliveries
- Non‑technical users

---

## Option 2: Upload using temporary AWS credentials (recommended for larger uploads)

For larger uploads, scripting, or programmatic access, use temporary AWS credentials.

### How to get credentials

1. Go to your product page
2. In the `Product Contents` card, open the dropdown (click on lock icon in top‑right corner)
3. Select `View Credentials`
4. Choose:
   - `JSON (SDK)` credentials, or
   - `Environment Variables` (shell)

You will also see:

- `Expiration`: the expiration time of the credentials (a specific date and time)
- `Bucket`: the bucket name (`us-west-2.opendata.source.coop`)
- `Prefix`: the prefix (folder) you are allowed to write to (e.g. `your-org/your-product/`)

---

## What the credentials look ilke

### For SDK clients (boto3, AWS SDKs, etc.)

```json
{
  "aws_access_key_id": "ASIA...",
  "aws_secret_access_key": "pwEV...",
  "aws_session_token": "IQoJ...",
  "region_name": "us-west-2"
}
```

---

### For terminal / shell usage

```bash
export AWS_ACCESS_KEY_ID="ASIA..."
export AWS_SECRET_ACCESS_KEY="pwEV..."
export AWS_SESSION_TOKEN="IQoJ..."
export AWS_DEFAULT_REGION="us-west-2"
```

These credentials are:

- Temporary
- Scoped to your product
- Automatically revoked when they expire

---

## Where to upload your data

You may upload only to the provided prefix, for example:

```
s3://us-west-2.opendata.source.coop/your-org/your-product/
```

or if you are not uploading under an organization:

```
s3://us-west-2.opendata.source.coop/your-product/
```

You may upload:

- Files
- Folders
- Multiple objects

You may not upload outside this path.

---

## Example: Upload using the AWS CLI

```bash
aws s3 cp mydata.csv s3://us-west-2.opendata.source.coop/your-org/your-product/mydata.csv
```

Or upload a full directory:

```bash
aws s3 sync ./data s3://us-west-2.opendata.source.coop/your-org/your-product/
```

---

## Option 3: Long‑standing or automated access (ADVANCED)

If you need:

- Continuous uploads
- Scheduled pipelines
- Integration from your own AWS account

You can use your own IAM role to write to the Source Cooperative bucket.

### How this works

- You keep using your existing AWS role
- Source Cooperative grants that role write access to the bucket/prefix
- You must set the bucket owner to have full control on uploaded objects

This avoids sharing credentials and does not require role chaining.

---

### Required ACL setting (IMPORTANT)

When uploading from your own AWS account, you must set:

```
bucket-owner-full-control
```

This ensures Source Cooperative fully owns and can manage the uploaded objects.

---

### Example: Upload with bucket owner full control

```bash
aws s3 cp mydata.csv s3://us-west-2.opendata.source.coop/your-org/your-product/mydata.csv --acl bucket-owner-full-control
```

Or for a directory:

```bash
aws s3 sync ./data s3://us-west-2.opendata.source.coop/your-org/your-product/ --acl bucket-owner-full-control
```

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

- Request permanent AWS access keys
- Ask for full bucket access
- Upload outside your assigned prefix
- Reuse expired temporary credentials
- Upload without `bucket-owner-full-control` when using your own role

---

## Need help?

If you’re unsure which option is right for you, or need help setting up automated access, contact the Source Cooperative team at `hello@source.coop`, and we will help you choose the best approach for your use case.

---

Thank you for contributing data to Source Cooperative.
