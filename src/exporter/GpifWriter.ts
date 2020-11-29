import { Score } from '@src/model/Score';
import { Settings } from '@src/Settings';
import { XmlDocument } from '@src/xml/XmlDocument';
import { XmlNode, XmlNodeType } from '@src/xml/XmlNode';

/**
 * This class can write a score.gpif XML from a given score model.
 */
export class GpifWriter {
    // private _score!: Score;
    // private _settings!: Settings;
    private _xmlDocument!: XmlDocument;

    public writeXml(_score: Score, _settings: Settings): string {
        // this._score = score;
        // this._settings = settings;
        this._xmlDocument = new XmlDocument();

        this._xmlDocument.documentElement = new XmlNode();
        this._xmlDocument.documentElement.nodeType = XmlNodeType.Element;
        this._xmlDocument.documentElement.localName = 'GPIF';
        // TODO GP7Export

        return this._xmlDocument.toString('  ', true);
    }
}
