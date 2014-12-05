define([
	'backbone',
	'views/base/ReportView',
	'models/reports/ReportModel',
	'collections/trucker/TruckerCollection',
	'text!templates/reports/TruckersPayListTemplate.html',
	'global',
	'constant',
], function(
	Backbone,
	ReportView,			
	Report,
	TruckerCollection,
	truckerListTemplate,
	Global,
	Const
){

	var TruckersSearchView = ReportView.extend({
		
		initialize: function() {
			var thisObj = this;			
			this.filtername = "Truck Name";
			this.title = "Trucking Statement";
			this.dataModel = "trucking-statement";					

			this.collection = new TruckerCollection();

			//Only display form when finished synching
			this.collection.on('sync', function (){																
				this.off('sync');
			});

			if(typeof this.otherInits != "undefined")		
				this.otherInits();						

		},
		
		render: function(){	
			this.getTruckersList();		
			Backbone.View.prototype.refreshTitle('Report','Trucking Statement');
		},	

		getTruckersList: function (){	
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
			var truckers = '<option disabled selected>Select Truck</option>';				
			_.each(this.collection.models, function (model) {	
				_.each(model.get('data'), function (truck) {
					truckers += '<option value="'+truck.id+'">'+truck.trucknumber +'</option>';													
				});						
			});
			
			return truckers;
		},	

		onclickgenerate: function(data) {
			var thisObj = this;	
			
			this.model = new Report();		
			this.model.fetchStatement(data['reporttype'], data['filtername'], data['transportdatestart'], data['transportdateend']);										
			this.model.on('change', function() {
				thisObj.processData(thisObj.model, truckerListTemplate, data['transportdatestart'], data['transportdateend']);
				this.off("change");
			});	
		},							

		
	});

  return TruckersSearchView;
  
});