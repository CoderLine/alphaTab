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

internal fun String.splitBy(pattern: RegExp): List<String> {
    return pattern.split(this)
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

internal inline fun String.localeCompare(other: String): Double {
    return this.compareTo(other).toDouble()
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

/**
 * Parses like ECMAScript `parseInt`: leading whitespace and an optional sign are skipped,
 * the longest prefix of digits of the radix is parsed, and NaN is returned if there is none.
 * A radix of 0 means 10, or 16 for a `0x` prefix.
 */
internal fun String.toIntOrNaN(radix: Double): Double {
    var r = radix.toInt()
    var i = 0
    while (i < this.length && isEcmaScriptWhiteSpace(this[i])) {
        i++
    }

    var sign = 1.0
    if (i < this.length && (this[i] == '+' || this[i] == '-')) {
        if (this[i] == '-') {
            sign = -1.0
        }
        i++
    }

    var stripPrefix = true
    if (r != 0) {
        if (r < 2 || r > 36) {
            return Double.NaN
        }
        stripPrefix = r == 16
    } else {
        r = 10
    }

    if (stripPrefix && i + 1 < this.length && this[i] == '0' && (this[i + 1] == 'x' || this[i + 1] == 'X')) {
        i += 2
        r = 16
    }

    val start = i
    var value = 0.0
    while (i < this.length) {
        val digit = asciiDigitValue(this[i])
        if (digit >= r) {
            break
        }
        value = value * r + digit
        i++
    }

    if (i == start) {
        return Double.NaN
    }

    // beyond 2^53 only the decimal conversion rounds like ECMAScript
    if (r == 10 && i - start > 15) {
        value = this.substring(start, i).toDouble()
    }

    return sign * value
}

private fun asciiDigitValue(c: Char): Int {
    return when (c) {
        in '0'..'9' -> c - '0'
        in 'a'..'z' -> c - 'a' + 10
        in 'A'..'Z' -> c - 'A' + 10
        else -> Int.MAX_VALUE
    }
}

private fun isEcmaScriptWhiteSpace(c: Char): Boolean {
    return when (c) {
        '\t', '\n', '\u000B', '\u000C', '\r', '\u2028', '\u2029', '\uFEFF' -> true
        else -> Character.getType(c) == Character.SPACE_SEPARATOR.toInt()
    }
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

internal inline fun Throwable.cause(): Throwable? {
    return this.cause
}

internal inline fun Throwable.stack(): String {
    return this.stackTraceToString()
}
