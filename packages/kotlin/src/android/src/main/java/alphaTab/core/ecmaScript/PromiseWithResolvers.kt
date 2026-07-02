package alphaTab.core.ecmaScript

import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.Deferred

class PromiseWithResolvers<T> {
    private val _deferred = CompletableDeferred<T>()

    public val promise: Deferred<T>
        get() = _deferred

    fun resolve(v: T) {
        _deferred.complete(v)
    }

    fun reject(e: Error) {
        _deferred.completeExceptionally(e)
    }
}
