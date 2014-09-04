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
				thisObj.processData(commissionListTemplate);
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
			this.getUserList();			
			Backbone.View.prototype.refreshTitle('Report','Commission Statement');			
		},	

		getUserList: function (){
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
				
			var customers = '<option disabled selected>Select User</option>';
			_.each(this.collection.models, function (model) {
				_.each(model.get('data'), function (data) {
					customers += '<option value="'+data.id+'">'+data.firstname + ' ' + data.lastname +'</option>';
				});
			});

			return customers;
		},			
				
		onclickgenerate: function() {
			var thisObj = this;			
			this.filterId = $("#filtername").val();
			
			if(this.checkFields()){							
				this.model.fetchCommissionStatement(this.filterId, this.startDate, this.endDate);

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