package alphatab.platform.js;
#if js
import alphatab.io.DataStream;
import alphatab.io.StringStream;
import alphatab.platform.FileLoader;

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
    
    public function loadBinary(method:String, file:String, success:DataStream->Void, error:String->Void) : Void
    {        
        if (JQuery.isIE())
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
            
            var reader:DataStream = new DataStream(new StringStream(data));
            success(reader);
        }
        else
        {
            var options:Dynamic = cast { };
            options.type = method;
            options.url = file;
            options.success = function(data:String)
            {
                var reader:DataStream = new DataStream(new StringStream(data));
                success(reader);
            }
            options.error = function(x:Dynamic, e:String)
            {
                if(x.status==0){
                    error('You are offline!!\n Please Check Your Network.');
                }else if(x.status==404){
                    error('Requested URL not found.');
                }else if(x.status==500){
                    error('Internel Server Error.');
                }else if(e=='parsererror'){
                    error('Error.\nParsing JSON Request failed.');
                }else if(e=='timeout'){
                    error('Request Time out.');
                }else {
                    error('Unknow Error.\n'+x.responseText);
                }
            }
            
            options.beforeSend = function(xhr:Dynamic) {
                untyped
                {
                    if (xhr.overrideMimeType)
                    {
                        xhr.overrideMimeType('text/plain; charset=x-user-defined');
                    }
                }
            }
            
            JQuery.ajax(options);
        }
    }
}
#end