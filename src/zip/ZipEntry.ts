
export class ZipEntry {
    public static readonly OptionalDataDescriptorSignature: number = 0x08074b50;
    public static readonly CompressionMethodDeflate: number = 8;
    public static readonly LocalFileHeaderSignature: number = 0x04034b50;
    public static readonly CentralFileHeaderSignature: number = 0x02014b50;
    public static readonly EndOfCentralDirSignature: number = 0x06054b50;


    public readonly fullName: string;
    public readonly fileName: string;
    public readonly data: Uint8Array;

    public constructor(fullName: string, data: Uint8Array) {
        this.fullName = fullName;
        let i: number = fullName.lastIndexOf('/');
        this.fileName = i === -1 || i === fullName.length - 1 ? this.fullName : fullName.substr(i + 1);
        this.data = data;
    }
}
