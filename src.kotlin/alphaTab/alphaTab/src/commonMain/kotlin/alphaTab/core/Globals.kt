@file:Suppress("NOTHING_TO_INLINE")

package alphaTab.core

import alphaTab.collections.List
import alphaTab.core.ecmaScript.ArrayBuffer
import alphaTab.core.ecmaScript.RegExp
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Deferred
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.async
import kotlinx.coroutines.delay
import kotlin.coroutines.CoroutineContext
import kotlin.coroutines.EmptyCoroutineContext
import kotlin.coroutines.suspendCoroutine

@ExperimentalUnsignedTypes
internal expect fun UByteArray.decodeToFloatArray(): FloatArray

@ExperimentalUnsignedTypes
internal expect fun UByteArray.decodeToDoubleArray(): DoubleArray

@ExperimentalUnsignedTypes
internal expect fun UByteArray.decodeToString(encoding: String): String

internal fun <T : Comparable<T>> List<T>.sort() {
    this.sort { a, b ->
        a.compareTo(b).toDouble()
    }
}

internal fun String.substr(startIndex: Double, length: Double): String {
    return this.substring(startIndex.toInt(), (startIndex + length).toInt())
}

internal fun String.substr(startIndex: Double): String {
    return this.substring(startIndex.toInt())
}

internal fun String.splitBy(separator: String): List<String> {
    return List(this.split(separator))
}

internal fun String.replace(pattern: RegExp, replacement: String): String {
    return pattern.replace(this, replacement)
}

internal fun String.indexOfInDouble(item: String): Double {
    return this.indexOf(item).toDouble()
}

internal fun Double.toInvariantString(base: Double): String {
    return this.toInt().toString(base.toInt())
}

internal expect fun Double.toInvariantString(): String
internal fun IAlphaTabEnum.toInvariantString(): String {
    return this.toString()
}
internal expect fun Double.toFixed(decimals:Double): String

internal fun String.lastIndexOfInDouble(item: String): Double {
    return this.lastIndexOf(item).toDouble()
}

internal operator fun Double.plus(str: String): String {
    return this.toInvariantString() + str
}

internal fun String.charAt(index: Double): String {
    return this.substring(index.toInt(), index.toInt() + 1)
}

internal fun String.charCodeAt(index: Int): Double {
    return this[index].code.toDouble()
}

internal fun String.charCodeAt(index: Double): Double {
    return this[index.toInt()].code.toDouble()
}

internal fun String.split(delimiter: String): List<String> {
    @Suppress("CHANGING_ARGUMENTS_EXECUTION_ORDER_FOR_NAMED_VARARGS")
    return List(this.split(delimiters = arrayOf(delimiter), ignoreCase = false, limit = 0))
}

internal fun String.substring(startIndex: Double, endIndex: Double): String {
    return this.substring(startIndex.toInt(), endIndex.toInt())
}

internal operator fun String.get(index: Double): Char {
    return this[index.toInt()]
}

internal fun String.substring(startIndex: Double): String {
    return this.substring(startIndex.toInt())
}

internal fun String.replaceAll(before: String, after: String): String {
    return this.replace(before, after)
}

internal fun IAlphaTabEnum.toDouble(): Double {
    return this.value.toDouble()
}

internal fun IAlphaTabEnum?.toDouble(): Double? {
    return this?.value.toDouble()
}

internal inline fun Double.toTemplate(): String {
    return this.toInvariantString()
}

internal inline fun Any?.toTemplate(): Any? {
    return this
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

internal fun Int?.toDouble(): Double? {
    return this?.toDouble()
}

internal expect fun String.toDoubleOrNaN(): Double;
internal expect fun String.toIntOrNaN(): Double;
internal expect fun String.toIntOrNaN(radix: Double): Double;

internal class Globals {
    companion object {
        const val NaN: Double = Double.NaN
        val console = Console()

        public fun isNaN(s: Double): Boolean {
            return s.isNaN()
        }

        public fun parseFloat(s: String): Double {
            return s.toDoubleOrNaN()
        }

        fun parseInt(s: String): Double {
            return s.toIntOrNaN()
        }

        fun parseInt(s: String, radix: Double): Double {
            return s.toIntOrNaN(radix)
        }

        fun parseInt(s: Char): Double {
            return parseInt(s.toString())
        }

        fun parseInt(s: Char, radix: Double): Double {
            return parseInt(s.toString(), radix);
        }

        fun setImmediate(action: () -> Unit) {
            action()
        }

        fun setTimeout(action: () -> Unit, millis: Double): Deferred<Unit> {
            return GlobalScope.async {
                delay(millis.toLong())
                action()
            }
        }
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
            if (it is alphaTab.core.ecmaScript.Error) {
                callback(it)
            } else {
                callback(alphaTab.core.ecmaScript.Error(it.message, it))
            }
        }
    }
    return this
}

@OptIn(ExperimentalUnsignedTypes::class)
internal val ArrayBuffer.byteLength: Int
    get() = this.size
