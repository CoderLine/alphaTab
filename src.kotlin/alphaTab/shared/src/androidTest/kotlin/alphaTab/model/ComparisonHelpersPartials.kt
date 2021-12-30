package alphaTab.model

import alphaTab.collections.DoubleList
import alphaTab.test.Globals
import kotlin.contracts.ExperimentalContracts

@ExperimentalUnsignedTypes
@ExperimentalContracts
actual class ComparisonHelpersPartials {
    actual companion object {
        public actual fun compareObjects(expected: Any?, actual: Any?, path: String, ignoreKeys: alphaTab.collections.List<String>?): Boolean {
            if (actual is DoubleList && expected is DoubleList) {
                if (actual.length != expected.length) {
                    Globals.fail("""Double Array Length mismatch on hierarchy: ${path}, ${actual.length} != ${expected.length}""")
                    return false
                } else {
                    var i = 0
                    while (i < actual.length) {
                        try {
                            if (alphaTab.core.ecmaScript.Math.abs((actual[i]) - (expected[i])) >= 0.000001)
                            {
                                Globals.fail("""Number mismatch on hierarchy: ${path}[${i}], '${actual}' != '${expected}'""")
                                return false
                            }
                        } finally {
                            i++
                        }
                    }
                }

                return true
            }

            Globals.fail("cannot compare unknown object types expected[${actual?.javaClass?.packageName}.${actual?.javaClass?.name}] expected[${expected?.javaClass?.packageName}.${expected?.javaClass?.name}]');            }")
            return false
        }
    }
}
