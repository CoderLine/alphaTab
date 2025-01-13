package alphaTab.io

import alphaTab.core.ecmaScript.Uint8Array

@ExperimentalUnsignedTypes
internal class TypeConversions {
    companion object {
        public fun uint16ToInt16(v: Double): Double {
            return v.toUInt().toShort().toDouble()
        }

        public fun int16ToUint32(v: Double): Double {
            return v.toInt().toShort().toUInt().toDouble()
        }

        public fun int32ToUint16(v: Double): Double {
            return v.toInt().toUShort().toDouble()
        }

        public fun int32ToInt16(v: Double): Double {
            return v.toInt().toShort().toDouble()
        }

        public fun int32ToUint32(v: Double): Double {
            return v.toInt().toUInt().toDouble()
        }

        public fun bytesToFloat32LE(bytes: Uint8Array): Double {
            val buffer = java.nio.ByteBuffer.wrap(bytes.buffer.asByteArray())
                .order(java.nio.ByteOrder.LITTLE_ENDIAN)
            return buffer.getFloat().toDouble()
        }

        public fun bytesToFloat64LE(bytes: Uint8Array): Double {
            val buffer = java.nio.ByteBuffer.wrap(bytes.buffer.asByteArray())
                .order(java.nio.ByteOrder.LITTLE_ENDIAN)
            return buffer.getDouble()
        }

        fun bytesToInt64LE(bytes: Uint8Array): Double {
            val buffer = java.nio.ByteBuffer.wrap(bytes.buffer.asByteArray())
                .order(java.nio.ByteOrder.LITTLE_ENDIAN)
            return buffer.getInt().toDouble()
        }
    }
}
