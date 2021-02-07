package alphaTab.core.ecmaScript

class CoreString {
    companion object{
        public fun fromCharCode(code:Double): kotlin.String {
            return code.toInt().toChar().toString();
        }
    }
}
