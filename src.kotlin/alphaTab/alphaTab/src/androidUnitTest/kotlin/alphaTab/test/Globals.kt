package alphaTab.test

import kotlin.reflect.KClass

public class Globals {
    companion object {
        public fun <T> expect(actual: T): Expector<T> {
            return Expector(actual)
        }

        public fun expect(actual: () -> Unit): Expector<() -> Unit> {
            return Expector(actual)
        }

        public fun fail(message: Any?) {
            kotlin.test.fail(message.toString())
        }
    }
}

public class Expector<T> {
    private val _actual: T
    private var _message: String = ""

    public constructor(actual: T) {
        _actual = actual
    }

    public fun withContext(message: String): Expector<T> {
        _message = message
        return this
    }

    public fun toEqual(expected: Any?, message: String? = null) {
        var exp = expected
        if (exp is Int && _actual is Double) {
            exp = exp.toDouble()
        }
        kotlin.test.assertEquals(exp, _actual, _message + message)
    }

    public fun toBeCloseTo(expected: Double, message: String? = null) {
        if(_actual is Number) {
            kotlin.test.assertEquals(expected, _actual.toDouble(), 0.001, _message + message)
        } else {
            kotlin.test.fail("ToBeCloseTo can only be used with numeric operands")
        }
    }

    public fun toBe(expected: Any?) {
        var exp = expected
        if(exp is Int && _actual is Double) {
            exp = exp.toDouble()
        }
        kotlin.test.assertEquals(exp, _actual, _message)
    }

    public fun toBeTruthy() {
        kotlin.test.assertNotNull(_actual, _message)
    }

    public fun toBeTrue() {
        if(_actual is Boolean) {
            kotlin.test.assertTrue(_actual, _message)
        } else {
            kotlin.test.fail("ToBeTrue can only be used on bools: $_message")
        }
    }

    public fun toBeFalsy() {
        val actual = _actual;
        if(actual is String){
            kotlin.test.assertTrue(actual.isEmpty(), _message)
        } else {
            kotlin.test.assertNull(_actual, _message)
        }
    }

    public fun toThrowError(expected: KClass<out Exception>) {
        val actual = _actual
        if (actual is Function0<*>) {
            try {
                actual()
                kotlin.test.fail("Did not throw error: $_message")
            } catch (e: Exception) {
                if (expected::class.isInstance(e::class)) { // bad
                    return
                }
            }
            kotlin.test.fail("Exception type didn't match: $_message")
        }
        kotlin.test.fail("toThrowError can only be used with an exception: $_message")
    }
}
