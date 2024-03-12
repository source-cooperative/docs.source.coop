+++
title = "Sharing STAC Catalogs"
weight = 10
+++

## Sharing STAC Catalogs

### Single Catalog
Each data product should contain only one STAC catalog. This helps maintain a clear and organized structure for the data.

### Catalog Location
The STAC catalog should be within a subdirectory of the root directory (e.g., `root/stac/`). This ensures that the catalog is easily accessible and organized.

### Relative Links
Use relative links for all child collections/items and assets within the STAC catalog. This helps maintain the integrity of the links, especially if the data is moved or shared.