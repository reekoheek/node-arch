
xn = {};

xn.stylize = function(selector) {
    $("input:text", selector).addClass("text");
    $("input:password", selector).addClass("password");
    $("input:reset", selector).addClass("reset");
    $("input:submit", selector).addClass("submit");
    $("input:button", selector).addClass("button");
    $("input:radio", selector).addClass("radio");
    $("input:file", selector).addClass("file");
    $("select", selector).addClass("select");
    
    $("input[type='text'], input[type='password'], input[type='checkbox'], input[type='radio'], textarea", selector).uniform();
    
    var a = $("a[title!=''], img[title!=''], div[title!='']", selector).tooltip({
        effect:'fade'
    });
        
    $('table.grid tr:even').addClass('even');
    
    $('*').hover(function() {
        $(this).addClass('hover');
    },
    function() {
        $(this).removeClass('hover');
    });
    
    $('fieldset.collapsible > legend').click(function() {
        $(this).parent().toggleClass('clicked');
    });
};

$(function() {
    xn.stylize();
});