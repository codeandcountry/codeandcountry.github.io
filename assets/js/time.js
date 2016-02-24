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
    sleep: 0,
    work: 0,
    housework: 1,
    meals: 1,
    'morning routine': 0,
    kids: 0,
    spouse: 0,
    'side business': 0,
    'social time': 0
  }

  tool.options = {};
  tool.allocations = {};

  tool.init = function(allocations, options) {
    console.log('init');
    options = tool.options = tool.loadOptions(options);
    allocations = tool.allocations = tool.loadAllocations(allocations);
  };

  tool.initBudget = function(){
    tool.autoScale();
    tool.drawBars();
    tool.updateTotal();
  }

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
                    html: $('<div>', {class: 'allocation-handle ui-resizable-handle ui-resizable-e', 
                                      html: $('<div>', {class:'allocation-value', 
                                                        html: $('<span>', {html: v}), 'data-key': k})})
                    }))
            
        );
      }
    });

    tool.initResizable();
  }

  tool.resizeBars = function(){
    $.each(tool.allocations, function(k,v){
      if( tool.isAllocationVisible(k) ){
        $("div.resizable[data-key='"+k+"']").width(tool.getBarWidth(k));
      }
    });
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
    if (maxAllocation < 3) maxAllocation = 3;
    tool.options.barWidthMultiplier = (maxWidth / 2) / maxAllocation;
    $( ".resizable" ).resizable( "option", "grid", [tool.options.barWidthMultiplier, tool.options.barWidthMultiplier]);
    console.log('bwm='+tool.options.barWidthMultiplier)
  }

  tool.initResizable = function(){
    $( ".resizable" ).resizable(
      {
        handles: 'e',
        grid: [tool.options.barWidthMultiplier, tool.options.barWidthMultiplier],
        containment: "parent",
        minHeight: 35
      });

    $( ".resizable" ).on( "resize", function( event, ui ) {
      tool.setAllocation($(this).data('key'), ui.size.width);
      $(this).height(0);
    });    
    $( ".resizable" ).on( "resizestop", function( event, ui ) {
      console.log('stop');
      tool.autoScale();
      tool.resizeBars();
    });
  }

  tool.setAllocation = function(k, width){
    console.log('setAllocation: '+k+" : "+width);
    var allocation = Math.floor(width / tool.options.barWidthMultiplier);
    console.log('bwm='+tool.options.barWidthMultiplier);
    console.log('a='+allocation);
    tool.allocations[k] = allocation;
    $("div.allocation-value[data-key='"+k+"']").html(allocation);

    tool.updateTotal();
  }

  tool.updateTotal = function(){
    var used = 0;
    $.each(tool.allocations, function(k,v){
      console.log('used '+k+' = '+ v);
      used = used + v;
      console.log('used: '+used);
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

  tool.saveAnswer = function(question, answer){
    console.log('save: '+question+" | "+answer)
    switch(question){
      case 'sleep':
        //tool.setAllocation('sleep', answer);
        tool.allocations['sleep'] = parseInt(answer, 10) * 7;
        tool.showQuestion('have-work');
        break;
      case 'have-work':
        if(answer === 'yes'){
          tool.showQuestion('work');  
        }else{
          tool.saveAnswer('work', 0);
        }
        
        break;
      case 'work':
        tool.allocations['work'] = parseInt(answer, 10);
        tool.showBudget();
        tool.initBudget();
        break;
    }
  }

  tool.showQuestion = function(question){
    $('.question-wrapper').hide();
    $('#question-'+question).show();
  }

  tool.showBudget = function(){
    $('#qualifier-view').hide();
    $('#budget-view').show();
  }

}( window.bb = window.bb || {}, jQuery ));

$(document).ready(function(){
    bb.tool.init({}, {showSleep: false, showWork: false, barWidthMultiplier: 50});
    //bb.tool.init();

    $('.question-wrapper .next').on('click', function(){
      var question = $(this).data('question');
      var answer = $(this).siblings('.answer').val();
      bb.tool.saveAnswer(question, answer);
    });

    $('.question-wrapper #have-work-yes').on('click', function(){
      bb.tool.saveAnswer('have-work', 'yes');
    });

    $('.question-wrapper #have-work-no').on('click', function(){
      bb.tool.saveAnswer('have-work', 'no');
    });    

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