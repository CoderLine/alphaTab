var settings = alphatab.Settings.defaults();
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
        currentScore = alphatab.importer.ScoreLoader.loadScoreFromBytes(haxe.io.Bytes.ofData(new Uint8Array(bytes)));
        $('#alphaTab').alphaTab('renderer').render(currentScore.tracks[0]);
    }
    catch(e) {
        alert('Error opening the file');
        console.error(e);
    }
}

function updateSettings() {
    settings.scale = parseFloat($('#zoom').val());
    settings.layout.mode = $('#layoutMode').val();
    settings.layout.additionalSettings.set('autoSize', $('#autoSize').is(':checked'));
    settings.width = parseInt($('#width').val());
    switch(settings.layout.mode) 
    {
        case 'page':
            settings.layout.additionalSettings.set('start', parseInt($('#startBarPage').val()))
            settings.layout.additionalSettings.set('count', parseInt($('#barCountPage').val()));
            break;
        case 'horizontal':
            settings.layout.additionalSettings.set('start', parseInt($('#startBarHorizontal').val()))
            settings.layout.additionalSettings.set('count', parseInt($('#barCountHorizontal').val()));
            break;
    }
    settings.layout.additionalSettings.set('hideInfo', $('#hideInfo').is(':checked'));
    settings.layout.additionalSettings.set('barsPerRow', parseInt($('#barsPerRow').val()));
    settings.staves = new Array();
    $('input[name=staves]').each(function() {
       if($(this).is(':checked')) {
           settings.staves.push(new alphatab.StaveSettings($(this).val()));
       }
    });
    $('#alphaTab').alphaTab('renderer').invalidate();
}

function updateUi() {
    $('#zoom option[value="'+settings.scale+'"]').attr('selected', true);
    highlightEngine(settings.engine);
    $('#layoutMode option[value="'+settings.layout.mode+'"]').attr('selected', true);
    $('#autoSize').attr('checked', settings.layout.get('autoSize', true));
    $('#autoSize').trigger('change');
    $('#width').val(settings.width);
    $('#startBarPage').val(settings.layout.get('start', 1));
    $('#barCountPage').val(settings.layout.get('count', -1));
    $('#hideInfo').attr('checked', settings.layout.get('hideInfo', false));
    $('#startBarHorizontal').val(settings.layout.get('start', 1));
    $('#barCountHorizontal').val(settings.layout.get('count', -1));
    $('#barsPerRow').val(settings.layout.get('barsPerRow', -1));
    $('#layoutMode').trigger('change');
    
    for(i in settings.staves) {
        $('input[name="staves"][value="'+settings.staves[i].id+'"]').attr('checked', true);
    }
}


function changeEngine(newEngine) {
    if(newEngine == settings.engine) return;
    settings.engine = newEngine;
    highlightEngine(newEngine);
    $.alphaTab.restore('#alphaTab');
    $('#alphaTab').alphaTab(settings);  
    $('#alphaTab').alphaTab('renderer').render(currentScore.tracks[0]);
}

function initializeTrackChooser() {
    var currentTrack = $('#alphaTab').alphaTab('track');
    var allTracks = currentTrack.score.tracks;

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
        a.text(track.name);
        a.data('track', track);
        a.click(function(e) {
           e.preventDefault();
           $('#alphaTab').alphaTab('renderer').render($(this).data('track'));
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
   
   settings.engine = "html5";
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