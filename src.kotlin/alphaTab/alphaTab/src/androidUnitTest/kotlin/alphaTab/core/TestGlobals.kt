package alphaTab.core

import kotlin.reflect.KClass

class assert {
    companion object {
        fun fail(message: Any?) {
            kotlin.test.fail(message?.toString())
        }
    }
}

class NotExpector<T>(private val actual: T) {
    val be
        get() = this

    fun ok() {
        when (actual) {
            is Int -> {
                kotlin.test.assertEquals(0, actual)
            }

            is Double -> {
                kotlin.test.assertEquals(0.0, actual)
            }

            is String -> {
                kotlin.test.assertEquals("", actual)
            }

            else -> {
                kotlin.test.assertNull(actual)
            }
        }
    }
}

class Expector<T>(private val actual: T) {
    val to
        get() = this
    val not
        get() = NotExpector<T>(actual)

    val be
        get() = this

    fun equal(expected: Any?, message: String? = null) {
        var expectedTyped: Any? = expected

        if (expected is Int && actual is Double) {
            expectedTyped = expected.toDouble();
        }

        if (expected is Double && actual is Int) {
            expectedTyped = expected.toInt();
        }

        kotlin.test.assertEquals(expectedTyped, actual as Any?, message)
    }

    fun closeTo(expected: Double, delta: Double, message: String? = null) {
        if (actual is Number) {
            kotlin.test.assertEquals(expected, actual.toDouble(), delta, message)
        } else {
            kotlin.test.fail("toBeCloseTo can only be used with numeric operands");
        }
    }

    //    fun toBe(expected: Any) {
//        var expectedTyped = expected
//        if (expected is Int && actual is Double) {
//            expectedTyped = expected.toDouble();
//        }
//        kotlin.test.assertEquals(expectedTyped, actual as Any?)
//    }
//
    fun ok() {
        kotlin.test.assertNotNull(actual)
        when (actual) {
            is Int -> {
                kotlin.test.assertNotEquals(0, actual)
            }

            is Double -> {
                kotlin.test.assertNotEquals(0.0, actual)
            }

            is String -> {
                kotlin.test.assertNotEquals("", actual)
            }
        }
    }

    fun `true`() {
        if (actual is Boolean) {
            kotlin.test.assertTrue(actual);
        } else {
            kotlin.test.fail("toBeTrue can only be used on booleans:");
        }
    }


    fun `throw`(expected: KClass<out Throwable>) {
        val actual = actual
        if (actual is Function0<*>) {
            try {
                actual()
                kotlin.test.fail("Did not throw error " + expected.qualifiedName);
            } catch (e: Throwable) {
                if (expected::class.isInstance(e::class)) {
                    return;
                }
            }

            kotlin.test.fail("Exception type didn't match");
        } else {
            kotlin.test.fail("ToThrowError can only be used with an exception");
        }
    }
}

class TestGlobals {
    companion object {
        fun <T> expect(actual: T): Expector<T> {
            return Expector(actual);
        }

        fun expect(actual: () -> Unit): Expector<() -> Unit> {
            return Expector(actual);
        }

        fun fail(message: Any?) {
            kotlin.test.fail(message.toString())
        }
    }
}
