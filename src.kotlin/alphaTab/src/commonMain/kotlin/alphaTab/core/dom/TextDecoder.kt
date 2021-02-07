package alphaTab.core.dom

import alphaTab.core.decodeToString
import alphaTab.core.ecmaScript.ArrayBuffer

class TextDecoder(encoding:String) {
    private val _encoding:String = encoding

    @ExperimentalUnsignedTypes
    public fun decode(buffer: ArrayBuffer): String {
        return buffer.raw.decodeToString(_encoding)
    }
}
