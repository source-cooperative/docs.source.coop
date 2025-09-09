import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Source Cooperative Documentation',
  tagline: 'Source Cooperative Documentation',
  // Set the production url of your site here
  url: 'https://docs.source.coop',
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: '/',
  
  favicon: '/img/favicon.svg',

  // GitHub pages deployment config.
  organizationName: 'source-cooperative',
  projectName: 'docs.source.coop',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    [
      '@docusaurus/plugin-vercel-analytics',
      {
        debug: true,
        mode: 'auto',
      },
    ],
  ],

  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
        },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/source-docs-social-card.jpg',
    metadata: [
      {name: 'theme-color', content: '#121a1b'},
      {name: 'apple-mobile-web-app-capable', content: 'yes'},
      {name: 'apple-mobile-web-app-status-bar-style', content: 'default'},
      {name: 'apple-mobile-web-app-title', content: 'Source Docs'},
    ],
    navbar: {
      title: 'Source Cooperative Documentation',
      logo: {
        alt: 'Source Cooperative Documentation',
        src: 'img/logo-light.svg',
        srcDark: 'img/logo-dark.svg',
      },
      items: [
      ],
    },
    footer: {
      copyright: `<a href="https://source.coop">Source Cooperative</a> • Copyright © ${new Date().getFullYear()} <a href="https://radiant.earth">Radiant Earth</a>`
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;