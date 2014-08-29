define([
	'backbone',
	'views/base/ReportView',
	'models/reports/ReportModel',
	'collections/account/AccountProducerCollection',
	'text!templates/reports/FilterFormTemplate.html',
	'text!templates/reports/ProducersListTemplate.html',
	'global',
	'constant',
], function(
	Backbone,
	ReportView,			
	Report,
	AccountProducerCollection,
	filterFormTemplate,
	producersListTemplate,
	Global,
	Const
){

	var ProducerSearchView = ReportView.extend({		
		
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

			this.collection = new AccountProducerCollection();

			//Only display form when finished synching
			this.collection.on('sync', function (){				
				thisObj.displayForm();																
				this.off('sync');
			})			

		},
		
		render: function(){	

			this.getProducerList();			
			Backbone.View.prototype.refreshTitle('Report','Producer Statement');			
		},	

		getProducerList: function (){
			var thisObj = this;
			var keyword = "Pro";			
			this.collection.formatURL(keyword);
			this.collection.fetch({
				success: function (collection, response, options) {
					
				},
				error: function (collection, response, options) {
				},
				headers: this.collection.getAuth()
			});
		},

		getProducers: function(){
				
			var producers = '<option disabled selected>Select Producer</option>';
			_.each(this.collection.models, function (model) {
				producers += '<option value="'+model.get('id')+'">'+model.get('name') +'</option>';
			});

			return producers;
		},	
	
		displayForm: function () {
			var thisObj = this;	

			var innerTemplateVariables = {
				'date': this.setCurDate(),
				'filters': this.getProducers(),
				'filter_name': "Producer's Name"
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
				this.model.fetchProducersStatement(this.filterId, this.startDate, this.endDate);
			}

			this.model.on('sync', function (){				
				thisObj.processData();				
				this.off("sync");
			});	
		},

		processData: function() {
			var thisObj = this;
			
			var innerTemplateVariables= {
				'producers': this.model,
			}
			var compiledTemplate = _.template(producersListTemplate, innerTemplateVariables);

			$("report-list").html('');
			$("#report-list").removeClass("hidden");
			$("#report-list").html(compiledTemplate);
		},

		
	});

  return ProducerSearchView;
  
});