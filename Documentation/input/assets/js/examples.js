Prism.languages.alphaTex = {
	'comment': [
		{
			pattern: /(^|[^\\])\/\*[\w\W]*?\*\//,
			lookbehind: true
		},
		{
			pattern: /(^|[^\\:])\/\/.*/,
			lookbehind: true
		}
	],

	'number': /\b-?(?:0x[\da-f]+|\d*\.?\d+(?:e[+-]?\d+)?)\b/i,

	'string': {
		pattern: /(["'])(\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
		greedy: true
	},
   
	'keyword': /\\([^ ]+)/,
	'constant': /([cdefgabh][0-9])/,
};

$('.example').each(function() {
	var html = $(this).find('.html').html();
	var js = $(this).find('.js').html();
	
	var wrap = $('<div class="example-source"></div>');
	var ul = $('<ul class="nav nav-tabs"></ul>').appendTo(wrap);
	var tabContent = $('<div class="tab-content"></li>').appendTo(wrap);
	
	$('<li class="active"><a href="#">HTML</a></li>').appendTo(ul);
	$('<div class="tab-pane active"></div>')
		.append($('<pre class="line-numbers"></pre>').append($('<code class="language-html"></code>').text(html)))
		.appendTo(tabContent);
	
	$('<li><a href="#">JavaScript</a></li>').appendTo(ul);
	$('<div class="tab-pane"></div>')
		.append($('<pre class="line-numbers"></pre>').append($('<code class="language-javascript"></code>').text(js)))
		.appendTo(tabContent);
		
	$(this).prepend(wrap);
	
	ul.on('click', 'a', function(e){
		e.preventDefault();
		
		var parent = $(this).closest('.example-source'),
			li = $(this).closest('li'),
			index = li.index(),
			tabs = parent.find('.tab-content')
		;
		
		parent.find('li.active').removeClass('active');
		li.addClass('active');
		tabs.find('.tab-pane.active').removeClass('active');
		tabs.find('.tab-pane').eq(index).addClass('active');
		
	});
});

function prepareTex(tex) {
   return tex.replace(/[\t ]*(.*)[ \t]*/g, "$1");     
}
if(window.texSample) {
	$('[data-tex]').each(function() {
		var code = $('<code class="language-alphaTex line-numbers"></code>')
			.text(prepareTex($(this).text()))   

		var pre = $('<pre></pre>').append(code);    
		$(this).after($('<div class="texSample"></div>').append(pre));
	});
}

Prism.highlightAll();                

$('script[type="text/x-alphatab"]').each(function() {
	var code = $(this).html();
	var newScript = document.createElement('script');
	newScript.innerHTML = code;
	$(this).replaceWith(newScript);
});
