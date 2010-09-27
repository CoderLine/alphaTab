/*
 * This file is part of alphaTab.
 *
 *  alphaTab is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  alphaTab is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with alphaTab.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * This is a plugin which extends alphaTab with a alphaTex editor.
 */
(function(alphaTabWrapper)
{
    alphaTabWrapper.fn.editor = function() {
        var self = this;
        var editorArea = $('<textarea class="alphaTexEditor">' + this.contents + '</textarea>');
        this.el.append($('<br />'));
        this.el.append(editorArea);

        // size textarea
        var str = editorArea.html();
        var cols = editorArea[0].cols;
        var linecount = 0;
        $( str.split( "\n" ) ).each( function( i, l ) 
        {
            linecount++; // take into account long lines
        });
        editorArea[0].rows = linecount;
        this.editor = editorArea;
        editorArea.keyup(function() 
        {
            self.loadAlphaTex(editorArea.val());
        });
        
        return this;
    }

})(alphaTabWrapper);