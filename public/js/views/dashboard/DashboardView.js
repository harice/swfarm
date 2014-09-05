define([
	'backbone',	
	'views/base/BarGraphView',
	'models/dashboard/DashboardModel',
	'collections/dashboard/GraphCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/dashboard/barGraphTemplate.html',
	'global',
	'constant',
], function(
	Backbone,
	BarGraphView, 
	DashboardModel,
	GraphCollection,
	contentTemplate,
	barGraphTemplate,
	Global,
	Const
){

	var DashboardView = BarGraphView.extend({
		el: $("#"+Const.CONTAINER.MAIN),	

		initialize: function (){			
			this.initSubContainer();
			var thisObj = this;	
			
			this.model = new DashboardModel();	
			this.model.on('sync', function (){
				thisObj.displayAdminDashboard();
				this.off("sync");
			});				
			
			this.graphCollection = new GraphCollection();
			this.graphCollection.on('sync', function() {	
				if(thisObj.subContainerExist())
					thisObj.displayAdminDashboard();
				this.off('sync');
			});
			
			this.graphCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		render: function(){	
			this.graphCollection.getModels();				
			Backbone.View.prototype.refreshTitle('Dashboard','View');
		},	

		displayAdminDashboard: function() {
			var thisObj = this;

			this.subContainer.html("<div class='row'></div>"); console.log(this.graphCollection.models);
			
			_.each(this.graphCollection.models, function (graph) {
				var graphId = graph.get('graphName').replace(/\s+/g, '_').toLowerCase();
				var label = false;

				var innerTemplateVariables = {
					'graph_heading': graph.get('graphName'),
					'graph_id': graphId,
					'gid': graph.get('graphId'),
				};
				var graphInnerTemplate = _.template(barGraphTemplate, innerTemplateVariables);

				thisObj.subContainer.find('.row').append(graphInnerTemplate);
				
				var currency = '';
				var tickDecimals = 0;

				if(label) {
					currency = '$';
					tickDecimals = 2;
				}
				
				var graphData = thisObj.formatGraphData(graph.('data'), graph.get('graphType'));
				
				switch(graph.get('graphType')){
					case Const.GRAPH.TYPE.STACKEDBAR:
						//thisObj.graphStackedData(graph_id, graph.data, graph.xData, currency, tickDecimals);
						break;
					case Const.GRAPH.TYPE.BAR:
						//thisObj.graphData(graph_id, graph.data, graph.xData, currency, tickDecimals);
						break;
					default:
						break;
				}
			});
			
			/*_.each(this.model.get('reports'), function (graph) {
				var graph_id = graph.graphname.replace(/\s+/g, '_').toLowerCase();
				var label = graph.settings.currency;

				var innerTemplateVariables = {
					'graph_heading': graph.graphname,
					'graph_id': graph_id
				};

				var graphInnerTemplate = _.template(barGraphTemplate, innerTemplateVariables);

				if(thisObj.subContainerExist()) {					
					thisObj.subContainer.find('.row').append(graphInnerTemplate);
				}

				var currency = '';
				var tickDecimals = 0;

				if(label) {
					currency = '$';
					tickDecimals = 2;
				}

				switch(graph.settings.type){
					case "stackedbar":
						thisObj.graphStackedData(graph_id, graph.data, graph.xData, currency, tickDecimals);
						break;
					default:
						thisObj.graphData(graph_id, graph.data, graph.xData, currency, tickDecimals);
						break;
				}	
											

			});	*/
		},
		

	});

	 return DashboardView;
  
});