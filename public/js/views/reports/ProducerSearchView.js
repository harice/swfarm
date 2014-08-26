define([
	'backbone',
	'views/base/ReportView',
	'models/reports/ReportModel',
	'collections/contact/ContactCollection',
	'collections/account/AccountProducerCollection',
	'text!templates/reports/ProducersFormTemplate.html',
	'text!templates/reports/ProducersListTemplate.html',
	'global',
	'constant',
], function(
	Backbone,
	ReportView,			
	Report,
	ContactCollection,
	AccountProducerCollection,
	producersFormTemplate,
	producersListTemplate,
	Global,
	Const
){

	var OperatorSearchView = ReportView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			var thisObj = this;
			this.producerId = null;		

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
			//this.collection.getContactsByAccountType(5);
			this.getProducerList();			
			Backbone.View.prototype.refreshTitle('Admin','Producer Statement');			
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
				
			var producers = '<option value="">Select Producer</option>';
			_.each(this.collection.models, function (model) {
				producers += '<option value="'+model.get('id')+'">'+model.get('name') +'</option>';
			});

			return producers;
		},	
	
		displayForm: function () {
			var thisObj = this;	
							
			var innerTemplateVariables = {
				'date': this.setCurDate(),
				'producers': this.getProducers(),
			};
			
			var innerTemplate = _.template(producersFormTemplate, innerTemplateVariables);
						
			this.$el.find("#report-filter").html(innerTemplate);			
			this.focusOnFirstField();
			
			this.$el.find('.capitalize').textFormatter({type:'capitalize'});
			this.$el.find('.lowercase').textFormatter({type:'lowercase'});
				

			this.initCalendars();
			
			$('.form-button-container').show();		
		},				
				
		onclickgenerate: function() {			
			this.producerId = $("#producername").val();			
			this.model.fetchProducersStatement(this.producerId, this.startDate, this.endDate);
		},

		processData: function() {
			var thisObj = this;
			
			var innerTemplateVariables= {
				'date_from': $('#filter-operator-date-start .input-group.date input').val(),
				'date_to': $('#filter-operator-date-end .input-group.date input').val(),
				'producers': this.model,
			}
			var compiledTemplate = _.template(producersListTemplate, innerTemplateVariables);
			this.$el.find("#report-list").removeClass("hidden");
			this.$el.find("#report-list").html(compiledTemplate);
		},

		
	});

  return OperatorSearchView;
  
});