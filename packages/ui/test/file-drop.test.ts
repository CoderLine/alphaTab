import { describe, expect, it, vi } from 'vitest';
import { attachFileDrop } from '../src/state/file-drop';

function dragEvent(type: string, files: File[] = []): DragEvent {
    const event = new Event(type, { bubbles: true, cancelable: true }) as DragEvent;
    Object.defineProperty(event, 'dataTransfer', {
        value: { types: files.length > 0 || type !== 'drop' ? ['Files'] : [], files, dropEffect: 'none' }
    });
    return event;
}

describe('attachFileDrop', () => {
    it('reports one drag over the target while the pointer crosses its children', () => {
        const target = document.createElement('div');
        const child = document.createElement('span');
        target.appendChild(child);
        const onDragChange = vi.fn();
        const onDrop = vi.fn();
        const detach = attachFileDrop(target, { onDragChange, onDrop });

        target.dispatchEvent(dragEvent('dragenter'));
        child.dispatchEvent(dragEvent('dragenter'));
        child.dispatchEvent(dragEvent('dragleave'));
        expect(onDragChange.mock.calls).toEqual([[true]]);

        const file = new File(['3.3.4'], 'song.alphatex');
        child.dispatchEvent(dragEvent('drop', [file]));
        expect(onDragChange.mock.calls).toEqual([[true], [false]]);
        expect(onDrop).toHaveBeenCalledWith(file);

        detach();
        target.dispatchEvent(dragEvent('dragenter'));
        expect(onDragChange).toHaveBeenCalledTimes(2);
    });

    it('ends the drag when the pointer leaves the target', () => {
        const target = document.createElement('div');
        const onDragChange = vi.fn();
        attachFileDrop(target, { onDragChange, onDrop: vi.fn() });

        target.dispatchEvent(dragEvent('dragenter'));
        target.dispatchEvent(dragEvent('dragleave'));
        target.dispatchEvent(dragEvent('dragleave'));
        expect(onDragChange.mock.calls).toEqual([[true], [false]]);
    });
});
