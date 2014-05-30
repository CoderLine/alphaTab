(function($) 
{
    var supported = (window.File && window.FileReader && window.FileList && window.Blob);

    // extend the api
    var api = $.fn.alphaTab.fn;
    
    api.drop = function() 
    {
        var self = this;
        if(!supported) { $.error('File API not supported'); }
        var context = $(this).data('alphaTab');
        if(!context) { $.error('alphaTab not initialized!'); }

        $(this)
        .on('dragenter', function(e) {
            e.stopPropagation();
            e.preventDefault();
            $(this).addClass('drop');
        })
        .on('dragover', function(e) {
            e.stopPropagation();
            e.preventDefault();
        })
        .on('drop', function(e) {
            $(this).removeClass('drop');
            e.preventDefault();
            // when dropping files, load them using FileReader
            var files = e.originalEvent.dataTransfer.files;
            if(files.length > 0) {
                var reader = new FileReader();
                reader.onload = (function(e) {
                    // call load
                    api.load.call(self, e.target.result);
                });
                reader.readAsArrayBuffer(files[0]);
            }
        });
    };
   

})(jQuery);