package alphaTab.core.ecmaScript

import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.async
import kotlinx.coroutines.cancelChildren
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.selects.select

internal class Promise {
    companion object {
        fun <T> race(promises: alphaTab.collections.List<kotlinx.coroutines.Deferred<T>>): kotlinx.coroutines.Deferred<T> {
            @Suppress("OPT_IN_USAGE")
            return GlobalScope.async {
                coroutineScope {
                    select {
                        for (p in promises) {
                            p.onAwait { it }
                        }
                    }.also { coroutineContext.cancelChildren() }
                }
            }
        }
    }
}
