using System.Windows.Forms;
using alphatab.model;

namespace AlphaTab.Gdi
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
            txtAlbum.Text = score.album;
            txtArtist.Text = score.artist;
            txtCopyright.Text = score.copyright;
            txtLyrics.Text = score.words;
            txtMusic.Text = score.music;
            txtNotes.Text = score.notices;
            txtSubTitle.Text = score.subTitle;
            txtTab.Text = score.tab;
            txtTitle.Text = score.title;
        }
    }
}
