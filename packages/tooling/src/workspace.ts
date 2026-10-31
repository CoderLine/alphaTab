import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

/** The folder holding all workspace packages, one per subfolder. */
export const packagesDir = path.resolve(url.fileURLToPath(new URL('.', import.meta.url)), '..', '..');

export interface WorkspacePackage {
    readonly dir: string;
    /** Private packages are not published, so other packages must ship whatever they use of them. */
    readonly isPrivate: boolean;
}

const packages = new Map<string, WorkspacePackage | undefined>();

/** The workspace package containing `file`, or `undefined` for files outside of the workspace packages. */
export function workspacePackageOf(file: string): WorkspacePackage | undefined {
    const relative = path.relative(packagesDir, path.resolve(file));
    if (relative === '' || relative.startsWith('..') || path.isAbsolute(relative)) {
        return undefined;
    }
    const dir = path.join(packagesDir, relative.split(path.sep)[0]);
    if (!packages.has(dir)) {
        const packageJsonPath = path.join(dir, 'package.json');
        packages.set(
            dir,
            fs.existsSync(packageJsonPath)
                ? { dir, isPrivate: JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')).private === true }
                : undefined
        );
    }
    return packages.get(dir);
}

/**
 * Where the declaration emit places the declarations of the sources in `sourceDir`: the tree under `declarationDir`
 * mirrors the workspace packages, so relative imports between them stay valid.
 */
export function intermediateDeclarationDir(declarationDir: string, sourceDir: string): string {
    return path.join(declarationDir, path.relative(packagesDir, sourceDir));
}

/** Where the declaration emit places the declarations of `sourceFile`, see {@link intermediateDeclarationDir}. */
export function intermediateDeclarationPath(declarationDir: string, sourceFile: string): string {
    const parsed = path.parse(sourceFile);
    return path.join(intermediateDeclarationDir(declarationDir, parsed.dir), `${parsed.name}.d.ts`);
}
