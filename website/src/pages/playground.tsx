import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

export default function PlaygroundPage(): React.ReactElement {
    return (
        <Layout
            title="Playground"
            description="Open, play and explore music notation with alphaTab: tracks, every setting, alphaTex editing and audio/video sync."
            noFooter
        >
            <BrowserOnly>
                {() => {
                    const { Playground } = require('@site/src/components/Playground') as typeof import('@site/src/components/Playground');
                    return <Playground />;
                }}
            </BrowserOnly>
        </Layout>
    );
}
