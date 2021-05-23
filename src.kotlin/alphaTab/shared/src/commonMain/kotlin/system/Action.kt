package system

typealias Action = () -> Unit;
typealias ActionOfT<T> = (t:T) -> Unit;
