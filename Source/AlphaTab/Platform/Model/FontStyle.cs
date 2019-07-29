using System;

namespace AlphaTab.Platform.Model
{
    /// <summary>
    /// Lists all flags for font styles. 
    /// </summary>
    [Flags]
    public enum FontStyle
    {
        /// <summary>
        /// No flags. 
        /// </summary>
        Plain = 0,

        /// <summary>
        /// Font is bold
        /// </summary>
        Bold = 1,

        /// <summary>
        /// Font is italic. 
        /// </summary>
        Italic = 2
    }
}
