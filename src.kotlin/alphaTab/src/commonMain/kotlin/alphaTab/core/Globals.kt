package alphaTab.core

fun String.substr(startIndex:Double, length:Double): String {
    return this.substring(startIndex.toInt(), (startIndex + length).toInt());
}
fun String.substr(startIndex:Double): String {
    return this.substring(startIndex.toInt());
}

fun <T> MutableList<T>.splice(start: Double, deleteCount: Double, vararg newItems:T) {
    if(deleteCount > 0) {
        this.removeAll(this.subList(start.toInt(), (start + deleteCount).toInt()))
    }
    this.addAll(start.toInt(), newItems.asList());
}

fun <T> MutableList<T>.pop(): T {
    return this.removeLast();
}

fun <T> List<T>.indexOfInDouble(item:T): Double {
    return this.indexOf(item).toDouble();
}
fun <T> Iterable<T>.join(separator:String): String {
    return this.joinToString(separator);
}
operator fun Double.plus(str:String): String {
    return this.toString() + str;
}
fun String.charAt(index:Double): String {
    return this.substring(index.toInt(), 1);
}
fun String.split(delimiter:String): MutableList<String> {
    return this.split(delimiters = arrayOf(delimiter), false, 0).toMutableList();
}
fun String.substring(startIndex:Double, endIndex:Double): String {
    return this.substring(startIndex.toInt(), endIndex.toInt());
}
fun Any.toDouble(): Double {
    if(this is Double) {
        return this;
    }
    return this.toString().toDouble();
}

class Console {
    public open fun debug( format:String, vararg details:Any?)
    {
        var message = details != null ? string.Format(format, details) : format;
        println(message, "AlphaTab Debug");
    }

    public open fun warn(string format, object?[]? details)
    {
        var message = details != null ? string.Format(format, details) : format;
        Trace.Write(message, "AlphaTab Warn");
    }

    public open fun info(string format, object?[]? details)
    {
        var message = details != null ? string.Format(format, details) : format;
        Trace.Write(message, "AlphaTab Info");
    }

    public open fun error(string format, object?[]? details)
    {
        var message = details != null ? string.Format(format, details) : format;
        Trace.Write(message, "AlphaTab Error");
    }
}

class Globals {
    companion object {
        val console = Console();

        fun parseFloat(s:String): Double {
            return 0.0
        }
    }
}
