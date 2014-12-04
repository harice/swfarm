define([
	'backbone',
	'base64',
	'views/base/ReportView',
	'models/reports/ReportModel',
	'models/document/DocumentModel',
	'collections/contact/ContactCollection',
	'text!templates/reports/OperatorsPayListTemplate.html',
	'global',
	'constant',
], function(
	Backbone,
	Base64,
	ReportView,			
	Report,
	DocumentModel,
	ContactCollection,
	operatorListTemplate,
	Global,
	Const
){

	var OperatorSearchView = ReportView.extend({	

		initialize: function() {
			var thisObj = this;			
			this.filtername = "Operator's Name";
			this.title = "Operator's Pay Report";
			this.dataModel = "operator-statement";		
			
			this.collection = new ContactCollection();	

			if(typeof this.otherInits != "undefined")		
				this.otherInits();			

		},
		
		render: function(){
			this.collection.getContactsByAccountType(4);
			this.getOperatorsList();								
			Backbone.View.prototype.refreshTitle('Report','Operator Pay');
		},	

		getOperatorsList: function(){
			var thisObj = this;	

			this.collection.on('sync', function (){	
				thisObj.displayForm();																	
				this.off('sync');
			})	
		},			

		getFilterName: function (){
			var operators = '<option disabled selected>Select Operator</option>';			
			_.each(this.collection.models, function (model) {
				operators += '<option value="'+model.get('id')+'">'+model.get('firstname')+ ' ' +model.get('lastname') +'</option>';
			});

			return operators;
		},

		onclickgenerate: function(data) {
			var thisObj = this;	
			
			this.model = new Report();		
			this.model.fetchStatement(data['reporttype'], data['filtername'], data['transportdatestart'], data['transportdateend']);										
			this.model.on('change', function() {
				thisObj.processData(thisObj.model, operatorListTemplate);
				this.off("change");
			});	
		},											

		
	});

  return OperatorSearchView;
  
});