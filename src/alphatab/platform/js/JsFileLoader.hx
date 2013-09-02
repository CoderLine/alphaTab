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
package alphatab.platform.js;

#if js
import alphatab.file.FileFormatException;
import alphatab.io.DataInputStream;
import alphatab.io.StringInputStream;
import alphatab.platform.FileLoader;
import js.html.XMLHttpRequest;

/**
 * This is a fileloader implementation for JavaScript.
 * It uses a ajax request in case of modern browsers like Firefox or Chrome. 
 * For IE a VBScript is used to load a binary stream. 
 */
class JsFileLoader implements FileLoader
{
    public function new()
    {
    }
	
	private static function isIE()
	{
		var agent:String = untyped __js__("navigator.userAgent");
		return agent.indexOf("MSIE") != -1;
	}
    
    public function loadBinary(method:String, file:String, success:DataInputStream->Void, error:String->Void) : Void
    {        
        if (isIE())
        {
            // use VB Loader to load binary array
            var vbArr = untyped VbAjaxLoader(method, file);
            var fileContents =  vbArr.toArray();
            
            // decode byte array to string
            var data = "";
            var i = 0; 
            while(i < (fileContents.length-1))
            {
                data += untyped String.fromCharCode(fileContents[i]);
                i++;
            }
            
            var reader:DataInputStream = new DataInputStream(new StringInputStream(data));
            success(reader);
        }
        else
        {
            var xhr:XMLHttpRequest = new XMLHttpRequest();
            untyped
            {
                xhr.overrideMimeType('text/plain; charset=x-user-defined');
            }
            xhr.onreadystatechange = function(d) 
            {
                try
                {
                    if (xhr.readyState == 4)
                    {
                        if (xhr.status == 200)
                        {
                            var reader:DataInputStream = new DataInputStream(new StringInputStream(xhr.responseText));
                            success(reader);
                        }
                        // Error handling
                        else if (xhr.status == 0)
                        {
                            error('You are offline!!\n Please Check Your Network.');
                        }
                        else if (xhr.status == 404)
                        {
                            error('Requested URL not found.');
                        }
                        else if (xhr.status == 500)
                        {
                            error('Internel Server Error.');
                        }
                        else if (xhr.statusText == 'parsererror')
                        {
                            error('Error.\nParsing JSON Request failed.');
                        }
                        else if (xhr.statusText == 'timeout')
                        {
                            error('Request Time out.');
                        }
                        else 
                        {
                            error('Unknow Error: ' + xhr.responseText);
                        }
                    }
                }
                catch (e:FileFormatException)
                {
                    error("Error loading file: " + e.message);
                }
                catch (e:Dynamic)
                {
                    error("Error loading file: " + e);
                }
            }
            xhr.open(method, file, true);
            xhr.send(null);
        }
    }
}
#end