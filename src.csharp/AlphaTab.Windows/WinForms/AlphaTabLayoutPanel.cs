#if NET48
using System.ComponentModel;
using System.Diagnostics;
using System.Drawing;
using System.Windows.Forms;
using System.Windows.Forms.Layout;

namespace AlphaTab.Platform.CSharp.WinForms
{
    internal class AlphaTabLayoutPanel : Panel
    {
        private AlphaTabLayoutEngine _laoyutEngine;

        public override LayoutEngine LayoutEngine => _laoyutEngine ?? (_laoyutEngine = new AlphaTabLayoutEngine());

        public AlphaTabLayoutPanel()
        {
            DoubleBuffered = true;
            ResizeRedraw = true;
        }

        private class AlphaTabLayoutEngine : LayoutEngine
        {
            public override bool Layout(object container, LayoutEventArgs layoutEventArgs)
            {
                var parent = (Control)container;

                var xChild = 0;
                var yChild = 0;

                var rowHeight = 0;

                foreach (Control child in parent.Controls)
                {
                    child.Location = new Point(xChild, yChild);

                    xChild += child.Width;
                    if (child.Height > rowHeight)
                    {
                        rowHeight = child.Height;
                    }

                    if (xChild >= parent.Width)
                    {
                        xChild = 0;
                        yChild += rowHeight;
                        rowHeight = 0;
                    }
                }

                return false;
            }
        }
    }
}
#endif
