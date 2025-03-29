package alphaTab.core

import org.junit.Assert
import kotlin.reflect.KClass

annotation class TestName(val name: String)
annotation class SnapshotFile(val path: String)

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
    fun not() = NotExpector(actual)

    val be
        get() = this
    val have
        get() = this

    fun equal(expected: Any?, message: String? = null) {
        var actualToCheck = actual
        var expectedTyped: Any? = expected

        if (expected is Int && actualToCheck is Double) {
            expectedTyped = expected.toDouble();
        }

        if (expected is Double && actualToCheck is Int) {
            expectedTyped = expected.toInt();
        }

        if(expected is Double && expected == 0.0 &&
            actualToCheck is Double) {
            val d = actualToCheck as Double;
            if (d == -0.0) {
                @Suppress("UNCHECKED_CAST")
                actualToCheck = 0.0 as T
            }
        }

        Assert.assertEquals(message, expectedTyped, actualToCheck as Any?)
    }


    fun lessThan(expected: Double) {
        if (actual is Number) {
            Assert.assertTrue("Expected $actual to be less than $expected", actual.toDouble() < expected)
        } else {
            Assert.fail("lessThan can only be used with numeric operands");
        }
    }


    fun greaterThan(expected: Double) {
        if (actual is Number) {
            Assert.assertTrue("Expected $actual to be greater than $expected", actual.toDouble() > expected)
        } else {
            Assert.fail("greaterThan can only be used with numeric operands");
        }
    }
    fun closeTo(expected: Double, delta: Double, message: String? = null) {
        if (actual is Number) {
            Assert.assertEquals(message, expected, actual.toDouble(), delta)
        } else {
            Assert.fail("toBeCloseTo can only be used with numeric operands");
        }
    }

    fun length(expected:Double) {
        if(actual is alphaTab.collections.List<*>) {
            Assert.assertEquals(expected.toInt(), actual.length.toInt())
        } else if(actual is alphaTab.collections.DoubleList) {
            Assert.assertEquals(expected.toInt(), actual.length.toInt())
        } else if(actual is alphaTab.collections.BooleanList) {
            Assert.assertEquals(expected.toInt(), actual.length.toInt())
        } else {
            Assert.fail("length can only be used with collection operands");
        }
    }

    fun contain(value: Any) {
        if(actual is Iterable<*>) {
            Assert.assertTrue("Expected collection ${actual.joinToString(",")} to contain $value", actual.contains(value))
        } else {
            Assert.fail("contain can only be used with Iterable operands");
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

    private fun findTestMethod(): Method {
        val walker = StackWalker.getInstance(StackWalker.Option.RETAIN_CLASS_REFERENCE)
        var testMethod:Method? = null
        walker.forEach { frame ->
            if(testMethod == null) {
                val method = frame.declaringClass.getDeclaredMethod(
                    frame.methodName,
                    *frame.methodType.parameterArray()
                )

                if(method.getAnnotation(Test::class.java) != null) {
                    testMethod = method
                }
            }
        }

        if (testMethod == null) {
            Assert.fail("No information about current test available, cannot find test snapshot");
        }

        return testMethod!!
    }

    @ExperimentalUnsignedTypes
    @ExperimentalContracts
    fun toMatchSnapshot() {
        val testMethodInfo = findTestMethod()
        val file = testMethodInfo.getAnnotation(SnapshotFile::class.java)?.path
        if (file.isNullOrEmpty()) {
            Assert.fail("Missing SnapshotFile annotation with path to .snap file")
        }

        val absoluteSnapFilePath = Paths.get(
            TestPlatformPartials.projectRoot,
            file
        ).toAbsolutePath();
        if (!absoluteSnapFilePath.toFile().exists()) {
            Assert.fail("Could not find snapshot file at $absoluteSnapFilePath")
        }

        val snapshotFile = SnapshotFileRepository.loadSnapshortFile(absoluteSnapFilePath.toString())

        val testSuiteName = testMethodInfo.declaringClass.simpleName
        val testName = testMethodInfo.getAnnotation(TestName::class.java)!!.name

        val fullTestName = "$testSuiteName $testName "

        val counter = (TestGlobals.snapshotAssertionCounters.get(fullTestName) ?: 0.0) + 1
        TestGlobals.snapshotAssertionCounters.set(fullTestName, counter)

        val snapshotName = "$fullTestName${counter.toInt()}"

        val error = snapshotFile.match(snapshotName, actual)
        if (!error.isNullOrEmpty()) {
            Assert.fail(error)
        }
    }
}

class TestGlobals {
    @ExperimentalUnsignedTypes
    @ExperimentalContracts
    companion object {
        val snapshotAssertionCounters: ObjectDoubleMap<String> = ObjectDoubleMap()

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
