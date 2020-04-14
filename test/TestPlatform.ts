import { ByteBuffer } from '@src/io/ByteBuffer';
import { IReadable } from '@src/io/IReadable';
import { Platform } from '@src/platform/Platform';
  
export class TestPlatform {
    public static createStringReader(tex: string): IReadable {
        return ByteBuffer.fromBuffer(Platform.stringToByteArray(tex));
    }

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

    public static async loadFileAsString(path: string): Promise<string> {
        const data = await TestPlatform.loadFile(path);
        return Platform.toString(data, 'UTF-8');
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