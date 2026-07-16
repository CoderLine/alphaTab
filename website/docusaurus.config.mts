import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import type {
  NormalizedSidebarItem,
  SidebarItemsGeneratorDoc,
} from "@docusaurus/plugin-content-docs/src/sidebars/types.js";
import remarkGithubAdmonitionsToDirectives from "remark-github-admonitions-to-directives";

import * as path from "path";
import * as fs from "fs";
import { AlphaTabWebPackPlugin } from "@coderline/alphatab-webpack";
import { RuleSetRule } from "webpack";

const alphaTabVersionFull = JSON.parse(
  fs.readFileSync(
    path.join("node_modules", "@coderline", "alphatab", "package.json"),
    "utf8"
  )
).version;

// Fetch the GitHub star count from shields.io at build time. Stored in
// customFields as the initial value; the client-side GitHubStarsLink component
// refreshes it on page load (shields.io's 30 min HTTP cache prevents per-visitor
// chatter). shields.io's JSON endpoint is documented at
// https://github.com/badges/shields/blob/master/doc/json-format.md
async function fetchInitialGithubStars(
  slug: string,
  fallback: string,
): Promise<string> {
  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(
      `https://img.shields.io/github/stars/${slug}.json`,
      { signal: ctrl.signal },
    );
    clearTimeout(timeout);
    if (!res.ok) return fallback;
    const data = (await res.json()) as { message?: string; value?: string };
    return data.message ?? data.value ?? fallback;
  } catch {
    return fallback;
  }
}
const githubRepo = "CoderLine/alphaTab";

// Discover the latest release-notes page so the landing banner's "Release
// notes" link always points to the newest release without manual edits.
function findLatestReleaseNotesPath(): string {
  const dir = path.join("docs", "releases");
  const files = fs.readdirSync(dir);
  // Filenames look like `release1_8.mdx`. Sort by the numeric suffix and pick
  // the highest. Strip the extension for the docs URL.
  const ranked = files
    .map((f) => {
      const m = f.match(/^release(\d+)_(\d+)\.(mdx?|md)$/);
      if (!m) return null;
      const major = parseInt(m[1], 10);
      const minor = parseInt(m[2], 10);
      const base = f.replace(/\.(mdx?|md)$/, "");
      return { major, minor, base };
    })
    .filter((x): x is { major: number; minor: number; base: string } => x !== null)
    .sort((a, b) => b.major - a.major || b.minor - a.minor);
  const latest = ranked[0]?.base ?? "release1_0";
  return `/docs/releases/${latest}`;
}
const latestReleaseNotesPath = findLatestReleaseNotesPath();
const isPreRelease = alphaTabVersionFull.indexOf("-") >= 0;
let alphaTabVersion;
let algoliaAppId = '26AE6KNYRK';
let algoliaApiKey = '3db9646111702a74fe1f2249ddafa870';
let algoliaIndexName;
if (isPreRelease) {
  alphaTabVersion = alphaTabVersionFull.substring(
    0,
    alphaTabVersionFull.indexOf("-")
  );
  algoliaIndexName = 'next_alphaTab';
} else {
  alphaTabVersion = alphaTabVersionFull;
  algoliaIndexName = 'alphaTab';
}

function getSortValue(
  prop: string,
  docs: Map<string, SidebarItemsGeneratorDoc>,
  item: NormalizedSidebarItem
): string | number | undefined {
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

  // console.warn(`Could not get sort prop '${prop}' on sidebar item`, item);
  return undefined;
}

// Docusaurus loads .mts configs via jiti, which does not support top-level
// await. Wrap the config in an async default-export function so we can await
// the shields.io fetch at build time.
async function createConfig(): Promise<Config> {
  const githubStarsInitial = await fetchInitialGithubStars(githubRepo, "1.7k");
  return {
  title: "alphaTab",
  tagline: "Build modern music notation apps for web, desktop and mobile",
  url: "https://alphatab.net",
  baseUrl: "/",
  favicon: "img/favicon.ico",
  organizationName: "CoderLine",
  projectName: "alphaTab",
  onBrokenLinks: "throw",
  customFields: {
    isPreRelease: isPreRelease,
    alphaTabVersion: alphaTabVersion,
    alphaTabVersionFull: alphaTabVersionFull,
    githubRepo: githubRepo,
    githubStarsInitial: githubStarsInitial,
    latestReleaseNotesPath: latestReleaseNotesPath,
  },

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: "warn",
    }
  },
  themes: ["@docusaurus/theme-mermaid"],

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          editUrl: "https://github.com/CoderLine/alphaTabWebsite/tree/main/",
          beforeDefaultRemarkPlugins: [remarkGithubAdmonitionsToDirectives],
          async sidebarItemsGenerator({
            defaultSidebarItemsGenerator,
            ...args
          }) {
            const sidebarItems = await defaultSidebarItemsGenerator(args);

            if (Array.isArray(args.item.customProps?.["sort"])) {
              let props = args.item.customProps?.["sort"] as
                | [string, string]
                | [string, string][];
              if (!Array.isArray(props[0])) {
                props = [props as [string, string]];
              }

              const docsLookup = new Map<string, SidebarItemsGeneratorDoc>(
                args.docs.map((d) => [d.id, d])
              );

              // Reverse items in categories

              sidebarItems.sort((a, b) => {
                for (const prop of props) {
                  const ascending = prop[1] !== "desc";

                  let av = getSortValue(prop[0], docsLookup, a);
                  let bv = getSortValue(prop[0], docsLookup, b);

                  if (typeof av !== typeof bv) {
                    av = av === undefined ? av : String(av);
                    bv = bv === undefined ? bv : String(bv);
                  }

                  var result = 0;

                  if (av === undefined && bv === undefined) {
                    // continue
                  } else if (av === undefined) {
                    return -1;
                  } else if (bv === undefined) {
                    return 1;
                  } else if (typeof av === "string") {
                    if (ascending) {
                      result = av.localeCompare(bv as string);
                    } else {
                      result = (bv as string).localeCompare(av);
                    }
                  } else {
                    if (ascending) {
                      result = av - (bv as number);
                    } else {
                      result = (bv as number) - av;
                    }
                  }

                  if (result !== 0) {
                    return result;
                  }
                }

                return 0;
              });
            }

            return sidebarItems;
          },
        },
        theme: {
          customCss: "./src/css/custom.scss",
        },
        sitemap: {
          async createSitemapItems({defaultCreateSitemapItems, ...params}) {
            const defaultItems = await defaultCreateSitemapItems(params);
            
            // rank reference type docs lower than manual docs
            for(const item of defaultItems) {
              if(item.url.includes('reference/types')) {
                item.priority = 0.1;
              }
            }

            return defaultItems;
          },
        }
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
          className: "navbar-link-secondary",
        },
        {
          type: "doc",
          docId: "showcase/introduction",
          position: "left",
          label: "Showcase",
          className: "navbar-link-secondary",
        },
        {
          type: "doc",
          docId: "playground/playground",
          position: "left",
          label: "Playground",
        },
        // Right
        {
          type: "search",
          position: "right"
        },
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
        // Custom navbar item type — see src/theme/NavbarItem/ComponentTypes.ts.
        // Renders the GitHub icon + live star count from shields.io, falling
        // back to the build-time fetched value in `customFields.githubStarsInitial`.
        {
          type: "custom-githubStarsLink",
          position: "right",
          href: `https://github.com/${githubRepo}`,
          className: "header-github-link",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      ],
    },
    footer: {
      style: "light",
      links: [
        {
          title: "Docs",
          items: [
            { label: "Getting started", to: "/docs/introduction" },
            { label: "Web", to: "/docs/getting-started/installation-web" },
            { label: ".NET", to: "/docs/getting-started/installation-net" },
            { label: "Android", to: "/docs/getting-started/installation-android" },
            { label: "Migration", to: "/docs/migration/breaking-changes-097-098" },
          ],
        },
        {
          title: "Learn",
          items: [
            { label: "Tutorial", to: "/docs/tutorials" },
            { label: "alphaTex", to: "/docs/alphatex/introduction" },
            { label: "Showcase", to: "/docs/showcase/introduction" },
            { label: "Playground", to: "/docs/playground/playground" },
          ],
        },
        {
          title: "Project",
          items: [
            { label: "GitHub", href: "https://github.com/CoderLine/alphaTab" },
            { label: "Release notes", to: latestReleaseNotesPath },
            { label: "Contributing", to: "/docs/contributing" },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "Discussions",
              href: "https://github.com/CoderLine/alphaTab/discussions",
            },
            {
              label: "Issues",
              href: "https://github.com/CoderLine/alphaTab/issues",
            },
            {
              label: "Stack Overflow",
              href: "https://stackoverflow.com/questions/tagged/alphatab",
            },
          ],
        },
      ],
      copyright: `© 2010—${new Date().getFullYear()} alphaTab contributors · MPL-2.0`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ["csharp", "diff", "kotlin", "groovy"],
    },
    colorMode: {
      defaultMode: 'light'
    },
    algolia: {
      appId: algoliaAppId,
      apiKey: algoliaApiKey,
      indexName: algoliaIndexName
    },
  } satisfies Preset.ThemeConfig,

  plugins: [
    "docusaurus-plugin-sass",
    () => ({
      name: "docusaurus-customization",
      injectHtmlTags() {
        return {};
      },
      configureWebpack(config, isServer, options) {
        const matchRule = (r: RuleSetRule) => {
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

        let sassRule = config.module!.rules!.find(matchRule);

        if (typeof sassRule !== "object") {
          throw new Error("Could not find SASS rule");
        }

        if (sassRule!.oneOf) {
          sassRule = sassRule!.oneOf.find(matchRule);
        }

        if (typeof sassRule !== "object") {
          throw new Error("Could not find inner SASS rule");
        }

        if (!Array.isArray(sassRule!.use)) {
          throw new Error("Need SASS rule with use[]");
        }

        const sassLoaderIndex = sassRule!.use.findIndex(
          (l) => typeof l === "object" && l!.loader?.includes("sass-loader")
        );
        if (sassLoaderIndex === -1) {
          throw new Error("Could not find sass-loader in rule");
        }

        // ensure source-map before resolve-url-loader
        const sassLoader = sassRule!.use[sassLoaderIndex] as RuleSetRule;
        sassLoader.options = {
          ...((sassLoader.options as object | undefined) ?? {}),
          sourceMap: true, // force sourcemaps
        };

        // insert resolve-url-loader before SASS loader to fix relative URLs
        sassRule!.use.splice(sassLoaderIndex, 0, {
          loader: "resolve-url-loader",
        });

        return {
          plugins: [
            // Copy the Font and SoundFont Files to the output
            new AlphaTabWebPackPlugin({
              assetOutputDir: config.output!.path,
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
}

export default createConfig;
