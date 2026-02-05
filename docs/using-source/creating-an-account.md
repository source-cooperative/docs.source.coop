---
title: Creating an Account on Source Cooperative
id: create-an-account
slug: /create-an-account
sidebar_position: 2
draft: true
---

Getting started with Source Cooperative requires creating an account. Currently, Source is in beta, so publishing data requires being accepted as a beta tester.

## Prerequisites

Before creating an account, be aware that:
- **Source is currently in beta**: All data hosted in Source is publicly accessible, but publishing data requires applying to be a beta tester
- **Beta tester application**: To publish data to Source, apply at [https://forms.gle/4weS1hkRjZhQLoPE9](https://forms.gle/4weS1hkRjZhQLoPE9)
- **Browsing and downloading**: You can browse and download public data on Source without an account

## Step 1: Navigate to Source Cooperative

Visit [https://source.coop](https://source.coop) and click "Log In / Register" in the top navigation.

## Step 2: Choose Your Sign-Up Method

Source offers authentication through third-party providers. Select your preferred authentication method and follow the sign-in flow. Common options may include:
- GitHub authentication
- Google authentication  
- Other OAuth providers

## Step 3: Set Up Your Profile

After authentication, you'll be able to:
- Set your username (this becomes your namespace: `username/`)
- Add a display name
- Provide biographical information (optional)
- Add profile links and additional information

## Step 4: Apply as a Beta Tester (For Data Publishers)

If you want to publish data on Source:

1. Complete the beta tester application at [https://forms.gle/4weS1hkRjZhQLoPE9](https://forms.gle/4weS1hkRjZhQLoPE9)
2. Wait for approval from the Radiant Earth team
3. Once approved, you'll be able to create data products and upload data

## Creating an Organizational Account

If you need to publish data under an organizational identity rather than your personal account:

1. First create your individual account
2. Contact the Source team at [hello@source.coop](mailto:hello@source.coop) to request creation of an organizational account
3. Provide:
   - Desired organization name and ID
   - Organization description
   - Initial organization members and their roles
4. The Source team will create the organizational account and grant you access

Note: Self-service organizational account creation is on the roadmap but not yet available.

## Tips for Account Setup

- **Choose your username carefully**: Your username becomes part of all your data product URLs (e.g., `https://source.coop/username/dataset-name/`). Choose something professional and recognizable.

- **Use your real identity**: Source is built for trusted organizations and individuals. Using your real name or organizational identity helps build trust in the data you publish.

- **Complete your profile**: A complete profile with biographical information helps other users understand who is publishing the data and builds confidence in your data products.

- **Link to your work**: Include links to your organization, research profile (ORCID), or relevant work to establish credibility.

## What You Can Do With an Account

Once you have an account and beta access:

- **Publish data products**: Create repositories to host your datasets
- **Generate access credentials**: Get AWS CLI credentials for programmatic data access
- **Manage your data**: Update, organize, and document your data products
- **Collaborate**: Add team members to organizational accounts
- **Track usage**: Monitor how your data products are being accessed (feature in development)

## Data Access Without an Account

You don't need an account to:
- Browse public data products on Source
- Download data through your web browser  
- Access data via direct HTTP URLs
- View data previews

However, you will need an account for:
- Accessing data programmatically via AWS CLI
- Generating S3-compatible access credentials
- Publishing your own data products
- Accessing private or restricted data products (if granted permission)

## Next Steps

After creating your account:
1. Explore existing data products to see examples
2. Review the [Core Concepts](core-concepts.md) to understand how Source works
3. If approved as a beta tester, proceed to [Publishing a Data Product](publishing-a-data-product.md)
4. Learn about [uploading data](uploading-data.md) to your repositories