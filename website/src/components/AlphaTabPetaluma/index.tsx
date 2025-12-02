import * as alphaTab from "@coderline/alphatab";
import { useAlphaTab } from "@site/src/hooks";
import { useEffect } from "react";

export interface AlphaTabPetalumaProps {
    children: string | React.ReactElement;
}

export const AlphaTabPetaluma: React.FC<AlphaTabPetalumaProps> = ({
    children,
}) => {
    const [api, element] = useAlphaTab((s) => {
        s.core.tex = true;
        s.core.smuflFontSources = new Map<alphaTab.FontFileFormat, string>([
            [alphaTab.FontFileFormat.OpenType, '/files/petaluma/Petaluma.otf']
        ])
    });

    useEffect(() => {
        if (api) {
            const request = new XMLHttpRequest();
            request.open('GET', '/files/petaluma/petaluma_metadata.json', true);
            request.responseType = 'json';
            request.onload = () => {
                api.settings.display.resources.engravingSettings.fillFromSmufl(request.response);
                api.updateSettings();
                api.render();
            };
            request.send();

            return () => {
                request.abort();
            };
        }
    }, [api]);

    return (
        <div ref={element}>{children}</div>
    )
}