---
title: Data Proxy
id: data-proxy
slug: /data-proxy
sidebar_position: 3
---

# Accessing Data Through the Source Data Proxy

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

## Getting Started with AWS CLI

If you don't have the AWS CLI installed, follow the [AWS CLI Getting Started Guide](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html).

## Current Status

The Source Data Proxy is currently in beta. We're working to make performance indistinguishable from accessing objects directly via AWS S3.

## Uploading Data Through the Source Data Proxy

Uploading data through the Source Data Proxy is currently disabled while we work on new, easier, and more secure ways to upload data. If you need to upload data, please contact hello@source.coop.