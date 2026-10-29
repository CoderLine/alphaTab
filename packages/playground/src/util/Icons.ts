import type { IconNode } from 'lucide';
import createElement from 'lucide/dist/esm/createElement.mjs';
import ArrowDownNarrowWide from 'lucide/dist/esm/icons/arrow-down-narrow-wide.mjs';
import BarChart3 from 'lucide/dist/esm/icons/chart-column.mjs';
import ChevronDown from 'lucide/dist/esm/icons/chevron-down.mjs';
import ChevronRight from 'lucide/dist/esm/icons/chevron-right.mjs';
import Crop from 'lucide/dist/esm/icons/crop.mjs';
import Download from 'lucide/dist/esm/icons/download.mjs';
import Drum from 'lucide/dist/esm/icons/drum.mjs';
import FileAudio from 'lucide/dist/esm/icons/file-headphone.mjs';
import Guitar from 'lucide/dist/esm/icons/guitar.mjs';
import Headphones from 'lucide/dist/esm/icons/headphones.mjs';
import Hourglass from 'lucide/dist/esm/icons/hourglass.mjs';
import Menu from 'lucide/dist/esm/icons/menu.mjs';
import Metronome from 'lucide/dist/esm/icons/metronome.mjs';
import Mic from 'lucide/dist/esm/icons/mic.mjs';
import MousePointer from 'lucide/dist/esm/icons/mouse-pointer.mjs';
import Pause from 'lucide/dist/esm/icons/pause.mjs';
import Piano from 'lucide/dist/esm/icons/piano.mjs';
import Play from 'lucide/dist/esm/icons/play.mjs';
import Printer from 'lucide/dist/esm/icons/printer.mjs';
import Repeat from 'lucide/dist/esm/icons/repeat.mjs';
import ScrollText from 'lucide/dist/esm/icons/scroll-text.mjs';
import Search from 'lucide/dist/esm/icons/search.mjs';
import SkipBack from 'lucide/dist/esm/icons/skip-back.mjs';
import Volume2 from 'lucide/dist/esm/icons/volume-2.mjs';

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
