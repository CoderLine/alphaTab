package alphaTab.util

internal object UninitializedValue

internal class Lazy<T : Any?>(factory: () -> T) {
    private val _factory: () -> T = factory
    private var _value:Any? = UninitializedValue

    public val value:T
        get() {
            if(_value == UninitializedValue) {
                _value = _factory()
            }
            @Suppress("UNCHECKED_CAST")
            return _value as T
        }
}
