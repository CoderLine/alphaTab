package alphaTab.io

import alphaTab.core.ecmaScript.Uint8Array

@ExperimentalUnsignedTypes
expect class TypeConversions {
    companion object {
        public fun float64ToBytes(v: Double): Uint8Array
        public fun bytesToFloat64(bytes: Uint8Array): Double
        public fun uint16ToInt16(v: Double): Double
        public fun int16ToUint32(v: Double): Double
        public fun int32ToUint16(v: Double): Double
        public fun int32ToInt16(v: Double): Double
        public fun int32ToUint32(v: Double): Double
        public fun uint8ToInt8(v: Double): Double
    }
}
