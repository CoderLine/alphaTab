import * as alphaTab from "@coderline/alphatab";
import { useAlphaTab, useAlphaTabEvent } from "@site/src/hooks";
import { FC, useEffect, useState } from "react";
import CodeBlock from "@theme/CodeBlock";
import { openFile, openInputFile } from "@site/src/utils";

export const AlphaTexExporterSample: FC = () => {
    const [alphaTex, setAlphaTex] = useState('');

    const [api, element] = useAlphaTab((s) => {
        s.core.file = '/files/Bach_Prelude_BWV999.gp'
    });

    useAlphaTabEvent(api, 'scoreLoaded', (score) => {
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
        if (e.dataTransfer) {
            const files = e.dataTransfer.files;
            if (files.length === 1) {
                openFile(api!, files[0]);
            }
        }
    };

    return (
        <div onDragOver={onDragOver} onDrop={onDrop} style={{cursor: 'pointer', overflow: 'auto', maxHeight: "50vh"}} onDoubleClick={()=> api && openInputFile(api)}>
            <div ref={element}></div>
            <CodeBlock children={alphaTex} />
        </div>
    )
};