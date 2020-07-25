using System.Windows.Forms;
using AlphaTab.Model;

namespace AlphaTab.Samples.WinForms
{
    public partial class ScoreInfoWindow : Form
    {
        public ScoreInfoWindow()
        {
            InitializeComponent();
        }

        public ScoreInfoWindow(Score score)
        {
            InitializeComponent();
            txtAlbum.Text = score.Album;
            txtArtist.Text = score.Artist;
            txtCopyright.Text = score.Copyright;
            txtLyrics.Text = score.Words;
            txtMusic.Text = score.Music;
            txtNotes.Text = score.Notices;
            txtSubTitle.Text = score.SubTitle;
            txtTab.Text = score.Tab;
            txtTitle.Text = score.Title;
        }
    }
}
