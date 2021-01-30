package alphaTab.core.ecmaScript

import kotlin.math.pow

class Math {
    companion object {
        public fun pow(b:Double, e:Double) : Double {
            return b.pow(e);
        }
        public fun abs(x:Double) : Double {
            return kotlin.math.abs(x);
        }
        public fun floor(x:Double) : Double {
            return kotlin.math.floor(x);
        }

        public fun log2(x:Double) : Double {
            return kotlin.math.log2(x);
        }

        public fun min(a:Double, b:Double) : Double {
            return kotlin.math.min(a,b)
        }
        public fun max(a:Double, b:Double) : Double {
            return kotlin.math.max(a,b)
        }

        public fun random(): Double {
            return kotlin.random.Random.nextDouble();
        }
    }
}
