/* jshint eqnull:true, -W100, -W011, -W013 */
/* globals jQuery:true, HTMLElement:true, console:true */
(function(bb, $, undefined) {

  var tool = bb.tool = {};
  
  tool.defaultsOptions = {
    hours: 168,
    graphWrapper: '#graph-wrapper',
    barWidthMultiplier: 20
  };

  tool.defaultAllocations = {
    sleep: 56,
    work: 63,
    housework: 5,
    meals: 7,
    morning: 4,
    kids: 1,
    spouse: 1,
    'side business': 1,
    'social time': 1
  }

  tool.options = {};
  tool.allocations = {};

  tool.init = function(allocations, options) {
    console.log('init');
    options = tool.options = tool.loadOptions(options);
    allocations = tool.allocations = tool.loadAllocations(allocations);

    tool.drawBars();
    tool.updateTotal();
  };

  tool.loadOptions = function(options){
    return $.extend( true, {}, tool.defaultsOptions, options );
  };

  tool.loadAllocations = function(allocations){
    return $.extend( true, {}, tool.defaultAllocations, allocations );
  };

  tool.drawBars = function(){
    $.each(tool.allocations, function(k,v){
      console.log(k+" : "+v);

      $(tool.options.graphWrapper).append(
        $('<div>', {
          class: 'allocation-wrapper',
          html: $('<div>', {
                  class: 'resizable', 
                  style: 'width:' + tool.getBarWidth(k),
                  html: $('<h3>', { html: k}),
                  'data-key': k
                  })
          }).append($('<span>', {class: 'allocation-value', html: v, 'data-key': k}))
        );
    });

    tool.initResizable();
  }

  tool.getBarWidth = function(allocation){
    return (tool.allocations[allocation] * tool.options.barWidthMultiplier) + 'px';
  }

  tool.initResizable = function(){
    $( ".resizable" ).resizable(
      {
        handles: 'e, w',
        grid: [tool.options.barWidthMultiplier, tool.options.barWidthMultiplier]
      });

    $( ".resizable" ).on( "resize", function( event, ui ) {
      tool.setAllocation($(this).data('key'), ui.size.width);
    });
  }

  tool.setAllocation = function(k, width){
    var allocation = Math.floor(width / tool.options.barWidthMultiplier);
    tool.allocations[k] = allocation;
    $("span[data-key='"+k+"']").html(allocation);

    tool.updateTotal();
  }

  tool.updateTotal = function(){
    var used = 0;
    $.each(tool.allocations, function(k,v){
      used = used + v;
    });
    var remaining = tool.options.hours - used;
    $('#remaining').html(remaining);
  }

}( window.bb = window.bb || {}, jQuery ));

$(document).ready(function(){
    bb.tool.init();
});