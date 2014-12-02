define([
	'backbone',
	'views/base/ReportView',
	'models/reports/ReportModel',
	'collections/account/AccountCustomerCollection',
	'text!templates/reports/CustomersListTemplate.html',
	'global',
	'constant',
], function(
	Backbone,
	ReportView,			
	Report,
	AccountCustomerCollection,
	customersListTemplate,
	Global,
	Const
){

	var CustomerSearchView = ReportView.extend({
		
		initialize: function() {
			var thisObj = this;			
			this.filtername = "Customer's Name";
			this.title = "Customer Sales Report";
			this.dataModel = "customer-sales-statement";		

			this.collection = new AccountCustomerCollection();

			//Only display form when finished synching
			this.collection.on('sync', function (){				
				thisObj.displayForm();																
				this.off('sync');
			});

			if(typeof this.otherInits != "undefined")		
				this.otherInits();			
		},
		
		render: function(){	
			this.getProducerList();			
			Backbone.View.prototype.refreshTitle('Report','Customer Sales');			
		},	

		getProducerList: function (){
			var thisObj = this;
			
			this.collection.fetch({
				success: function (collection, response, options) {
					thisObj.displayForm();	
				},
				error: function (collection, response, options) {
				},
				headers: this.collection.getAuth()
			});
		},

		getFilterName: function(){
				
			var customers = '<option disabled selected>Select Customer</option>';
			_.each(this.collection.models, function (model) {
				customers += '<option value="'+model.get('id')+'">'+model.get('name') +'</option>';
			});

			return customers;
		},			
				
		onclickgenerate: function() {
			var thisObj = this;	
			var data = this.formatField($("#generateReportForm").serializeObject());
			
			this.model = new Report();		
			this.model.fetchStatement(data['reporttype'], data['filtername'], data['transportdatestart'], data['transportdateend']);													
			this.model.on('change', function() {
				thisObj.processData(thisObj.model, customersListTemplate);
				this.off("change");
			});	
		},		
		
	});

  return CustomerSearchView;
  
});