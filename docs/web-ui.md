---
title: Web Interface
id: web-ui
slug: /web-ui
sidebar_position: 2
---

## Repositories

Repositories are where data products live on Source. Currently, new data products will be provisioned a path within an Amazon S3 bucket for you will be given credentials that allow you to upload your data. We recommend that you upload a README markdown file that contains detailed documentation about the data product and contact information that data users can use if they need support for the data product.

## Creating a Repository

To create a repository, you must first create an account on Source Cooperative at [https://auth.source.coop/ui/login](https://auth.source.coop/ui/login) and have approval from us to create new repositories after having been approved for [beta access](https://forms.gle/4weS1hkRjZhQLoPE9).

Once you have received confirmation that your account has been enabled for repository creation, sign out of your Source Cooperative account and sign back in. You should now have a "New Repository" button in the dropdown menu at the top right of the navigation bar.

Repositories may be associated with either an Organization or Individual. Repositories created within organizations allow all members of the organization to generate read / write credentials for the underlying S3 bucket. Currently, Organization creation and management is disabled so repositories must be created under your individual account. We will enable this feature when development of our Organization management feature is complete.

Repository IDs appear in the URL for your repository. Repository IDs must be between 3 and 39 characters in length, contain only alphanumeric characters as well as hyphens (A-Z, 0-9, -), may not contain consecutive hyphens, and may not begin or end with a hyphen.

The title for your repository must be less than 200 characters in length.

The description for your repository, if provided, must be less than 500 characters in length. Repository descriptions should be used to give a quick overview of the data product and more information should be provided in the README.

Repository tags allow users to filter for specific data products matching their needs. Tags must be comma separated and you may not have more than 20 tags.

Your repository will be created in the "Unlisted" state. This state means that your repository will not appear in the search results but users with direct links to the repository page will be able to view it. This is useful for when you have not uploaded your entire data product yet or it is not ready for release yet. Once your repository is ready to be published, you can set the state to "Listed" in the repository edit page.

### Uploading Data

After you have created your repository and you are ready to upload your data product, navigate to the repository page and click the "Access Data" link in the sidebar. Here you can generate the S3 credentials necessary to upload your data product to your bucket using the AWS CLI or other tools that support the S3 protocol. Examples on how to use these credentials are shown when your credentials are generated.

### Editing Repositories

After your repository has been created, you may edit the title, description, and tags by navigating to your repository's page and clicking the "Edit" link in the sidebar. You may also change the state of your repository from "Unlisted" to "Listed" here or vice versa.

### README Markdown Files

The landing page for your repository attempts to render a `README.md` located at the root of your bucket. If no `README.md` file is found, a message will be displayed indicating so. If you have uploaded a `README.md` file and this message is showing, check that you have uploaded it to the correct location and wait a few minutes for the cache to update.

You may put whatever content you wish in this document to describe your data product. It's also recommended to include contact information so that if users have questions they know who to reach out to. Standard markup syntax is supported in this file.