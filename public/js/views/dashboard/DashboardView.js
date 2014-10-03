define([
	'backbone',	
	'views/base/BarGraphView',
	'views/base/GoogleMapsView',
	'models/dashboard/GraphModel',
	'collections/dashboard/GraphCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/dashboard/barGraphTemplate.html',
	'text!templates/dashboard/dashboardTemplate.html',
	'global',
	'constant',
], function(
	Backbone,
	BarGraphView, 
	GoogleMapsView,
	GraphModel,
	GraphCollection,
	contentTemplate,
	barGraphTemplate,
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
				var label = false;
				var currency = '';
				var tickDecimals = 0;

				if(label) {
					currency = '$';
					tickDecimals = 2;
				}

				var elementId = $('.graph-cont[data-id='+ this.get('graphId') +'] .graph-container').attr('id');

				if($("#start-"+this.get('graphId') + " input").val() !='' && $("#end-"+this.get('graphId') + " input").val() != '')	{
					var graphId = this.get('graphId');
					var graphData = thisObj.formatGraphData(graphId, this.get('data'), this.get('graphType'));
					switch(this.get('graphType')){
						case Const.GRAPH.TYPE.STACKEDBAR:							
							thisObj.graphStackedData(elementId, graphData.data, graphData.xData, currency, tickDecimals);
							break;
						case Const.GRAPH.TYPE.BAR:
							thisObj.graphData(elementId, graphData.data, graphData.xData, currency, tickDecimals);
							break;
						default:
							break;
					}
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


		},
		render: function(){	
			this.graphCollection.getModels();			
			Backbone.View.prototype.refreshTitle('Dashboard','View');
		},	

		displayAdminDashboard: function() {
			var thisObj = this;	

			var initTemp = {		
				sub_content_template: dashboardTemplate
			};
			
			var dashboardTemp = _.template(contentTemplate, initTemp);

			thisObj.subContainer.html(dashboardTemp);

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

					default:
						thisObj.drawMap(graph);
						break;
				}
			});

			this.googleMaps = new GoogleMapsView();
			this.googleMaps.initGetMapLocation(function (data) {
				var index = $("#google-maps-modal-getlocation").attr('data-id', index);
				if(typeof data.location !== 'undefined') {
					thisObj.subContainer.find(".latitude[name='latitude."+ index +"']").val(data.location.lat());
					thisObj.subContainer.find(".longitude[name='longitude."+ index +"']").val(data.location.lng());
				}
				else {
					thisObj.subContainer.find('.latitude').val('');
					thisObj.subContainer.find('.longitude').val('');
				}
			});
			
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
