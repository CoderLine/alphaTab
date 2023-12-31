package alphaTab.core.ecmaScript

internal actual class Date {
    actual companion object {
        public actual fun now(): Double {
            return kotlin.system.getTimeMillis().toDouble()
        }
    }
}
