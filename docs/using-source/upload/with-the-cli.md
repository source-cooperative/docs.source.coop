---
title: Upload with the Source CLI
sidebar_label: With the Source CLI
id: with-the-cli
slug: /upload-with-the-cli
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

For larger uploads, scripting, or programmatic access, use temporary credentials
issued by Source Cooperative with an S3 client pointed at the
[data proxy](/data-upload#how-uploads-work-the-source-data-proxy).

## Get credentials with the Source CLI (recommended)

The [Source CLI](https://github.com/source-cooperative/source-coop-cli) authenticates you with Source Cooperative and provides temporary credentials automatically, so you don't have to copy expiring credentials out of the UI. Once configured as an AWS CLI profile, the AWS CLI and SDKs refresh credentials for you, and you'll only need to re-authenticate every 30 days.

**1. Install the CLI**

Follow the install instructions in the [CLI README](https://github.com/source-cooperative/source-coop-cli).

**2. Log in**

```bash
source-coop login
```

This opens your browser to authenticate and caches short‑lived credentials in your OS keyring.

**3. Configure an AWS CLI profile**

Add a profile to `~/.aws/config` (`%USERPROFILE%\.aws\config` on Windows) that calls the Source CLI to fetch credentials on demand and sends requests to the data proxy:

```ini
[profile source-coop]
credential_process = source-coop creds
endpoint_url = https://data.source.coop
```

The `endpoint_url` line is what sends requests to the Source data proxy instead of AWS.

**4. Use standard S3 commands with the profile**

Pass the profile per command with `--profile`:

```bash
aws s3 cp mydata.csv s3://your-org/product-id/mydata.csv --profile source-coop
aws s3 sync ./data s3://your-org/product-id/ --profile source-coop
```

Or set it once for your shell session with the `AWS_PROFILE` environment variable:

<Tabs groupId="os" queryString>
<TabItem value="unix" label="macOS / Linux">

```bash
export AWS_PROFILE=source-coop
aws s3 cp mydata.csv s3://your-org/product-id/mydata.csv
aws s3 sync ./data s3://your-org/product-id/
```

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
$env:AWS_PROFILE = "source-coop"
aws s3 cp mydata.csv s3://your-org/product-id/mydata.csv
aws s3 sync ./data s3://your-org/product-id/
```

</TabItem>
</Tabs>

:::tip

`AWS_PROFILE` is also picked up automatically by the AWS SDKs (boto3, JavaScript, Go, etc.), so your scripts can use the default credential chain instead of hardcoding access keys or endpoint details.

:::

The AWS CLI will refresh credentials automatically; re-run `source-coop login` when your session expires. Your upload permissions are scoped to the products you have access to.

## Without the CLI: get credentials from the UI

You can also copy the same kind of temporary credentials out of the web
interface. They expire, and you'll need to copy new ones when they do.

1. Go to your product page
2. In the `Product Contents` card, open the dropdown (click on lock icon in top‑right corner)
3. Select `View Credentials`
4. Choose:
   - `JSON (SDK)` credentials, or
   - `Environment Variables` (shell)

You will also see:

- `Expiration`: the expiration time of the credentials (a specific date and time)
- `Bucket`: the bucket name on the data proxy, which is your account ID (`your-org`)
- `Prefix`: the prefix (folder) you are allowed to write to (e.g. `product-id/`)

### What the credentials look like

These are Source Cooperative credentials in the AWS credential format. They
only work against the data proxy, so always set the endpoint to
`https://data.source.coop`. The data proxy doesn't use the region and accepts
any value, but set one anyway: many SDKs won't sign requests without it. It
doesn't say where your data is stored.

For SDK clients (boto3, AWS SDKs, etc.):

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
s3.upload_file("mydata.csv", "account-id", "product-id/mydata.csv")
```

For terminal / shell usage:

<Tabs groupId="os" queryString>
<TabItem value="unix" label="macOS / Linux">

```bash
export AWS_ACCESS_KEY_ID="ASIA..."
export AWS_SECRET_ACCESS_KEY="pwEV..."
export AWS_SESSION_TOKEN="IQoJ..."
export AWS_DEFAULT_REGION="us-west-2"
export AWS_ENDPOINT_URL="https://data.source.coop"  # add this: send requests to the data proxy
```

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
$env:AWS_ACCESS_KEY_ID = "ASIA..."
$env:AWS_SECRET_ACCESS_KEY = "pwEV..."
$env:AWS_SESSION_TOKEN = "IQoJ..."
$env:AWS_DEFAULT_REGION = "us-west-2"
$env:AWS_ENDPOINT_URL = "https://data.source.coop"  # add this: send requests to the data proxy
```

</TabItem>
</Tabs>

These credentials are:

- Temporary
- Scoped to your product
- Automatically revoked when they expire

### Example: Upload using the AWS CLI

```bash
aws s3 cp mydata.csv s3://your-org/product-id/mydata.csv --endpoint-url https://data.source.coop
```

Or upload a full directory:

```bash
aws s3 sync ./data s3://your-org/product-id/ --endpoint-url https://data.source.coop
```

`--endpoint-url` isn't needed if you set `AWS_ENDPOINT_URL` or use the `source-coop` profile above.
