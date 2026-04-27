---
title: Core Concepts
id: core-concepts
slug: /core-concepts
sidebar_position: 2
---

Source Cooperative ("Source") is a data publishing utility designed to make data shared in object stores easier to find, explore, and share on the web. Understanding these fundamental concepts will help you navigate and use Source effectively.

## Overview

Source allows individuals or organizations to publish files to the web, collected in data products. Every data product is owned by either an individual or an organization. A data product has a title and description, can contain any number of files (or objects), and can contain a README file (the file you see displayed at the root of the data product).

## The data

### Data Products

Data products are the primary organizational unit in Source. They serve as containers for related data files and provide a way to group and organize information logically.

A data product is a collection of related data files with associated metadata and documentation. Each data product consists of:

- **Product ID**: A unique identifier following the pattern `account-name/data-product-name` (e.g., `cholmes/eurocrops`)
- **Product Title**: A descriptive, human-readable name for the data product
- **Description**: A detailed explanation of what the data product contains and its purpose
- **Owner Account**: Either an individual or an organization
- **Documentation and Metadata**: Typically a README.md file at the data product root that explains the data. Suggested to includea description of the data product, license information (separate for metadata vs data), access examples (interactive maps preferred over downloads), contact information and citation/DOI information.
- **Product Contents**: The actual data files stored in the data product (any number of files)
- **Visibility**: Controlling who can access the data

Data products are built entirely on cloud object storage, which allows Source to host very large volumes of data. While platforms like GitHub limit project size to around 5GB, Source data products can be hundreds of terabytes. For example, the RapidAI4EO dataset on Source is over 100TB.

#### Data Product URLs

Each data product has both a web view and a data access view:

- **Web view**: `https://source.coop/account-name/data-product-name/` - Browse files in your browser
- **Data view**: `https://data.source.coop/account-name/data-product-name/` - Programmatic access via JSON

Everything in Source is designed to be linkable. You can navigate deeper into data products with URLs like `https://source.coop/account-name/data-product-name/subdirectory/`.

#### Data Product Features

- **Public Access**: All data products are publicly accessible via HTTP
- **Unlisted Data Products**: While all data products are publicly accessible, users can opt to leave them unlisted to prevent them from appearing in search results or lists of data products on the Source website
- **Web Interface**: Each data product has a dedicated web page for browsing and exploring
- **Direct HTTP Access**: Every object can be accessed directly via its URL

#### Future Data Product Features

- **Restricted Access**: The ability to restrict data product access based on identity and access rules
- **Data Product Monetization**: The ability to charge for access to data products
- **Versioning**: Support for tracking changes made to data products

For information on how to create and manage data products in the web interface, see [Create a Data Product](/create-a-data-product).

### Objects

Objects are the individual files or data items stored within data products. They represent the actual data that users want to access and analyze.

#### Object Characteristics

In Source:

- **File Types**: Objects can be any file type (GeoTIFF, CSV, Parquet, JSON, NetCDF, PMTiles, images, documents, etc.)
- **Size**: Objects can be any size, from kilobytes to terabytes (no practical limits)
- **Organization**: Objects are organized using path prefixes to create virtual directory structures
- **Direct Access**: Each object has a direct URL for access: `https://data.source.coop/account/data-product/path/to/file.ext`

#### Object Storage vs File Storage

Source uses object storage rather than traditional file storage. This has important implications:

- **Scalability**: Object storage can handle massive volumes of data efficiently
- **No version control**: Unlike Git-based systems, Source doesn't provide granular version control on individual objects. Source is designed for publishing "fully baked" data products
- **Flat namespace**: While you can organize objects with path prefixes, the underlying storage is flat rather than hierarchical

### Data Viewers

Source provides built-in preview functionality for common data formats directly in the browser. This allows users to visualize and explore data before downloading. When you navigate to an individual file in Source, you'll see a preview along with metadata rather than immediately downloading the file.

Currently supported preview formats include:

- **PMTiles** - [https://source.coop/ftw/global-data/predictions/vectors/alpha/global.pmtiles](https://source.coop/ftw/global-data/predictions/vectors/alpha/global.pmtiles))
- **GeoParquet / Parquet** - [https://source.coop/maxar/maxar-opendata/maxar-opendata.parquet](https://source.coop/maxar/maxar-opendata/maxar-opendata.parquet)
- **CSV** - [https://source.coop/severo/csv-papaparse-test-files/long-sample.csv](https://source.coop/severo/csv-papaparse-test-files/long-sample.csv)
- **3D / GLB** - [https://source.coop/harvard-lil/smithsonian-open-access/3d/002f2567-7384-4027-9b99-bcb7a7e6361e/USNM153798_cranium_-400-150k-1024-low-nondraco.glb](https://source.coop/harvard-lil/smithsonian-open-access/3d/002f2567-7384-4027-9b99-bcb7a7e6361e/USNM153798_cranium_-400-150k-1024-low-nondraco.glb)
- **README Markdowns** - [https://source.coop/alexgleith/gebco-2024](https://source.coop/alexgleith/gebco-2024)

The data viewer system is extensible, and the community can propose solutions for additional file formats as needs arise.

### Data Access Methods

Source provides multiple ways to access data:

1. **Web Browser**: Browse and download files through the web interface at `https://source.coop`
2. **Direct HTTP**: Access individual files directly via `https://data.source.coop`
3. **AWS CLI**: Use the Source Data Proxy's S3-compatible API to list, upload, download, and manage objects programmatically
4. **AWS SDKs**: Use AWS SDKs (boto3 for Python, AWS SDK for JavaScript, etc.) with Source's endpoint
5. **Direct Cloud Access**: Authenticated users can generate credentials to access data directly from the underlying cloud storage  using native tools (e.g. `aws s3`, `azcopy`)

### Tags and Discoverability

Data products can be tagged with relevant keywords to improve discoverability. Common tags include:
- Data types: `vector`, `raster`, `tabular`
- Themes: `agriculture`, `climate`, `conservation`, `land cover`
- Formats: `geoparquet`, `cog`, `pmtiles`, `netcdf`
- Applications: `machine learning`, `segmentation`, `time series`

Tags help users find relevant datasets through search and browsing, and improve Source's visibility in search engines.

## Accounts

### Individual Accounts

When you create an account on Source, you get a personal namespace where you can publish and manage your own data products. Your individual account is identified by your username (e.g., `source.coop/cholmes`). This username becomes part of your data product URLs.

#### Individual Account Benefits

- **Easy Publishing**: Simple tools for publishing data without technical infrastructure
- **Professional Presence**: Establish a professional presence in the data community
- **Attribution**: Clear attribution for data contributions and ownership
- **Collaboration**: Connect with other data publishers and users
- **Impact**: Increase the visibility and impact of research and data work

### Organizational Accounts

Organizations can create shared accounts that multiple individuals can manage collaboratively. Organizational accounts have their own namespace and allow teams to publish data under a shared identity. For example, the Harvard Library Innovation Lab publishes data under the `harvard-lil` namespace.

#### Organization Features

- **Branded Presence**: Organizations have branded profile pages
- **Team Management**: Multiple individuals can contribute to organization data products
- **Governance**: Organizational policies and standards can be applied to data publishing
- **Analytics**: Insights into data usage and impact

#### Organization Benefits

- **Data Strategy**: Implement a comprehensive data publishing strategy
- **Compliance**: Meet open data requirements and transparency goals
- **Engagement**: Increase engagement with stakeholders and the public
- **Efficiency**: Streamline data sharing processes without maintaining custom infrastructure

#### Roles and Permissions

**Account Roles**: Individuals can have different roles within organizational accounts:

- **Owner**: Full control over the organization and all its data products
- **Administrator**: Can manage data products and organization members
- **Member**: Can contribute to the organization's data products based on assigned permissions

**Data Product Roles**: Access to individual data products can be managed separately:

- **Owner**: Full control over the data product, including deletion and access management
- **Contributor**: Can upload and modify data within the product
- **Viewer**: Can view and download data (relevant for restricted access data products)

## Key Principles

### Open Access

All data published through Source is publicly accessible, promoting transparency and collaboration.

### Simplicity

Source eliminates the complexity of building custom data portals or APIs, making data publishing accessible to everyone.

### Standards-Based

Source leverages existing web standards and object storage protocols, ensuring compatibility and longevity.

### Community-Driven

Source fosters a community of data publishers and users, creating opportunities for collaboration and knowledge sharing.