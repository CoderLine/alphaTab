const path = require('path');
const admonitions = require('remark-admonitions');

module.exports = {
  title: 'alphaTab',
  tagline: 'Build modern music notation apps for web, desktop and mobile',
  url: 'https://alphatab.net',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'CoderLine',
  projectName: 'alphaTab',
  themeConfig: {
    disableDarkMode: true,
    navbar: {
      hideOnScroll: true,
      logo: {
        alt: 'alphaTab',
        src: 'img/alphaTab.png',
      },
      links: [
        { to: 'docs/introduction', label: 'Docs', position: 'left' },
        { to: 'docs/tutorial', label: 'Tutorial', position: 'left' },
        { to: 'docs/alphaTex/introduction', label: 'alphaTex', position: 'left' },
        { to: 'docs/showcase/introduction', label: 'Showcase', position: 'left' },
        {
          href: 'https://github.com/CoderLine/alphaTab',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Introduction',
              to: 'docs/introduction',
            },
            {
              label: 'Installation',
              to: 'docs/getting-started/installation-web',
            },
            {
              label: 'AlphaTex',
              to: 'docs/alphaTex/introduction',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Gitter',
              href: 'https://gitter.im/alphaTabMusic/community',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/CoderLine/alphaTab',
            },
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/alphatab',
            },
          ],
        },
        {
          title: 'Social',
          items: [
            {
              label: 'Facebook',
              href: 'https://facebook.com/alphaTabMusic',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/alphaTabMusic',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Daniel Kuschny and Contributors`,
    },
    prism: {
      additionalLanguages: ['csharp'],
    }
  },
  plugins: [
    [
      '@docusaurus/plugin-content-blog',
      {

      }
    ],
    [
      '@docusaurus/plugin-content-pages',
      {
      }
    ],
    [
      '@docusaurus/plugin-sitemap',
      {

      }
    ],
    [
      path.resolve(__dirname, './plugins/docusaurus-plugin-content-docs'),
      {
        sidebarPath: require.resolve('./sidebars.js'),
        editUrl: 'https://github.com/CoderLine/alphaTabWebsite/tree/master',
        remarkPlugins: [
          admonitions
        ]
      }
    ],
    [
      path.resolve(__dirname, './plugins/alphatab'),
      {
      }
    ]
  ],
  themes: [
    [
      '@docusaurus/theme-classic', 
      {
        customCss: require.resolve('./src/css/custom.css')
      }
    ],
    // algolia && '@docusaurus/theme-search-algolia',
  ]
};
