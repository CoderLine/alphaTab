package alphaTab.core.ecmaScript

import java.nio.ByteOrder

@ExperimentalUnsignedTypes
internal class DataView(val buffer: ArrayBuffer) {
    private val _bufferView = java.nio.ByteBuffer.wrap(buffer.asByteArray()).order(ByteOrder.LITTLE_ENDIAN)

    fun getFloat32(index: Double, littleEndian: Boolean): Double {
        return if (littleEndian) {
            _bufferView.getFloat(index.toInt()).toDouble()
        } else {
            _bufferView.order(ByteOrder.BIG_ENDIAN).getFloat(index.toInt()).toDouble()
        }
    }
}
