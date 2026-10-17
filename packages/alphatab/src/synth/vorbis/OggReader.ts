/**
 * The packets of an Ogg logical bitstream.
 * @record
 * @internal
 */
export interface OggPackets {
    /**
     * The data of all packets, back to back.
     */
    data: Uint8Array;
    /**
     * The end offset of each packet in {@link data}, a packet starts where the previous one ends.
     */
    ends: number[];
    /**
     * The granule position per packet: the one of the page for the last packet completed on a page, otherwise -1.
     */
    granules: number[];
}

/**
 * Splits the first logical bitstream of an Ogg container into packets (RFC 3533).
 *
 * The page bodies are concatenated and the packet boundaries follow from the lacing values alone,
 * which makes packets spanning multiple pages work without special handling.
 * Pages of other logical bitstreams are skipped, incomplete pages and packets at the end are dropped.
 * @internal
 */
export class OggReader {
    public static read(data: Uint8Array, offset: number, length: number): OggPackets {
        const end = Math.min(offset + length, data.length);
        const body = new Uint8Array(Math.max(0, end - offset));
        const ends: number[] = [];
        const granules: number[] = [];
        let size = 0;
        let serial = 0;
        let hasSerial = false;

        let pos = offset;
        while (pos + 27 <= end) {
            // capture pattern 'OggS', resync byte by byte if missing
            if (data[pos] !== 0x4f || data[pos + 1] !== 0x67 || data[pos + 2] !== 0x67 || data[pos + 3] !== 0x53) {
                pos++;
                continue;
            }

            const segments = data[pos + 26];
            const bodyStart = pos + 27 + segments;
            if (bodyStart > end) {
                break;
            }
            let bodySize = 0;
            for (let i = 0; i < segments; i++) {
                bodySize += data[pos + 27 + i];
            }
            if (bodyStart + bodySize > end) {
                break;
            }

            const pageSerial =
                data[pos + 14] | (data[pos + 15] << 8) | (data[pos + 16] << 16) | (data[pos + 17] << 24);
            if (!hasSerial) {
                serial = pageSerial;
                hasSerial = true;
            }

            if (pageSerial === serial) {
                const firstPacket = ends.length;
                let source = bodyStart;
                for (let i = 0; i < segments; i++) {
                    const lacing = data[pos + 27 + i];
                    for (let j = 0; j < lacing; j++) {
                        body[size + j] = data[source + j];
                    }
                    source += lacing;
                    size += lacing;
                    if (lacing < 255) {
                        ends.push(size);
                        granules.push(-1);
                    }
                }
                if (ends.length > firstPacket) {
                    // 64-bit granule position: unsigned low word, signed high word
                    const low =
                        data[pos + 6] + data[pos + 7] * 256 + data[pos + 8] * 65536 + data[pos + 9] * 16777216;
                    const high =
                        data[pos + 10] | (data[pos + 11] << 8) | (data[pos + 12] << 16) | (data[pos + 13] << 24);
                    granules[ends.length - 1] = high * 4294967296 + low;
                }
                if ((data[pos + 5] & 4) !== 0) {
                    break;
                }
            }

            pos = bodyStart + bodySize;
        }

        return { data: body, ends, granules };
    }
}
