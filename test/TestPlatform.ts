import { ByteBuffer } from '@src/io/ByteBuffer';
import { IReadable } from '@src/io/IReadable';
import { IOHelper } from '@src/io/IOHelper';
  
/**
 * @partial
 */
export class TestPlatform {
    public static createStringReader(tex: string): IReadable {
        return ByteBuffer.fromString(tex);
    }

    /**
     * @target web
     */
    public static saveFile(name: string, data: Uint8Array): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let x: XMLHttpRequest = new XMLHttpRequest();
            x.open('POST', 'http://localhost:8090/save-file/', true);
            x.onload = () => {
                resolve();
            };
            x.onerror = () => {
                reject();
            };
            const form = new FormData();
            form.append('file', new Blob([data]), name);
            x.send(form);
        });
    }

    /**
     * @target web
     */
    public static loadFile(path: string): Promise<Uint8Array> {
        return new Promise<Uint8Array>((resolve, reject) => {
            let x: XMLHttpRequest = new XMLHttpRequest();
            x.open('GET', '/base/' + path, true, null, null);
            x.responseType = 'arraybuffer';
            x.onreadystatechange = () => {
                if (x.readyState === XMLHttpRequest.DONE) {
                    if (x.status === 200) {
                        let ab: ArrayBuffer = x.response;
                        let data: Uint8Array = new Uint8Array(ab);
                        resolve(data);
                    } else {
                        let response: string = x.response;
                        reject('Could not find file: ' + path + ', received:' + response);
                    }
                }
            };
            x.send();
        });
    }

    /**
     * @target web
     */
    public static listDirectory(path: string): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            let x: XMLHttpRequest = new XMLHttpRequest();
            x.open('GET', 'http://localhost:8090/list-files?dir=' + path, true, null, null);
            x.responseType = 'text';
            x.onreadystatechange = () => {
                if (x.readyState === XMLHttpRequest.DONE) {
                    if (x.status === 200) {
                        resolve(JSON.parse(x.responseText));
                    } else {
                        reject('Could not find path: ' + path + ', received:' + x.responseText);
                    }
                }
            };
            x.send();
        });
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
}