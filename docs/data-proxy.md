---
title: Data Proxy
id: data-proxy
slug: /data-proxy
sidebar_position: 3
---

Uploading data to Source is done through the Data Proxy which uses an S3-compatible API. 

## Configuration

The Data Proxy is configured using the same environment variables as the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html), but using API keys issued by Source.

### Authentication

Authentication is required for all uploads to Source. API keys are issued by Source and are used to authenticate requests to the Data Proxy. API keys can be associated with an individual user, an organization, or specific repository and can be used to upload data to that repository.

### Generating an API Key

To generate an API key, navigate to the *Manage* tab on your user profile, an organiztion that you own, or a repository that you own. Enter the Name of your API key in the "Create an API Key" box, and click "Create." Your API key will be displayed immediately.

### Required Environment Variables

The Data Proxy requires the following environment variables to be set:

- `aws_access_key_id` - The access key ID for your repository.
- `aws_secret_access_key` - The accompanying secret access key for your repository.
- `endpoint_url` - The Source Data Proxy endpoint, which is `https://data.source.coop`.

### Example 

An example of how to set these environment variables in the AWS CLI configuration file is shown below.

```bash
[profile source]
export aws_access_key_id=<YOUR_API_ACCESS_KEY_ID_HERE>
export aws_secret_access_key=<YOUR_API_SECRET_ACCESS_KEY_HERE>
export endpoint_url=https://data.source.coop
```

## In beta

Ultimately, we want performance of the Source Data Proxy to be indistinguishable from accessing objects directly via the AWS CLI using the subset of S3 APIs that Source supports. Until then, if you need to upload a large number of objects, we recommend using the AWS CLI directly.