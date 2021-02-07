package alphaTab.core

import alphaTab.core.ecmaScript.RegExp
import system.globalization.CultureInfo

expect fun UByteArray.decodeToFloatArray(): FloatArray
expect fun UByteArray.decodeToDoubleArray(): DoubleArray
expect fun UByteArray.decodeToString(encoding: String): String

public class DoubleRange(start: Double, endInclusive: Double) : Iterable<Double> {
    private val _start = start;
    private val _endInclusive = endInclusive;

    override fun iterator(): Iterator<Double> =
        generateSequence(_start, { _start + 1 })
            .takeWhile { it <= _endInclusive }
            .iterator()

    companion object {
        public val EMPTY: DoubleRange = DoubleRange(1.0, 0.0)
    }
}

public class ReverseDoubleRange(start: Double, endInclusive: Double) : Iterable<Double> {
    private val _start = start;
    private val _endInclusive = endInclusive;

    override fun iterator(): Iterator<Double> =
        generateSequence(_start, { _start - 1 })
            .takeWhile { it >= _endInclusive }
            .iterator()

    companion object {
        public val EMPTY: ReverseDoubleRange = ReverseDoubleRange(0.0, 1.0)
    }
}

public infix fun Int.until(to: Double): DoubleRange {
    return DoubleRange(this.toDouble(), (to - 1.0))
}

public infix fun Double.until(to: Double): DoubleRange {
    return DoubleRange(this, (to - 1.0))
}

public infix fun Double.until(to: Int): DoubleRange {
    return DoubleRange(this, (to - 1.0))
}

public infix fun Double.downTo(to: Double): ReverseDoubleRange {
    return ReverseDoubleRange(this.toDouble(), to)
}

public infix fun Double.downTo(to: Int): ReverseDoubleRange {
    return ReverseDoubleRange(this.toDouble(), to.toDouble())
}

public infix fun Int.downTo(to: Double): ReverseDoubleRange {
    return ReverseDoubleRange(this.toDouble(), to)
}


fun kotlin.String.substr(startIndex: Double, length: Double): kotlin.String {
    return this.substring(startIndex.toInt(), (startIndex + length).toInt());
}

fun kotlin.String.substr(startIndex: Double): kotlin.String {
    return this.substring(startIndex.toInt());
}

fun kotlin.String.replace(pattern:RegExp, replacement:String): kotlin.String {
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
    return this.subList(start.toInt(), this.size - 1)
}

fun <T> MutableList<T>.rev(): MutableList<T> {
    this.reverse()
    return this;
}

fun <T> MutableList<T>.fillWith(value: T): MutableList<T> {
    this.fill(value)
    return this
}

fun <T> MutableList<T>.splice(start: Double, deleteCount: Double, vararg newItems: T) {
    if (deleteCount > 0) {
        this.removeAll(this.subList(start.toInt(), (start + deleteCount).toInt()))
    }
    this.addAll(start.toInt(), newItems.asList());
}

fun <T> MutableList<T>.pop(): T {
    return this.removeLast();
}

fun kotlin.String.indexOfInDouble(item: kotlin.String): Double {
    return this.indexOf(item).toDouble();
}

fun Double.toString(base: Double): kotlin.String {
    return this.toInt().toString(base.toInt());
}

fun Double.toString(cultureInfo: CultureInfo): kotlin.String {
// TODO
    return this.toString()
}


fun kotlin.String.lastIndexOfInDouble(item: kotlin.String): Double {
    return this.lastIndexOf(item).toDouble();
}

fun <T> List<T>.indexOfInDouble(item: T): Double {
    return this.indexOf(item).toDouble();
}

fun <T> Iterable<T>.join(separator: kotlin.String): kotlin.String {
    return this.joinToString(separator);
}

operator fun Double.plus(str: kotlin.String): kotlin.String {
    return this.toString() + str;
}

fun kotlin.String.charAt(index: Double): kotlin.String {
    return this.substring(index.toInt(), 1);
}

fun kotlin.String.charAt(index: Int): kotlin.String {
    return this.substring(index, 1);
}

fun kotlin.String.charCodeAt(index: Int): Double {
    return this[index].toDouble()
}

fun kotlin.String.charCodeAt(index: Double): Double {
    return this[index.toInt()].toDouble()
}

fun kotlin.String.split(delimiter: kotlin.String): MutableList<kotlin.String> {
    return this.split(delimiters = arrayOf(delimiter), false, 0).toMutableList();
}

fun kotlin.String.substring(startIndex: Double, endIndex: Double): kotlin.String {
    return this.substring(startIndex.toInt(), endIndex.toInt());
}

fun kotlin.String.substring(startIndex: Double): kotlin.String {
    return this.substring(startIndex.toInt());
}

operator fun Int.rangeTo(d: Double): IntRange {
    return this.rangeTo(d.toInt())
}

fun Any?.toDouble(): Double {
    if (this is Double) {
        return this;
    }
    return this.toString().toDouble();
}

class Console {
    public open fun debug(format: kotlin.String, vararg details: Any?) {
    }

    public open fun warn(format: kotlin.String, vararg details: Any?) {
    }

    public open fun info(format: kotlin.String, vararg details: Any?) {
    }

    public open fun error(format: kotlin.String, vararg details: Any?) {
    }
}

class Globals {
    companion object {
        const val NaN: Double = Double.NaN;
        val console = Console();

        fun isNaN(s: Double): Boolean {
            return s.isNaN()
        }

        fun parseFloat(s: String): Double {
            return 0.0
        }

        fun parseInt(s: String): Double {
            return 0.0
        }

        fun parseInt(s: String, radix: Double): Double {
            return 0.0
        }
    }
}
