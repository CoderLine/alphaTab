package alphaTab.core

import alphaTab.core.ecmaScript.RegExp
import system.globalization.CultureInfo

expect class LateInitList<T> : MutableList<T> {
    public constructor(size:Int)
}

@kotlin.ExperimentalUnsignedTypes
expect fun UByteArray.decodeToFloatArray(): FloatArray

@kotlin.ExperimentalUnsignedTypes
expect fun UByteArray.decodeToDoubleArray(): DoubleArray

@kotlin.ExperimentalUnsignedTypes
expect fun UByteArray.decodeToString(encoding: String): String

fun String.substr(startIndex: Double, length: Double): String {
    return this.substring(startIndex.toInt(), (startIndex + length).toInt())
}

fun String.substr(startIndex: Double): String {
    return this.substring(startIndex.toInt())
}

fun String.replace(pattern: RegExp, replacement: String): String {
    return pattern.replace(this, replacement)
}

fun <T> MutableList<T>.sort(comparer: ((a: T, b: T) -> Double)) {
    this.sortWith { a, b -> comparer(a, b).toInt() }
}

fun <TIn, TOut> MutableList<TIn>.mapTo(transform: (v: TIn) -> TOut): MutableList<TOut> {
    return this.map(transform).toMutableList()
}

fun <T> MutableList<T>.filterBy(predicate: (T) -> Boolean): MutableList<T> {
    return this.filter(predicate).toMutableList()
}

fun <T> MutableList<T>.slice(): MutableList<T> {
    return this.toMutableList()
}

fun <T> MutableList<T>.slice(start: Double): MutableList<T> {
    return this.subList(start.toInt(), this.size)
}

fun <T> MutableList<T>.rev(): MutableList<T> {
    this.reverse()
    return this
}

fun <T> MutableList<T>.fillWith(value: T): MutableList<T> {
    this.fill(value)
    return this
}

fun <T> MutableList<T>.splice(start: Double, deleteCount: Double, vararg newItems: T) {
    if (deleteCount > 0) {
        this.removeAll(this.subList(start.toInt(), (start + deleteCount).toInt()))
    }
    this.addAll(start.toInt(), newItems.asList())
}

fun <T> MutableList<T>.pop(): T {
    return this.removeLast()
}

fun String.indexOfInDouble(item: String): Double {
    return this.indexOf(item).toDouble()
}

fun Double.toString(base: Double): String {
    return this.toInt().toString(base.toInt())
}

expect fun Double.toInvariantString(): String

fun Double.toString(cultureInfo: CultureInfo): String {
    if (cultureInfo.isInvariant) {
        return this.toInvariantString()
    } else {
        return this.toString()
    }
}

fun String.lastIndexOfInDouble(item: String): Double {
    return this.lastIndexOf(item).toDouble()
}

fun <T> List<T>.indexOfInDouble(item: T): Double {
    return this.indexOf(item).toDouble()
}

@kotlin.jvm.JvmName("joinDouble")
fun Iterable<Double>.join(separator: String): String {
    return this.map { it.toInvariantString() }.join(separator)
}

fun <T> Iterable<T>.join(separator: String): String {
    return this.joinToString(separator)
}

operator fun Double.plus(str: String): String {
    return this.toString() + str
}

fun String.charAt(index: Double): String {
    return this.substring(index.toInt(), index.toInt() + 1)
}

fun String.charCodeAt(index: Int): Double {
    return this[index].code.toDouble()
}

fun String.charCodeAt(index: Double): Double {
    return this[index.toInt()].code.toDouble()
}

fun String.split(delimiter: String): MutableList<String> {
    @Suppress("CHANGING_ARGUMENTS_EXECUTION_ORDER_FOR_NAMED_VARARGS")
    return this.split(delimiters = arrayOf(delimiter), ignoreCase = false, limit = 0)
        .toMutableList()
}

fun String.substring(startIndex: Double, endIndex: Double): String {
    return this.substring(startIndex.toInt(), endIndex.toInt())
}

fun String.substring(startIndex: Double): String {
    return this.substring(startIndex.toInt())
}

operator fun Int.rangeTo(d: Double): IntRange {
    return this.rangeTo(d.toInt())
}

//fun Any?.toDouble(): Double {
//    if (this is Double) {
//        return this
//    }
//    return this.toString().toDouble()
//}
fun IAlphaTabEnum.toDouble(): Double {
    return this.value.toDouble()
}
fun IAlphaTabEnum?.toDouble(): Double? {
    return this?.value.toDouble()
}
fun Any?.toDouble(): Double {
    if(this is Double) {
        return this
    }
    if(this == null) {
        throw ClassCastException("Cannot cast null to double")
    }
    throw ClassCastException("Cannot cast ${this::class.simpleName} to double")
}
fun Int?.toDouble(): Double? {
    return this?.toDouble()
}

expect fun String.toDoubleOrNaN(): Double;
expect fun String.toIntOrNaN(): Double;

class Globals {
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
            if (radix.toInt() == 16) {
                return s.toIntOrNaN()
            }
            return Double.NaN
        }
    }
}
