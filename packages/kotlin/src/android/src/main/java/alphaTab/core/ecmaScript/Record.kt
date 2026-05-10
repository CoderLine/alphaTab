package alphaTab.core.ecmaScript

import alphaTab.core.IArrayTuple

public class Record<TKey, TValue> : alphaTab.collections.Map<TKey, TValue> {
    constructor() : super()
    constructor(vararg elements: IArrayTuple<TKey, TValue>) : super(elements.asIterable())
}
