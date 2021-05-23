package alphaTab.core.dom

class TextEncoder {
    @ExperimentalUnsignedTypes
    public fun encode(str: String): alphaTab.core.ecmaScript.Uint8Array {
        return alphaTab.core.ecmaScript.Uint8Array(str.encodeToByteArray().toUByteArray())
    }
}
