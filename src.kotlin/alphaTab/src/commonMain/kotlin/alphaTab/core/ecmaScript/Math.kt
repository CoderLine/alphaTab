package alphaTab.core.ecmaScript

class Math {
    companion object {
        public fun floor(x:Double) : Double {
            return kotlin.math.floor(x);
        }

        public fun random(): Double {
            return kotlin.random.Random.nextDouble();
        }
    }
}
