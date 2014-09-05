define([
	'backbone',
	'views/base/ReportView',
	'models/reports/ReportModel',
	'collections/account/AccountCustomerCollection',
	'text!templates/reports/CustomersListTemplate.html',
	'global',
	'constant',
], function(
	Backbone,
	ReportView,			
	Report,
	AccountCustomerCollection,
	customersListTemplate,
	Global,
	Const
){

	var CustomerSearchView = ReportView.extend({
		
		initialize: function() {
			var thisObj = this;			
			this.filtername = "Customer's Name";

			this.model = new Report();
			this.model.on('change', function (){
				thisObj.processData(customersListTemplate);
				this.off("change");
			});	

			this.collection = new AccountCustomerCollection();

			//Only display form when finished synching
			this.collection.on('sync', function (){				
				thisObj.displayForm();																
				this.off('sync');
			})			

		},
		
		render: function(){	
			this.getProducerList();			
			Backbone.View.prototype.refreshTitle('Report','Customer Sales');			
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
				
			var customers = '<option disabled selected>Select Customer</option>';
			_.each(this.collection.models, function (model) {
				customers += '<option value="'+model.get('id')+'">'+model.get('name') +'</option>';
			});

			return customers;
		},			
				
		onclickgenerate: function() {
			var thisObj = this;			
			this.filterId = $("#filtername").val();
			
			if(this.checkFields()){							
				this.model.fetchCustomerSales(this.filterId, this.startDate, this.endDate);

				$("#report-form").collapse("toggle");
				$(".collapse-form").addClass("collapsed");
			}

			this.model.on('sync', function (){				
				thisObj.processData(customersListTemplate);				
				this.off("sync");
			});				

		},

		processData: function() {
			var thisObj = this;
			
			var innerTemplateVariables= {
				'cur_date': this.setCurDate(),
				'date_from': thisObj.parseDate($('#filter-operator-date-start .input-group.date input').val()),
				'date_to': thisObj.parseDate($('#filter-operator-date-end .input-group.date input').val()),
				'customers': this.model,
			}

			_.extend(innerTemplateVariables,Backbone.View.prototype.helpers);
			var compiledTemplate = _.template(customersListTemplate, innerTemplateVariables);

			$(".reportlist").removeClass("hidden");
			$("#report-list").removeClass("hidden");
			$("#report-list").html(compiledTemplate);
		},		

		
	});

  return CustomerSearchView;
  
});