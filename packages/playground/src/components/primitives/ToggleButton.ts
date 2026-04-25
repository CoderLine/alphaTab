import { css, injectStyles } from '../../util/Dom';
import { IconButton, type IconButtonProps } from './IconButton';

injectStyles(
    'ToggleButton',
    css`
    .at-icon-btn.at-toggle-active {
        background: var(--at-accent-hover);
        color: #fff;
    }
`
);

export interface ToggleButtonProps extends IconButtonProps {
    initialActive?: boolean;
}

export class ToggleButton extends IconButton {
    private active: boolean;

    onChange: ((active: boolean) => void) | null = null;

    constructor(props: ToggleButtonProps) {
        super(props);
        this.active = props.initialActive ?? false;
        this.root.classList.add('at-toggle');
        this.root.classList.toggle('at-toggle-active', this.active);
        this.root.setAttribute('aria-pressed', String(this.active));

        this.onClick = () => {
            this.setActive(!this.active);
            this.onChange?.(this.active);
        };
    }

    isActive(): boolean {
        return this.active;
    }

    setActive(active: boolean): void {
        this.active = active;
        this.root.classList.toggle('at-toggle-active', active);
        this.root.setAttribute('aria-pressed', String(active));
    }
}
