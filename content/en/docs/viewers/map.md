+++
title = "Map"
+++

# Map Viewer

## Description

The Map viewer uses [OpenLayers](https://openlayers.org/) to display an interact map of features in PMTiles or GeoJSON files.

## Supported Filetypes

- [GeoJSON](https://geojson.org/)
- [PMTiles](https://docs.protomaps.com/pmtiles/)

## Limitations

The map viewer currently only supports basic plotting of features on a map and clicking on the features displays a popup with that feature's properties.
Large GeoJSON files can cause the viewer to take a long time to load while the file is being downloaded.
