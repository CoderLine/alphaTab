package alphaTab.core.ecmaScript

import alphaTab.core.BitConverter

@ExperimentalUnsignedTypes
class DataView {
    private val _buffer: ArrayBuffer

    public constructor(buffer: ArrayBuffer) {
        this._buffer = buffer
    }

    public fun setUint16(offset: Double, value: Double, littleEndian: Boolean) {
        BitConverter.put(
            _buffer.raw.asByteArray(),
            offset.toInt(),
            value.toUInt().toUShort(),
            littleEndian
        )
    }

    public fun getInt16(offset: Double, littleEndian: Boolean): Double {
        return BitConverter.getInt16(_buffer.raw.asByteArray(), offset.toInt(), littleEndian)
            .toDouble()
    }

    public fun setInt16(offset: Double, value: Double, littleEndian: Boolean) {
        BitConverter.put(
            _buffer.raw.asByteArray(),
            offset.toInt(),
            value.toInt().toShort(),
            littleEndian
        )
    }

    public fun getUint32(offset: Double, littleEndian: Boolean): Double {
        return BitConverter.getUint32(_buffer.raw.asByteArray(), offset.toInt(), littleEndian)
            .toDouble()
    }

    public fun setInt32(offset: Double, value: Double, littleEndian: Boolean) {
        BitConverter.put(_buffer.raw.asByteArray(), offset.toInt(), value.toInt(), littleEndian)
    }

    public fun getUint16(offset: Double, littleEndian: Boolean): Double {
        return BitConverter.getUint16(_buffer.raw.asByteArray(), offset.toInt(), littleEndian)
            .toDouble()
    }

    public fun setUint8(offset: Double, value: Double) {
        _buffer.raw[offset.toInt()] = value.toUInt().toUByte()
    }

    public fun getInt8(offset: Double): Double {
        return _buffer.raw[offset.toInt()].toByte().toDouble()
    }
}
