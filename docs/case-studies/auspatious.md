# Auspatious

## Auspatious Datasets on Source

- GHRSST Multi-scale Ultra-high Resolution (MUR) dataset: [https://source.coop/ausantarctic/ghrsst-mur-v2/](https://source.coop/ausantarctic/ghrsst-mur-v2/)

## Introducing Auspatious

[Auspatious](https://auspatious.com) specialises in supporting geospatial technology projects, providing software development, data wrangling, and technical leadership.

## Cloud Optimizing Datasets to Enable Collaboration

One project spearheaded by Auspatious was to convert an existing dataset into a cloud native format, the project was in collaboration with Australian Antarctic Division, and aimed to make the Group for High Resolution Sea Surface Temperature (GHRSST) Multi-scale Ultra-high Resolution (MUR) dataset easier to access.

This is a daily dataset, which is accessible from NASA as NetCDF files, which work fine for single-date access, but if you want to explore a year or decade or longer, then the data requires downloading. Auspatious converted the individual measurements from each day to cloud optimised geotiffs and created a GeoParquet STAC index file to them. This optimization makes it possible to access all the data and create a lazy-loaded Xarray using Python, which can then be subset and analysed in seconds using distributed computing tools like Dask.

Source Cooperative provided Auspatious a scalable data store that is discoverable, low-cost, and designed to support many types of user expertise.

> "I value Source Cooperative as a scalable, practically unlimited in size, data store for open data. I could store the data in a commercial account that I manage, but I prefer using a well-known, discoverable space for storage. I like using Source when it's for a broader public good, one which provides public usefulness.
>
> For example, I've downloaded a high resolution elevation model for Tasmania and converted it to a nice COG and it just made sense for me to store it and document access on Source because then everyone can get value out of its simpler access. I appreciate that Source truly supports the broader public good to catalyze collaboration, sharing, and building on existing data."

&mdash; **Alex Leith, Auspatious Founder**

## Find Out More About Auspatious

Learn more about Auspatious: [https://auspatious.com](https://auspatious.com)

## About Source Cooperative

Source Cooperative is the data publishing utility for the web, allowing trusted organizations and individuals to publish data of any kind at any scale.

[Find out more at Source Cooperative](https://source.coop/)
