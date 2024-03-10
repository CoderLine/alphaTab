import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

import * as path from "path";
import * as fs from "fs";
import { AlphaTabWebPackPlugin } from '@coderline/alphatab/webpack'

const alphaTabVersionFull = JSON.parse(
  fs.readFileSync(
    path.join("node_modules", "@coderline", "alphatab", "package.json"),
    "utf8"
  )
).version;
const isPreRelease = alphaTabVersionFull.indexOf("-") >= 0;
let alphaTabVersion;
if (isPreRelease) {
  alphaTabVersion = alphaTabVersionFull.substring(0, alphaTabVersionFull.indexOf("-"));
} else {
  alphaTabVersion = alphaTabVersionFull;
}

const config: Config = {
  title: "alphaTab",
  tagline: "Build modern music notation apps for web, desktop and mobile",
  url: "https://alphatab.net",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "CoderLine",
  projectName: "alphaTab",
  customFields: {
    isPreRelease: isPreRelease,
    alphaTabVersion: alphaTabVersion,
    alphaTabVersionFull: alphaTabVersionFull
  },

  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          editUrl: "https://github.com/CoderLine/alphaTabWebsite/tree/main/",
        },
        theme: {
          customCss: "./src/css/custom.scss",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig:
    {
      docs: {
        sidebar: {
          hideable: true
        }
      },
      navbar: {
        title: "alphaTab",
        logo: {
          alt: "alphaTab Logo",
          src: "img/alphaTab.png",
        },
        items: [
          {
            type: "doc",
            docId: "introduction",
            position: "left",
            label: "Docs",
          },
          {
            type: "doc",
            docId: "tutorials",
            position: "left",
            label: "Tutorial",
          },
          {
            type: "doc",
            docId: "alphatex/introduction",
            position: "left",
            label: "alphaTex",
          },
          {
            type: "doc",
            docId: "showcase/introduction",
            position: "left",
            label: "Showcase",
          },
          // Right
          {
            type: "dropdown",
            position: "right",
            label: isPreRelease ? `${alphaTabVersion} 🚧` : alphaTabVersion,
            items: [
              {
                href: "https://next.alphatab.net",
                label: "Next Version 🚧",
              },
              {
                href: "https://alphatab.net",
                label: "Stable Version",
              }
            ],
          },
          {
            href: "https://github.com/CoderLine/alphaTab",
            label: "GitHub",
            className: "header-github-link",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Docs", 
            items: [
              {
                label: "Introduction",
                to: "docs/introduction",
              },
              { 
                label: "Installation",
                to: "docs/getting-started/installation-web",
              },
              {
                label: "AlphaTex",
                to: "docs/alphatex/introduction",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "GitHub",
                href: "https://github.com/CoderLine/alphaTab",
              },
              {
                label: "Stack Overflow",
                href: "https://stackoverflow.com/questions/tagged/alphatab",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Daniel Kuschny and Contributors`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ["csharp", "diff"],
      },
      colorMode: {
        disableSwitch: true,
      },
    } satisfies Preset.ThemeConfig,

  plugins: [
    "docusaurus-plugin-sass",
    require.resolve('docusaurus-lunr-search'),
    () => ({
      name: "docusaurus-customization",
      injectHtmlTags() {
        return {};
      },
      configureWebpack(config, isServer, options) {
        return {
          plugins: [
            // Copy the Font and SoundFont Files to the output
            new AlphaTabWebPackPlugin({ 
              assetOutputDir: config.output.path
            })
          ],
          resolve: {
            fallback: {
              fs: false,
              buffer: false,
              path: false,
              os: false,
              util: false,
              assert: false,
              stream: false,
              crypto: false,
              constants: false,
              child_process: false,
              module: false,
            }
          },
        };
      },
    }),
  ],
};

export default config;
