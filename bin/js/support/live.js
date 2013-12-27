var settings = alphatab.Settings.defaults();

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

   $('#alphaTab').alphaTab(settings);
});