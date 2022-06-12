package alphaTab.core.ecmaScript

internal class Set<T> : Iterable<T> {
    private val _set: HashSet<T>

    public constructor() {
        _set = HashSet()
    }

    public constructor(values: Iterable<T>?) {
        _set = values?.toHashSet() ?: HashSet()
    }

    public fun add(item: T) {
        _set.add(item)
    }

    public fun has(item: T): Boolean {
        return _set.contains(item)
    }

    public fun delete(item: T) {
        _set.remove(item)
    }

    public fun forEach(action: (item: T) -> Unit) {
        for (i in _set) {
            action(i)
        }
    }

    override fun iterator(): Iterator<T> {
        return _set.iterator()
    }
}
