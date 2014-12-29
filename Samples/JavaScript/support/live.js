var settings = AlphaTab.Settings.get_Defaults();
var currentScore = null;

function highlightEngine(engine) {
    $('#engine a').each(function() {
        if($(this).data('val') == engine) {
            $(this).addClass('active');
        }
        else {
            $(this).removeClass('active');
        }
    });
}

function openFile(bytes) {
    try {
        currentScore = AlphaTab.Importer.ScoreLoader.LoadScoreFromBytes(new Uint8Array(bytes));
        $('#alphaTab').alphaTab('renderer').Render(currentScore.Tracks[0]);
    }
    catch(e) {
        alert('Error opening the file');
        console.error(e);
    }
}

function updateSettings() {
    settings.Scale = parseFloat($('#zoom').val());
    settings.Layout.Mode = $('#layoutMode').val();
    settings.Layout.AdditionalSettings['autoSize'] = $('#autoSize').is(':checked');
    settings.Width = parseInt($('#width').val());
    switch(settings.Layout.Mode) 
    {
        case 'page':
            settings.Layout.AdditionalSettings['start'] = parseInt($('#startBarPage').val())
            settings.Layout.AdditionalSettings['count'] = parseInt($('#barCountPage').val());
            break;
        case 'horizontal':
            settings.Layout.AdditionalSettings['start'] = parseInt($('#startBarHorizontal').val())
            settings.Layout.AdditionalSettings['count'] = parseInt($('#barCountHorizontal').val());
            break;
    }
    settings.Layout.AdditionalSettings['hideInfo'] = $('#hideInfo').is(':checked');
    settings.Layout.AdditionalSettings['barsPerRow'] = parseInt($('#barsPerRow').val());
    settings.Staves = new Array();
    $('input[name=staves]').each(function() {
       if($(this).is(':checked')) {
           settings.Staves.push(new AlphaTab.StaveSettings($(this).val()));
       }
    });
    $('#alphaTab').alphaTab('renderer').Invalidate();
}

function updateUi() {
    $('#zoom option[value="'+settings.Scale+'"]').attr('selected', true);
    highlightEngine(settings.Engine);
    $('#layoutMode option[value="'+settings.Layout.Mode+'"]').attr('selected', true);
    $('#autoSize').attr('checked', settings.Layout.Get('autoSize', true));
    $('#autoSize').trigger('change');
    $('#width').val(settings.Width);
    $('#startBarPage').val(settings.Layout.Get('start', 1));
    $('#barCountPage').val(settings.Layout.Get('count', -1));
    $('#hideInfo').attr('checked', settings.Layout.Get('hideInfo', false));
    $('#startBarHorizontal').val(settings.Layout.Get('start', 1));
    $('#barCountHorizontal').val(settings.Layout.Get('count', -1));
    $('#barsPerRow').val(settings.Layout.Get('barsPerRow', -1));
    $('#layoutMode').trigger('change');
    
    for(i in settings.Staves) {
        $('input[name="staves"][value="'+settings.Staves[i].Id+'"]').attr('checked', true);
    }
}


function changeEngine(newEngine) {
    if(newEngine == settings.Engine) return;
    settings.Engine = newEngine;
    highlightEngine(newEngine);
    $.alphaTab.restore('#alphaTab');
    $('#alphaTab').alphaTab(settings);  
    $('#alphaTab').alphaTab('renderer').Render(currentScore.Tracks[0]);
}

function initializeTrackChooser() {
    var score = $('#alphaTab').alphaTab('score');
    var currentTrack = $('#alphaTab').alphaTab('tracks');
    currentTrack = (currentTrack.length == 0) ? null : currentTrack[0];
    var allTracks = score.Tracks;

    var list = $('#trackList');
    list.empty();
    
    for(var i = 0; i < allTracks.length; i++) 
    {
        var track = allTracks[i];
        var li = $('<li></li>');
        list.append(li);
        if(track == currentTrack) li.addClass('active');
        
        var a = $('<a></a>');
        li.append(a);
        a.attr('href', '#');
        a.text(track.Name);
        a.data('track', track);
        a.click(function(e) {
           e.preventDefault();
           $('#alphaTab').alphaTab('renderer').Render($(this).data('track'));
           $('#trackChooser').fadeOut();
        });
    }
}

$(document).ready(function() {
   /* accordion */
   var groups =  $('#settingsContent a');
   groups.click(function(e) {
      e.preventDefault();
      var content = $($(this).attr('rel'));
      if(content.is(':visible')) {
          $(this).removeClass('open');
      }
      else {
          $(this).addClass('open');
      }
      content.slideToggle('fast');
   });
   $(groups[0]).trigger('click');
   
   /* Settings UI */
   $('#autoSize').change(function() {
       $('#widthWrap input').attr('disabled', $(this).is(':checked'));
   });
   $('#startBarPage').change(function() {
       $('#startBarHorizontal').val($(this).val());
   });
   $('#barCountPage').change(function() {
       $('#barCountHorizontal').val($(this).val());
   });
   $('#startBarHorizontal').change(function() {
       $('#startBarPage').val($(this).val());
   });
   $('#barCountHorizontal').change(function() {
       $('#barCountPage').val($(this).val());
   });
   $('#engine a').click(function() {
        changeEngine($(this).data('val'));
   });
   $('#layoutMode').change(function() {
      switch($(this).val())
      {
          case 'page':
              $('#pageLayout').slideDown();
              $('#horizontalLayout').slideUp();
              break;
          case 'horizontal':
              $('#pageLayout').slideUp();
              $('#horizontalLayout').slideDown();
              break;
      }
   });
      
   $('#invalidate').click(function() {
       updateSettings();
   });
   
   settings.Engine = "svg";
   updateUi();

    $('#alphaTab').on('loaded', function(e, score) {
        currentScore = score;
    });
   
    $('#alphaTab').alphaTab(settings);
    $('#alphaTab').data('file', null); 
    
   
    var endsWith = function(s, suffix) {
        return s.indexOf(suffix, this.length - suffix.length) !== -1;
    };
   
    /* file reader */
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        $('#openFileData').change(function(e) {
            var file = e.target.files[0];
            if(endsWith(file.name, "gp3") || endsWith(file.name, "gp4") || endsWith(file.name, "gp5") || endsWith(file.name, "gpx")) {
               
                var reader = new FileReader();
                reader.onload = function(e) {
                    openFile(e.target.result);
                };
                reader.readAsArrayBuffer(file)
           }
           else {
               alert('Please open a Guitar Pro 3-6 File');
           }
        });
    } 
    else {
      $('#openFile').hide();
    }
    
    /* Track Chooser */
    $('#tracks').click(function(e) { e.preventDefault(); initializeTrackChooser(); $('#trackChooser').fadeIn(); });
    $('#trackChooser .shadow').click(function() { $('#trackChooser').fadeOut(); } );
    
});