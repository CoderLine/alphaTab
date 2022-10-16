using System.Drawing;
using System.Windows.Forms;
using System.Windows.Forms.Layout;

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
