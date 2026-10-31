import fs from "fs";
import path from "path";

const writtenFiles = new Set<string>();
const generatedPageDirs = new Set<string>();

/**
 * Marks `dir` as holding generated `.mdx` pages. {@link removeStaleGeneratedPages}
 * later deletes the pages below it that the current run did not write.
 * Hand-written `_*.mdx` partials are never touched.
 */
export function trackGeneratedPages(dir: string): void {
  generatedPageDirs.add(path.resolve(dir));
}

/**
 * Deletes generated pages below the tracked folders that the current run did not
 * write, and the folders left empty. Runs after generation so a watching dev server
 * never sees pages disappear and reappear.
 */
export async function removeStaleGeneratedPages(): Promise<void> {
  for (const dir of generatedPageDirs) {
    await removeStalePages(dir);
  }
}

async function removeStalePages(dir: string): Promise<void> {
  let entries: fs.Dirent[];
  try {
    entries = await fs.promises.readdir(dir, { withFileTypes: true });
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") {
      return;
    }
    throw e;
  }

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await removeStalePages(entryPath);
    } else if (
      entry.name.endsWith(".mdx") &&
      !entry.name.startsWith("_") &&
      !writtenFiles.has(entryPath)
    ) {
      await fs.promises.rm(entryPath);
    }
  }

  if ((await fs.promises.readdir(dir)).length === 0) {
    await fs.promises.rmdir(dir);
  }
}

export interface FileStream extends AsyncDisposable {
  suspend: boolean;
  readonly path: string;
  write(s: string): Promise<void>;
  writeLine(s?: string): Promise<void>;
}

/**
 * Collects the written text in memory. On dispose the file is replaced atomically,
 * and only when its content changed, so watchers never read partial files.
 */
export async function openFileStream(filePath: string): Promise<FileStream> {
  const resolvedPath = path.resolve(filePath);
  const chunks: string[] = [];
  let _suspended = false;

  const write = async (s: string) => {
    if (_suspended) {
      return;
    }
    chunks.push(s);
  };
  const writeLine = (s?: string) => {
    if (s) {
      return write(s + "\n");
    } else {
      return write("\n");
    }
  };
  const asyncDispose = async () => {
    writtenFiles.add(resolvedPath);
    const content = chunks.join("");
    let existing: string | undefined;
    try {
      existing = await fs.promises.readFile(resolvedPath, "utf8");
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "ENOENT") {
        throw e;
      }
    }
    if (existing === content) {
      return;
    }
    const tempPath = `${resolvedPath}.${process.pid}.tmp`;
    await fs.promises.writeFile(tempPath, content);
    await fs.promises.rename(tempPath, resolvedPath);
  };

  return {
    path: filePath,
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
    const parts = v.split(".");
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
