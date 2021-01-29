package alphaTab.core

class Lazy<T : Any?> {
    private val _factory: () -> T
    private var _created:Boolean = false;
    private var _value:T;

    public constructor(factory:() -> T) {
        this._factory = factory;
    }

    public val value:T
        get() {
            if(!_created) {
                _value = _factory()
            }
            return _value;
        }
}
