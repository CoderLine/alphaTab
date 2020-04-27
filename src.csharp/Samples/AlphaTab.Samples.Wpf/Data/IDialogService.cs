using AlphaTab.Model;

namespace AlphaTab.Samples.Wpf.Data
{
    public interface IDialogService
    {
        /// <summary>
        /// Called when the application wants to open a new file. 
        /// Implementation should ask the user to select a file from the filesystem.
        /// </summary>
        /// <returns>The path to the file which should be opened or <code>null</code> if no file should be opened</returns>
        string OpenFile();

        /// <summary>
        /// Called when the application wants to show a score information. 
        /// </summary>
        void ShowScoreInfo(Score score);
    }
}
