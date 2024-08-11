package alphaTab.core

import org.junit.Assert
import kotlin.reflect.KClass

typealias Test = org.junit.Test

class assert {
    companion object {
        fun fail(message: Any?) {
            Assert.fail(message?.toString())
        }
    }
}

class NotExpector<T>(private val actual: T) {
    val be
        get() = this

    fun ok() {
        when (actual) {
            is Int -> {
                Assert.assertEquals(0, actual)
            }

            is Double -> {
                Assert.assertEquals(0.0, actual, 0.0)
            }

            is String -> {
                Assert.assertEquals("", actual)
            }

            else -> {
                Assert.assertNull(actual)
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

        Assert.assertEquals(message, expectedTyped, actual as Any?)
    }

    fun closeTo(expected: Double, delta: Double, message: String? = null) {
        if (actual is Number) {
            Assert.assertEquals(message, expected, actual.toDouble(), delta)
        } else {
            Assert.fail("toBeCloseTo can only be used with numeric operands");
        }
    }

    fun ok() {
        Assert.assertNotNull(actual)
        when (actual) {
            is Int -> {
                Assert.assertNotEquals(0, actual)
            }

            is Double -> {
                Assert.assertNotEquals(0.0, actual)
            }

            is String -> {
                Assert.assertNotEquals("", actual)
            }
        }
    }

    fun `true`() {
        if (actual is Boolean) {
            Assert.assertTrue(actual);
        } else {
            Assert.fail("toBeTrue can only be used on booleans:");
        }
    }

    fun `false`() {
        if (actual is Boolean) {
            Assert.assertFalse(actual);
        } else {
            Assert.fail("toBeFalse can only be used on booleans:");
        }
    }


    fun `throw`(expected: KClass<out Throwable>) {
        val actual = actual
        if (actual is Function0<*>) {
            try {
                actual()
                Assert.fail("Did not throw error " + expected.qualifiedName);
            } catch (e: Throwable) {
                if (expected::class.isInstance(e::class)) {
                    return;
                }
            }

            Assert.fail("Exception type didn't match");
        } else {
            Assert.fail("ToThrowError can only be used with an exception");
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
            Assert.fail(message.toString())
        }
    }
}
