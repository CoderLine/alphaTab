package alphaTab.core.ecmaScript

import android.os.Build
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

    fun replace(s: String, replacement: (match: String, group1: String) -> String): String {
        val matcher = _regex.matcher(s);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            return if (_global)
                matcher.replaceAll {
                    replacement(it.group(), it.group(1))
                }
            else
                matcher.replaceFirst {
                    replacement(it.group(), it.group(1))
                }
        } else {
            // custom implementation for older android versions
            if(!matcher.find()){
                return s;
            }

            val sb = StringBuilder()

            var appendPos = 0
            if(_global) {

                do {
                    sb.append(s, appendPos, matcher.start())
                    sb.append(replacement(matcher.group(), matcher.group(1)!!))
                    appendPos = matcher.end()
                } while (matcher.find())

                sb.append(s, appendPos, s.length)
            } else {
                sb.append(s, appendPos, matcher.start())
                sb.append(replacement(matcher.group(), matcher.group(1)!!))
                sb.append(s, matcher.end(), s.length)
            }

            return sb.toString()
        }
    }
}
