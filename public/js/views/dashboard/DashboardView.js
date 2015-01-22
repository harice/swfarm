define([
	'backbone',	
	'views/base/BarGraphView',
	'views/base/GoogleMapsView',
	'models/session/SessionModel',
	'models/dashboard/GraphModel',
	'models/dashboard/WoeIdModel',
	'collections/dashboard/WeatherCollection',
	'collections/dashboard/GraphCollection',	
	'text!templates/layout/contentTemplate.html',
	'text!templates/dashboard/dashboardTemplate.html',
	'global',
	'constant',
], function(
	Backbone,
	BarGraphView, 
	GoogleMapsView,
	SessionModel,
	GraphModel,
	WoeIdModel,
	WeatherCollection,
	GraphCollection,
	contentTemplate,
	dashboardTemplate,
	Global,
	Const
){

	var DashboardView = BarGraphView.extend({
		el: $("#"+Const.CONTAINER.MAIN),	
		index: 0,	

		initialize: function (){			
			this.initSubContainer();
			var thisObj = this;	
			
			this.isInitProcess = true;	
			this.changedData = null;
			this.changedId = null;
			this.changedType = null;
			this.options = {
			  enableHighAccuracy: true,
			  timeout: 10000,
			  maximumAge: 6000
			};
			this.woeId = null;			

			this.clockModel = new Backbone.Model({ time: new Date() });
			this.clockModel.on('change', function(){
				thisObj.updateTime();
			});

			setInterval(function(){
				thisObj.clockModel.set('time', new Date());
			}, 1000);

			this.model = new GraphModel();
			this.model.on("change", function() {
				var graphIdName = $('.graph-cont[data-id='+ this.get('graphId') +'] .graph-container').attr('id');

				switch(this.get('graphType')){
					case Const.GRAPH.TYPE.STACKEDBAR:
						if($("#start-"+this.get('graphId') + " input").val() !='' && $("#end-"+this.get('graphId') + " input").val() != '')	{
							var graphData = thisObj.drawGraph(this, graphIdName, this.get('graphId'));											
							thisObj.graphStackedData(graphIdName, graphData.data, graphData.xData, graphData.currency, graphData.tickDecimals);
						}
						break;

					case Const.GRAPH.TYPE.BAR:
						if($("#start-"+this.get('graphId') + " input").val() !='' && $("#end-"+this.get('graphId') + " input").val() != '')	{
							var graphData = thisObj.drawGraph(this, graphIdName, this.get('graphId'));											
							thisObj.graphData(graphIdName, graphData.data, graphData.xData, graphData.currency, graphData.tickDecimals);
						}
						break;				

					case Const.GRAPH.TYPE.SUMMARY:
						if($("#start-"+this.get('graphId') + " input").val() !='' && $("#end-"+this.get('graphId') + " input").val() != '')	{
							var graphData = thisObj.drawGraph(this, graphIdName, this.get('graphId'));
							thisObj.graphMultiSeriesGraph(graphIdName, graphData.data, graphData.xData, graphData.currency, graphData.tickDecimals);
						}						
						break;

					default:						
						break;
				}
			});
								
			this.graphCollection = new GraphCollection();
			this.graphCollection.on('sync', function() {	
				if(thisObj.isInitProcess) {
					if(thisObj.subContainerExist()) {
						thisObj.isInitProcess = false;
						thisObj.displayAdminDashboard();				
					}
				}				
			});			
			
			this.graphCollection.on('error', function(collection, response, options) {
				
			});			

			var geolocation = SessionModel.get('Latitude');				

			if(geolocation == null) {
				if(navigator.geolocation){
					navigator.geolocation.getCurrentPosition(function(position) {					
						SessionModel.set('Latitude', position.coords.latitude);
						SessionModel.set('Longitude', position.coords.longitude);	
						thisObj.getLocationResults();						
					});
				}	
			}
			else 			
				this.getLocationResults();
			
			
		},
		render: function(){	
			this.graphCollection.getModels();			
			Backbone.View.prototype.refreshTitle('Dashboard','View');			
		},
		
		updateTime: function(){

			this.$el.find("#curtime").text(Backbone.View.prototype.formatDate('h:i A', this.clockModel.get('time')));
			
		},

		getLocationResults: function(){
			var thisObj = this;

			this.woeIdModel = new WoeIdModel({latitude: SessionModel.get('Latitude'), longitude: SessionModel.get('Longitude')});	
			this.woeIdModel.fetch();								
			this.woeIdModel.on('sync', function(){	
				thisObj.getWoeId(thisObj.woeIdModel.get('query').results.Result.woeid, thisObj.woeIdModel.get('query').results.Result.city, thisObj.woeIdModel.get('query').results.Result.country);
				this.off('sync');
			});
		},

		getWoeId: function(woeid, city, country){	
			var thisObj = this;			
			var address = city + ', ' +  country;

			this.weatherCollection = new WeatherCollection({woeid: woeid});
			this.weatherCollection.fetch();		
			this.weatherCollection.on('sync', function(){						
				thisObj.getForecast(address);			
				this.off('sync');
			});

		},		

		displayAdminDashboard: function() {
			var thisObj = this;	

			thisObj.subContainer.html(dashboardTemplate);

			_.each(this.graphCollection.models, function (graph) {
				var graphIdName = graph.get('graphName').replace(/\s+/g, '_').toLowerCase();
				var graphId = graph.get('graphId');											
				
				switch(graph.get('graphType')){
					case Const.GRAPH.TYPE.STACKEDBAR:
						var graphData = thisObj.drawGraph(graph, graphIdName, graphId);											
						thisObj.graphStackedData(graphIdName, graphData.data, graphData.xData, graphData.currency, graphData.tickDecimals);
						break;
					case Const.GRAPH.TYPE.BAR:
						var graphData = thisObj.drawGraph(graph, graphIdName, graphId);	
						thisObj.graphData(graphIdName, graphData.data, graphData.xData, graphData.currency, graphData.tickDecimals);
						break;
					case Const.GRAPH.TYPE.MAP:
						thisObj.drawMap(graph, graphIdName, graphId);
						break;
					case Const.GRAPH.TYPE.LOGISTICS:
						thisObj.drawMap(graph, graphIdName, graphId);
						break;
					case Const.GRAPH.TYPE.SUMMARY:
						var graphData = thisObj.drawGraph(graph, graphIdName, graphId);
						break;
					default:						
						break;
				}
			});		
			
		},
		
		initStartEndCalendarFilter: function (id) {
			var thisObj = this;
			var startId = 'start-'+id;
			var endId = 'end-'+id;
			
			this.$el.find('#'+startId+' .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: this.dateFormat,
			}).on('changeDate', function (ev) {
				var graphId = $(ev.currentTarget).closest('.graph-cont').attr('data-id');
			
				var startDate = $('#'+startId+' .input-group.date input').val();
				thisObj.subContainer.find('#'+endId+' .input-group.date').datepicker('setStartDate', startDate);
				var sDate = null;
				if(startDate != '' && typeof startDate != 'undefined')
					sDate = thisObj.convertDateFormat(startDate, thisObj.dateFormat, 'yyyy-mm-dd', '-');
				
				var endDate = $('#'+endId+' .input-group.date input').val();
				var eDate = null;
				if(endDate != '' && typeof endDate != 'undefined')
					eDate = thisObj.convertDateFormat(endDate, thisObj.dateFormat, 'yyyy-mm-dd', '-');
				
				if(sDate != null && eDate != null) {
					thisObj.model.fetchGraphData(graphId, sDate, eDate);																
				}
				else {
					thisObj.model.fetchGraphData(graphId);				
				}
			});
			
			this.$el.find('#'+endId+' .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: this.dateFormat,
			}).on('changeDate', function (ev) {
				var graphId = $(ev.currentTarget).closest('.graph-cont').attr('data-id');
			
				var endDate = $('#'+endId+' .input-group.date input').val();
				thisObj.subContainer.find('#'+startId+' .input-group.date').datepicker('setEndDate', endDate);
				var eDate = '';
				if(endDate != '' && typeof endDate != 'undefined')
					eDate = thisObj.convertDateFormat(endDate, thisObj.dateFormat, 'yyyy-mm-dd', '-');
					
				var startDate = $('#'+startId+' .input-group.date input').val();
				var sDate = null;
				if(startDate != '' && typeof startDate != 'undefined')
					sDate = thisObj.convertDateFormat(startDate, thisObj.dateFormat, 'yyyy-mm-dd', '-');
					
				if(sDate != null && eDate != null) {
					thisObj.model.fetchGraphData(graphId, sDate, eDate);					
				}
				else
					thisObj.model.fetchGraphData(graphId);

			});
		},		

	});

	 return DashboardView;
  
});
