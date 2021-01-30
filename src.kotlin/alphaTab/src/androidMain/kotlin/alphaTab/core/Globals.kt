import system.globalization.CultureInfo
import java.text.NumberFormat
import java.util.*

fun Double.toString(cultureInfo: CultureInfo): kotlin.String {
    if (cultureInfo.isInvariant) {
        return NumberFormat.getNumberInstance(Locale.ROOT).format(this)
    } else {
        return this.toString()
    }
}
