---
hide_title: true
title: Source Cooperative Documentation
id: index
slug: /
sidebar_label: Home
sidebar_position: 1
---

import ThemedImage from '@theme/ThemedImage';

<ThemedImage
  alt="Source Cooperative Logotype"
  width="400"
  height="auto"
  sources={{
    light: '/img/logotype-light.svg',
    dark: '/img/logotype-dark.svg',
  }}
/>

<div className="hero hero--primary" style={{padding: '4rem 0', marginBottom: '2rem'}}>
  <div className="container">
    <h1 className="hero__title" style={{fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem'}}>
      Source Cooperative is the data publishing utility for the web
    </h1>
    <p className="hero__subtitle" style={{fontSize: '1.25rem', opacity: '0.9'}}>
      Share your data with the world without building servers, APIs, or portals. Just upload and go.
    </p>
  </div>
</div>


---

# Source Cooperative Documentation

[Source Cooperative](https://source.coop) makes it easy for organizations to share data publicly without the technical complexity of building their own infrastructure.

## How is Source different?

**vs. Cloud Object Storage.** While object storage services like Amazon S3, Google Cloud Storage, and Azure Blob Storage can store data, they don't make it discoverable or accessible to others. Source is a utility built on top of cloud object storage services that provides a public catalog, standardized access, and community visibility that raw cloud storage can't offer. 

**vs. Google Drive/Dropbox:** Most consumer-facing cloud storage services are designed for personal file sharing, not data publishing. Source is built specifically for organizations that want to share data openly with proper documentation, standardized formats, and global discoverability – allowing others to access and build on your data without needing to download it.

**vs. Building your own solution:** Instead of building and maintaining data portals, custom APIs, and hosting infrastructure, Source lets you focus on the fundamentals that make data easy to publish and easy to use.

Source is currently in beta, but all data hosted in Source is available to the public and can be accessed by anyone. If you would like to publish data to Source, please [apply to be a beta tester](https://forms.gle/4weS1hkRjZhQLoPE9).

## Organizations Using Source

Source is trusted by leading organizations to publish and share data for the public good:

- **[Bridges to Prosperity](case-studies/bridges-to-prosperity)** uses Source to enable AI-powered global water mapping, tripling the known extent of mapped waterways worldwide and helping raise hundreds of thousands in funding for rural infrastructure projects.

- **[Earth Genome](case-studies/earth-genome)** shares 60+ terabytes of processed satellite imagery and 3.5 billion embeddings through Source, making foundational planetary data accessible to researchers, journalists, and communities across nearly every continent.

- **[Dynamical.org](case-studies/dynamical)** provides fast, easy access to weather data through Source, serving 13,000 unique visitors and 31.3 million data requests while enabling hundreds of organizations to save significant time on weather data management.

- **[Auspatious](case-studies/auspatious)** uses Source to publish cloud-optimized geospatial datasets, making high-resolution sea surface temperature data accessible to researchers without requiring large downloads or complex infrastructure.

## Contributing to Source

The code for Source is open source and available on [GitHub](https://github.com/source-cooperative/). We welcome pull requests, bug reports, and feature requests to:

- https://github.com/source-cooperative/source.coop – the Next.JS application which hosts the Source frontend and API
- https://github.com/source-cooperative/data.source.coop – the rust application which hosts the Source Data Proxy

We also seek volunteers and contractors to help with documentation, design, and community management. If you are interested in contributing to Source, please [contact us](mailto:hello@source.coop).

## Funding and Governance  

Source is developed, maintained, and governed by [Radiant Earth](https://radiant.earth), a 501(c)(3) non-profit organization. We are exploring cooperative governance models for Source that we may implement in the future, and have drafted proposed bylaws at https://github.com/source-cooperative/governance.

Current development of Source is funded by the [Navigation Fund's Open Science Initiative](https://www.navigation.org/grants/open-science). If you are interested in providing financial support to accelerate development of Source, please [contact us](mailto:hello@source.coop).