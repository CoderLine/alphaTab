module.exports = {
  title: 'alphaTab',
  tagline: 'Build modern music notation apps for web, desktop and mobile',
  url: 'https://alphatab.net',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'CoderLine',
  projectName: 'alphaTab',
  themeConfig: {
    navbar: {
	  hideOnScroll: true,
      logo: {
        alt: 'alphaTab',
        src: 'img/alphaTab.png',
      },
      links: [
        {to: 'docs/introduction', label: 'Docs', position: 'left'},
        {to: 'docs/tutorial', label: 'Tutorial', position: 'left'},
        {to: 'docs/showcase', label: 'Showcase', position: 'left'},
        {to: 'community', label: 'Community', position: 'left'},
        {to: 'blog', label: 'Blog', position: 'left'},
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
              to: 'docs/installation',
            },
            {
              label: 'AlphaTex',
              to: 'docs/alphaTex',
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
              label: 'Blog',
              to: 'blog',
            },
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
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/CoderLine/alphaTabWebsite/tree/master',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
