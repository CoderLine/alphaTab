package alphaTab.core

import alphaTab.core.ecmaScript.RegExp
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.async
import kotlin.contracts.ExperimentalContracts
import kotlin.contracts.contract

internal class TypeHelper {
    companion object {
        public fun createRegex(pattern: String, flags: String): RegExp {
            return RegExp(pattern, flags)
        }

        @ExperimentalContracts
        public fun isTruthy(s: String?): Boolean {
            contract { returns(true) implies (s != null) }
            return s != null && s.isNotEmpty()
        }

        public fun isTruthy(b: Boolean?): Boolean {
            return b != null && b
        }

        @ExperimentalContracts
        public fun isTruthy(s: Any?): Boolean {
            contract { returns(true) implies (s != null) }
            return s != null
        }

        @ExperimentalUnsignedTypes
        public fun typeOf(s: Any?): String {
            return when (s) {
                is String -> "string"
                is Boolean -> "boolean"
                is Byte,
                is Short,
                is Int,
                is Long,
                is UByte,
                is UShort,
                is UInt,
                is ULong,
                is Float,
                is Double,
                is IAlphaTabEnum -> "number"

                null -> "undefined"
                else -> "object"
            }
        }

        @Suppress("NOTHING_TO_INLINE")
        public inline fun <T> setInitializer(vararg values: T): Iterable<T> {
            return values.asIterable()
        }

        @Suppress("NOTHING_TO_INLINE")
        public inline fun <T> mapInitializer(vararg values: T): Iterable<T> {
            return values.asIterable();
        }

        public fun <T> suspendToDeferred(block: suspend CoroutineScope.() -> T): kotlinx.coroutines.Deferred<T> {
            return GlobalScope.async {
                block()
            }
        }

        @JvmName("createPromiseWithValue")
        public fun <T> createPromise(action: (resolve: (T) -> Unit, reject: (Any) -> Unit) -> Unit): kotlinx.coroutines.Deferred<T> {
            val d = CompletableDeferred<T>()
            GlobalScope.async {
                action(
                    { d.complete(it) },
                    {
                        when (it) {
                            is alphaTab.core.ecmaScript.Error -> {
                                d.completeExceptionally(it)
                            }

                            is Throwable -> {
                                d.completeExceptionally(alphaTab.core.ecmaScript.Error(it.message, it))
                            }

                            else -> {
                                d.completeExceptionally(alphaTab.core.ecmaScript.Error("Promise rejected with: $it"))
                            }
                        }
                    }
                )
            }
            return d
        }

        public fun createPromise(action: (resolve: () -> Unit, reject: (Any) -> Unit) -> Unit): kotlinx.coroutines.Deferred<Unit> {
            val d = CompletableDeferred<Unit>()
            GlobalScope.async {
                action(
                    { d.complete(Unit) },
                    {
                        when (it) {
                            is alphaTab.core.ecmaScript.Error -> {
                                d.completeExceptionally(it)
                            }

                            is Throwable -> {
                                d.completeExceptionally(alphaTab.core.ecmaScript.Error(it.message, it))
                            }

                            else -> {
                                d.completeExceptionally(alphaTab.core.ecmaScript.Error("Promise rejected with: $it"))
                            }
                        }
                    }
                )
            }
            return d
        }
    }
}
