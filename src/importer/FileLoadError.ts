/**
 * @target web
 */
export class FileLoadError extends Error {
    public xhr: XMLHttpRequest;

    public constructor(message: string, xhr: XMLHttpRequest) {
        super(message);
        this.xhr = xhr;
    }
}
