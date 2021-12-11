package alphaTab.collections

import org.eclipse.collections.api.DoubleIterable

class EclipseDoubleIterable(private val iterable: DoubleIterable) : IDoubleIterable {
    override fun iterator(): DoubleIterator {
        return EclipseDoubleIterator(iterable.doubleIterator())
    }
}

class EclipseDoubleIterator(private val iterator: org.eclipse.collections.api.iterator.DoubleIterator) :
    DoubleIterator() {
    override fun hasNext(): Boolean {
        return iterator.hasNext()
    }

    override fun nextDouble(): Double {
        return iterator.next()
    }
}
