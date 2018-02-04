package alphaTab.test.model;

using system.HaxeExtensions;
class TuningParserTest
{
    @Test
    public function TestStandard() : Void 
    {
        var standard : alphaTab.model.Tuning = alphaTab.model.Tuning.GetDefaultTuningFor(6);
        var tuningText : system.FixedArray<system.CsString> = ["E4", "B3", "G3", "D3", "A2", "E2"];
        var tuning : system.FixedArray<system.Int32> = system.FixedArray.empty(tuningText.Length);
        var tuningText2 : system.FixedArray<system.CsString> = system.FixedArray.empty(tuningText.Length);
        {
            var i: system.Int32 = 0;
            while (i < tuningText.Length)
            {
                tuning[i] = alphaTab.model.TuningParser.GetTuningForText(tuningText[i]);
                tuningText2[i] = alphaTab.model.Tuning.GetTextForTuning(tuning[i], true);
                i++;
            }
        }
        massive.munit.Assert.areEqual(system.CsString.Join_CsString_IEnumerable_T1(",", standard.Tunings.ToEnumerable()), system.CsString.Join_CsString_IEnumerable_T1(",", tuning.ToEnumerable()));
        massive.munit.Assert.areEqual(system.CsString.Join_CsString_CsStringArray(",", tuningText), system.CsString.Join_CsString_CsStringArray(",", tuningText2));
    }

    public function new() 
    {
    }

}
