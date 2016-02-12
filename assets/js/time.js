/* jshint eqnull:true, -W100, -W011, -W013 */
/* globals jQuery:true, HTMLElement:true, console:true */
(function(bb, $, undefined) {

  var tool = bb.tool = {};
  
  tool.defaultsOptions = {
    hours: 168,
    graphWrapper: '#graph-wrapper',
    barWidthMultiplier: 20,
    showSleep: true,
    showWork: true
  };

  tool.defaultAllocations = {
    sleep: 56,
    work: 63,
    housework: 5,
    meals: 7,
    'morning routine': 4,
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

    tool.autoScale();
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
    $(tool.options.graphWrapper).html('');
    $.each(tool.allocations, function(k,v){
      if( tool.isAllocationVisible(k) ){
        console.log(k+" : "+v);

        $(tool.options.graphWrapper).append(
          $('<div>', {
            class: 'allocation-wrapper',
            html: $('<h4>', { html: k, class:'allocation-name'})
            })
            .append($('<div>', {
                    class: 'resizable', 
                    style: 'width:' + tool.getBarWidth(k),
                    'data-key': k,
                    html: $('<div>', {class: 'allocation-value ui-resizable-handle ui-resizable-e', html: $('<span>', {html: v}), 'data-key': k})
                    }))
            
        );
      }
    });

    tool.initResizable();
  }

  tool.getBarWidth = function(allocation){
    return (tool.allocations[allocation] * tool.options.barWidthMultiplier) + 'px';
  }

  tool.isAllocationVisible = function(allocation){
    return ( (allocation != 'sleep' && allocation != 'work') || (allocation == 'sleep' && tool.options.showSleep) || (allocation == 'work' && tool.options.showWork));
  }

  tool.autoScale = function(){
    var maxWidth = $(tool.options.graphWrapper).innerWidth();
    var maxAllocation = 0;
    $.each(tool.allocations, function(k,v){
      if(tool.isAllocationVisible(k)){
        maxAllocation = v > maxAllocation ? v : maxAllocation;
      }
    });

    tool.options.barWidthMultiplier = (maxWidth / 2) / maxAllocation;
  }

  tool.initResizable = function(){
    $( ".resizable" ).resizable(
      {
        handles: 'e, w',
        grid: [tool.options.barWidthMultiplier, tool.options.barWidthMultiplier],
        containment: "parent",
        minHeight: 35
      });

    $( ".resizable" ).on( "resize", function( event, ui ) {
      tool.setAllocation($(this).data('key'), ui.size.width);
    });    
  }

  tool.setAllocation = function(k, width){
    var allocation = Math.floor(width / tool.options.barWidthMultiplier);
    tool.allocations[k] = allocation;
    $("div.allocation-value[data-key='"+k+"']").html(allocation);

    tool.updateTotal();
  }

  tool.updateTotal = function(){
    var used = 0;
    $.each(tool.allocations, function(k,v){
      used = used + v;
    });
    var remaining = tool.options.hours - used;
    $('#remaining').html(remaining);

    if(remaining < 0){
      $(tool.options.graphWrapper).addClass('overbudget').removeClass('zero');
    }else if(remaining == 0){
      $(tool.options.graphWrapper).removeClass('overbudget').addClass('zero');
    }else{
      $(tool.options.graphWrapper).removeClass('overbudget').removeClass('zero');
    }
  }

  tool.showWork = function(show){
    tool.options.showWork = show;
    tool.autoScale();
    tool.drawBars();
  }

  tool.showSleep = function(show){
    tool.options.showSleep = show;
    tool.autoScale();
    tool.drawBars();
  }

  tool.addAllocation = function(name, hours){
    tool.allocations[name] = hours;
    tool.updateTotal();
    tool.drawBars();
  }

}( window.bb = window.bb || {}, jQuery ));

$(document).ready(function(){
    bb.tool.init({}, {showSleep: false, showWork: false, barWidthMultiplier: 50});
    //bb.tool.init();

    $('#work-toggle').on('click', function(){
      bb.tool.showWork(!bb.tool.options.showWork);
    });
    $('#sleep-toggle').on('click', function(){
      bb.tool.showSleep(!bb.tool.options.showSleep);
    });

    $('#add-item').on('click', function(){
      var name = $('#add-name').val();
      var hours = $('#add-hours').val();

      if(name != '' && hours != '' && /^\d+$/.test(hours)){
        bb.tool.addAllocation($('#add-name').val(), parseInt($('#add-hours').val(), 10));
        $('#add-name').val('');
        $('#add-hours').val('');
      }
    });
});