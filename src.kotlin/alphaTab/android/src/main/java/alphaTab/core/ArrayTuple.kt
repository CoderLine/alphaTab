package alphaTab.core

// generic variant (would box)
interface IArrayTuple<T0, T1> {
    val v0: T0
    val v1: T1

    operator fun component1(): T0
    operator fun component2(): T1
}

data class ArrayTuple<T0, T1>(override val v0: T0, override val v1: T1) : IArrayTuple<T0, T1>

// strong typed variants (Kotlin should compile this to non-boxed variants where possible)
interface IObjectBooleanArrayTuple<T> : IArrayTuple<T, Boolean>
data class ObjectBooleanArrayTuple<T>(override val v0: T, override val v1: Boolean) :
    IObjectBooleanArrayTuple<T>

interface IObjectDoubleArrayTuple<T> : IArrayTuple<T, Double>
data class ObjectDoubleArrayTuple<T>(override val v0: T, override val v1: Double) :
    IObjectDoubleArrayTuple<T>

interface IDoubleObjectArrayTuple<T> : IArrayTuple<Double, T>
data class DoubleObjectArrayTuple<T>(override val v0: Double, override val v1: T) :
    IDoubleObjectArrayTuple<T>

interface IDoubleDoubleArrayTuple : IArrayTuple<Double, Double>
data class DoubleDoubleArrayTuple(override val v0: Double = 0.0, override val v1: Double = 0.0) :
    IDoubleDoubleArrayTuple

interface IDoubleBooleanArrayTuple : IArrayTuple<Double, Boolean>
data class DoubleBooleanArrayTuple(override val v0: Double = 0.0, override val v1: Boolean = false) :
    IDoubleBooleanArrayTuple

