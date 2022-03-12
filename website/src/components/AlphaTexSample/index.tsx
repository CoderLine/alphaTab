import React from 'react';
import CodeBlock from '@theme/CodeBlock';
import { AlphaTab } from '../AlphaTab';

export interface AlphaTexSampleProps {
    tracks: number[],
    children: string | React.ReactElement;
}

export class AlphaTexSample extends React.Component<AlphaTexSampleProps>
{
    public constructor(props: AlphaTexSampleProps) {
        super(props);
    }

    render() {
        return (
            <>
                <AlphaTab tex={true} tracks={this.props.tracks}>{this.props.children}</AlphaTab>
                <CodeBlock>{this.props.children}</CodeBlock>
            </>
        );
    }
};