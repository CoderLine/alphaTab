package alphaTab.core.dom

import alphaTab.core.decodeToString
import alphaTab.core.ecmaScript.ArrayBuffer

class TextDecoder {


    private val _encoding:String
    public constructor(encoding:String) {
        _encoding = encoding
    }

    public fun decode(buffer: ArrayBuffer): String {
        return buffer.raw.decodeToString(_encoding);
    }
}
