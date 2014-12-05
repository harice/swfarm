define([
	'backbone',
	'views/base/ReportView',
	'models/reports/ReportModel',	
	'collections/account/AccountProducerCollection',
	'text!templates/reports/ProducersListTemplate.html',
	'global',
	'constant',
], function(
	Backbone,
	ReportView,			
	Report,
	AccountProducerCollection,
	producersListTemplate,
	Global,
	Const
){

	var ProducerSearchView = ReportView.extend({		
		
		initialize: function() {
			var thisObj = this;		
			this.filtername = "Producer's Name";				
			this.title = "Producer Statement";
			this.dataModel = "producer-statement";					

			this.collection = new AccountProducerCollection();

			//Only display form when finished synching
			this.collection.on('sync', function (){				
				thisObj.displayForm();																
				this.off('sync');
			})	

			if(typeof this.otherInits != "undefined")		
				this.otherInits();			

		},
		
		render: function(){	
			this.getProducerList();			
			Backbone.View.prototype.refreshTitle('Report','Producer Statement');			
		},	

		getProducerList: function (){
			var thisObj = this;				
			
			this.collection.fetch({
				success: function (collection, response, options) {
					
				},
				error: function (collection, response, options) {
				},
				headers: this.collection.getAuth()
			});
		},

		getFilterName: function(){
				
			var producers = '<option disabled selected>Select Producer</option>';
			_.each(this.collection.models, function (model) {
				producers += '<option value="'+model.get('id')+'">'+model.get('name') +'</option>';
			});

			return producers;
		},					

		onclickgenerate: function(data) {
			var thisObj = this;	
			
			this.model = new Report();		
			this.model.fetchStatement(data['reporttype'], data['filtername'], data['transportdatestart'], data['transportdateend']);										
			this.model.on('change', function() {
				thisObj.processData(thisObj.model, producersListTemplate, data['transportdatestart'], data['transportdateend']);
				this.off("change");
			});	
		},		
		
	});

  return ProducerSearchView;
  
});