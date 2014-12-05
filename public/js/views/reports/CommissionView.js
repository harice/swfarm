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
			this.title = "Commission Report";
			this.dataModel = "commission-statement";								

			this.collection = new UserCollection();

			//Only display form when finished synching
			this.collection.on('sync', function (){				
				thisObj.displayForm();																
				this.off('sync');
			});	

			if(typeof this.otherInits != "undefined")		
				this.otherInits();
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

		onclickgenerate: function(data) {
			var thisObj = this;	

			this.model = new Report();		
			this.model.fetchStatement(data['reporttype'], data['filtername'], data['transportdatestart'], data['transportdateend']);										
			this.model.on('change', function() {
				thisObj.processData(thisObj.model, commissionListTemplate, data['transportdatestart'], data['transportdateend']);
				this.off("change");
			});	
		},	
		
		
	});

  return CommissionView;
  
});