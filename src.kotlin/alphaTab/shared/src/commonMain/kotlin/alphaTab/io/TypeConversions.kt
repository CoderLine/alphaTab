package alphaTab.io

@ExperimentalUnsignedTypes
expect class TypeConversions {
    companion object {
        public fun uint16ToInt16(v: Double): Double
        public fun int16ToUint32(v: Double): Double
        public fun int32ToUint16(v: Double): Double
        public fun int32ToInt16(v: Double): Double
        public fun int32ToUint32(v: Double): Double
    }
}
