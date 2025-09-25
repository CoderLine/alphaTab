import { AlphaTexImporter } from "@src/importer/AlphaTexImporterNew";
import type { Score } from "@src/model/Score";
import { Settings } from "@src/Settings";

describe('AlphaTexImporterNewTest', () => {
    function parseTex(tex: string): Score {
        const importer: AlphaTexImporter = new AlphaTexImporter();
        importer.initFromString(tex, new Settings());
        return importer.readScore();
    }

    // Here we should focus on all the semantic tests:
    // - all metadata tags (valid and invalid variants)
    // - all properties (valid and invalid variants)
    // - proper diagnostics reporting
    // - value list type validations
    // - round-trip tests on old/new importer/exporter (backwards compatibility, and verification of new parser)
    
    

});

