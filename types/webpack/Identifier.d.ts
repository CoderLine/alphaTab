declare module 'webpack/lib/util/identifier' {
    export const contextify:  {
        bindContextCache(context: string, associatedObjectForCache: any): (s: string) => string;
    }
}