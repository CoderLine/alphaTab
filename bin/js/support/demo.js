var currentGroup = null;
var firstGroup = null;
var currentGroupMenuItem = null;
var menuLookup = {};

function showGroup(groupId) {
    if(!groupId || groupId.length == 0) 
        groupId = firstGroup;
    
    if(currentGroupMenuItem != null)
        currentGroupMenuItem.removeClass('active');
    currentGroupMenuItem = menuLookup[groupId];
    if(currentGroupMenuItem)
    {
        currentGroupMenuItem.addClass('active');
        
        var group = currentGroupMenuItem.data('group');
        if(group == currentGroup) return;
        if(currentGroup != null) $(currentGroup).fadeOut();
        $(group).fadeIn();
        currentGroup = group;
        $("html, body").animate({ scrollTop: 0 }, 400);
        
        $('script[type="text/javascript-lazy"]', group).each(function() {
            if(!$(this).data('run')) {
                eval($(this).html());
                $(this).data('run',true);
            }
        });
    }    
}
       
$(document).ready(function() {
    var menu = $('#menu');
    
    
    $('.group').each(function() {
        var group = this;
        var title = $('h1', group).text();
        
        var menuItem = $(document.createElement('a'));
        menuItem.addClass('button');
        menuItem.text(title);
        menuItem.data('group', group);
        var groupId = '#' + group.id;
        menuItem.attr('href', groupId);
        menuLookup[groupId] = menuItem;
        if(firstGroup == null)
            firstGroup = groupId;
        menu.append(menuItem);
        
    });
    
    $(window).on('hashchange', function() {
        showGroup(window.location.hash);
    });
    
    showGroup(window.location.hash);
});