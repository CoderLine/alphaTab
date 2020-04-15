export class TypeConversions {
    private static _conversionBuffer: ArrayBuffer = new ArrayBuffer(8);
    private static _dataView = new DataView(TypeConversions._conversionBuffer);

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
