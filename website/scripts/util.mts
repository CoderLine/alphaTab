import fs from "fs";

export interface FileStream extends AsyncDisposable {
  suspend: boolean;
  readonly path: string;
  write(s: string): Promise<void>;
  writeLine(s?: string): Promise<void>;
}

export async function openFileStream(path: string): Promise<FileStream> {
  const fileStream = await fs.promises.open(path, "w");
  let _suspended = false;

  const write = async (s: string) => {
    if (_suspended) {
      return;
    }
    await fileStream.write(s);
  };
  const writeLine = (s?: string) => {
    if (s) {
      return write(s + "\n");
    } else {
      return write("\n");
    }
  };
  const asyncDispose = async () => {
    await fileStream.close();
  };

  return {
    path,
    write,
    writeLine,
    [Symbol.asyncDispose]: asyncDispose,
    get suspend() {
      return _suspended
    },
    set suspend(v: boolean) {
      _suspended = v;
    }
  };
}

export function toPascalCase(v: string | string[]) {
  if (typeof v === "string") {
    var parts = v.split(".");
    for (let i = 0; i < parts.length; i++) {
      parts[i] = parts[i].slice(0, 1).toUpperCase() + parts[i].slice(1);
    }
    return parts.join(".");
  }
  return v.map(toPascalCase);
}
// alphaTab's JSDoc still links to the removed /docs/showcase pages; map them to the
// feature pages the client-redirects in docusaurus.config.mts point at.
const legacyDocLinks: [RegExp, string][] = [
  [/\/docs\/showcase\/layouts#page-layout-5-bars-per-row\b/g, "/docs/features/render/page-layout"],
  [/\/docs\/showcase\/layouts#page-layout-bar-5-to-8\b/g, "/docs/features/render/bar-range"],
  [/\/docs\/showcase\/layouts#page-layout\b/g, "/docs/features/render/page-layout"],
  [/\/docs\/showcase\/layouts#horizontal-layout\b/g, "/docs/features/render/horizontal-layout"],
  [/\/docs\/showcase\/layouts#parchment\b/g, "/docs/features/render/parchment-layout"],
  [/\/docs\/showcase\/layouts\b/g, "/docs/features/render/bar-range"],
  [/\/docs\/showcase\/guitar-tabs\b/g, "/docs/features/render/guitar-tablature"],
  [/\/docs\/showcase\/general#brackets-and-braces\b/g, "/docs/features/render/bracket-extend-mode"],
  [/\/docs\/showcase\/general#track-names\b/g, "/docs/features/render/track-name-policies"],
];

export function rewriteLegacyDocLinks(s: string): string {
  for (const [pattern, target] of legacyDocLinks) {
    s = s.replaceAll(pattern, target);
  }
  return s;
}
