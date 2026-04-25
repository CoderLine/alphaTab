import {
    ArrowDownNarrowWide,
    BarChart3,
    ChevronDown,
    ChevronRight,
    Crop,
    Download,
    Drum,
    FileAudio,
    Guitar,
    Headphones,
    Hourglass,
    Menu,
    Metronome,
    Mic,
    MousePointer,
    Pause,
    Piano,
    Play,
    Printer,
    Repeat,
    ScrollText,
    Search,
    SkipBack,
    Volume2,
    createElement
} from 'lucide';

type IconNode = Parameters<typeof createElement>[0];

export function icon(node: IconNode): SVGElement {
    return createElement(node);
}

export const Icons = {
    Play: Play as IconNode,
    Pause: Pause as IconNode,
    Stop: SkipBack as IconNode,
    Loop: Repeat as IconNode,
    CountIn: Hourglass as IconNode,
    Metronome: Metronome as IconNode,
    Search: Search as IconNode,
    Print: Printer as IconNode,
    DownloadGp: Download as IconNode,
    DownloadAudio: FileAudio as IconNode,
    OutputDevice: Headphones as IconNode,
    ChevronDown: ChevronDown as IconNode,
    LayoutHorizontal: ChevronRight as IconNode,
    LayoutPage: ChevronDown as IconNode,
    LayoutParchment: ScrollText as IconNode,
    ScrollOff: MousePointer as IconNode,
    ScrollContinuous: ArrowDownNarrowWide as IconNode,
    ScrollOffScreen: Crop as IconNode,
    ScrollSmooth: BarChart3 as IconNode,
    Volume: Volume2 as IconNode,
    Track: Guitar as IconNode,
    TrackDrum: Drum as IconNode,
    TrackPiano: Piano as IconNode,
    TrackVoice: Mic as IconNode,
    Menu: Menu as IconNode
} satisfies Record<string, IconNode>;

export type { IconNode };
