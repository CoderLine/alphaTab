package alphaTab.core.ecmaScript

class ArrayBuffer {
    public val raw: UByteArray;

    public constructor(size: Double) {
        raw = UByteArray(size.toInt());
    }

    public constructor(raw: UByteArray) {
        this.raw = raw;
    }
}
