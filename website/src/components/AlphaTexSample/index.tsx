import React from 'react';
import CodeBlock from '@theme/CodeBlock';
import { AlphaTab } from '../AlphaTab';

export interface AlphaTexSampleProps {
    tracks?: number[] | string;
    children: string | React.ReactElement;
    player: boolean;
}

export class AlphaTexSample extends React.Component<AlphaTexSampleProps>
{
    public constructor(props: AlphaTexSampleProps) {
        super(props);
    }

    render() {
        return (
            <>
                <AlphaTab tex={true} player={this.props.player} tracks={this.props.tracks}>{this.props.children}</AlphaTab>
                <CodeBlock>{typeof this.props.children === 'string' ? this.props.children.trim() : this.props.children}</CodeBlock>
            </>
        );
    }
};