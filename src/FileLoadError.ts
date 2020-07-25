import { AlphaTabError, AlphaTabErrorType } from "./AlphaTabError";

/**
 * @target web
 */
export class FileLoadError extends AlphaTabError {
    public xhr: XMLHttpRequest;

    public constructor(message: string, xhr: XMLHttpRequest) {
        super(AlphaTabErrorType.General, message);
        this.xhr = xhr;
        Object.setPrototypeOf(this, FileLoadError.prototype);
    }
}
