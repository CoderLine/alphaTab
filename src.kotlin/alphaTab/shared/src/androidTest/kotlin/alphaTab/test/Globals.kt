package alphaTab.test

import org.junit.Assert

public class Globals {
    companion object {
        public fun <T> expect(actual: T): Expector<T> {
            return Expector(actual)
        }

        public fun fail(message: Any?) {
            Assert.fail(message.toString())
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
        Assert.assertEquals(_message + message, exp, _actual)
    }

    public fun toBeCloseTo(expected:Double, message:String? = null) {
        if(_actual is Number) {
            Assert.assertEquals(_message + message, expected, _actual.toDouble(), 0.001)
        } else {
            Assert.fail("ToBeCloseTo can only be used with numeric operands")
        }
    }

    public fun toBe(expected:Any?) {
        var exp = expected
        if(exp is Int && _actual is Double) {
            exp = exp.toDouble()
        }
        Assert.assertEquals(_message, exp, _actual)
    }

    public fun toBeTruthy() {
        Assert.assertNotNull(_message, _actual)
    }

    public fun toBeTrue() {
        if(_actual is Boolean) {
            Assert.assertTrue(_message, _actual)
        } else {
            Assert.fail("ToBeTrue can only be used on bools: $_message")
        }
    }

    public fun toBeFalsy() {
        Assert.assertNull(_message, _actual)
    }
}
