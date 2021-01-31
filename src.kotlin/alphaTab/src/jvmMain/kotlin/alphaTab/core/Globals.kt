package alphaTab.core

import java.nio.ByteBuffer
import java.nio.charset.Charset

actual fun UByteArray.decodeToFloatArray(): FloatArray {
    return ByteBuffer.wrap(this.toByteArray()).asFloatBuffer().array()
}

actual fun UByteArray.decodeToDoubleArray(): DoubleArray {
    return ByteBuffer.wrap(this.toByteArray()).asDoubleBuffer().array()
}

@ExperimentalUnsignedTypes
actual fun UByteArray.decodeToString(encoding: String): String {
    return String(this.toByteArray(), 0, this.size, Charset.forName(encoding))
}
