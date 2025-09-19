# Case Study Logos

This directory contains logos for case studies. Each organization should have two SVG files:

## File Naming Convention

For each organization, create two files:
- `[organization-name]-light.svg` - Logo optimized for light theme
- `[organization-name]-dark.svg` - Logo optimized for dark theme

## Current Organizations

1. **Auspatious**
   - `auspatious-light.svg`
   - `auspatious-dark.svg`

2. **Bridges to Prosperity**
   - `bridges-to-prosperity-light.svg`
   - `bridges-to-prosperity-dark.svg`

3. **Dynamical.org**
   - `dynamical-light.svg`
   - `dynamical-dark.svg`

4. **Earth Genome**
   - `earth-genome-light.svg`
   - `earth-genome-dark.svg`

## Logo Guidelines

- **Format**: SVG format for scalability
- **Size**: Optimized for display at 60px height (200px max width)
- **Colors**: 
  - Light theme logos should work well on light backgrounds
  - Dark theme logos should work well on dark backgrounds
- **Accessibility**: Include proper alt text in the implementation

## Implementation

The logos are automatically displayed using Docusaurus's `ThemedImage` component, which switches between light and dark versions based on the user's theme preference.
