import { AlphaTabError, AlphaTabErrorType } from '@src/AlphaTabError';

/**
 * @target web
 * @public
 */
export class FileLoadError extends AlphaTabError {
    public xhr: XMLHttpRequest;

    public constructor(message: string, xhr: XMLHttpRequest) {
        super(AlphaTabErrorType.General, message);
        this.xhr = xhr;
    }
}
