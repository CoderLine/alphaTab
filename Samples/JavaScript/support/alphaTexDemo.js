function prepareTex(tex) {
   return tex.replace(/[\t ]*(.*)[ \t]*/g, "$1");     
}

$('[data-tex]').each(function() {
    var code = $('<code class="language-alphaTex line-numbers"></code>')
        .text(prepareTex($(this).text()))   

    var pre = $('<pre></pre>').append(code);    
    $(this).after($('<div class="texSample"></div>').append(pre));
    Prism.highlightElement(code[0]);
});