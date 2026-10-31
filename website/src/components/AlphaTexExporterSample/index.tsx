import React, { FC, useState } from "react";
import type * as alphaTab from "@coderline/alphatab";
import {
  AlphaTabPlayer,
  AlphaTabCanvas,
  useAlphaTabApi,
  useAlphaTabEvent,
  useAlphaTabModule,
} from "@site/src/alphatab-react";
import CodeBlock from "@theme/CodeBlock";
import { openFile, openInputFile } from "@site/src/utils";

const AlphaTexExporterInner: FC = () => {
    const api = useAlphaTabApi();
    const module = useAlphaTabModule();
    const [alphaTex, setAlphaTex] = useState('');

    useAlphaTabEvent('scoreLoaded', (score: alphaTab.model.Score) => {
        if (!module) return;
        const exporter = new module.exporter.AlphaTexExporter();
        const exportSettings = new module.Settings();
        exportSettings.exporter.comments = true;
        exportSettings.exporter.indent = 2;

        setAlphaTex(exporter.exportToString(score, exportSettings));
    }, [module]);

    const onDragOver = (e: React.DragEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = "link";
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (e.dataTransfer && api) {
            const files = e.dataTransfer.files;
            if (files.length === 1) {
                openFile(api, files[0]);
            }
        }
    };

    return (
        <div
            onDragOver={onDragOver}
            onDrop={onDrop}
            style={{ cursor: 'pointer', overflow: 'auto', maxHeight: "50vh" }}
            onDoubleClick={() => api && openInputFile(api)}
        >
            <AlphaTabCanvas />
            <CodeBlock>{alphaTex}</CodeBlock>
        </div>
    );
};

export const AlphaTexExporterSample: FC = () => {
    return (
        <AlphaTabPlayer file="/files/Bach_Prelude_BWV999.gp">
            <AlphaTexExporterInner />
        </AlphaTabPlayer>
    );
};
