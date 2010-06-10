FileLoader = function () {
};

FileLoader.LoadBinary = function(file, method, success, error) {
	$.ajax({
        type: method,
        url: file,
		success: function(data)	{
			success(new BinaryReader(data)); 
		},
		error : function(x, e) {
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
		},
        beforeSend: function(xhr){
            xhr.overrideMimeType('text/plain; charset=x-user-defined');
        }
    });
}
