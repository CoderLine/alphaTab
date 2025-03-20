import rangeParser from "parse-numeric-range";
import { useThemeConfig } from "@docusaurus/theme-common";

type MagicCommentConfig = ReturnType<
  typeof useThemeConfig
>["prism"]["magicComments"][0];

/**
 * The supported types for {@link CodeBlockMeta.options} values.
 */
export type CodeMetaOptionValue = string | boolean | number;

/**
 * Any options as specified by the user in the "metastring" of codeblocks.
 */
export interface CodeBlockMeta {
  /**
   * The highlighted lines, 0-indexed. e.g. `{ 0: ["highlight", "sample"] }`
   * means the 1st line should have `highlight` and `sample` as class names.
   */
  readonly lineClassNames: { [lineIndex: number]: string[] };

  /**
   * The parsed options, key converted to lowercase.
   * e.g. `"title" => "file.js", "showlinenumbers" => true`
   */
  readonly options: { [key: string]: CodeMetaOptionValue };
}

// note: regexp/no-useless-non-capturing-group is a false positive
// the group is required or it breaks the correct alternation of
// <quote><stringValue><quote> | <rawValue>
const optionRegex =
  // eslint-disable-next-line regexp/no-useless-non-capturing-group
  /(?<key>\w+)(?:=(?:(?:(?<quote>["'])(?<stringValue>.*?)\k<quote>)|(?<rawValue>\S*)))?/g;
const metastringLinesRangeRegex = /\{(?<range>[\d,-]+)\}/g;
const highlightOptionKey = "highlight";

function parseCodeBlockOptions(
  meta: CodeBlockMeta,
  originalMetastring: string,
  metastring: string,
  magicComments: MagicCommentConfig[]
) {
  if (metastring) {
    optionRegex.lastIndex = 0;

    let match = optionRegex.exec(metastring);

    while (match) {
      const { stringValue, rawValue } = match.groups!;

      const key = match.groups!.key!.toLowerCase();

      // special highlight option
      if (key === highlightOptionKey) {
        if (magicComments.length === 0) {
          throw new Error(
            `A highlight range has been given in code block's metastring (\`\`\` ${originalMetastring}), but no magic comment config is available. Docusaurus applies the first magic comment entry's className for metastring ranges.`
          );
        }
        const metastringRangeClassName = magicComments[0]!.className;
        rangeParser(stringValue ?? rawValue!)
          .filter((n) => n > 0)
          .forEach((n) => {
            meta.lineClassNames[n - 1] = [metastringRangeClassName];
          });
      } else if (stringValue === undefined && rawValue === undefined) {
        // flag options
        meta.options[key] = true;
      } else if (stringValue !== undefined) {
        // string option
        meta.options[key] = stringValue;
      } else if (rawValue === "true") {
        // boolean option
        meta.options[key] = true;
      } else if (rawValue === "false") {
        meta.options[key] = false;
      } else {
        const number = parseFloat(rawValue!);
        if (!Number.isNaN(number)) {
          // number value
          meta.options[key] = number;
        } else {
          // non quoted string
          meta.options[key] = rawValue!;
        }
      }

      match = optionRegex.exec(metastring);
    }
  }
}

export type ParseLineOptions = {
  /**
   * The full metastring, as received from MDX. Line ranges declared here
   * start at 1. Or alternatively the parsed {@link CodeBlockMeta}.
   */
  metastring: string | undefined;
  /**
   * Language of the code block, used to determine which kinds of magic
   * comment styles to enable.
   */
  language: string | undefined;
  /**
   * Magic comment types that we should try to parse. Each entry would
   * correspond to one class name to apply to each line.
   */
  magicComments: MagicCommentConfig[];
};

/**
 * Rewrites the range syntax to special options. e.g.
 * `{1,2,3-4,5} => highlight=1 highlight=2 highlight=3-4 highlight=5`
 * @param metastring The input metastring with the range syntax
 * @returns The string where the range syntax has been rewritten
 */
function rewriteLinesRange(metastring: string): string {
  metastringLinesRangeRegex.lastIndex = 0;

  return metastring.replaceAll(metastringLinesRangeRegex, (_, range) => {
    return (range as string)
      .split(",")
      .map((r) => `${highlightOptionKey}=${r}`)
      .join(" ");
  });
}

export function parseCodeBlockMeta(options: ParseLineOptions): CodeBlockMeta {
  if (typeof options.metastring === "object") {
    return options.metastring;
  }

  const meta: CodeBlockMeta = {
    lineClassNames: {},
    options: {},
  };

  const { metastring, magicComments } = options;

  // exit early if nothing to do.
  if (!metastring) {
    return meta;
  }

  const rewritten = rewriteLinesRange(metastring);
  parseCodeBlockOptions(meta, metastring, rewritten, magicComments);

  return meta;
}
