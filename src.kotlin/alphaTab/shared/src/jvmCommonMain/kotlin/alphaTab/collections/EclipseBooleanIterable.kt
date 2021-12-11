package alphaTab.collections

import org.eclipse.collections.api.BooleanIterable

class EclipseBooleanIterable(private val iterable: BooleanIterable) : IBooleanIterable {
    override fun iterator(): BooleanIterator {
        return EclipseBooleanIterator(iterable.booleanIterator())
    }
}

class EclipseBooleanIterator(private val iterator: org.eclipse.collections.api.iterator.BooleanIterator) :
    BooleanIterator() {
    override fun hasNext(): Boolean {
        return iterator.hasNext()
    }

    override fun nextBoolean(): Boolean {
        return iterator.next()
    }
}
