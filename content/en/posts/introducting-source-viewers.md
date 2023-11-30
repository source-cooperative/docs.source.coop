+++
title = "Introducing Source Viewers"
date = "2023-11-30"
categories = [
    "Announcements"
]
+++

Today we're releasing a [new component](https://github.com/source-cooperative/viewers) of Source Cooperative as well as a [demo site](https://viewers.source.coop).

## Source Viewers

Source Viewers are views into files served over HTTP intended to enable quick and easy exploration of data through your web browser.
The [Source Viewers library](https://github.com/source-cooperative/viewers) contains a collection of React components which define the file types that they are compatible with.
Similar to your operating system's file explorer, the Source Viewer allows you to open a file in all viewers which are compatible with that file type.

At launch, Source Viewers has three different viewers:

- [Text Viewer](/docs/viewers/text) - Renders plain-text files
- [Markdown Viewer](/docs/viewers/markdown) - Renders markdown files as HTML
- [Map Viewer](/docs/viewers/map) - Renders PMTiles and GeoJSON files on a slippy map

Source Viewers is an open-source library and we welcome all contributions to this project!
If there's a file type which is not currently supported you can follow [this guide](https://github.com/source-cooperative/viewers/blob/main/CONTRIBUTING.md) and create a viewer yourself.

## Demo Site

The demo site let's you explore and interact with data _anywhere_ on the web through your browser, as long as it's accessible through HTTP.
This site operates independely of the main [Source Cooperative site](https://beta.source.coop) but both sites utilize the same Source Viewers library so you can get a sense of how your data product will be visualized before you upload it to Source.

As an example of the demo site at work, here's a visualization of the [Google-Microsoft Open Buildings PMTiles file](https://viewers.source.coop/?url=https%3A%2F%2Fdata.source.coop%2Fvida%2Fgoogle-microsoft-open-buildings%2Fpmtiles%2Fgo_ms_building_footprints.pmtiles&viewer=map) provided by VIDA on Source Cooperative.
