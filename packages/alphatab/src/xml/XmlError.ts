import { AlphaTabError, AlphaTabErrorType } from '@coderline/alphatab/AlphaTabError';

/**
 * The error thrown when parsing malformed XML.
 * @internal
 */
export class XmlError extends AlphaTabError {
    /**
     * The XML which failed to parse.
     */
    public xml: string;

    /**
     * The position in the XML where the error was detected.
     */
    public pos: number = 0;

    public constructor(message: string, xml: string, pos: number) {
        super(AlphaTabErrorType.Format, message);
        this.xml = xml;
        this.pos = pos;
    }
}
