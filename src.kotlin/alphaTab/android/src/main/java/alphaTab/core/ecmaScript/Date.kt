package alphaTab.core.ecmaScript

internal class Date {
    companion object {
        public fun now(): Double {
            return System.currentTimeMillis().toDouble()
        }
    }
}
