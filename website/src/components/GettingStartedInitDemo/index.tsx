import * as alphaTab from '@coderline/alphatab';
import React from 'react';

interface InitDemoState {
    api?: alphaTab.AlphaTabApi
}

export class InitDemo extends React.Component<{}, InitDemoState> {
    private _element: React.RefObject<HTMLDivElement> = React.createRef();
    
    constructor(props) {
        super(props);
        this.state = {};
    }
    componentDidMount() {
        const element = this._element.current;
        this.setState({
            api: new alphaTab.AlphaTabApi(element, {})
        })
    }
    render() {
        return (
            <div ref={this._element} data-tex="true" style={{ border: '1px solid #E5E6E7' }}>
                \title "Hello alphaTab"
                .
                :4 0.6 1.6 3.6 0.5 2.5 3.5 0.4 2.4 |
                3.4 0.3 2.3 0.2 1.2 3.2 0.1 1.1 |
                3.1.1
            </div>
        );
    }
}
