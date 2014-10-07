define([
	'backbone',
	'bootstrapdatepicker',	
	'jqueryflot',
	'jqueryflotresize',
	'jqueryflotlabels',
	'jqueryflotbarnumbers',
	'jqueryflotstackpercent',
	'views/base/AppView',
	'views/base/GoogleMapsView',
	'text!templates/dashboard/barGraphTemplate.html',
	'global',
	'constant',
], function(
	Backbone,
	DatePicker,
	Flot,
	FlotResize,
	FlotLabels,
	FlotBarNumbers,
	FlotStackPercent,
	AppView, 
	GoogleMapsView,
	barGraphTemplate,
	Global,
	Const
){

	var BarGraphView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),

		graphData: function (id, data, xData, label, decimals){		

			var graph = $.plot($("#"+id), data, {
		        series: {
		          bars: {
		            show: true,
		            barWidth: 0.6,
		            align: "center",
		            lineWidth: 0,
		            fill: true,
		            hoverable: true,
		            fillColor: {
		              colors: [{
		                opacity: 0.5
		              }, {
		                opacity: 1
		              }
		              ]
		            },
		            numbers: {
		            	show:true,
		            	xAlign: function(x,a) { return x; },
						yAlign: function(y,a) { return y+55; }
		            }
		          },
		          shadowSize: 2
		        },
		        legend:{
		          show: false
		        },
		        grid: {
		           labelMargin: 10,
		           axisMargin: 500,
		           hoverable: true,
		           clickable: true,
		           tickColor: "rgba(0,0,0,0.15)",
		           borderWidth: 0,
		           color: "green"
		        },
		        colors: ["#3E7BC4", "#FFFFFF", "#52e136"],
		        xaxis: {
		          ticks: xData,
		          tickDecimals: 0,
		          tickLength: 0
		        },
		        yaxis: {
		          ticks: 5,
		          tickFormatter: function (v,axis) {
		          	return label + v.toFixed(decimals);
		          }
		        }
		    });

		    this.plotHover(id, label, decimals);
		},

		graphStackedData: function(id, data, xData, label, decimals) {	
			var options = {
		        series: {
		            stackpercent : true,    // enable stackpercent
		            bars: {
		                show: true,
		                barWidth: 0.6,
		                lineWidth: 0,
		                hoverable:true,
		                fillColor: {
		                    colors:[
		                    	{opacity: 0.5 },
		                    	{opacity: 1 }
		                    ]
		                },
		                align: "center",
		                numbers :{
		                    show: true,
		                    xAlign: function(x) { return x; },
							yAlign: function(y) { return y+2; },
							showDataValue: true,
		                },
		            }
		        },
		        legend : {
					show: true,
					noColumns: 2,
					backgroundOpacity:0,
					position: "ne",
					margin: -60,
					labelBoxBorderColor: "transparent",					
		        },
		        colors: ["#3569A8", "#D7423D", "#52e136"],
				grid: {
					borderWidth: 0
				},
		        xaxis: {
		        	ticks: xData,
		        	tickSize : 1,
		        	tickLength: 0
		        },
		        yaxis: {
		        	max:100,
		        	tickFormatter: function (v, axis){
		        		return v + '%';
		        	}
		        }
		    }


			$.plot($("#"+id), data, options);	

			$("#"+id)
				.find('.legend table')
				.css({
					"width": "auto",
					"right": "0",
					"top": -100 + "px"				
				})
				.find('tr')
				.css("background", "#f8f8f8")
				.find('td')
				.css({
					"border": 0,
					"padding": "2px"
				});

			this.plotHoverStack(id);			
			
		},

		showTooltip: function(x, y, contents) {
	      $("<div id='tooltip'>" + contents + "</div>").css({
	        position: "absolute",
	        display: "none",
	        top: y + 5,
	        left: x + 5,
	        border: "1px solid #000",
	        padding: "5px",
	        'color':'#fff',
	        'border-radius':'2px',
	        'font-size':'11px',
	        "background-color": "#000",
	        opacity: 0.80
	      }).appendTo("body").fadeIn(200);
	    }, 

	    plotHover: function(id, currency, decimals) {
	    	var thisObj = this;
	    	var previousPoint = null;
	    	$("#"+id).bind("plothover", function (event, pos, item) {
      
	        var str = "(" + pos.x.toFixed(2) + ", " + pos.y.toFixed(2) + ")";

	        if (item) {
	          if (previousPoint != item.dataIndex) {
	            previousPoint = item.dataIndex;
	            $("#tooltip").remove();
	            var x = item.datapoint[0],
	            y = item.datapoint[1];
	            thisObj.showTooltip(item.pageX, item.pageY,
	            item.series.xaxis.ticks[x].label + " = " + currency + y.toFixed(decimals));
	          }
	        } else {
	          $("#tooltip").remove();
	          previousPoint = null;
	        }
	      }); 
	      
	    },

	    plotHoverStack: function(id) {

	    	var thisObj = this;
	    	var previousPoint = null;
	    	$("#"+id).bind("plothover", function (event, pos, item) {
      
	        var str = "(" + pos.x.toFixed(2) + ", " + pos.y.toFixed(2) + ")";

	        if (item) {
	          if (previousPoint != item.dataIndex) {
	            previousPoint = item.dataIndex;
	            $("#tooltip").remove();
	            var x = item.datapoint[0];
	            thisObj.showTooltip(item.pageX, item.pageY,
	            item.series.data.ticks[1][x].label);
	          }
	        } else {
	          $("#tooltip").remove();
	          previousPoint = null;
	        }
	      }); 
	      
	    },
		
		formatGraphData: function (id, data, type) { 
			var graphData = [];
			var graphXData = [];

			switch(type){
				case Const.GRAPH.TYPE.STACKEDBAR:			
					var d = [];					
					d.push({
						label: 'delivered',
						data: []
					});
					d.push({
						label: 'balance',
						data: []
					});

					for(var i = 0; i < data.length; i++) {						
						graphXData.push([i, data[i].name]); 
						d[0].data.push([i, data[i].totalTonsDelivered]);										
						d[1].data.push([i, data[i].totalTonsOrdered]);										
					}					
							
					graphData = d;

					break;
				case Const.GRAPH.TYPE.BAR:
					
					var d = [];
					for(var i = 0; i < data.length; i++) {	
						
						if(id == 7) {
							graphXData.push([i, data[i].account]); 
							d.push([i, data[i].totalSales]); 
						}
						else {							
							graphXData.push([i, data[i].label]); 
							d.push([i, data[i].value]); 
						}						
					}
					
					graphData.push({ data:d, yPositionAdjustLabel: -10 });
					
					break;
				default:
					var d = [];
					for(var i = 0; i < data.length; i++) {						
						d.push([i, data[i].value]);
						graphXData.push([i, data[i].label]); 
					}
					
					graphData.push({ data:d, yPositionAdjustLabel: -10 });

					break;
			}
			
			return { data: graphData, xData: graphXData, };
		},


		drawGraph: function(graph, graphIdName, graphId){
			var thisObj = this;
			var innerTemplateVariables = {
				'graph_heading': graph.get('graphName'),
				'graph_id': graphIdName,
				'gid': graphId,
				'start_date_id': 'start-'+graphId,
				'end_date_id': 'end-'+graphId,				
			};
			var graphInnerTemplate = _.template(barGraphTemplate, innerTemplateVariables);
			thisObj.subContainer.find('#graph-cont').append(graphInnerTemplate);

			thisObj.initStartEndCalendarFilter(graphId);
			
			var label = false;			
			var currency = '';
			var tickDecimals = 0;

			if(label) {
				currency = '$';
				tickDecimals = 2;
			}
			var graphData = thisObj.formatGraphData(graphId, graph.get('data'), graph.get('graphType'));

			return { data: graphData.data, xData: graphData.xData, currency: currency, tickDecimals: tickDecimals };
		},


		drawMap: function (graph, graphIdName, graphId) {
			var lat = 33.393532;
			var lng = -112.315879;
			var thisObj = this;

			var innerTemplateVariables = {
				'graph_heading': graph.get('graphName'),
				'graph_id': graphIdName,
				'gid': graphId,
				'latitude': lat,
				'longitude': lng,
			};
			var graphInnerTemplate = _.template(barGraphTemplate, innerTemplateVariables);
			thisObj.subContainer.find('#graph-cont').append(graphInnerTemplate);

			thisObj.subContainer.find('#' +graphIdName).append("<div id='map-canvas-getlocation'></div>");

			this.googleMaps = new GoogleMapsView();
			this.googleMaps.initGetDashboardMapLocation(function (data) {
				console.log("test");
			});
		},
	});

	return BarGraphView;
});		