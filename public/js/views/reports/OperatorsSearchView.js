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
			this.filterId = null;	
			this.filtername = "Operator's Name";

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

		getFilterName: function (){
			var operators = '<option disabled selected>Select Operator</option>';			
			_.each(this.collection.models, function (model) {
				operators += '<option value="'+model.get('id')+'">'+model.get('firstname')+ ' ' +model.get('lastname') +'</option>';
			});

			return operators;
		},				
				
		onclickgenerate: function() {
			var thisObj = this;			
			this.filterId = $("#filtername").val();
				
			if(this.checkFields()){								
				this.model.fetchOperatorsPay(this.filterId, this.startDate, this.endDate);
				$("#report-form").collapse("toggle");
				$(".collapse-form").addClass("collapsed");
			}

			this.model.on('sync', function (){				
				thisObj.processData();				
				this.off("sync");
			});	
		},

		processData: function() {
			var thisObj = this;
			
			var innerTemplateVariables= {
				'cur_date': this.setCurDate(),
				'date_from': thisObj.parseDate($('#filter-operator-date-start .input-group.date input').val()),
				'date_to': thisObj.parseDate($('#filter-operator-date-end .input-group.date input').val()),
				'operators': this.model,
				print_url : Const.URL.FILE +'?q='+ Base64.encode(Backbone.View.prototype.serialize({id:this.model.id, type:'pdf', model:'order'})),
			}

			_.extend(innerTemplateVariables,Backbone.View.prototype.helpers);
			var compiledTemplate = _.template(operatorListTemplate, innerTemplateVariables);
			
			$(".reportlist").removeClass("hidden");
			$("#report-list").removeClass("hidden");
			$("#report-list").html(compiledTemplate);
		},

		showPDF: function (ev) {
			// console.log('showPDF');
			this.model = new DocumentModel({id:$(ev.currentTarget).attr('data-id')});
			this.model.on('change', function() {
				
			});
			this.model.runFetch();
			
			return false;
		},

		
	});

  return OperatorSearchView;
  
});