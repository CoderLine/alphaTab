import { IOHelper } from '@src/io/IOHelper';
import fs from 'node:fs';
import path from 'node:path';

/**
 * @partial
 */
export class TestPlatform {
    /**
     * @target web
     * @partial
     */
    public static async saveFile(name: string, data: Uint8Array): Promise<void> {
        const directory = path.dirname(name);
        await fs.promises.mkdir(directory, { recursive: true });
        await fs.promises.writeFile(name, data);
    }

    /**
     * @target web
     * @partial
     */
    public static async deleteFile(name: string): Promise<void> {
        await fs.promises.rm(name, { force: true });
    }

    /**
     * @target web
     * @partial
     */
    public static loadFile(path: string): Promise<Uint8Array> {
        return fs.promises.readFile(path);
    }

    /**
     * @target web
     * @partial
     */
    public static loadFileSync(path: string): Uint8Array {
        return fs.readFileSync(path);
    }

    /**
     * @target web
     * @partial
     */
    public static async listDirectory(path: string): Promise<string[]> {
        return await fs.promises.readdir(path);
    }

    public static async loadFileAsString(path: string): Promise<string> {
        const data = await TestPlatform.loadFile(path);
        return IOHelper.toString(data, 'UTF-8');
    }

    public static loadFileAsStringSync(path: string): string {
        const data = TestPlatform.loadFileSync(path);
        return IOHelper.toString(data, 'UTF-8');
    }

    public static changeExtension(file: string, extension: string): string {
        const lastDot: number = file.lastIndexOf('.');
        if (lastDot === -1) {
            return file + extension;
        }
        return file.substr(0, lastDot) + extension;
    }

    /**
     * @target web
     * @partial
     */
    public static joinPath(...parts: string[]): string {
        return path.join(...parts);
    }

    /**
     * @target web
     * @partial
     */
    public static enumValues<T>(enumType: any): T[] {
        return Object.values(enumType).filter(k => typeof k === 'number') as T[];
    }

    /**
     * @target web
     * @partial
     */
    public static typedArrayAsUnknownArray(array: unknown): unknown[] {
        return array as unknown[];
    }

    /**
     * @target web
     * @partial
     */
    public static typedArrayAsUnknownIterable(array: unknown): Iterable<unknown> {
        return array as Iterable<unknown>;
    }

    
    /**
     * @target web
     * @partial
     */
    public static mapAsUnknownIterable(map: unknown): Iterable<[unknown, unknown]> {
        return (map as Map<unknown, unknown>).entries();
    }
}
