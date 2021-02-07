package alphaTab.core.ecmaScript

import kotlin.math.pow

class Math {
    companion object {
        public const val PI: Double = kotlin.math.PI
        public inline fun log10(x: Double): Double {
            return kotlin.math.log10(x)
        }

        public inline fun round(x: Double): Double {
            return kotlin.math.round(x)
        }

        public inline fun exp(x: Double): Double {
            return kotlin.math.exp(x)
        }

        public inline fun tan(x: Double): Double {
            return kotlin.math.tan(x)
        }

        public inline fun ceil(x: Double): Double {
            return kotlin.math.ceil(x)
        }

        public inline fun asin(x: Double): Double {
            return kotlin.math.asin(x)
        }

        public inline fun sqrt(x: Double): Double {
            return kotlin.math.sqrt(x)
        }

        public inline fun log(x: Double): Double {
            return kotlin.math.ln(x)
        }

        public inline fun sin(x: Double): Double {
            return kotlin.math.sin(x)
        }

        public inline fun pow(b: Double, e: Double): Double {
            return b.pow(e)
        }

        public inline fun abs(x: Double): Double {
            return kotlin.math.abs(x)
        }

        public inline fun floor(x: Double): Double {
            return kotlin.math.floor(x)
        }

        public inline fun log2(x: Double): Double {
            return kotlin.math.log2(x)
        }

        public inline fun min(a: Double, b: Double): Double {
            return kotlin.math.min(a, b)
        }

        public inline fun max(a: Double, b: Double): Double {
            return kotlin.math.max(a, b)
        }

        public inline fun random(): Double {
            return kotlin.random.Random.nextDouble()
        }
    }
}
