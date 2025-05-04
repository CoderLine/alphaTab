import fs from "fs";

export interface FileStream extends AsyncDisposable {
  readonly path: string;
  write(s: string): Promise<void>;
  writeLine(s?: string): Promise<void>;
}

export async function openFileStream(path: string): Promise<FileStream> {
  const fileStream = await fs.promises.open(path, "w");

  const write = async (s: string) => {
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