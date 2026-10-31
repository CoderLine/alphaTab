import React, { FC, useState } from "react";
import * as alphaTab from "@coderline/alphatab";
import { AlphaTabHost, AlphaTabProvider, useAlphaTabApi, useAlphaTabEvent } from "@coderline/alphatab-react";
import CodeBlock from "@theme/CodeBlock";
import { useSiteAlphaTabSettings } from "@site/src/alphatab-settings";
import { isIOS } from "@site/src/components/Playground/is-ios";

function openFile(api: alphaTab.AlphaTabApi, file: Blob) {
    const reader = new FileReader();
    reader.onload = (data) => {
        api.load(data.target?.result, [0]);
    };
    reader.readAsArrayBuffer(file);
}

function openInputFile(api: alphaTab.AlphaTabApi) {
    const input = document.createElement('input');
    input.type = 'file';
    if (!isIOS()) {
        input.accept = '.gp,.gp3,.gp4,.gp5,.gpx,.musicxml,.mxml,.xml,.capx';
    }
    input.onchange = () => {
        if (input.files?.length === 1) {
            openFile(api, input.files[0]);
        }
    };
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
}

const AlphaTexExporterInner: FC = () => {
    const api = useAlphaTabApi();
    const [alphaTex, setAlphaTex] = useState('');

    useAlphaTabEvent('scoreLoaded', (score: alphaTab.model.Score) => {
        const exporter = new alphaTab.exporter.AlphaTexExporter();
        const exportSettings = new alphaTab.Settings();
        exportSettings.exporter.comments = true;
        exportSettings.exporter.indent = 2;

        setAlphaTex(exporter.exportToString(score, exportSettings));
    });

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
            <AlphaTabHost />
            <CodeBlock>{alphaTex}</CodeBlock>
        </div>
    );
};

export const AlphaTexExporterSample: FC = () => {
    const site = useSiteAlphaTabSettings();
    return (
        <AlphaTabProvider
            file="/files/Bach_Prelude_BWV999.gp"
            configureSettings={site.configureSettings}
            settings={site.settings}
        >
            <AlphaTexExporterInner />
        </AlphaTabProvider>
    );
};
