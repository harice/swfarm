define([
	'backbone',
	'views/base/ReportView',
	'models/reports/ReportModel',
	'collections/contact/ContactCollection',
	'text!templates/reports/FilterFormTemplate.html',
	'text!templates/reports/DriversPayListTemplate.html',
	'global',
	'constant',
], function(
	Backbone,
	ReportView,			
	Report,
	ContactCollection,
	filterFormTemplate,
	driverListTemplate,
	Global,
	Const
){

	var DriverSearchView = ReportView.extend({
		
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
			this.collection.getContactsByAccountType(9);
			this.getDriversList();								
			Backbone.View.prototype.refreshTitle('Report','Driver Pay');
		},	

		getDriversList: function(){
			var thisObj = this;	

			this.collection.on('sync', function (){	
				thisObj.displayForm();																	
				this.off('sync');
			})	
		},			

		getDrivers: function (){
			var drivers = '<option disabled selected>Select Driver</option>';			
			_.each(this.collection.models, function (model) {
				drivers += '<option value="'+model.get('id')+'">'+model.get('firstname')+ ' ' +model.get('lastname') +'</option>';
			});

			return drivers;
		},

		displayForm: function () {
			var thisObj = this;	

			var innerTemplateVariables = {
				'date': this.setCurDate(),
				'filters': this.getDrivers(),
				'filter_name': "Driver's Name"
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
				this.model.fetchDriverStatement(this.filterId, this.startDate, this.endDate);
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
				'drivers': this.model,
			}
			var compiledTemplate = _.template(driverListTemplate, innerTemplateVariables);

			$("report-list").html('');
			$("#report-list").removeClass("hidden");
			$("#report-list").html(compiledTemplate);
		},



		
	});

  return DriverSearchView;
  
});