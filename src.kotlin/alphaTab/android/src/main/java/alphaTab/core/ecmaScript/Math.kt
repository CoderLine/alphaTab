package alphaTab.core.ecmaScript

import kotlin.math.pow

internal class Math {
    companion object {
        public const val PI: Double = kotlin.math.PI
        public fun log10(x: Double): Double {
            return kotlin.math.log10(x)
        }

        public fun round(x: Double): Double {
            return kotlin.math.round(x)
        }

        public fun exp(x: Double): Double {
            return kotlin.math.exp(x)
        }

        public fun tan(x: Double): Double {
            return kotlin.math.tan(x)
        }

        public fun ceil(x: Double): Double {
            return kotlin.math.ceil(x)
        }

        public fun asin(x: Double): Double {
            return kotlin.math.asin(x)
        }

        public fun sqrt(x: Double): Double {
            return kotlin.math.sqrt(x)
        }

        public fun log(x: Double): Double {
            return kotlin.math.ln(x)
        }

        public fun sin(x: Double): Double {
            return kotlin.math.sin(x)
        }

        public fun pow(b: Double, e: Double): Double {
            return b.pow(e)
        }

        public fun abs(x: Double): Double {
            return kotlin.math.abs(x)
        }

        public fun floor(x: Double): Double {
            return kotlin.math.floor(x)
        }

        public fun log2(x: Double): Double {
            return kotlin.math.log2(x)
        }

        public fun min(a: Double, b: Double): Double {
            return kotlin.math.min(a, b)
        }

        public fun min(a: Double, b: Double, c:Double): Double {
            return kotlin.math.min(kotlin.math.min(a, b), c);
        }

        public fun max(a: Double, b: Double): Double {
            return kotlin.math.max(a, b)
        }

        public fun max(a: Double, b: Double, c:Double): Double {
            return kotlin.math.max(kotlin.math.max(a, b), c);
        }

        public fun random(): Double {
            return kotlin.random.Random.nextDouble()
        }
    }
}
