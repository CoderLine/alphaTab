package alphaTab.model

import alphaTab.collections.DoubleList
import kotlin.contracts.ExperimentalContracts

@ExperimentalUnsignedTypes
@ExperimentalContracts
class ComparisonHelpersPartials {
    companion object {
         fun compareObjects(expected: Any?, actual: Any?, path: String, ignoreKeys: alphaTab.collections.List<String>?): Boolean {
            if (actual is DoubleList && expected is DoubleList) {
                if (actual.length != expected.length) {
                    kotlin.test.fail("""Double Array Length mismatch on hierarchy: ${path}, ${actual.length} != ${expected.length}""")
                    return false
                } else {
                    var i = 0
                    while (i < actual.length) {
                        try {
                            if (alphaTab.core.ecmaScript.Math.abs((actual[i]) - (expected[i])) >= 0.000001)
                            {
                                kotlin.test.fail("""Number mismatch on hierarchy: ${path}[${i}], '${actual}' != '${expected}'""")
                                return false
                            }
                        } finally {
                            i++
                        }
                    }
                }

                return true
            }

            val actualClass = if(actual != null) actual::class.qualifiedName else "unknown";
            val expectedClass = if(expected != null) expected::class.qualifiedName else "unknown";

            kotlin.test.fail("cannot compare unknown object types expected[${actualClass}] expected[${expectedClass}] on path $path")
            return false
        }
    }
}
