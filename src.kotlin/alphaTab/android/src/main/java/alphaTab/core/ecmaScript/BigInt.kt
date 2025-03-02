package alphaTab.core.ecmaScript

internal class BigInt {
    companion object {
        fun asUintN(bits: Double, value: Long): Long {
            // https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-bigint.asuintn
            return (value % Math.pow(2.0, bits)).toLong()
        }
    }
}
