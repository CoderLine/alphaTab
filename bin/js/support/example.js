$('.example').each(function() {
    var html = $(this).html();
    
    var codeDiv = $(document.createElement('div'));
    codeDiv.addClass('example-code');
    codeDiv.append('<h3>Example code</h3>');
    
    var code = $(document.createElement('pre'));
    code.text(html);
    codeDiv.append(code);
    
    $(this).append(codeDiv);
});