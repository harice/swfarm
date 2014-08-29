define([
	'backbone',
	'views/base/ReportView',
	'models/reports/ReportModel',
	'collections/stack/LocationCollection',
	'text!templates/reports/FilterFormTemplate.html',
	'text!templates/reports/InventoryListTemplate.html',
	'global',
	'constant',
], function(
	Backbone,
	ReportView,			
	Report,
	LocationCollection,
	filterFormTemplate,
	inventoryListTemplate,
	Global,
	Const
){

	var InventorySearchView = ReportView.extend({	

		initialize: function() {
			var thisObj = this;
			this.filterId = null;	
			this.startDate = null;
			this.endDate = null;	

			this.model = new Report();
			this.model.on('change', function (){				
				thisObj.processData();;
				this.off("change");
			});			

			this.collection = new LocationCollection();			

		},
		
		render: function(){
			this.getLocationList();								
			Backbone.View.prototype.refreshTitle('Report','Inventory');
		},	

		getLocationList: function(){
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

		getLocations: function (){
			var locations = '<option disabled selected>Select Location</option>';			
			_.each(this.collection.models, function (model) {
				locations += '<option value="'+model.get('id')+'">'+model.get('locationName')+'</option>';
			});

			return locations;
		},

		displayForm: function () {
			var thisObj = this;	

			var innerTemplateVariables = {
				'date': this.setCurDate(),
				'filters': this.getLocations(),
				'filter_name': "Storage Location"
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
				this.model.fetchInventory(this.filterId, this.startDate, this.endDate);
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
				'locations': this.model,
			}
			var compiledTemplate = _.template(inventoryListTemplate, innerTemplateVariables);
			
			$("report-list").html('');
			$("#report-list").removeClass("hidden");
			$("#report-list").html(compiledTemplate);
		},



		
	});

  return InventorySearchView;
  
});