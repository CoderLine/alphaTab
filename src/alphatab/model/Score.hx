package alphatab.model;

/**
 * The score is the root node of the complete 
 * model. It stores the basic information of 
 * a song and stores the sub components. 
 */
class Score 
{
    /**
     * The album of this song. 
     */
    public var album:String;
    /**
     * The artist who performs this song.
     */
    public var artist:String;
    /**
     * The owner of the copyright of this song. 
     */
    public var copyright:String;
    /**
     * Additional instructions 
     */
    public var instructions:String;
    /**
     * The author of the music. 
     */
    public var music:String;
    /**
     * Some additional notes about the song. 
     */
    public var notices:String;
    /**
     * The subtitle of the song. 
     */
    public var subTitle:String;
    /**
     * The title of the song. 
     */
    public var title:String;
    /**
     * The author of the song lyrics
     */
    public var words:String;    
    /**
     * The author of this tablature. 
     */
    public var tab:String;

    public var tempoLabel:String;
    
    public var masterBars:Array<MasterBar>;
    public var tracks:Array<Track>;
    
    public function new() 
    {
        masterBars = new Array<MasterBar>();
        tracks = new Array<Track>();
    }
    
    public function addMasterBar(bar:MasterBar)
    {
        bar.score = this;
        bar.index = masterBars.length;
        if (masterBars.length != 0)
        {
            bar.previousMasterBar = masterBars[masterBars.length - 1];
            bar.previousMasterBar.nextMasterBar = bar;
        }
        masterBars.push(bar);
    }
    
    public function addTrack(track:Track)
    {
        track.score = this;
        track.index = tracks.length;
        tracks.push(track);
    }
}