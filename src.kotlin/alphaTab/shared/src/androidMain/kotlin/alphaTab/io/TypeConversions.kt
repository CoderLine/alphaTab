package alphaTab.io

@ExperimentalUnsignedTypes
actual class TypeConversions {
    actual companion object {
        public actual fun uint16ToInt16(v: Double): Double {
            return v.toUInt().toShort().toDouble()
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
    }
}
