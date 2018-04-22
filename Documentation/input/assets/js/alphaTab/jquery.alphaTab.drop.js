/*
 * This file is part of alphaTab.
 * Copyright c 2013, Daniel Kuschny and Contributors, All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or at your option any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */
(function($) {
    if(!$) { return; }
    
    var supported = (window.File && window.FileReader && window.FileList && window.Blob);

    // extend the api
    var api = $.fn.alphaTab.fn;
    
    api.drop = function(element, context, args) 
    {
        var drop = element.data('alphaTab.drop');
        if(!drop)
        {
            var self = this;
            if(!supported) { $.error('File API not supported'); }

            element
            .on('dragenter', function(e) {
                e.stopPropagation();
                e.preventDefault();
                element.addClass('drop');
            })
            .on('dragover', function(e) {
                e.stopPropagation();
                e.preventDefault();
            })
            .on('drop', function(e) {
                element.removeClass('drop');
                e.preventDefault();
                // when dropping files, load them using FileReader
                var files = e.originalEvent.dataTransfer.files;
                if(files.length > 0) {
                    var reader = new FileReader();
                    reader.onload = (function(e) {
                        // call load
                        api.load(element, context, e.target.result);
                    });
                    reader.readAsArrayBuffer(files[0]);
                }
            });
        }
    };
})(typeof jQuery !== 'undefined' ? jQuery : null);