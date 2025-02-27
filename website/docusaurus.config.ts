import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import type {
  NormalizedSidebarItem,
  SidebarItemsGeneratorDoc,
} from "@docusaurus/plugin-content-docs/src/sidebars/types.js";

import * as path from "path";
import * as fs from "fs";
import { AlphaTabWebPackPlugin } from "@coderline/alphatab/webpack";
import { Configuration, RuleSetRule } from "webpack";

const alphaTabVersionFull = JSON.parse(
  fs.readFileSync(
    path.join("node_modules", "@coderline", "alphatab", "package.json"),
    "utf8"
  )
).version;
const isPreRelease = alphaTabVersionFull.indexOf("-") >= 0;
let alphaTabVersion;
if (isPreRelease) {
  alphaTabVersion = alphaTabVersionFull.substring(
    0,
    alphaTabVersionFull.indexOf("-")
  );
} else {
  alphaTabVersion = alphaTabVersionFull;
}

function getSortValue(
  prop: string,
  docs: Map<string, SidebarItemsGeneratorDoc>,
  item: NormalizedSidebarItem
): string | number {
  if (prop in item) {
    return item[prop];
  }

  switch (item.type) {
    case "doc":
      const doc = docs.get(item.id);
      if (doc) {
        if (prop in doc) {
          return doc[prop];
        }

        if (prop in doc.frontMatter) {
          switch (typeof doc.frontMatter[prop]) {
            case "number":
            case "string":
              return doc.frontMatter[prop];
            case "undefined":
              break;
            default:
              return String(doc.frontMatter[prop]);
          }
        }
      }

      break;
    case "category":
      if (prop === "title") {
        return item.label;
      }
      break;
  }

  if (item.customProps && prop in item.customProps) {
    switch (typeof item.customProps[prop]) {
      case "number":
      case "string":
        return item.customProps[prop];
      default:
        return String(item.customProps[prop]);
    }
  }

  console.warn(`Could not get sort prop '${prop}' on sidebar item`, item);
  return "";
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
    alphaTabVersionFull: alphaTabVersionFull,
  },

  markdown: {
    mermaid: true,
  },
  themes: ["@docusaurus/theme-mermaid"],

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          editUrl: "https://github.com/CoderLine/alphaTabWebsite/tree/main/",
          async sidebarItemsGenerator({
            defaultSidebarItemsGenerator,
            ...args
          }) {
            const sidebarItems = await defaultSidebarItemsGenerator(args);

            if (Array.isArray(args.item.customProps?.["sort"])) {
              const ascending = args.item.customProps?.["sort"][1] !== "desc";
              const prop = args.item.customProps?.["sort"][0];

              const docsLookup = new Map<string, SidebarItemsGeneratorDoc>(
                args.docs.map((d) => [d.id, d])
              );

              // Reverse items in categories

              sidebarItems.sort((a, b) => {
                let av = getSortValue(prop, docsLookup, a);
                let bv = getSortValue(prop, docsLookup, b);

                if (typeof av !== typeof bv) {
                  av = String(av);
                  bv = String(bv);
                }

                if (typeof av === "string") {
                  if (ascending) {
                    return av.localeCompare(bv as string);
                  } else {
                    return (bv as string).localeCompare(av);
                  }
                } else {
                  if (ascending) {
                    return av - (bv as number);
                  } else {
                    return (bv as number) - av;
                  }
                }
              });
            }

            return sidebarItems;
          },
        },
        theme: {
          customCss: "./src/css/custom.scss",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    docs: {
      sidebar: {
        hideable: true,
      },
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
            },
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
      additionalLanguages: ["csharp", "diff", "kotlin", "groovy"],
    },
    colorMode: {
      disableSwitch: true,
    },
  } satisfies Preset.ThemeConfig,

  plugins: [
    "docusaurus-plugin-sass",
    require.resolve("docusaurus-lunr-search"),
    () => ({
      name: "docusaurus-customization",
      injectHtmlTags() {
        return {};
      },
      configureWebpack(config, isServer, options) {
        const matchRule = (r: Configuration["module"]["rules"][0]) => {
          if (typeof r === "object") {
            if (r.test instanceof RegExp) {
              return !!r.test.exec("custom.sass");
            } else if (typeof r.test === "undefined") {
              return true;
            } else {
              // unsupported
              return false;
            }
          } else {
            return false;
          }
        };

        let sassRule = config.module.rules.find(matchRule);

        if (typeof sassRule !== "object") {
          throw new Error("Could not find SASS rule");
        }

        if (sassRule.oneOf) {
          sassRule = sassRule.oneOf.find(matchRule);
        }

        if (typeof sassRule !== "object") {
          throw new Error("Could not find inner SASS rule");
        }

        if (!Array.isArray(sassRule.use)) {
          throw new Error("Need SASS rule with use[]");
        }

        const sassLoaderIndex = sassRule.use.findIndex(
          (l) => typeof l === "object" && l.loader?.includes("sass-loader")
        );
        if (sassLoaderIndex === -1) {
          throw new Error("Could not find sass-loader in rule");
        }

        // ensure source-map before resolve-url-loader
        const sassLoader = sassRule.use[sassLoaderIndex] as RuleSetRule;
        sassLoader.options = {
          ...((sassLoader.options as object | undefined) ?? {}),
          sourceMap: true // force sourcemaps
        };


        // insert resolve-url-loader before SASS loader to fix relative URLs
        sassRule.use.splice(sassLoaderIndex, 0, {
          loader: "resolve-url-loader",
        });

        
        return {
          plugins: [
            // Copy the Font and SoundFont Files to the output
            new AlphaTabWebPackPlugin({
              assetOutputDir: config.output.path,
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

export default config;
