define([
	'backbone',
	'views/base/ReportView',
	'models/reports/ReportModel',
	'collections/stack/LocationCollection',
	'text!templates/reports/InventoryListTemplate.html',
	'global',
	'constant',
], function(
	Backbone,
	ReportView,			
	Report,
	LocationCollection,
	inventoryListTemplate,
	Global,
	Const
){

	var InventorySearchView = ReportView.extend({	

		initialize: function() {
			var thisObj = this;
			this.filterId = null;	
			this.filtername = "Storage Location";

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

		getFilterName: function (){
			var locations = '<option disabled selected>Select Location</option>';			
			_.each(this.collection.models, function (model) {
				locations += '<option value="'+model.get('id')+'">'+model.get('name')+'</option>';
			});

			return locations;
		},
			
		onclickgenerate: function() {
			var thisObj = this;			
			this.filterId = $("#filtername").val();
				
			if(this.checkFields()){								
				this.model.fetchInventory(this.filterId, this.startDate, this.endDate);
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
				'locations': this.model,
			}
			var compiledTemplate = _.template(inventoryListTemplate, innerTemplateVariables);
			
			$(".reportlist").removeClass("hidden");
			$("#report-list").removeClass("hidden");
			$("#report-list").html(compiledTemplate);
		},



		
	});

  return InventorySearchView;
  
});