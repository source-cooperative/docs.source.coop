+++
title = "Best Practices"
+++

# Best Practices for Uploading Your Data
---

In the era of data-driven decision-making, the importance of well-organized and easily accessible data cannot be overstated. For customers uploading data to Source Cooperative, adhering to best practices ensures that their data products are not only compliant but also user-friendly and valuable to the wider community.

This guide outlines a comprehensive set of best practices for customers to follow when uploading data to Source Cooperative. From structuring the data product to including essential documentation and ensuring data security, these best practices aim to promote transparency, accessibility, and usability in data sharing. By following these guidelines, customers can contribute to a more efficient and effective data sharing ecosystem, benefiting both data producers and consumers alike.


## General Best Practices

### README File
Include a `README.md` file in the root directory of your data product. This file should provide essential information about the data product, including its purpose, contents, and usage instructions.

### Avoid .DS_STORE Files
Ensure your data product does not include any `.DS_STORE` files, as these are macOS system files and are not relevant to the data.

### Minimal Root Directory
Keep the root directory of the data product minimal in terms of files and directories. This helps maintain a clean and organized structure.

### Data Storage
Store the data within a subdirectory of the root directory (e.g., `root/data/`). This makes it easier to manage and access the data files.

### Metadata Storage
Store metadata, such as STAC catalogs or other relevant information, in a subdirectory of the root directory. This ensures that metadata is kept separate from the data files.

### Licensing
Include a `LICENSE.txt` file in the root directory containing the full license text for the data product. This ensures that users understand the licensing terms for using the data.

### README Guidelines
- **Description**: Provide a detailed description of the data product, including its purpose and scope. Provide detailed documentation for your data product, including data dictionaries, schema descriptions, and any relevant background information. This helps users understand the data and how to use it effectively.
- **Creator Information**: Mention the individuals or organization that created the data product.
- **Contact Information**: Include contact information for the author of the data product, in case users have questions or need further information.
- **Citation**: Provide citation information for the data product, including how users should cite the data in their work.
- **Usage Example**: Include an example of how to use the data product, such as code snippets or sample analyses.
- **Creation Process**: Describe how the data product was created, including any methodologies or tools used.
- **File Formats**: Specify what file formats the data product contains, so users know how to access and use the data.
- **Directory Structure**: Outline the directory structure of the data product, so users can easily navigate and find the data they need.
- **Licensing**: Mention the license of the data product, including any restrictions on use or distribution.

### Data Validation
Validate your data to ensure it is accurate, complete, and in the expected format. This can help prevent errors and ensure the integrity of the data.

## STAC Catalog Best Practices

### Single Catalog
Each data product should contain only one STAC catalog. This helps maintain a clear and organized structure for the data.

### Catalog Location
The STAC catalog should be within a subdirectory of the root directory (e.g., `root/stac/`). This ensures that the catalog is easily accessible and organized.

### Relative Links
Use relative links for all child collections/items and assets within the STAC catalog. This helps maintain the integrity of the links, especially if the data is moved or shared.

## Examples Best Practices

### Example Storage
Store examples, such as notebooks or scripts, in a subdirectory of the root directory (e.g., `root/examples/`). This makes it easy for users to find and use the examples.

### Sensitive Information
Ensure that notebooks or scripts do not include any sensitive information, such as credentials or personal data. This helps protect the privacy and security of the data and the users.

By following these best practices, you can ensure that your data products are well-organized on Source, easily accessible, and comply with standard practices for data sharing and distribution.

