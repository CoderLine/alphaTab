package alphaTab.core

import java.nio.ByteBuffer
import java.nio.charset.Charset
import java.text.NumberFormat
import java.util.*

@ExperimentalUnsignedTypes
actual fun UByteArray.decodeToFloatArray(): FloatArray {
    return ByteBuffer.wrap(this.toByteArray()).asFloatBuffer().array()
}

@ExperimentalUnsignedTypes
actual fun UByteArray.decodeToDoubleArray(): DoubleArray {
    return ByteBuffer.wrap(this.toByteArray()).asDoubleBuffer().array()
}

@ExperimentalUnsignedTypes
actual fun UByteArray.decodeToString(encoding: String): String {
    return String(this.toByteArray(), 0, this.size, Charset.forName(encoding))
}

actual fun Double.toInvariantString(): String {
    return NumberFormat.getInstance(Locale.ROOT).format(this)
}

actual fun String.toDoubleOrNaN(): Double {
    try {
        val number = NumberFormat.getInstance(Locale.ROOT).parse(this)
        if(number != null) {
            return number.toDouble()
        }
    } catch (e: Throwable) {
    }
    return Double.NaN
}

actual fun String.toIntOrNaN(): Double {
    try {
        val number = NumberFormat.getInstance(Locale.ROOT).parse(this)
        if(number != null) {
            return number.toInt().toDouble()
        }
    } catch (e: Throwable) {
    }
    return Double.NaN
}
