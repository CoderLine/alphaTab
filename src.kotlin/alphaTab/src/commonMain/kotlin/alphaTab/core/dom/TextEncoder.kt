package alphaTab.core.dom

import alphaTab.core.decodeToString
import alphaTab.core.ecmaScript.ArrayBuffer

class TextEncoder {
    public fun encode(str: String): alphaTab.core.ecmaScript.Uint8Array {
        return alphaTab.core.ecmaScript.Uint8Array(str.encodeToByteArray().toUByteArray());
    }
}
