package alphaTab.core

interface IAlphaTabEnum {
    val value: Int
}


interface IAlphaTabEnumCompanion<T> {
    val values:Array<T>
    fun fromValue(value:Double): T
}
