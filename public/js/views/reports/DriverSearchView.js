define([
	'backbone',
	'views/base/ReportView',
	'models/reports/ReportModel',
	'collections/contact/ContactCollection',
	'text!templates/reports/DriversPayListTemplate.html',
	'global',
	'constant',
], function(
	Backbone,
	ReportView,			
	Report,
	ContactCollection,
	driverListTemplate,
	Global,
	Const
){

	var DriverSearchView = ReportView.extend({
		
		initialize: function() {
			var thisObj = this;			
			this.filtername = "Driver's Name";	
			this.title = "Driver's Pay Report";
			this.dataModel = "driver-pay-statement";			

			this.collection = new ContactCollection();			

			//Only display form when finished synching
			this.collection.on('sync', function (){				
				thisObj.displayForm();																
				this.off('sync');
			});	

			if(typeof this.otherInits != "undefined")		
				this.otherInits();
		},
		
		render: function(){
			this.collection.getContactsByAccountType(9);						
			Backbone.View.prototype.refreshTitle('Report','Driver Pay');
		},			

		getFilterName: function (){
			var drivers = '<option disabled selected>Select Driver</option>';			
			_.each(this.collection.models, function (model) {
				drivers += '<option value="'+model.get('id')+'">'+model.get('firstname')+ ' ' +model.get('lastname') +'</option>';
			});

			return drivers;
		},			
				
		onclickgenerate: function(data) {
			var thisObj = this;	
			
			this.model = new Report();	
			this.model.fetchStatement(data['reporttype'], data['filtername'], data['transportdatestart'], data['transportdateend']);													
			this.model.on('change', function() {
				thisObj.processData(thisObj.model, driverListTemplate);
				this.off("change");
			});	
		},

		
	});

  return DriverSearchView;
  
});