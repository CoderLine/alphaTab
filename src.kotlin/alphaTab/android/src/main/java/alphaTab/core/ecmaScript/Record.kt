package alphaTab.core.ecmaScript

import alphaTab.core.ArrayTuple

public class Record<TKey, TValue> : alphaTab.collections.Map<TKey, TValue> {
    constructor() : super()
    constructor(vararg elements: ArrayTuple<TKey, TValue>) : super(elements.asIterable())
}
