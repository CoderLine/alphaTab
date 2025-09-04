using System.Windows.Forms;

namespace AlphaTab.WinForms
{
    internal class AlphaTabLayoutPanel : Panel
    {
        public AlphaTabLayoutPanel()
        {
            base.DoubleBuffered = true;
            ResizeRedraw = true;
        }
    }
}
