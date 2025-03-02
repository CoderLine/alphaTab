package alphaTab.core.ecmaScript

import kotlinx.coroutines.cancelChildren
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.selects.select

internal class Promise {
    companion object {
        suspend fun <T> race(promises: alphaTab.collections.List<kotlinx.coroutines.Deferred<T>>) {
            return coroutineScope {
                select {
                    for(p in promises) {
                        p.onAwait { it }
                    }
                }.also { coroutineContext.cancelChildren() }
            }
        }
    }
}
