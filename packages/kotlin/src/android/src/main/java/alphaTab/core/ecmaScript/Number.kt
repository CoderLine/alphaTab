@file:Suppress("NOTHING_TO_INLINE")

package alphaTab.core.ecmaScript

import alphaTab.core.toDoubleOrNaN
import alphaTab.core.toIntOrNaN

internal class Number {

    companion object {
        const val POSITIVE_INFINITY: Double = Double.POSITIVE_INFINITY
        const val MAX_SAFE_INTEGER: Double = 9007199254740991.0
        const val MIN_SAFE_INTEGER: Double = -9007199254740991.0
        const val NaN: Double = Double.NaN

        inline fun isNaN(s: Double): Boolean {
            return s.isNaN()
        }

        inline fun parseFloat(s: String): Double {
            return s.toDoubleOrNaN()
        }

        inline fun parseInt(s: String): Double {
            return s.toIntOrNaN()
        }

        inline fun parseInt(s: String, radix: Double): Double {
            return s.toIntOrNaN(radix)
        }

        inline fun parseInt(s: Char): Double {
            return parseInt(s.toString())
        }

        inline fun parseInt(s: Char, radix: Double): Double {
            return parseInt(s.toString(), radix)
        }
    }
}
