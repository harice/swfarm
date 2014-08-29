define([
	'backbone',
	'views/base/ReportView',
	'models/reports/ReportModel',
	'collections/trucker/TruckerCollection',
	'text!templates/reports/FilterFormTemplate.html',
	'text!templates/reports/TruckersPayListTemplate.html',
	'global',
	'constant',
], function(
	Backbone,
	ReportView,			
	Report,
	TruckerCollection,
	filterFormTemplate,
	truckerListTemplate,
	Global,
	Const
){

	var TruckersSearchView = ReportView.extend({
		
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

			this.collection = new TruckerCollection();

			//Only display form when finished synching
			this.collection.on('sync', function (){																
				this.off('sync');
			})			

		},
		
		render: function(){	
			this.getTruckersList();		
			Backbone.View.prototype.refreshTitle('Report','Trucking Statement');
		},	

		getTruckersList: function (){	
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

		getTruckers: function (){
			var truckers = '<option disabled selected>Select Truck</option>';				
			_.each(this.collection.models, function (model) {	
				_.each(model.get('data'), function (truck) {
					truckers += '<option value="'+truck.id+'">'+truck.trucknumber +'</option>';													
				});						
			});
			
			return truckers;
		},

		displayForm: function () {
			var thisObj = this;	
							
			var innerTemplateVariables = {
				'date': this.setCurDate(),
				'filters': this.getTruckers(),
				'filter_name': "Truck Name"
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
				this.model.fetchTruckingStatement(this.filterId, this.startDate, this.endDate);
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
				'truckers': this.model,
			}
			var compiledTemplate = _.template(truckerListTemplate, innerTemplateVariables);

			$("report-list").html('');
			$("#report-list").removeClass("hidden");
			$("#report-list").html(compiledTemplate);
		},

		
	});

  return TruckersSearchView;
  
});