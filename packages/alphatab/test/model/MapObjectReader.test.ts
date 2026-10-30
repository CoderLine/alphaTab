import { MapObjectReader } from '@coderline/alphatab/io/MapObjectReader';
import { RecordFields } from '@coderline/alphatab/io/RecordFields';
import { describe, expect, it } from 'vitest';

describe('MapObjectReaderTests', () => {
    function entries(value: unknown, fields: RecordFields | null): string[] {
        const seen: string[] = [];
        new MapObjectReader(value).readRecord(fields, (id, name, r) => {
            seen.push(`${id}:${name}=${r.readString()}`);
            return true;
        });
        return seen;
    }

    it('record-keys-are-passed-as-field-ids', () => {
        const fields = new RecordFields(['first', 'second']);
        const value = new Map<string, unknown>();
        value.set('second', 'b');
        value.set('hook', 'c');
        value.set('first', 'a');
        expect(entries(value, fields)).toEqual(['1:second=b', '-1:hook=c', '0:first=a']);
    });

    it('record-keys-without-fields-are-passed-as-keys', () => {
        const value = new Map<string, unknown>();
        value.set('first', 'a');
        value.set('second', 'b');
        expect(entries(value, null)).toEqual(['-1:first=a', '-1:second=b']);
    });

    /*@target web*/
    it('plain-object-keys-are-passed-as-field-ids', () => {
        const fields = new RecordFields(['first', 'second']);
        expect(entries(JSON.parse('{"second":"b","hook":"c","first":"a"}'), fields)).toEqual([
            '1:second=b',
            '-1:hook=c',
            '0:first=a'
        ]);
    });
});
