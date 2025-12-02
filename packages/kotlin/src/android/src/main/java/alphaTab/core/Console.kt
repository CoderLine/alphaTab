package alphaTab.core

internal open class Console {
    public open fun debug(format: String, vararg details: Any?) {
        val message = if (details.isNotEmpty()) "$format,${details.joinToString(",")}" else format
        println("[AlphaTab Debug] $message")
    }

    public open fun warn(format: String, vararg details: Any?) {
        val message = if (details.isNotEmpty()) "$format,${details.joinToString(",")}" else format
        println("[AlphaTab Warn] $message")
    }

    public open fun info(format: String, vararg details: Any?) {
        val message = if (details.isNotEmpty()) "$format,${details.joinToString(",")}" else format
        println("[AlphaTab Info] $message")
    }

    public open fun error(format: String, vararg details: Any?) {
        val message = if (details.isNotEmpty()) "$format,${details.joinToString(",")}" else format
        println("[AlphaTab Error] $message")
    }
}
