package alphaTab.core.ecmaScript

internal class CoreString {
    companion object{
        public fun fromCharCode(code:Double): String {
            return code.toInt().toChar().toString();
        }

        public fun fromCodePoint(code:Double): String {
            return String(intArrayOf(code.toInt()), 0, 1);
        }
    }
}
