define([
	'backbone',
	'views/base/ReportView',
	'models/reports/ReportModel',
	'collections/account/AccountCustomerCollection',
	'text!templates/reports/FilterFormTemplate.html',
	'text!templates/reports/CustomersListTemplate.html',
	'global',
	'constant',
], function(
	Backbone,
	ReportView,			
	Report,
	AccountCustomerCollection,
	filterFormTemplate,
	customersListTemplate,
	Global,
	Const
){

	var CustomerSearchView = ReportView.extend({
		
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
			var keyword = "Cus";
			this.collection.formatURL(keyword);
			this.collection.fetch({
				success: function (collection, response, options) {
					
				},
				error: function (collection, response, options) {
				},
				headers: this.collection.getAuth()
			});
		},

		getCustomers: function(){
				
			var customers = '<option disabled selected>Select Customer</option>';
			_.each(this.collection.models, function (model) {
				customers += '<option value="'+model.get('id')+'">'+model.get('name') +'</option>';
			});

			return customers;
		},	
	
		displayForm: function () {
			var thisObj = this;	

			var innerTemplateVariables = {
				'date': this.setCurDate(),
				'filters': this.getCustomers(),
				'filter_name': "Customer's Name"
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
				this.model.fetchCustomerSales(this.filterId, this.startDate, this.endDate);
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
				'customers': this.model,
			}
			var compiledTemplate = _.template(customersListTemplate, innerTemplateVariables);

			$("report-list").html('');
			$("#report-list").removeClass("hidden");
			$("#report-list").html(compiledTemplate);
		},

		
	});

  return CustomerSearchView;
  
});