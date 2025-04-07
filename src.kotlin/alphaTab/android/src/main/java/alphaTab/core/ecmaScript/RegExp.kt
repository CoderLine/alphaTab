package alphaTab.core.ecmaScript

import android.annotation.SuppressLint
import android.os.Build
import java.util.regex.Matcher
import java.util.regex.Pattern

private data class RegExpCacheEntry(val pattern: String, val flags: String)

private val RegexpCache = HashMap<RegExpCacheEntry, RegExp>()

internal class RegExp {
    private var _regex: Pattern
    private var _global: Boolean

    public constructor(regex: String, flags: String = "") {
        val cache = RegexpCache.getOrPut(RegExpCacheEntry(regex, flags), {
            var options = 0
            for (c in flags) {
                when (c) {
                    'i' -> {
                        options = options or Pattern.CASE_INSENSITIVE
                    }

                    'g' -> {
                        _global = true
                    }

                    'm' -> {
                        options = options or Pattern.MULTILINE
                    }
                }
            }
            _regex = Pattern.compile(regex, options)
            this
        })

        _regex = cache._regex
        _global = cache._global
    }

    public fun exec(s: String): Boolean {
        return _regex.matcher(s).matches()
    }

    public fun replace(s: String, replacement: String): String {
        return if (_global)
            _regex.matcher(s).replaceAll(replacement)
        else
            _regex.matcher(s).replaceFirst(replacement)
    }

    @SuppressLint("NewApi")
    public fun replace(s: String, replacement: (match: String, group1: String) -> String): String {
        return if (_global)
            _regex.matcher(s).replaceAll({
                replacement(it.group(), it.group(1))
            })
        else
            _regex.matcher(s).replaceFirst {
                replacement(it.group(), it.group(1))
            }
    }
}
