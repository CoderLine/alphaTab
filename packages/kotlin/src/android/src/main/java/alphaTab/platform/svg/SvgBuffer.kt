package alphaTab.platform.svg

internal class SvgBuffer {
    private val _value: StringBuilder = StringBuilder()

    public fun reset(initial: String) {
        _value.setLength(0)
        _value.append(initial)
    }

    public fun append(value: String) {
        _value.append(value)
    }

    public fun build(): String {
        return _value.toString()
    }
}
