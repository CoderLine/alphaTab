var currentGroup = null;
var currentGroupMenuItem = null;

function showGroup(group) {
    if(group == currentGroup) return;
    if(currentGroup != null) $(currentGroup).fadeOut();
    $(group).fadeIn();
    currentGroup = group;
}

$(document).ready(function() {
    var menu = $('#menu');
    
    $('.group').each(function() {
        var group = this;
        var title = $('h1', group).text();
        
        var menuItem = $(document.createElement('a'));
        menuItem.addClass('button');
        menuItem.text(title);
        menuItem.click(function() {
            if(currentGroupMenuItem != null)
                currentGroupMenuItem.removeClass('active');
            currentGroupMenuItem = menuItem;
            currentGroupMenuItem.addClass('active');
            showGroup(group);
        });
        menu.append(menuItem);
        
    });
    
    $('#menu a').first().click();
});