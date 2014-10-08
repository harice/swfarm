define([
	'backbone',
	'views/base/ReportView',
	'views/reports/OperatorsSearchView',
	'views/reports/ProducerSearchView',	
	'views/reports/TruckersSearchView',	
	'views/reports/CustomerSearchView',	
	'views/reports/DriverSearchView',
	'views/reports/InventorySearchView',
	'views/reports/GrossProfitView',
	'views/reports/CommissionView',	
	'models/reports/ReportModel',	
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
			Inventory,
			GrossProfit,
			CommissionView,
			Report,			
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
			this.reportId = null;
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

		inventory: function (){
			this.closeView();
			this.currView = new Inventory();			
			this.currView.setElement($("#report-filter")).render();	
		},

		gross: function (){
			this.closeView();
			this.currView = new GrossProfit();			
			this.currView.setElement($("#report-filter")).render();	
		},

		commission: function() {
			this.closeView();
			this.currView = new CommissionView();
			this.currView.setElement($("#report-filter")).render();	
		},

		

	});

  return ReportView;
  
});