---
title: Upload Your Data
id: data-upload
slug: /data-upload
---

This guide explains how to deliver your data to Source Cooperative in a secure and simple way.
It is written for data providers and does not require an Amazon Web Services (AWS) account or deep cloud storage knowledge.

If you do not see the option to upload (for example, Edit Mode or View Credentials on your product page under the lock icon), contact [hello@source.coop](mailto:hello@source.coop) to request upload access.

## Choose how to upload

<!-- The anchors keep links to this page's old Option sections working. -->

| | Best for | |
| --- | --- | --- |
| <a id="option-1-upload-directly-in-the-ui-easiest"></a>**[In the browser](/upload-in-the-browser)** | Small or one-time uploads, without installing anything | Easiest |
| <a id="option-2-upload-through-the-data-proxy-with-temporary-credentials-recommended-for-larger-uploads"></a><a id="get-credentials-with-the-source-cli-recommended"></a>**[With the Source CLI](/upload-with-the-cli)** | Large uploads and scripts that you run yourself | Recommended for larger uploads |
| <a id="option-3-longstanding-or-automated-access-advanced"></a>**[With a service account](/automated-access)** | Pipelines, scheduled jobs and GitHub Actions: anything that runs with nobody at the keyboard | Advanced |

## How uploads work: the Source data proxy

Every upload goes through the **Source data proxy** at `https://data.source.coop`.
The proxy speaks the **S3 API**, the object storage protocol that Amazon S3
introduced and that most storage tools now support. It is not itself an AWS service.

Behind the proxy, a product's data may be stored with any of several object
storage providers: Amazon S3, Google Cloud Storage, Azure Blob Storage,
Cloudflare R2, and others. You don't need to know which one. You always
upload to the same proxy address, and the proxy writes to the right place.

That is why these guides use AWS tools:

- **The AWS CLI and AWS SDKs (boto3, etc.) are used only as S3 clients.** You
  point them at `https://data.source.coop` instead of AWS. Any S3-compatible
  client that lets you set a custom endpoint URL will work.
- **Your upload credentials come from Source Cooperative, not AWS.** They use
  the AWS credential format (access key ID, secret access key, session token)
  because S3 clients expect it, but they are only valid at the Source data proxy.
- **Addresses are proxy addresses.** `s3://your-org/your-product/` means the
  `your-product` product in the `your-org` account on Source Cooperative. It
  is not an Amazon S3 bucket. Where your data is physically stored doesn't change it.

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

## Why we use these controls

These controls prevent accidental or unauthorized access and ensure:

- Clear ownership of uploaded data
- No accidental access to other providers’ data
- Secure handling without sharing permanent credentials

This protects both you and Source Cooperative.

## What not to do

Please do not:

- Request permanent access keys
- Ask for full bucket access
- Upload outside your assigned prefix
- Reuse expired temporary credentials

## Need help?

If you’re unsure which option is right for you, or need help setting up automated access, contact the Source Cooperative team at `hello@source.coop`, and we will help you choose the best approach for your use case.

Thank you for contributing data to Source Cooperative.
