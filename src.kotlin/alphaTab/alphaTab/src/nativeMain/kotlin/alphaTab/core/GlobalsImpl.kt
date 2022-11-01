package alphaTab.core

import alphaTab.io.ByteBuffer
import kotlinx.cinterop.addressOf
import kotlinx.cinterop.toKString
import kotlinx.cinterop.usePinned
import platform.posix.sprintf

// workaround for https://youtrack.jetbrains.com/issue/KT-36878
public fun exposeByteArray(): ByteArray = ByteArray(2)

@ExperimentalUnsignedTypes
actual fun UByteArray.decodeToFloatArray(): FloatArray {
    val fa = FloatArray(this.size / 4)
    var i = 0
    while(i < this.size) {
        fa[i] = this.asByteArray().getFloatAt(i)
        i += 4
    }
    return fa
}

@ExperimentalUnsignedTypes
actual fun UByteArray.decodeToDoubleArray(): DoubleArray {
    val da = DoubleArray(this.size / 8)
    var i = 0
    while(i < this.size) {
        da[i] = this.asByteArray().getDoubleAt(i)
        i += 8
    }
    return da
}

@ExperimentalUnsignedTypes
actual fun UByteArray.decodeToString(encoding: String): String {
    return this.asByteArray().decodeToString()
}

val doubleToStringBuffer = ByteArray(100)
actual fun Double.toInvariantString(): String {
    doubleToStringBuffer.usePinned {
        sprintf(it.addressOf(0), "%g", this)
    }
    return doubleToStringBuffer.toKString()
}

actual fun String.toDoubleOrNaN(): Double {
    return this.toDoubleOrNull() ?: Double.NaN
}

actual fun String.toIntOrNaN(): Double {
    val number = this.toDoubleOrNull()
    if (number != null) {
        return number.toInt().toDouble()
    }
    return Double.NaN
}

actual fun String.toIntOrNaN(radix: Double): Double {
    val number = this.toIntOrNull(radix.toInt())
    if (number != null) {
        return number.toDouble()
    }
    return Double.NaN
}
