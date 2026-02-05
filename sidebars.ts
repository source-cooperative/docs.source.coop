import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'index',
    {
      type: 'category',
      label: 'About Source',
      items: [
        'about-source/what-is-source',
        'about-source/core-concepts',
      ],
    },
    {
      type: 'category',
      label: 'Using Source',
      items: [
        'using-source/create-an-account',
        'using-source/data-upload',
        'using-source/web-ui',
        'using-source/data-proxy',
        
      ],
    },
    {
      type: 'category',
      label: 'Case Studies',
      items: [
        'case-studies/auspatious',
        'case-studies/bridges-to-prosperity',
        'case-studies/earth-genome',
        'case-studies/dynamical',
      ],
    },
  ],
};

export default sidebars;
