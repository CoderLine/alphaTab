package alphaTab.io

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
    }
}
