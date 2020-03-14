import React from 'react';
import CodeBlock from '@theme/CodeBlock';

class AlphaTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            api: null
        }
    }

    componentDidMount() {
        const container = this.refs.alphaTab;
        this.state.api = new alphaTab.platform.javaScript.AlphaTabApi(container);  
    }        

    componentWillUnmount() {
        this.state.api.destroy();
    }

    render() {
        return (
            <div ref="alphaTab" data-tex={this.props.tex} data-tracks={this.props.tracks}>{this.props.children}</div>
        );
    }
}

export default function AlphaTexSample({ tracks, children }) {
    return (
        <>
            <AlphaTab tex={true} tracks={tracks}>{children}</AlphaTab>
            <CodeBlock>{children}</CodeBlock>
        </>
    );
};