package alphaTab.core.ecmaScript

internal class CoreString {
    companion object{
        public fun fromCharCode(code:Double): String {
            return code.toInt().toChar().toString();
        }
    }
}
