---
title: Create a Data Product
id: create-a-data-product
slug: /create-a-data-product
sidebar_position: 2
---

Before creating a data product, you need to [create an account](/create-an-account) and apply for beta access. After approval, sign out and sign back in—the option to create a new data product will then appear in the dropdown at the top right of the navigation bar.

Data products can be owned by an organization or an individual. You will see a dropdown option when creating the data product of who will be displayed as the data product host (you or one of your organizations).

## When creating a data product

- **Product Title**: Maximum 200 characters.
- - **Owner Account***: The account that the product will be listed under. If you are a part of 1 or multiple organizations, you will see the organization(s) as options for hosting in addition with your personal account. If you are not a part of any organizations, the owner will be your personal account. 
- - **Product ID**: 3–39 characters, alphanumeric and hyphens only (A–Z, 0–9, -). No consecutive hyphens, and it cannot start or end with a hyphen. The identifier appears in the URL.
- **Description**: Optional; maximum 500 characters. Use it for a short overview; put detailed documentation in the README.
- **Visibility**: New data products are created **Unlisted** (not shown in search). When ready to publish, open the data product page, click the gear icon, and set the state to **Listed**.
- **Tags**: Comma-separated, up to 20 tags. They help others discover your data.
- **Data Connection**: Choose where the product's data lives. By default it uses Source-managed storage. If you've set up [Bring Your Own Bucket](/bring-your-own-bucket), select the data connection for your bucket instead. If you don't have a strong preference, choose a connection in the `us-west-2` region—this is where most Source data lives, and colocating keeps access fast and avoids cross-region transfer costs.

You can bring an existing S3 bucket you own rather than storing data on Source. This is a beta feature—see [Bring Your Own Bucket](/bring-your-own-bucket) to set up a data connection before creating the product, then select it here.

## Editing a data product

To change the title, description, tags, or visibility later, open your data product page and click the gear icon.

## README and documentation

The landing page for a data product renders a `README.md` file from the root of the product. You can use standard markdown. Include contact information so users know who to reach for support. If your README does not appear after uploading, check that the file is at the root and allow a few minutes for the cache to update.

## Next steps

After creating your data product, see [Upload Your Data](/data-upload) to add files.
