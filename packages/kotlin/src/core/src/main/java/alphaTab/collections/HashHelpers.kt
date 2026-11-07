package alphaTab.collections

import kotlin.math.sqrt

class HashHelpers {
    companion object {
        private val _primes: IntArray = intArrayOf(
            3, 7, 11, 17, 23, 29, 37, 47, 59, 71, 89, 107, 131, 163, 197, 239, 293, 353, 431, 521, 631, 761, 919,
            1103, 1327, 1597, 1931, 2333, 2801, 3371, 4049, 4861, 5839, 7013, 8419, 10103, 12143, 14591,
            17519, 21023, 25229, 30293, 36353, 43627, 52361, 62851, 75431, 90523, 108631, 130363, 156437,
            187751, 225307, 270371, 324449, 389357, 467237, 560689, 672827, 807403, 968897, 1162687, 1395263,
            1674319, 2009191, 2411033, 2893249, 3471899, 4166287, 4999559, 5999471, 7199369
        )
        private const val hashPrime = 101

        public fun expandPrime(oldSize:Int): Int {
            val newSize = 2 * oldSize
            return getPrime(newSize)
        }

        public fun getPrime(min: Int): Int {
            for (prime in _primes) {
                if (prime >= min) {
                    return prime
                }
            }

            //outside of our predefined table.
            //compute the hard way.
            var i = min or 1
            while (i < Int.MAX_VALUE) {
                if (isPrime(i) && (i - 1) % hashPrime != 0) return i
                i += 2
            }
            return min
        }

        private fun isPrime(candidate: Int): Boolean {
            if (candidate and 1 != 0) {
                val limit = sqrt(candidate.toDouble()).toInt()
                var divisor = 3
                while (divisor <= limit) {
                    if (candidate % divisor == 0) {
                        return false
                    }
                    divisor += 2
                }
                return true
            }
            return candidate == 2
        }
    }
}
