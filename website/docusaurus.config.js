// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");
const path = require("path");
const fs = require("fs");
const CopyPlugin = require("copy-webpack-plugin");

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

/** @type {import('@docusaurus/types').Config} */
const config = {
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

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl: "https://github.com/CoderLine/alphaTabWebsite/tree/master/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.scss"),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
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
                to: "docs/alphaTex/introduction",
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
        theme: lightCodeTheme,
        darkCodeTheme: darkCodeTheme,
        additionalLanguages: ["csharp"],
      },
      colorMode: {
        disableSwitch: true,
      },
    }),

  plugins: [
    "docusaurus-plugin-sass",
    require.resolve('docusaurus-lunr-search'),
    // [
    //   require.resolve("./plugins/tsdoc"),
    //   {
    //     in: './node_modules/@coderline/alphatab/dist/alphaTab.d.ts',
    //     out: path.resolve('docs', "tsdoc")
    //   }
    // ],
    () => ({
      name: "docusaurus-customization",
      injectHtmlTags() {
        return {};
      },
      configureWebpack(config, isServer, options) {
        return {
          module: {
            rules: [
              {
                test: /\.sf2/,
                type: "asset/resource",
              },
            ],
          },
          plugins: [
            // Copy the Font and SoundFont Files to the output
            new CopyPlugin({
              patterns: [
                {
                  from: "node_modules/@coderline/alphatab/dist/font/*.*",
                  to: path.resolve(config.output.path, "font", "[name][ext]"),
                },
              ],
            }),
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
            },
          },
        };
      },
    }),
  ],
};

module.exports = config;
