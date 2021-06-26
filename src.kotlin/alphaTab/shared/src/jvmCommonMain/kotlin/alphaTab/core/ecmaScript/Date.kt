package alphaTab.core.ecmaScript

actual class Date {
    actual companion object {
        public actual fun now(): Double {
            return System.currentTimeMillis().toDouble()
        }
    }
}
