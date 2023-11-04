import { IOHelper } from '@src/io/IOHelper';
import * as fs from 'fs';
import * as path from 'path';

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
        await fs.promises.mkdir(directory, { recursive: true })
        await fs.promises.writeFile(name, data);
    }

    /**
     * @target web
     * @partial
     */
    public static async deleteFile(name: string): Promise<void> {
        await fs.promises.rm(name, { force: true })
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
    public static async listDirectory(path: string): Promise<string[]> {
        return await fs.promises.readdir(path);
    }

    public static async loadFileAsString(path: string): Promise<string> {
        const data = await TestPlatform.loadFile(path);
        return IOHelper.toString(data, 'UTF-8');
    }

    public static changeExtension(file: string, extension: string): string {
        let lastDot: number = file.lastIndexOf('.');
        if (lastDot === -1) {
            return file + extension;
        } else {
            return file.substr(0, lastDot) + extension;
        }
    }
    
    /**
     * @target web
     * @partial
     */
    public static joinPath(...parts: string[]): string {
        return path.join(...parts);
    }
}
