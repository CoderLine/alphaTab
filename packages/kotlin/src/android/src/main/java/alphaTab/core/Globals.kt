@file:Suppress("NOTHING_TO_INLINE")

package alphaTab.core

import alphaTab.collections.ArrayListWithRemoveRange
import alphaTab.collections.List
import alphaTab.collections.MapEntry
import alphaTab.core.ecmaScript.ArrayBuffer
import alphaTab.core.ecmaScript.RegExp
import alphaTab.core.ecmaScript.Set
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Deferred
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.async
import kotlinx.coroutines.delay
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.charset.Charset
import java.text.DecimalFormat
import java.text.NumberFormat
import java.util.Locale
import kotlin.coroutines.CoroutineContext
import kotlin.coroutines.EmptyCoroutineContext
import kotlin.coroutines.suspendCoroutine

@ExperimentalUnsignedTypes
internal inline fun UByteArray.decodeToFloatArray(): FloatArray {
    val fb = ByteBuffer.wrap(this.toByteArray()).order(ByteOrder.LITTLE_ENDIAN).asFloatBuffer();
    val fa = FloatArray(fb.limit())
    fb.get(fa)
    return fa
}

@ExperimentalUnsignedTypes
internal inline fun UByteArray.decodeToDoubleArray(): DoubleArray {
    val db = ByteBuffer.wrap(this.toByteArray()).order(ByteOrder.LITTLE_ENDIAN).asDoubleBuffer();
    val da = DoubleArray(db.limit())
    db.get(da)
    return da
}

@ExperimentalUnsignedTypes
internal inline fun UByteArray.decodeToString(encoding: String): String {
    return String(this.toByteArray(), 0, this.size, Charset.forName(encoding))
}


internal inline fun <T : Comparable<T>> List<T>.sort() {
    this.sort { a, b ->
        a.compareTo(b).toDouble()
    }
}

internal inline fun String.substr(startIndex: Double, length: Double): String {
    return this.substring(startIndex.toInt(), (startIndex + length).toInt())
}

internal inline fun String.substr(startIndex: Double): String {
    return this.substring(startIndex.toInt())
}

internal inline fun String.splitBy(separator: String): List<String> {
    return List(this.split(separator))
}

internal inline fun String.replace(pattern: RegExp, replacement: String): String {
    return pattern.replace(this, replacement)
}

internal fun String.replace(
    pattern: RegExp,
    replacement: (match: String, group1: String) -> String
): String {
    return pattern.replace(this, replacement)
}
internal fun String.replace(
    pattern: RegExp,
    replacement: (match: String) -> String
): String {
    return pattern.replace(this, replacement)
}

internal inline fun String.indexOfInDouble(item: String): Double {
    return this.indexOf(item).toDouble()
}

internal inline fun String.indexOfInDouble(item: String, startIndex: Double): Double {
    return this.indexOf(item, startIndex.toInt()).toDouble()
}

internal fun Double.toInvariantString(base: Double): String {
    return this.toInt().toString(base.toInt())
}


var invariantDoubleFormat = DecimalFormat().apply {
    this.minimumFractionDigits = 0
    this.maximumFractionDigits = Int.MAX_VALUE
    this.decimalFormatSymbols.decimalSeparator = '.'
    this.isGroupingUsed = false
}

internal fun Double.toInvariantString(): String {
    // TODO: On android/java the DecimalFormat is terribly slow, we need a more efficient
    // mechanism to convert doubles to string.
    val integerPart = this.toInt();
    val fractionalPart = (this - integerPart)
    if (fractionalPart > 0.0000001 || fractionalPart < -0.0000001) {
        return invariantDoubleFormat.format(this)
    }
    return this.toInt().toString();
}

internal inline fun IAlphaTabEnum.toInvariantString(): String {
    return this.value.toString()
}

internal inline fun Double.toFixed(decimals: Double): String {
    return String.format("%.${decimals.toInt()}f", this);
}

internal inline fun String.lastIndexOfInDouble(item: String): Double {
    return this.lastIndexOf(item).toDouble()
}

internal inline operator fun Double.plus(str: String): String {
    return this.toInvariantString() + str
}

internal inline fun String.charAt(index: Double): String {
    return this.substring(index.toInt(), index.toInt() + 1)
}

internal inline fun String.charCodeAt(index: Int): Double {
    return this[index].code.toDouble()
}

internal inline fun String.charCodeAt(index: Double): Double {
    return this[index.toInt()].code.toDouble()
}

internal inline fun String.split(delimiter: String): List<String> {
    return List(this.split(delimiters = arrayOf(delimiter), ignoreCase = false, limit = 0))
}

internal inline fun String.substring(startIndex: Double, endIndex: Double): String {
    return this.substring(startIndex.toInt(), endIndex.toInt())
}

internal inline operator fun String.get(index: Double): Char {
    return this[index.toInt()]
}

internal inline fun String.substring(startIndex: Double): String {
    return this.substring(startIndex.toInt())
}

internal inline fun String.replaceAll(before: String, after: String): String {
    return this.replace(before, after)
}

internal inline fun String.replaceAll(search: RegExp, after: String): String {
    return this.replace(search, after)
}

internal inline fun String.replaceAll(
    search: RegExp,
    noinline replacement: (match: String) -> String
): String {
    return this.replace(search, replacement)
}

internal inline fun IAlphaTabEnum.toDouble(): Double {
    return this.value.toDouble()
}

internal inline fun IAlphaTabEnum?.toDouble(): Double? {
    return this?.value.toDouble()
}

internal inline fun IAlphaTabEnum.toInt(): Int {
    return this.value
}

internal inline fun IAlphaTabEnum?.toInt(): Int? {
    return this?.value
}

internal inline fun Double.toTemplate(): String {
    return this.toInvariantString()
}

internal inline fun Double?.toTemplate(): String {
    return this?.toInvariantString() ?: ""
}

internal fun Any?.toTemplate(): String = when (this) {
    null -> ""
    is IAlphaTabEnum -> this.toInvariantString()
    is Double -> this.toTemplate()
    else -> this.toString()
}

internal fun Any?.toDouble(): Double {
    if (this is Double) {
        return this
    }
    if (this == null) {
        throw ClassCastException("Cannot cast null to double")
    }
    throw ClassCastException("Cannot cast ${this::class.simpleName} to double")
}

internal fun Any?.toLong(): Long {
    if (this is Long) {
        return this
    }
    if (this == null) {
        throw ClassCastException("Cannot cast null to long")
    }
    throw ClassCastException("Cannot cast ${this::class.simpleName} to long")
}

internal inline fun Int?.toDouble(): Double? {
    return this?.toDouble()
}

internal inline fun String.toDoubleOrNaN(): Double {
    try {
        val number = NumberFormat.getInstance(Locale.ROOT).parse(this.trim())
        if (number != null) {
            return number.toDouble()
        }
    } catch (e: Throwable) {
    }
    return Double.NaN
}

internal fun String.toIntOrNaN(): Double {
    try {
        val number = NumberFormat.getInstance(Locale.ROOT).parse(this.trim())
        if (number != null) {
            return number.toInt().toDouble()
        }
    } catch (e: Throwable) {
    }
    return Double.NaN
}

internal fun String.toIntOrNaN(radix: Double): Double {
    try {
        return Integer.parseInt(this.trim(), radix.toInt()).toDouble();
    } catch (e: Throwable) {
    }
    return Double.NaN
}


internal class Globals {
    companion object {
        val console = Console()

        inline fun setImmediate(action: () -> Unit) {
            action()
        }

        inline fun setTimeout(noinline action: () -> Unit, millis: Double): Deferred<Unit> {
            @Suppress("OPT_IN_USAGE")
            return GlobalScope.async {
                delay(millis.toLong())
                action()
            }
        }

        val performance = Performance()
    }
}

internal class Performance {
    fun now(): Double {
        return System.currentTimeMillis().toDouble()
    }
}

internal fun List<Char>.toCharArray(): CharArray {
    val result = CharArray(length.toInt())
    var index = 0
    for (element in this) {
        result[index++] = element
    }
    return result
}

@OptIn(ExperimentalCoroutinesApi::class)
internal fun <T> Deferred<T>.then(callback: (T) -> Unit): Deferred<T> {
    this.invokeOnCompletion {
        if (it == null) {
            callback(this.getCompleted())
        }
    }
    return this
}

internal fun <T> Deferred<T>.catch(callback: (alphaTab.core.ecmaScript.Error) -> Unit): Deferred<T> {
    this.invokeOnCompletion {
        if (it != null) {
            callback(it)
        }
    }
    return this
}

@OptIn(ExperimentalUnsignedTypes::class)
internal val ArrayBuffer.byteLength: Int
    get() = this.size

internal fun String.repeat(count: Double): String {
    return this.repeat(count.toInt())
}

internal fun String.padStart(length: Double, pad: String): String {
    return this.padStart(length.toInt(), pad[0])
}

internal val Throwable.stack: String
    get() = this.stackTraceToString()

internal inline fun <reified T> List<T>.spread(): Array<T> {
    return _data.toTypedArray();
}

internal inline fun <reified T> List<T?>.filterNotNull(): List<T> {
    return List(_data.filterNotNullTo(ArrayListWithRemoveRange()))
}

internal inline fun <reified TKey, reified TValue, reified TResult> List<MapEntry<TKey, TValue>>.map(
    func: (v: ArrayTuple<TKey, TValue>) -> TResult
): List<TResult> {
    return List(
        _data.map { func(ArrayTuple(it.key, it.value)) }.toCollection(
            ArrayListWithRemoveRange()
        )
    )
}

internal inline fun Set<Double>.spread(): DoubleArray {
    val empty = DoubleArray(this.size.toInt())
    for ((i, v) in this.withIndex()) {
        empty[i] = v
    }
    return empty
}

internal inline fun <reified T> Set<T>.spread(): kotlin.Array<T> {
    val empty = arrayOfNulls<T>(this.size.toInt())
    for ((i, v) in this.withIndex()) {
        empty[i] = v
    }
    @Suppress("UNCHECKED_CAST")
    return empty as kotlin.Array<T>
}

internal class IteratorIterable<T>(private val iterator: Iterator<T>) : Iterable<T> {
    override fun iterator(): Iterator<T> {
        return iterator
    }
}

internal inline fun Iterator<Double>.spread(): DoubleArray {
    return IteratorIterable(this).toList().toDoubleArray()
}

internal inline fun <reified T> Iterator<T>.spread(): kotlin.Array<T> {
    return IteratorIterable(this).toList().toTypedArray()
}

internal inline fun <reified T> List<T>.concat(other: Iterable<T>): List<T> {
    val copy = this.slice()
    copy.push(other)
    return copy
}
