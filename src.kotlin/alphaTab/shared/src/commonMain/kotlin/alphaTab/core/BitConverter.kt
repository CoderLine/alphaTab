package alphaTab.core

@kotlin.ExperimentalUnsignedTypes
expect class BitConverter {
    companion object {
        @kotlin.jvm.JvmStatic
        fun put(dest: ByteArray, pos: Int, v: UShort, littleEndian: Boolean)

        @kotlin.jvm.JvmStatic
        fun put(dest: ByteArray, pos: Int, v: Short, littleEndian: Boolean)

        @kotlin.jvm.JvmStatic
        fun put(dest: ByteArray, pos: Int, v: Int, littleEndian: Boolean)

        @kotlin.jvm.JvmStatic
        fun put(dest: ByteArray, pos: Int, v: Double, littleEndian: Boolean)

        @kotlin.jvm.JvmStatic
        fun getInt16(src: ByteArray, pos: Int, littleEndian: Boolean): Short

        @kotlin.jvm.JvmStatic
        fun getUint16(src: ByteArray, pos: Int, littleEndian: Boolean): UShort

        @kotlin.jvm.JvmStatic
        fun getUint32(src: ByteArray, pos: Int, littleEndian: Boolean): UInt

        @kotlin.jvm.JvmStatic
        fun getInt32(src: ByteArray, pos: Int, littleEndian: Boolean): Int

        @kotlin.jvm.JvmStatic
        fun getFloat(src: ByteArray, pos: Int, littleEndian: Boolean): Float

        @kotlin.jvm.JvmStatic
        fun getDouble(src: ByteArray, pos: Int, littleEndian: Boolean): Double
    }
}
