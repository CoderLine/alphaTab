var currentGroup = null;
var firstGroup = null;
var currentGroupMenuItem = null;
var menuLookup = {};

function showGroup(groupId) {
    if(!groupId || groupId.length == 0) 
        groupId = firstGroup;
    
    $('#menu li').removeClass('active');
    
    currentGroupMenuItem = menuLookup[groupId];
    if(currentGroupMenuItem)
    {
        currentGroupMenuItem.closest('li').addClass('active');
        
        var group = currentGroupMenuItem.data('group');
        if(group == currentGroup) return;
        if(currentGroup != null) $(currentGroup).fadeOut();
        $(group).fadeIn();
        currentGroup = group;
        $("html, body").animate({ scrollTop: 0 }, 400);
        
        $('script[type="text/javascript-lazy"]', group).each(function() {
            if(!$(this).data('run')) {
                $(this).data('run',true).trigger('sampleLoad');
                eval($(this).html());
            }
        });
    }    
}
       
$(document).ready(function() {
    var menu = $('#menu');
    
    $('.group').each(function() {
        var group = this;
        var title = $('h1', group).text();
        
        var menuItem = $(document.createElement('li'));
        
        var menuItemLink = $(document.createElement('a'));
        menuItemLink.text(title);
        menuItemLink.data('group', group);
        var groupId = '#' + group.id;
        menuItemLink.attr('href', groupId);
        menuLookup[groupId] = menuItemLink;
        if(firstGroup == null)
            firstGroup = groupId;
        menuItem.append(menuItemLink);
        
        menu.append(menuItem);
    });
    
    $(window).on('hashchange', function() {
        showGroup(window.location.hash);
    });
    
    showGroup(window.location.hash);
});