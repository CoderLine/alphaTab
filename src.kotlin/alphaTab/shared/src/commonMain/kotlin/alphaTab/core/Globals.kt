package alphaTab.core

import alphaTab.core.ecmaScript.RegExp

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

fun String.splitBy(separator:String): alphaTab.collections.List<String> {
    TODO("")
}

fun String.replace(pattern: RegExp, replacement: String): String {
    return pattern.replace(this, replacement)
}

fun Iterable<Char>.toCharArray(): CharArray {
    return this.toList().toCharArray()
}

fun String.indexOfInDouble(item: String): Double {
    return this.indexOf(item).toDouble()
}

fun Double.toInvariantString(base: Double): String {
    return this.toInt().toString(base.toInt())
}

expect fun Double.toInvariantString(): String
fun IAlphaTabEnum.toInvariantString(): String {
    return this.toString()
}

fun String.lastIndexOfInDouble(item: String): Double {
    return this.lastIndexOf(item).toDouble()
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

fun String.split(delimiter: String): alphaTab.collections.List<String> {
    @Suppress("CHANGING_ARGUMENTS_EXECUTION_ORDER_FOR_NAMED_VARARGS")
    return alphaTab.collections.List(this.split(delimiters = arrayOf(delimiter), ignoreCase = false, limit = 0))
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
