package alphaTab.core.ecmaScript

import alphaTab.core.byteLength

@Suppress("NOTHING_TO_INLINE")
@ExperimentalUnsignedTypes
internal class Int16Array : Iterable<Short> {
    private val _data: ShortArray?
    private val _buffer: ArrayBuffer?
    private val _byteBuffer: java.nio.ByteBuffer?

    public val length: Double
        get() {
            return _data?.size?.toDouble() ?: (_buffer!!.byteLength / 2.0)
        }

    public constructor(size: Double) {
        _data = ShortArray(size.toInt())
        _buffer = null
        _byteBuffer = null
    }

    public constructor(buffer: ArrayBuffer) {
        _data = null
        _buffer = buffer
        _byteBuffer = java.nio.ByteBuffer.wrap(buffer.asByteArray())
    }

    public inline operator fun get(index: Double): Double {
        return get(index.toInt())
    }

    fun getInt16FromBuffer(index: Int): Short {
        return _byteBuffer!!.getShort(index * 2)
    }

    public inline operator fun set(index: Double, value: Double) {
        set(index.toInt(), value)

    }

    public inline operator fun get(index: Int): Double {
        return if (_data != null) _data[index].toDouble() else getInt16FromBuffer(index).toDouble()
    }

    public inline operator fun set(index: Int, value: Double) {
        if (_data != null) {
            _data[index] = value.toInt().toShort()
        } else {
            _byteBuffer!!.putShort((index * 2), value.toInt().toShort())
        }
    }

    override fun iterator(): Iterator<Short> {
        if (_data == null) {
            return (0 until length.toInt()).map { getInt16FromBuffer(it) }.iterator()
        }
        return _data.iterator()
    }
}
