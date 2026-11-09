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
source-coop login
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

## Getting Started with AWS CLI

If you don't have the AWS CLI installed, follow the [AWS CLI Getting Started Guide](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html).

## Current Status

The Source Data Proxy is currently in beta. We're working to make performance indistinguishable from accessing objects directly via AWS S3.
