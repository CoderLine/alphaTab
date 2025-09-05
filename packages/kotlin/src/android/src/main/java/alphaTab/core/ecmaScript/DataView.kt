package alphaTab.core.ecmaScript

import java.nio.ByteOrder

@ExperimentalUnsignedTypes
internal class DataView {
    private val _littleEndianBufferView: java.nio.ByteBuffer
    private val _bigEndianBufferView: java.nio.ByteBuffer

    val buffer: ArrayBuffer
    val byteOffset: Double
    val byteLength: Double

    constructor(buffer: ArrayBuffer) {
        this.buffer = buffer
        byteOffset = 0.0
        byteLength = buffer.size.toDouble()
        this._littleEndianBufferView =
            java.nio.ByteBuffer.wrap(buffer.asByteArray()).order(ByteOrder.LITTLE_ENDIAN)
        this._bigEndianBufferView =
            java.nio.ByteBuffer.wrap(buffer.asByteArray()).order(ByteOrder.BIG_ENDIAN)

    }

    constructor(buffer: ArrayBuffer, byteOffset: Double, byteLength: Double) {
        this.buffer = buffer
        this.byteOffset = byteOffset
        this.byteLength = byteLength
        this._littleEndianBufferView =
            java.nio.ByteBuffer.wrap(buffer.asByteArray(), byteOffset.toInt(), byteLength.toInt())
                .order(ByteOrder.LITTLE_ENDIAN)
        this._bigEndianBufferView =
            java.nio.ByteBuffer.wrap(buffer.asByteArray(), byteOffset.toInt(), byteLength.toInt())
                .order(ByteOrder.BIG_ENDIAN)
    }

    fun getFloat32(index: Double, littleEndian: Boolean): Double {
        return if (littleEndian) {
            _littleEndianBufferView
        } else {
            _bigEndianBufferView
        }.getFloat((byteOffset + index).toInt()).toDouble()
    }


    fun getInt16(index: Double, littleEndian: Boolean): Double {
        return if (littleEndian) {
            _littleEndianBufferView
        } else {
            _bigEndianBufferView
        }.getShort((byteOffset + index).toInt()).toDouble()
    }
}
