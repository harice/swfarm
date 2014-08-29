define([
	'backbone',
	'views/base/ReportView',
	'views/reports/OperatorsSearchView',
	'views/reports/ProducerSearchView',	
	'views/reports/TruckersSearchView',	
	'views/reports/CustomerSearchView',	
	'views/reports/DriverSearchView',	
	'models/reports/ReportModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/reports/ReportFormTemplate.html',
	'global',
	'constant',
], function(Backbone,
			ReportView,
			Operator,
			Producer,
			Trucker,
			Customer,
			Driver,
			Report,
			contentTemplate,
			reportFormTemplate,
			Global,
			Const
){

	var ReportView = ReportView.extend({
		el: $("#"+Const.CONTAINER.MAIN),	

		initialize: function (){			
			this.initSubContainer();
			var thisObj = this;
			this.startDate = null;
			this.endDate = null;

			this.displayFilter();			
		},
		render: function(){									
			Backbone.View.prototype.refreshTitle('Report','Generate');
		},										

		operator: function (){
			this.closeView();
			this.currView = new Operator();			
			this.currView.setElement($("#report-filter")).render();						
		},

		producer: function (){
			this.closeView();
			this.currView = new Producer();
			this.currView.setElement($("#report-filter")).render();					
		},

		trucker: function (){
			this.closeView();
			this.currView = new Trucker();			
			this.currView.setElement($("#report-filter")).render();					
		},
		
		customer: function (){
			this.closeView();
			this.currView = new Customer();			
			this.currView.setElement($("#report-filter")).render();			
		},

		driver: function (){
			this.closeView();
			this.currView = new Driver();			
			this.currView.setElement($("#report-filter")).render();			
		},
	});

  return ReportView;
  
});