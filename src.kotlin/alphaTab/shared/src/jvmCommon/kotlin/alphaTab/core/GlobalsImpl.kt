package alphaTab.core

import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.charset.Charset
import java.text.DecimalFormat
import java.text.NumberFormat
import java.util.*

actual class LateInitList<T> : java.util.ArrayList<T>, MutableList<T> {
    @Suppress("UNCHECKED_CAST")
    public actual constructor(size: Int) : super(arrayOfNulls<Any>(size).toList() as List<T>) {

    }
}


@ExperimentalUnsignedTypes
actual fun UByteArray.decodeToFloatArray(): FloatArray {
    val fb = ByteBuffer.wrap(this.toByteArray()).order(ByteOrder.LITTLE_ENDIAN).asFloatBuffer();
    val fa = FloatArray(fb.limit())
    fb.get(fa)
    return fa
}

@ExperimentalUnsignedTypes
actual fun UByteArray.decodeToDoubleArray(): DoubleArray {
    val db = ByteBuffer.wrap(this.toByteArray()).order(ByteOrder.LITTLE_ENDIAN).asDoubleBuffer();
    val da = DoubleArray(db.limit())
    db.get(da)
    return da
}

@ExperimentalUnsignedTypes
actual fun UByteArray.decodeToString(encoding: String): String {
    return String(this.toByteArray(), 0, this.size, Charset.forName(encoding))
}

var invariantDoubleFormat = DecimalFormat().apply {
    this.minimumFractionDigits = 0
    this.maximumFractionDigits = 12
    this.decimalFormatSymbols.decimalSeparator = '.'
    this.isGroupingUsed = false
}

actual fun Double.toInvariantString(): String {
    return invariantDoubleFormat.format(this)
}

actual fun String.toDoubleOrNaN(): Double {
    try {
        val number = NumberFormat.getInstance(Locale.ROOT).parse(this)
        if (number != null) {
            return number.toDouble()
        }
    } catch (e: Throwable) {
    }
    return Double.NaN
}

actual fun String.toIntOrNaN(): Double {
    try {
        val number = NumberFormat.getInstance(Locale.ROOT).parse(this)
        if (number != null) {
            return number.toInt().toDouble()
        }
    } catch (e: Throwable) {
    }
    return Double.NaN
}
