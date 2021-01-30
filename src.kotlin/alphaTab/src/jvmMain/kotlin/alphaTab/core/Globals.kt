package alphaTab.core

import java.nio.ByteBuffer

actual fun UByteArray.decodeToFloatArray(): FloatArray {
    return ByteBuffer.wrap(this.toByteArray()).asFloatBuffer().array()
}

actual fun UByteArray.decodeToDoubleArray(): DoubleArray {
    return ByteBuffer.wrap(this.toByteArray()).asDoubleBuffer().array()
}
