export interface DemoEntry {
    href: string;
    title: string;
    description: string;
}

export const DEMOS: DemoEntry[] = [
    {
        href: '/demos/control/',
        title: 'Control',
        description:
            'The full-featured player: track sidebar, transport bar, layout/scroll/zoom pickers, downloads, drag-drop loading.'
    },
    {
        href: '/demos/recorder/',
        title: 'Drum Recorder',
        description:
            'Record drum hits onto a percussion staff while the player runs. Demonstrates dynamic score extension and tick-cache updates.'
    },
    {
        href: '/demos/alphatex-editor/',
        title: 'AlphaTex Editor',
        description:
            'Monaco editor on the left, live alphaTab rendering on the right. Round-trips between AlphaTex source and Score model with LSP support.'
    },
    {
        href: '/demos/youtube-sync/',
        title: 'YouTube Sync',
        description:
            'Plays an alphaTab score in step with a YouTube video using the EnabledExternalMedia player mode.'
    },
    {
        href: '/demos/test-results/',
        title: 'Visual Test Results',
        description:
            'Compare expected vs. actual screenshots from visual regression runs. Drop a results zip or use the dev-server endpoint.'
    }
];
