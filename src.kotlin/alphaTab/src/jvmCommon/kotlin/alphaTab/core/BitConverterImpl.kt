package alphaTab.core

import java.nio.ByteBuffer
import java.nio.ByteOrder

@kotlin.ExperimentalUnsignedTypes
actual class BitConverter {
    actual companion object {
        @kotlin.jvm.JvmStatic
        public actual fun put(dest: ByteArray, pos: Int, v: UShort, littleEndian: Boolean) {
            ByteBuffer
                .wrap(dest)
                .order(if (littleEndian) ByteOrder.LITTLE_ENDIAN else ByteOrder.BIG_ENDIAN)
                .putShort(pos, v.toShort())
        }

        @kotlin.jvm.JvmStatic
        public actual fun put(dest: ByteArray, pos: Int, v: Short, littleEndian: Boolean) {
            ByteBuffer
                .wrap(dest)
                .order(if (littleEndian) ByteOrder.LITTLE_ENDIAN else ByteOrder.BIG_ENDIAN)
                .putShort(pos, v)
        }

        @kotlin.jvm.JvmStatic
        public actual fun put(dest: ByteArray, pos: Int, v: Int, littleEndian: Boolean) {
            ByteBuffer
                .wrap(dest)
                .order(if (littleEndian) ByteOrder.LITTLE_ENDIAN else ByteOrder.BIG_ENDIAN)
                .putInt(pos, v)
        }

        @kotlin.jvm.JvmStatic
        public actual fun getInt16(src: ByteArray, pos: Int, littleEndian: Boolean): Short {
            return ByteBuffer
                .wrap(src)
                .order(if (littleEndian) ByteOrder.LITTLE_ENDIAN else ByteOrder.BIG_ENDIAN)
                .getShort(pos)
        }

        @kotlin.jvm.JvmStatic
        public actual fun getUint16(src: ByteArray, pos: Int, littleEndian: Boolean): UShort {
            return ByteBuffer
                .wrap(src)
                .order(if (littleEndian) ByteOrder.LITTLE_ENDIAN else ByteOrder.BIG_ENDIAN)
                .getShort(pos)
                .toUShort()
        }

        @kotlin.jvm.JvmStatic
        public actual fun getUint32(src: ByteArray, pos: Int, littleEndian: Boolean): UInt {
            return ByteBuffer
                .wrap(src)
                .order(if (littleEndian) ByteOrder.LITTLE_ENDIAN else ByteOrder.BIG_ENDIAN)
                .getInt(pos)
                .toUInt()
        }

        @kotlin.jvm.JvmStatic
        public actual fun getInt32(src: ByteArray, pos: Int, littleEndian: Boolean): Int {
            return ByteBuffer
                .wrap(src)
                .order(if (littleEndian) ByteOrder.LITTLE_ENDIAN else ByteOrder.BIG_ENDIAN)
                .getInt(pos)
        }
    }
}
