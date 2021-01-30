package alphaTab.core.ecmaScript

open class Error: Throwable {
    public override val message: String

    public constructor() : super() {
        this.message = ""
    }

    public constructor(msg:String) : super(msg) {
        this.message = msg;
    }
}
