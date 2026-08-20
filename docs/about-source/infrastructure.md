---
title: Infrastructure
id: infrastructure
slug: /infrastructure
sidebar_position: 4
---

Source Cooperative allows publication of data in most AWS regions. This page documents our technical infrastructure configuration and regional coverage.

Some data in Source is hosted in Microsoft Azure but we do not support adding new data to Azure at this time.

## S3 Bucket Configuration

### Naming Convention

All Source Cooperative data buckets follow a consistent naming pattern:

- **Pattern**: `{region}.opendata.source.coop`
- **Examples**: 
  - `us-east-1.opendata.source.coop`
  - `eu-west-1.opendata.source.coop`
  - `ap-northeast-1.opendata.source.coop`

### Bucket Policy

All data buckets use a public read-only policy that allows global access to our open data:

```json
{
  "Effect": "Allow",
  "Principal": "*",
  "Action": [
    "s3:List*",
    "s3:Get*"
  ],
  "Resource": [
    "arn:aws:s3:::BUCKET_NAME/*",
    "arn:aws:s3:::BUCKET_NAME"
  ]
}
```

This policy enables:

- **`s3:List*`** - List bucket contents and objects
- **`s3:Get*`** - Download objects and metadata
- **Public access** - No authentication required for data access

### CORS Configuration

Our buckets are configured to support web applications and browser-based access:

- **Allowed Methods**: `GET`, `HEAD`
- **Allowed Origins**: `*` (all origins)
- **Allowed Headers**: `*` (all headers)
- **Max Age**: 3000 seconds (50 minutes)

This configuration enables:

- Direct browser access to data files
- Cross-origin requests from web applications
- Integration with JavaScript-based data visualization tools

### Data Protection Features

#### Versioning

- **Status**: Enabled on all buckets
- **Lifecycle Management**: Non-current versions automatically deleted after 90 days
- **Incomplete Uploads**: Cleaned up after 7 days to optimize storage costs

#### Encryption

- **Type**: Server-side encryption with AES256
- **Scope**: All objects encrypted at rest

## Regional Coverage

### Americas

| Region Code    | Location                  | Bucket Name                         |
| -------------- | ------------------------- | ----------------------------------- |
| `us-east-1`    | US East (N. Virginia)     | `us-east-1.opendata.source.coop`    |
| `us-east-2`    | US East (Ohio)            | `us-east-2.opendata.source.coop`    |
| `us-west-1`    | US West (N. California)   | `us-west-1.opendata.source.coop`    |
| `us-west-2`    | US West (Oregon)          | `us-west-2.opendata.source.coop`    |
| `ca-central-1` | Canada (Central)          | `ca-central-1.opendata.source.coop` |
| `sa-east-1`    | South America (São Paulo) | `sa-east-1.opendata.source.coop`    |

### Europe

| Region Code    | Location           | Bucket Name                         |
| -------------- | ------------------ | ----------------------------------- |
| `eu-west-1`    | Europe (Ireland)   | `eu-west-1.opendata.source.coop`    |
| `eu-west-2`    | Europe (London)    | `eu-west-2.opendata.source.coop`    |
| `eu-west-3`    | Europe (Paris)     | `eu-west-3.opendata.source.coop`    |
| `eu-central-1` | Europe (Frankfurt) | `eu-central-1.opendata.source.coop` |
| `eu-north-1`   | Europe (Stockholm) | `eu-north-1.opendata.source.coop`   |

### Asia Pacific

| Region Code      | Location                 | Bucket Name                           |
| ---------------- | ------------------------ | ------------------------------------- |
| `ap-northeast-1` | Asia Pacific (Tokyo)     | `ap-northeast-1.opendata.source.coop` |
| `ap-northeast-2` | Asia Pacific (Seoul)     | `ap-northeast-2.opendata.source.coop` |
| `ap-northeast-3` | Asia Pacific (Osaka)     | `ap-northeast-3.opendata.source.coop` |
| `ap-south-1`     | Asia Pacific (Mumbai)    | `ap-south-1.opendata.source.coop`     |
| `ap-southeast-1` | Asia Pacific (Singapore) | `ap-southeast-1.opendata.source.coop` |
| `ap-southeast-2` | Asia Pacific (Sydney)    | `ap-southeast-2.opendata.source.coop` |
