package alphaTab.io

import alphaTab.core.ecmaScript.Uint8Array

@ExperimentalUnsignedTypes
actual class TypeConversions {
    actual companion object {
        public actual fun float64ToBytes(v: Double): Uint8Array {
            val l = java.lang.Double.doubleToLongBits(v);
            return Uint8Array(
                ubyteArrayOf(
                    ((l shl 56) and 0xFF).toUByte(),
                    ((l shl 48) and 0xFF).toUByte(),
                    ((l shl 40) and 0xFF).toUByte(),
                    ((l shl 32) and 0xFF).toUByte(),
                    ((l shl 24) and 0xFF).toUByte(),
                    ((l shl 16) and 0xFF).toUByte(),
                    ((l shl 8) and 0xFF).toUByte(),
                    ((l shl 0) and 0xFF).toUByte()
                )
            )
        }

        public actual fun bytesToFloat64(bytes: Uint8Array): Double {
            val l = (bytes.buffer.raw[0].toLong() shl 56) or
                (bytes.buffer.raw[1].toLong() shl 48) or
                (bytes.buffer.raw[2].toLong() shl 40) or
                (bytes.buffer.raw[3].toLong() shl 32) or
                (bytes.buffer.raw[4].toLong() shl 24) or
                (bytes.buffer.raw[5].toLong() shl 16) or
                (bytes.buffer.raw[6].toLong() shl 8) or
                (bytes.buffer.raw[7].toLong() shl 0)
            return java.lang.Double.longBitsToDouble(l);
        }

        public actual fun uint16ToInt16(v: Double): Double {
            return v.toUInt().toUShort().toDouble()
        }

        public actual fun int16ToUint32(v: Double): Double {
            return v.toInt().toShort().toUInt().toDouble()
        }

        public actual fun int32ToUint16(v: Double): Double {
            return v.toInt().toUShort().toDouble()
        }

        public actual fun int32ToInt16(v: Double): Double {
            return v.toInt().toShort().toDouble()
        }

        public actual fun int32ToUint32(v: Double): Double {
            return v.toInt().toUInt().toDouble()
        }

        public actual fun uint8ToInt8(v: Double): Double {
            return v.toUInt().toUByte().toInt().toDouble()
        }
    }
}
