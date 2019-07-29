using System;

namespace AlphaTab.Samples.Wpf.Data
{
    /// <summary>
    /// Implement this interface to handle application errors. 
    /// </summary>
    public interface IErrorService
    {
        /// <summary>
        /// Called when an error during opening a file occurs. 
        /// </summary>
        /// <param name="e">The exception occured during opening the file</param>
        void OpenFailed(Exception e);
    }
}
