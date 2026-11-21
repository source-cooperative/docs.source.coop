---
title: Access Data
id: data-proxy
slug: /data-proxy
sidebar_position: 3
---

The Source Data Proxy provides S3-compatible access to all data hosted on Source Cooperative. You can access data through the proxy without authentication, making it easy to programmatically download datasets using standard AWS CLI commands.

## Using the AWS CLI

All Source datasets are accessible using the AWS CLI with these parameters:
- **Endpoint URL:** `https://data.source.coop`
- **Paths:** `s3://ACCOUNT/PRODUCT/...`: the bucket is the account, and the proxy only takes path-style requests
- **No authentication required:** Add `--no-sign-request` to all commands

### Example: Fields of The World Dataset

The Fields of The World (FTW) dataset is fully open and available at [https://source.coop/kerner-lab/fields-of-the-world](https://source.coop/kerner-lab/fields-of-the-world)

You can find and download all of the files there individually, or you can use the AWS CLI to access the data using the Source Data Proxy by adding `--endpoint-url https://data.source.coop --no-sign-request` to your standard AWS commands.

### Listing Dataset Contents

To list the contents at the root level of a dataset:

```bash
aws s3 ls s3://kerner-lab/fields-of-the-world --endpoint-url https://data.source.coop --no-sign-request
```

To recursively list all contents in a specific directory within the dataset (e.g., the `vietnam` directory):

```bash
aws s3 ls s3://kerner-lab/fields-of-the-world/vietnam --endpoint-url https://data.source.coop --no-sign-request --recursive
```

Add `--summarize` to any `ls` command to see a count and total byte volume of the listed objects. For example:

```bash
aws s3 ls s3://kerner-lab/fields-of-the-world/vietnam --endpoint-url https://data.source.coop --no-sign-request --recursive --summarize
```

### Downloading Datasets

Use the `cp` command to copy data to local storage:

```bash
aws s3 cp s3://kerner-lab/fields-of-the-world/README.md . --endpoint-url https://data.source.coop --no-sign-request
```

## Authenticated Access with the Source CLI

Public datasets work with `--no-sign-request`. To access data that requires authentication, use the [Source CLI](https://github.com/source-cooperative/source-coop-cli), which logs you in and supplies temporary AWS credentials through an AWS profile:

```bash
source-coop auth login
aws s3 ls s3://your-org/product-id --profile source-coop
```

See [Upload with the Source CLI](/upload-with-the-cli) for the one-time install and profile setup.

For software that runs on its own, with nobody there to log in, use a [service account](/automated-access) instead.

## Using DuckDB

DuckDB's `httpfs` extension doesn't read the AWS CLI's endpoint settings, so give it the proxy in an S3 secret. Paths are `s3://ACCOUNT/PRODUCT/...`, and the proxy only takes path-style requests.

For public data, no credentials are needed:

```sql
CREATE SECRET source_coop (
    TYPE s3,
    ENDPOINT 'data.source.coop',
    URL_STYLE 'path',
    REGION 'us-west-2'
);

SELECT count(*) FROM 's3://cholmes/admin-boundaries/countries.parquet';
```

For data that needs authentication, set up the `source-coop` AWS profile from [Upload with the Source CLI](/upload-with-the-cli), then let DuckDB get credentials from it:

```sql
CREATE SECRET source_coop (
    TYPE s3,
    PROVIDER credential_chain,
    CHAIN 'process',
    PROFILE 'source-coop',
    ENDPOINT 'data.source.coop',
    URL_STYLE 'path',
    REGION 'us-west-2'
);

SELECT * FROM 's3://your-org/product-id/data.parquet' LIMIT 10;
```

DuckDB runs the profile's `credential_process` (`source-coop creds`) when the secret is created. The credentials are temporary: if reads start failing after a while, run `CREATE SECRET` again.

## Using GDAL

GDAL's `/vsis3/` doesn't read `endpoint_url` from the AWS config either. Set its own endpoint options; `AWS_VIRTUAL_HOSTING=FALSE` makes it use path-style requests.

For public data:

```bash
export AWS_S3_ENDPOINT=data.source.coop AWS_VIRTUAL_HOSTING=FALSE
AWS_NO_SIGN_REQUEST=YES ogrinfo -so /vsis3/cholmes/admin-boundaries/countries.parquet
```

For data that needs authentication, GDAL gets credentials from the `source-coop` profile's `credential_process`:

```bash
export AWS_S3_ENDPOINT=data.source.coop AWS_VIRTUAL_HOSTING=FALSE
AWS_PROFILE=source-coop gdalinfo /vsis3/your-org/product-id/image.tif
```

## Using Python

boto3 reads the `source-coop` profile, including its `endpoint_url`, so authenticated access needs no extra settings:

```python
import boto3

s3 = boto3.Session(profile_name="source-coop").client("s3")
s3.list_objects_v2(Bucket="your-org", Prefix="product-id/")
```

For public data, send unsigned requests:

```python
import boto3
from botocore import UNSIGNED
from botocore.config import Config

s3 = boto3.client("s3", endpoint_url="https://data.source.coop", config=Config(signature_version=UNSIGNED))
s3.list_objects_v2(Bucket="cholmes", Prefix="admin-boundaries/")
```

[obstore](https://developmentseed.org/obstore/) doesn't read the AWS config file, so give it the endpoint. For public data:

```python
import obstore as obs
from obstore.store import S3Store

store = S3Store("cholmes", endpoint="https://data.source.coop", skip_signature=True, region="us-west-2")
obs.list(store, prefix="admin-boundaries/").collect()
```

## Getting Started with AWS CLI

If you don't have the AWS CLI installed, follow the [AWS CLI Getting Started Guide](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html).

## Current Status

The Source Data Proxy is currently in beta. We're working to make performance indistinguishable from accessing objects directly via AWS S3.
