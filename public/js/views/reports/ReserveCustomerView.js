define([
	'backbone',
	'views/base/ReportView',
	'models/reports/ReportModel',
	'collections/account/AccountCustomerCollection',
	'text!templates/reports/ReserveCustomerListTemplate.html',
	'global',
	'constant',
], function(
	Backbone,
	ReportView,			
	Report,
	AccountCustomerCollection,
	ReserveCustomerListTemplate,
	Global,
	Const
){

	var TruckersSearchView = ReportView.extend({
		
		initialize: function() {
			var thisObj = this;			
			this.filtername = "Customer Name";
			this.title = "Reserve Customer";
			this.dataModel = "reserve-customer";					

			this.collection = new AccountCustomerCollection();

			//Only display form when finished synching
			this.collection.on('sync', function (){																
				this.off('sync');
			});

			if(typeof this.otherInits != "undefined")		
				this.otherInits();						

		},
		
		render: function(){	
			this.getReserveCustomerList();		
			Backbone.View.prototype.refreshTitle('Report','Reserve Customer');
		},	

		getReserveCustomerList: function (){	
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

		getFilterName: function (){
			var customers = '<option disabled selected>Select Customer</option>';				
			_.each(this.collection.models, function (customer) {	
				customers += '<option value="'+customer.id +'">'+ customer.get('name') +'</option>';						
			});
			
			return customers;
		},	

		onclickgenerate: function(data) {
			var thisObj = this;	
			
			this.model = new Report();		
			this.model.fetchStatement(data['reporttype'], data['filtername'], data['transportdatestart'], data['transportdateend']);										
			this.model.on('change', function() {
				thisObj.processData(thisObj.model, ReserveCustomerListTemplate, data['transportdatestart'], data['transportdateend']);
				this.off("change");
			});	
		},							

		
	});

  return TruckersSearchView;
  
});