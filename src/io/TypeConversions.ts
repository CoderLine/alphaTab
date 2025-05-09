/**
 * @target web
 */
export class TypeConversions {
    private static _conversionBuffer: ArrayBuffer = new ArrayBuffer(8);
    private static _conversionByteArray: Uint8Array = new Uint8Array(TypeConversions._conversionBuffer);
    private static _dataView = new DataView(TypeConversions._conversionBuffer);

    public static float64ToBytes(v: number): Uint8Array {
        TypeConversions._dataView.setFloat64(0, v, true);
        return TypeConversions._conversionByteArray;
    }

    public static bytesToInt64LE(bytes: Uint8Array): number {
        TypeConversions._conversionByteArray.set(bytes, 0);
        const int64 = TypeConversions._dataView.getBigInt64(0, true);
        if (int64 <= Number.MAX_SAFE_INTEGER && int64 >= Number.MIN_SAFE_INTEGER) {
            return Number(int64);
        }
        return Number.MAX_SAFE_INTEGER;
    }

    public static bytesToFloat64LE(bytes: Uint8Array): number {
        TypeConversions._conversionByteArray.set(bytes, 0);
        return TypeConversions._dataView.getFloat64(0, true);
    }

    public static bytesToFloat32LE(bytes: Uint8Array): number {
        TypeConversions._conversionByteArray.set(bytes, 0);
        return TypeConversions._dataView.getFloat32(0, true);
    }

    public static float32BEToBytes(v: number): Uint8Array {
        TypeConversions._dataView.setFloat32(0, v, false);
        return TypeConversions._conversionByteArray.slice(0, 4);
    }

    public static uint16ToInt16(v: number): number {
        TypeConversions._dataView.setUint16(0, v, true);
        return TypeConversions._dataView.getInt16(0, true);
    }

    public static int16ToUint32(v: number): number {
        TypeConversions._dataView.setInt16(0, v, true);
        return TypeConversions._dataView.getUint32(0, true);
    }

    public static int32ToUint16(v: number): number {
        TypeConversions._dataView.setInt32(0, v, true);
        return TypeConversions._dataView.getUint16(0, true);
    }

    public static int32ToInt16(v: number): number {
        TypeConversions._dataView.setInt32(0, v, true);
        return TypeConversions._dataView.getInt16(0, true);
    }

    public static int32ToUint32(v: number): number {
        TypeConversions._dataView.setInt32(0, v, true);
        return TypeConversions._dataView.getUint32(0, true);
    }

    public static uint8ToInt8(v: number): number {
        TypeConversions._dataView.setUint8(0, v);
        return TypeConversions._dataView.getInt8(0);
    }
}
