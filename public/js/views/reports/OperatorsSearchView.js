define([
	'backbone',
	'views/base/ReportView',
	'models/reports/ReportModel',
	'collections/contact/ContactCollection',
	'text!templates/reports/FilterFormTemplate.html',
	'text!templates/reports/OperatorsPayListTemplate.html',
	'global',
	'constant',
], function(
	Backbone,
	ReportView,			
	Report,
	ContactCollection,
	filterFormTemplate,
	operatorListTemplate,
	Global,
	Const
){

	var OperatorSearchView = ReportView.extend({	

		initialize: function() {
			var thisObj = this;
			this.filterId = null;	
			this.startDate = null;
			this.endDate = null;	

			this.model = new Report();
			this.model.on('change', function (){				
				thisObj.processData();
				this.off("change");
			});			

			this.collection = new ContactCollection();			

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

		getOperators: function (){
			var operators = '<option disabled selected>Select Operator</option>';			
			_.each(this.collection.models, function (model) {
				operators += '<option value="'+model.get('id')+'">'+model.get('firstname')+ ' ' +model.get('lastname') +'</option>';
			});

			return operators;
		},

		displayForm: function () {
			var thisObj = this;	

			var innerTemplateVariables = {
				'date': this.setCurDate(),
				'filters': this.getOperators(),
				'filter_name': "Operator's Name"
			};
			
			var innerTemplate = _.template(filterFormTemplate, innerTemplateVariables);
					
			this.$el.html(innerTemplate);		
			this.focusOnFirstField();					
						
			$('.form-button-container').show();		
		},				
				
		onclickgenerate: function() {
			var thisObj = this;			
			this.filterId = $("#filtername").val();		
			if(this.checkFields()){								
				this.model.fetchOperatorsPay(this.filterId, this.startDate, this.endDate);
			}

			this.model.on('sync', function (){				
				thisObj.processData();				
				this.off("sync");
			});	
		},

		processData: function() {
			var thisObj = this;
			
			var innerTemplateVariables= {
				'date_from': $('#filter-operator-date-start .input-group.date input').val(),
				'date_to': $('#filter-operator-date-end .input-group.date input').val(),
				'operators': this.model,
			}
			var compiledTemplate = _.template(operatorListTemplate, innerTemplateVariables);
			
			$("report-list").html('');
			$("#report-list").removeClass("hidden");
			$("#report-list").html(compiledTemplate);
		},



		
	});

  return OperatorSearchView;
  
});