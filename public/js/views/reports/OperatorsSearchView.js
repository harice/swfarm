define([
	'backbone',
	'views/base/ReportView',
	'models/reports/ReportModel',
	'collections/contact/ContactCollection',
	'text!templates/reports/OperatorsFormTemplate.html',
	'text!templates/reports/OperatorsPayListTemplate.html',
	'global',
	'constant',
], function(
	Backbone,
	ReportView,			
	Report,
	ContactCollection,
	operatorFormTemplate,
	operatorListTemplate,
	Global,
	Const
){

	var OperatorSearchView = ReportView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			var thisObj = this;
			this.operatorId = null;		

			this.model = new Report();
			this.model.on('change', function (){
				thisObj.processData();
				this.off("change");
			});	

			this.collection = new ContactCollection();

			//Only display form when finished synching
			this.collection.on('sync', function (){
				thisObj.displayForm();										
				this.off('sync');
			})			

		},
		
		render: function(){					
			this.collection.getContactsByAccountType(4);
			Backbone.View.prototype.refreshTitle('Admin','Operator Pay');
		},				

		getOperators: function (){
			var operators = '<option value="">Select Operator</option>';			
			_.each(this.collection.models, function (model) {
				operators += '<option value="'+model.get('id')+'">'+model.get('firstname')+ ' ' +model.get('lastname') +'</option>';
			});

			return operators;
		},

		displayForm: function () {
			var thisObj = this;						
			var innerTemplateVariables = {
				'date': this.setCurDate(),
				'operators': this.getOperators(),
			};
			
			var innerTemplate = _.template(operatorFormTemplate, innerTemplateVariables);
						
			this.$el.find("#report-filter").html(innerTemplate);			
			this.focusOnFirstField();
			
			this.$el.find('.capitalize').textFormatter({type:'capitalize'});
			this.$el.find('.lowercase').textFormatter({type:'lowercase'});
				

			this.initCalendars();
			
			$('.form-button-container').show();		
		},				
				
		onclickgenerate: function() {			
			this.operatorId = $("#operatorname").val();			
			this.model.fetchOperatorsPay(this.operatorId, this.startDate, this.endDate);
		},

		processData: function() {
			var thisObj = this;
			
			var innerTemplateVariables= {
				'date_from': $('#filter-operator-date-start .input-group.date input').val(),
				'date_to': $('#filter-operator-date-end .input-group.date input').val(),
				'operators': this.model,
			}
			var compiledTemplate = _.template(operatorListTemplate, innerTemplateVariables);
			this.$el.find("#report-list").removeClass("hidden");
			this.$el.find("#report-list").html(compiledTemplate);
		},

		
	});

  return OperatorSearchView;
  
});