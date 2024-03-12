+++
title = "Repository basics"
weight = 10
+++

## Repository Basics

### README File
Include a `README.md` file in the root directory of your data product. This file should provide essential information about the data product, including its purpose, contents, and usage instructions.

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

### Minimize your root directory
Keep the root directory of the data product minimal in terms of files and directories. This helps maintain a clean and organized structure and an easy entry point for data users.

### Store data and metadata in separate directories
Store data and metadat files within separate subdirectories of the root directory. For example, you could include data files in a `~/data/` and metadata in a `~/metadata/` directory. This allows users to efficiently list metadata files without needing to list both data and metadata files simultaneously. 

If you're using a commonly used metadata standard such as STAC, name the metadata folder after the standard, such as `~/stac/`.

### Provide a data license 
Include a `LICENSE.txt` file in the root directory containing the full license text for the data product. This ensures that users understand the licensing terms for using the data.

### Validate your data before uploading
Validate your data to ensure it is accurate, complete, and in the expected format. This can help prevent errors and ensure the integrity of the data.

### Don't upload .DS_STORE files
Ensure your data product does not include any `.DS_STORE` files, as these are macOS system files and are not relevant to the data.
