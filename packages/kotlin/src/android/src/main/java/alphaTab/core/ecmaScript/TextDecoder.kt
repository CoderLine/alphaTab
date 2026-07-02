package alphaTab.core.ecmaScript

import alphaTab.core.ecmaScript.ArrayBuffer
import java.nio.charset.Charset

internal class TextDecoder(encoding:String) {
    private val _encoding:String = encoding

    @ExperimentalUnsignedTypes
    public fun decode(buffer: ArrayBuffer): String {
        return String(buffer.toByteArray(), 0, buffer.size, Charset.forName(_encoding))
    }

    @ExperimentalUnsignedTypes
    public fun decode(buffer: Uint8Array): String {
        return String(buffer.buffer.toByteArray(), buffer.byteOffset.toInt(), buffer.length.toInt(), Charset.forName(_encoding))
    }
}
