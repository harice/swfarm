define([
	'backbone',
	'views/base/ReportView',
	'models/reports/ReportModel',
	'collections/trucker/TruckerCollection',
	'text!templates/reports/TruckersPayListTemplate.html',
	'global',
	'constant',
], function(
	Backbone,
	ReportView,			
	Report,
	TruckerCollection,
	truckerListTemplate,
	Global,
	Const
){

	var TruckersSearchView = ReportView.extend({
		
		initialize: function() {
			var thisObj = this;
			this.filterId = null;	
			this.filtername = "Truck Name";

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

		getFilterName: function (){
			var truckers = '<option disabled selected>Select Truck</option>';				
			_.each(this.collection.models, function (model) {	
				_.each(model.get('data'), function (truck) {
					truckers += '<option value="'+truck.id+'">'+truck.trucknumber +'</option>';													
				});						
			});
			
			return truckers;
		},			
				
		onclickgenerate: function() {
			var thisObj = this;					
			this.filterId = $("#filtername").val();

			if(this.checkFields()){	
				this.model.fetchTruckingStatement(this.filterId, this.startDate, this.endDate);
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
				'truckers': this.model,
			}

			_.extend(innerTemplateVariables,Backbone.View.prototype.helpers);
			var compiledTemplate = _.template(truckerListTemplate, innerTemplateVariables);

			$(".reportlist").removeClass("hidden");
			$("#report-list").removeClass("hidden");
			$("#report-list").html(compiledTemplate);
		},

		
	});

  return TruckersSearchView;
  
});