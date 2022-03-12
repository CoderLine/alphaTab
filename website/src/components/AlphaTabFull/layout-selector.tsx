import * as alphaTab from '@coderline/alphatab';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid, regular } from '@fortawesome/fontawesome-svg-core/import.macro'

export interface LayoutSelectorProps {
    api: alphaTab.AlphaTabApi;
    onLayoutChange?: (layoutMode: alphaTab.LayoutMode, scrollMode: alphaTab.ScrollMode) => void;
}

export interface LayoutSelectorState {
}

export class LayoutSelector extends React.Component<LayoutSelectorProps, LayoutSelectorState> {
    public constructor(props: LayoutSelectorProps) {
        super(props);
        this.selectLayout = this.selectLayout.bind(this);
    }

    public selectLayout(layoutMode: alphaTab.LayoutMode | undefined, scrollMode: alphaTab.ScrollMode | undefined, e: React.MouseEvent) {
        e.preventDefault();

        if (this.props.onLayoutChange) {
            this.props.onLayoutChange(layoutMode, scrollMode);
        }
    }

    public render() {
        return (
            <div className="dropdown dropdown--hoverable">
                <span>Layout</span>
                <ul className="dropdown__menu">
                    <li>
                        <a className="dropdown__link" href="#" onClick={e => this.selectLayout(undefined, undefined, e)}>
                            <FontAwesomeIcon icon={solid('wand-sparkles')}></FontAwesomeIcon>
                            Automatic
                        </a>
                    </li>
                    <li>
                        <a className="dropdown__link" href="#" onClick={e => this.selectLayout(alphaTab.LayoutMode.Horizontal, alphaTab.ScrollMode.OffScreen, e)}>
                            <FontAwesomeIcon icon={regular('caret-square-right')}></FontAwesomeIcon>
                            Horizontal Layout (Off-Screen)
                        </a>
                    </li>
                    <li>
                        <a className="dropdown__link" href="#" onClick={e => this.selectLayout(alphaTab.LayoutMode.Horizontal, alphaTab.ScrollMode.OffScreen, e)}>
                            <FontAwesomeIcon icon={solid('caret-square-right')}></FontAwesomeIcon>
                            Horizontal Layout (Bar-Wise)
                        </a>
                    </li>
                    <li>
                        <a className="dropdown__link" href="#" onClick={e => this.selectLayout(alphaTab.LayoutMode.Page, alphaTab.ScrollMode.Continuous, e)}>
                            <FontAwesomeIcon icon={solid('caret-square-down')}></FontAwesomeIcon>
                            Vertical Layout
                        </a>
                    </li>
                </ul>
            </div>
        );
    }
}
