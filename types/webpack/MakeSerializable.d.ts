declare module 'webpack/lib/util/makeSerializable' {
    export default function (Constructor: any, request: string): void;
    export default function (Constructor: any, request: string, name: string | null): void;
}