package alphaTab.core

class TypeHelper {
    companion object {
    public fun isTruthy(s:String?): Boolean {
        return s != null && s.isNotEmpty();
    }
    }
}
