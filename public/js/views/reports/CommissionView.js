define([
	'backbone',
	'views/base/ReportView',
	'models/reports/ReportModel',
	'collections/user/UserCollection',
	'text!templates/reports/CommissionListTemplate.html',
	'global',
	'constant',
], function(
	Backbone,
	ReportView,			
	Report,
	UserCollection,
	commissionListTemplate,
	Global,
	Const
){

	var CommissionView = ReportView.extend({
		
		initialize: function() {
			var thisObj = this;			
			this.filtername = "User's Name";

			this.model = new Report();
			this.model.on('change', function (){
				thisObj.processData(customersListTemplate);
				this.off("change");
			});	

			this.collection = new UserCollection();

			//Only display form when finished synching
			this.collection.on('sync', function (){				
				thisObj.displayForm();																
				this.off('sync');
			})			

		},
		
		render: function(){	
			this.getProducerList();			
			Backbone.View.prototype.refreshTitle('Report','Commission Statement');			
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
				
			var customers = '<option disabled selected>Select User</option>';
			_.each(this.collection.models, function (model) {
				customers += '<option value="'+model.get('id')+'">'+model.get('name') +'</option>';
			});

			return customers;
		},			
				
		onclickgenerate: function() {
			var thisObj = this;			
			this.filterId = $("#filtername").val();
			
			if(this.checkFields()){							
				this.model.fetchCommissionStatement(this.filterId, this.startDate);

				$("#report-form").collapse("toggle");
				$(".collapse-form").addClass("collapsed");
			}

			this.model.on('sync', function (){				
				thisObj.processData(commissionListTemplate);				
				this.off("sync");
			});				

		},

		

		
	});

  return CommissionView;
  
});