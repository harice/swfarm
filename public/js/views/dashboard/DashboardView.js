define([
	'backbone',	
	'views/base/BarGraphView',
	'views/base/GoogleMapsView',
	'models/dashboard/GraphModel',
	'collections/dashboard/GraphCollection',
	'collections/dashboard/WeatherCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/dashboard/dashboardTemplate.html',
	'global',
	'constant',
], function(
	Backbone,
	BarGraphView, 
	GoogleMapsView,
	GraphModel,
	GraphCollection,
	WeatherCollection,
	contentTemplate,
	dashboardTemplate,
	Global,
	Const
){

	var DashboardView = BarGraphView.extend({
		el: $("#"+Const.CONTAINER.MAIN),		

		initialize: function (){			
			this.initSubContainer();
			var thisObj = this;	
			
			this.isInitProcess = true;	
			this.changedData = null;
			this.changedId = null;
			this.changedType = null;

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

			this.weatherCollection = new WeatherCollection();			

		},
		render: function(){	
			this.getWeatherForecast();
			this.graphCollection.getModels();			
			Backbone.View.prototype.refreshTitle('Dashboard','View');
		},	

		getWeatherForecast: function() {
			this.weatherCollection.fetch({
				success: function(collection, response, options){
					console.log(response);
				},
				error: function(collection, response, options){

				},
				headers: this.weatherCollection.getAuth()
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
