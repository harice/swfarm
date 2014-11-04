define([
	'backbone',
	'bootstrapdatepicker',	
	'jqueryflot',
	'jqueryflotresize',
	'jqueryflotlabels',
	'jqueryflotstackpercent',
	'jqueryflotbarnumbers',	
	'views/base/AppView',
	'views/base/GoogleMapsView',
	'text!templates/dashboard/barGraphTemplate.html',
	'text!templates/dashboard/weatherTemplate.html',
	'global',
	'constant',
], function(
	Backbone,
	DatePicker,
	Flot,
	FlotResize,
	FlotLabels,	
	FlotStackPercent,
	FlotBarNumbers,
	AppView, 
	GoogleMapsView,
	barGraphTemplate,
	weatherTemplate,
	Global,
	Const
){

	var BarGraphView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),

		graphData: function (id, data, xData, label, decimals){
			var thisObj = this;
			var barColor = "#3E7BC4";
			
			if(label != '')		
				barColor = "#990000";

			var graph = $.plot($("#"+id), data, {
		        series: {		          
		          bars: {
		            show: true,
		            barWidth: 0.6,
		            align: "center",
		            fill: true,
		            hoverable: true,
		            fillColor: {
		              colors: [{
		                opacity: 0.8
		              }, {
		                opacity: 1
		              }
		              ]
		            },
		            numbers: {
		            	show:true,
		            	xAlign: function(x,a) { return x; },
						yAlign: function(y,a) { return y; },
						label: label
		            },
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
		        colors: [barColor, "#FFFFFF", "#52e136"],
		        xaxis: {
		          ticks: xData		          
		        },
		        yaxis: {
		          ticks: 5,
		          tickFormatter: function (v,axis) {
		          	return label + thisObj.addCommaToNumber(v);
		          }
		        }
		    });

		    this.plotHover(id, label, decimals);
		},

		graphStackedData: function(id, data, xData, label, decimals) {		
			var options = {
		        series: {
		            stackpercent: true,
		            bars: {
		                show: true,
		                barWidth: 0.6,
		                lineWidth: 1,
		                hoverable:false,
		                fillColor: {
		                    colors:[
		                    	{opacity: .5 },
		                    	{opacity: .6 }
		                    ]
		                },
		                align: "center",
		                numbers :{
		                    show: true,
		                    xAlign: function(x) { return x; },
							yAlign: function(y) { return y - 1; },	
							font: '7pt Arial',	
							fontColor: '#000000',															
							showDataValue: true,
							label: label
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

			
		},

		graphMultiSeriesGraph: function(id, data, xData, label, decimals) {
			var thisObj = this;	
			var options = {
                xaxis: {                 
                    ticks: xData,
                    tickLength: 0,
                    tickDecimals: 0,
                }, 
                yaxis: {
                    tickFormatter: function (v,axis) {
			          	return label + thisObj.addCommaToNumber(v);
			          }
                }, 
                grid: {
                    labelMargin: 10,
                    axisMargin: 500,
                    hoverable: true,
                    clickable: true,
                    tickColor: "rgba(0,0,0,0.15)",
                    borderWidth: 0,
                    color: ""
                }, 
                legend : {
					show: true,
					noColumns: 2,
					backgroundOpacity:0,
					position: "ne",
					margin: -60,
					labelBoxBorderColor: "transparent",					
                }, 
                series: {                  
                    stackpercent : false,
                    bars: {
                        show: true,
                        lineWidth: 0,
                        barWidth: 0.35,
                        order:1,                     
                        numbers: {
		            		show:true,
		            		xAlign: function(x,a) { return x + .15; },
		            		yAlign: function(y,a) { return y; },
							showDataValue: true,
							label: label
		            	}
                    },
                }
            };

            $.plot($("#"+id), data[0].data, options);

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

			this.plotHover(id);
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
	    	if(currency == undefined)
	    		currency ='';

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
			var del = 0;
			var bal = 0;

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
						del = parseFloat(data[i].totalTonsDelivered);
						d[0].data.push([i, del]);	
						bal = parseFloat(data[i].totalTonsOrdered - data[i].totalTonsDelivered);									
						d[1].data.push([i, bal]);										
					}					
							
					graphData = d;

					break;
				case Const.GRAPH.TYPE.BAR:
					
					var d = [];
					for(var i = 0; i < data.length; i++) {	
						
						if(id == Const.GRAPH.ID.YEARTODATESALES) {
							graphXData.push([i, data[i].account]); 
							d.push([i, data[i].totalSales]); 
						}
						else if(id == Const.GRAPH.ID.INVENTORY) {
							graphXData.push([i, data[i].label]); 
							d.push([i, (data[i].value).replace(/,/g,'')]); 
						}
						else {							
							graphXData.push([i, data[i].label]); 
							d.push([i, data[i].value]); 
						}						
					}
					
					graphData.push({ data:d, yPositionAdjustLabel: -15 });
					
					break;

				case Const.GRAPH.TYPE.SUMMARY:
					var d = [];					
					var keys = Object.keys(data);

					d.push({
						label: 'incoming',
						data: [],
						bars: {fillColor: "#407EC9"}, 
						color: ["#407EC9"]
					});
					d.push({
						label: 'outgoing',
						data: [],
						bars: {fillColor: "#E41B17"}, 
						color: "#E41B17"
					});

					for(var x = 0; x < keys.length; x++) {
						graphXData.push([x+.4, keys[x]]);

						d[0].data.push([x, (data[keys[x]].incoming).replace(/,/g,'')]);										
						d[1].data.push([x + .4, (data[keys[x]].outgoing).replace(/,/g,'')]);
					}
				
					graphData.push({ data:d, yPositionAdjustLabel: -15 });

					break;
				default:
					var d = [];
					for(var i = 0; i < data.length; i++) {									
						d.push([i, (data[i].value).replace(/,/g,'')]);
						graphXData.push([i, data[i].label]); 
					}
					
					graphData.push({ data:d, yPositionAdjustLabel: -15 });

					break;
			}
			
			return { data: graphData, xData: graphXData, };
		},




		drawGraph: function(graph, graphIdName, graphId){
			var thisObj = this;
			var currency = '';
			var tickDecimals = 0;

			if(graphId == Const.GRAPH.ID.PURCHASEINDOLLARS || graphId == Const.GRAPH.ID.SALESINDOLLARS || graphId == Const.GRAPH.ID.YEARTODATESALES) {
				currency = '$';
				tickDecimals = 2;
			}

			if(thisObj.subContainer.find("#"+ graphIdName).length == 0){
				var innerTemplateVariables = {
					'graph_heading': this.setGraphTitle(graphId),
					'graph_id': graphIdName,
					'gid': graphId,
					'start_date_id': 'start-'+graphId,
					'end_date_id': 'end-'+graphId,				
				};
				var graphInnerTemplate = _.template(barGraphTemplate, innerTemplateVariables);
				thisObj.subContainer.find('#graph-cont').append(graphInnerTemplate);

				thisObj.initStartEndCalendarFilter(graphId);							
			}	

			var graphData = thisObj.formatGraphData(graphId, graph.get('data'), graph.get('graphType'));

			return { data: graphData.data, xData: graphData.xData, currency: currency, tickDecimals: tickDecimals };
		},


		drawMap: function (graph, graphIdName, graphId) {
			var lat = 33.393532;
			var lng = -112.315879;
			var thisObj = this;			
			var producers = graph.get('data');			
			var location = new google.maps.LatLng(lat, lng);
			var addr = '';
			var mapId = graphIdName + '-map-canvas-getlocation';

			this.googleMaps = new GoogleMapsView();			

			if(graphId == Const.GRAPH.ID.DASHBOARDLOGISTICS)
				mapId = this.googleMaps.mapCanvasIdGetDD;

			var innerTemplateVariables = {
				'graph_heading': this.setGraphTitle(graphId),
				'graph_id': graphIdName,
				'gid': graphId,
				'latitude': lat,
				'longitude': lng,
			};
			var graphInnerTemplate = _.template(barGraphTemplate, innerTemplateVariables);
			thisObj.subContainer.find('#graph-cont').append(graphInnerTemplate);

			thisObj.subContainer.find('#' +graphIdName).append("<div id="+ mapId +"></div>");
			thisObj.subContainer.find('#' +graphIdName).css({"width": "547px", "height": "300px"});
			thisObj.subContainer.find('#' +mapId).css({"width": "100%", "height": "100%"});			

			this.googleMaps.initGetDashboardMapLocation(mapId, location);
						
			if(graphId == Const.GRAPH.ID.DASHBOARDLOGISTICS)
				this.populateLogisticsMarkers(this.googleMaps, graph);
			else 
				this.populateMarkers(this.googleMaps, graph, location);	

		},

		setGraphTitle: function(graphId){
			var title;

			switch(graphId){
				case Const.GRAPH.ID.PURCHASEINTONS:
					title = 'Purchases in Tons';
					break;
				case Const.GRAPH.ID.PURCHASEINDOLLARS:
					title = 'Purchases in $';
					break;
				case Const.GRAPH.ID.SALESINTONS:
					title = 'Sales in Tons';
					break;
				case Const.GRAPH.ID.SALESINDOLLARS:
					title = 'Sales in $';
					break;
				case Const.GRAPH.ID.RESERVECUSTOMERS:
					title = 'Reserve Customers';
					break;
				case Const.GRAPH.ID.INVENTORY:
					title = 'Inventory on Hand';
					break;
				case Const.GRAPH.ID.YEARTODATESALES:
					title = 'Year to Year Sales in $';
					break;
				case Const.GRAPH.ID.DASHBOARDPURCHASES:
					title = 'Dashboard Purchases';
					break;
				case Const.GRAPH.ID.DASHBOARDSALES:
					title = 'Dashboard Sales';
					break;
				case Const.GRAPH.ID.DASHBOARDLOGISTICS:
					title = 'Dashboard Logistics';
					break;
				case Const.GRAPH.ID.LOGISTICSSUMMARY:
					title = 'Logistics Summary';
					break;
			}

			return title;
		},

		populateMarkers: function(googleMaps, graph, location) {
			var markers = [];
			markers.push({accountName: "SouthWest Farm", address: "11926 West Southern Avenue, Tolleson, Arizona, USA 85353", lat: location.k, lng: location.B});		

			_.each(graph.get('data'), function (acct) {
				_.each(acct.address, function(address){
					if(address.latitude && address.longitude) {					
						addr = address.street + ', ' + address.city + ', ' + address.address_states[0].state + ', USA';
						markers.push({accountName:acct.name, address: addr, lat:address.latitude, lng:address.longitude});
					}
				});
				
			});

			googleMaps.showDashboardSetLocation(markers, location);

		},

		populateLogisticsMarkers: function(googleMaps, graph) {	
			var markers = [];
			googleMaps.initMapDirectionService();

			_.each(graph.get('data'), function (transportsched) {
				_.each(transportsched.transportschedule, function(schedule){
					_.each(schedule.transportmap, function(transport){
						markers.push({latitudeFrom:transport.latitudeFrom, longitudeFrom:transport.longitudeFrom, latitudeTo:transport.latitudeTo, longitudeTo:transport.longitudeTo, distance: transport.distance, isLoadedDistance: transport.isLoadedDistance });
					});
				});
				
			});

			googleMaps.showGetDestinationRoute(markers);					
		},

		getForecast: function(city, region, country){
			var thisObj = this;
			var model = this.weatherCollection.models[0];
			var channels = model.get('query').results.channel.item;		

			if(typeof channels == "undefined")
				channels = model.get('query').results.channel[0].item;		
			
			var cityAddress = '';
			var regionAddress = '';

			if(city != null)
				cityAddress = city + ' ';

			if(region != null)
				regionAddress = region + ' ';

			var address = cityAddress + regionAddress + country;		

			thisObj.subContainer.find('#weather-cont').append("<div class='col-md-12'><h2>" + address + "</h2></div>");

			var variables = {
				'channel': channels
			};

			_.extend(variables,Backbone.View.prototype.helpers);
			var weatherInnerTemplate = _.template(weatherTemplate, variables);
			thisObj.subContainer.find('#weather-cont').append(weatherInnerTemplate);

		},
	});

	return BarGraphView;
});		