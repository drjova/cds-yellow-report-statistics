"use strict"
$(document).ready(function(){
  /*
   * Get the data from data.json file
   */
  var downloads;
  var views;
  var plot_options = {
    series: {
        bars: {
          show: true,
          barWidth: 0.6,
          align: "center",
        }
    },
    xaxis: {
      mode: "categories",
      tickLength: 0,
    },
    yaxis: {
      ticks: 20,
      min: 0,
    },
    grid: { hoverable: true, clickable: true }
  };
  function get_data(){
    var deferred = $.Deferred();
    $.get('scripts/data.json')
    .done(function(data){
      deferred.resolve(data);
    })
    .fail(function(){
      deferred.reject('Error');
    })
    return deferred.promise();
  }

  $.when(get_data()).then(function(results){
    downloads = results.downloads;
    views = results.views;
    create_download_plot(results.downloads);
    create_pageviews_plot(results.views);
    create_interactive_pageviews_plot(false);
    create_interactive_downloads_plot(false);
  }, function(error){
    alert(error);
  });

  function create_pageviews_plot(data){
    $.when(process_data(data)).done(function(processed){
      $.plot('#pageviews', [processed], plot_options)
    });
  }

  function create_download_plot(data){
    $.when(process_data(data)).done(function(processed){
      $.plot('#downloads', [processed], plot_options);
    });
  }
  function create_interactive_downloads_plot(report_id){
    if (report_id){
      $.when(process_interactive_data(downloads)).done(function(processed){
        $.plot('#contributions-downloads', [processed[report_id].data], plot_options)
      });
    }else{
      var choiceContainer = $("#choices-downloads");
      $.when(process_interactive_data(views)).done(function(processed){
        $.each(processed, function(key, val) {
            $('<option />', {
              value: key,
              text: val.label
            }).appendTo(choiceContainer)
        });
      });
      choiceContainer.on('change', function(){
        create_interactive_downloads_plot($(this).val())
      });
      choiceContainer.trigger('change');
    }
  }
  function create_interactive_pageviews_plot(report_id){
    if (report_id){
      $.when(process_interactive_data(views)).done(function(processed){
        $.plot('#contributions-pageviews', [processed[report_id].data], plot_options);
      });
    }else{
      var choiceContainer = $("#choices-pageviews");
      $.when(process_interactive_data(views)).done(function(processed){
        $.each(processed, function(key, val) {
            $('<option />', {
              'data-id':key,
              value: key,
              text: val.label
            }).appendTo(choiceContainer)
        });
      });
      choiceContainer.on('change', function(){
        create_interactive_pageviews_plot($(this).val())
      });
      choiceContainer.trigger('change');
    }
  }

  function process_data(data){
    var deferred = $.Deferred();
    var array = [];
    var i = 1;
    $.when(
      $.each(data, function(key, value){
        array.push(["CDS-2014-00"+i, value.total]);
        i++;
      })
    ).done(function(){
      deferred.resolve(array);
    })
    return deferred.promise();
  }

  function process_interactive_data(data){
    var deferred = $.Deferred();
    var result = {};
    var result_test = [];
    var i = 1;
    $.when(
      $.each(data, function(key, value){
        if (value.conferences !== undefined){
          result[key] = {
            label: "CDS-2014-00"+i,
            data: []
          }
          $.when(
            $.each(value.conferences, function(conf_key, conf_value){
              result[key]['data'].push([conf_key, conf_value]);
              result_test.push([conf_key, conf_value]);
            })
          ).done(function(){
          })
        }
        i++;
      })
    ).done(function(){
      deferred.resolve(result, result_test);
    })
    return deferred.promise();
  }
});
