using AlphaTab.Platform.Model;

namespace AlphaTab.Rendering
{
    /// <summary>
    /// This public class contains central definitions for controlling the visual appearance. 
    /// </summary>
    public class RenderingResources
    {
        public Font CopyrightFont { get; set; }
        public Font TitleFont { get; set; }
        public Font SubTitleFont { get; set; }
        public Font WordsFont { get; set; }
        public Font EffectFont { get; set; }

        public Font TablatureFont { get; set; }
        public Font GraceFont { get; set; }

        public Color StaveLineColor { get; set; }
        public Color BarSeperatorColor { get; set; }

        public Font BarNumberFont { get; set; }
        public Color BarNumberColor { get; set; }

        public Font MarkerFont { get; set; }
        public Font TabClefFont { get; set; }

        public Color MainGlyphColor { get; set; }

        public float Scale { get; set; }

        public RenderingResources(float scale)
        {
            Init(scale);
        }
    
        public void Init(float scale) 
        { 
            Scale = scale;
        
            const string sansFont = "Arial";
            const string serifFont = "Georgia";
        
            EffectFont = new Font(serifFont, 12 * scale, FontStyle.Italic);
            CopyrightFont = new Font(sansFont, 12 * scale, FontStyle.Bold);
        
            TitleFont = new Font(serifFont, 32 * scale);
            SubTitleFont = new Font(serifFont, 20 * scale);
            WordsFont = new Font(serifFont, 15 * scale);
        
            TablatureFont = new Font(sansFont, 13 * scale); 
            GraceFont = new Font(sansFont, 11 * scale); 
       
            StaveLineColor = new Color(165, 165, 165);
            BarSeperatorColor = new Color(34, 34, 17);
       
            BarNumberFont = new Font(sansFont, 11 * scale); 
            BarNumberColor = new Color(200, 0, 0);

            MarkerFont = new Font(serifFont, 14 * scale, FontStyle.Bold);
            TabClefFont = new Font(sansFont, 18 * scale, FontStyle.Bold);
        
            MainGlyphColor = new Color(0,0,0);
        }
    }
}
