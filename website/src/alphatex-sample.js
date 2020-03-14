import React from 'react';
import CodeBlock from '@theme/CodeBlock';
import AlphaTab from './alphatab';

export default function AlphaTexSample({ tracks, children }) {
    return (
        <>
            <AlphaTab tex={true} tracks={tracks}>{children}</AlphaTab>
            <CodeBlock>{children}</CodeBlock>
        </>
    );
};