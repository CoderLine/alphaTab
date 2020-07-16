using AlphaTab.Model;

namespace AlphaTab.Samples.Wpf.ViewModel
{
    public class ScoreInfoViewModel : ViewModelBase
    {
        private string _tab;
        private string _words;
        private string _title;
        private string _subTitle;
        private string _notices;
        private string _music;
        private string _instructions;
        private string _copyright;
        private string _artist;
        private string _album;

        public ScoreInfoViewModel(Score score)
        {
            _tab = score.Tab;
            _words = score.Words;
            _title = score.Title;
            _subTitle = score.SubTitle;
            _notices = score.Notices;
            _music = score.Music;
            _instructions = score.Instructions;
            _copyright = score.Copyright;
            _artist = score.Artist;
            _album = score.Album;
        }

        public string Album
        {
            get => _album;
            set
            {
                _album = value;
                OnPropertyChanged();
            }
        }

        public string Artist
        {
            get => _artist;
            set
            {
                _artist = value;
                OnPropertyChanged();
            }
        }

        public string Copyright
        {
            get => _copyright;
            set
            {
                _copyright = value;
                OnPropertyChanged();
            }
        }

        public string Instructions
        {
            get => _instructions;
            set
            {
                _instructions = value;
                OnPropertyChanged();
            }
        }

        public string Music
        {
            get => _music;
            set
            {
                _music = value;
                OnPropertyChanged();
            }
        }

        public string Notices
        {
            get => _notices;
            set
            {
                _notices = value;
                OnPropertyChanged();
            }
        }

        public string SubTitle
        {
            get => _subTitle;
            set
            {
                _subTitle = value;
                OnPropertyChanged();
            }
        }

        public string Title
        {
            get => _title;
            set
            {
                _title = value;
                OnPropertyChanged();
            }
        }

        public string Words
        {
            get => _words;
            set
            {
                _words = value;
                OnPropertyChanged();
            }
        }

        public string Tab
        {
            get => _tab;
            set
            {
                _tab = value;
                OnPropertyChanged();
            }
        }
    }
}
