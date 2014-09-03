define([
	'backbone',	
	'views/base/BarGraphView',
	'models/dashboard/DashboardModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/dashboard/barGraphTemplate.html',
	'global',
	'constant',
], function(
	Backbone,
	BarGraphView, 
	DashboardModel,
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
					
		},
		render: function(){	
			this.displayAdminDashboard();						
			Backbone.View.prototype.refreshTitle('Dashboard','View');
		},	

		displayAdminDashboard: function() {
			var thisObj = this;

			this.subContainer.html("<div class='row'></div>");

			_.each(this.model.get('reports'), function (graph) {
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
											

			});					
		},
		

	});

	 return DashboardView;
  
});