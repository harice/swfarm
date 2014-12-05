define([
	'backbone',
	'bootstrapmultiselect',
	'views/base/ReportView',
	'models/reports/ReportModel',
	'collections/reports/StackListByProductCollection',
	'collections/product/ProductCollection',
	'text!templates/reports/FilterFormTemplate.html',
	'text!templates/reports/InventoryListTemplate.html',
	'text!templates/reports/InventoryFormTemplate.html',
	'global',
	'constant',
], function(
	Backbone,
	bootstrapMultiSelect,
	ReportView,			
	Report,
	StackListByProductCollection,
	ProductCollection,
	filterFormTemplate,
	inventoryListTemplate,
	inventoryFormTemplate,
	Global,
	Const
){

	var InventorySearchView = ReportView.extend({	

		initialize: function() {	
			this.events = _.extend({}, ReportView.prototype.events, this.events);

			var thisObj = this;			
			this.filtername = "Product";
			this.title = "Inventory Report";
			this.dataModel = "inventory-report";				

			this.collection = new ProductCollection();
			this.productCollection = new StackListByProductCollection();

			if(typeof this.otherInits != "undefined")		
				this.otherInits();	
		},
		
		render: function(){
			this.getProducts();									
			Backbone.View.prototype.refreshTitle('Report','Inventory');
		},	

		
		getProducts: function(){
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

		displayForm: function () {
			var thisObj = this;	

			var innerTemplateVariables = {
				'filters': this.getFilterName(),
				'filter_name': thisObj.filtername
			};
			
			var innerTemplate = _.template(filterFormTemplate, innerTemplateVariables);
						
			this.$el.html(innerTemplate);			
			this.focusOnFirstField();	

			$('#generate').removeClass("hidden");											
		},

		showFilter: function(ev) {
			var thisObj = this;
			var prodId = $(ev.target).val();
			var variables = {};	
			this.productCollection.getStackNumbersByProduct(prodId);			

			this.productCollection.on('sync', function(){
				variables['filters'] = thisObj.productCollection.models;
				var innerTemplate = _.template(inventoryFormTemplate, variables);
				$('.additional-filter').html(innerTemplate);

				$('#stacknumbers').multiselect({
					buttonClass: 'btn btn-default btn-sm',
					includeSelectAllOption: true,
					includeSelectAllIfMoreThan:5,
		        	enableFiltering: true,
		        	enableCaseInsensitiveFiltering: true,
		        	disableIfEmpty: true,
		        	maxHeight: 250,
		        	nonSelectedText: 'Select Stack Number(s)',
		        	nSelectedText: 'stacknumbers selected',
		        	selectedClass: null,
		        	selectAllValue: '',
		        	checkboxName: 'stacknumbers',
		            templates: {
		            	filter: '<div class="input-group input-group-sm margin-right-10 margin-left-5"><span class="input-group-addon"><i class="fa fa-search"></i></span><input class="form-control multiselect-search" type="text"></div>',
		            }
				});	
				this.off('sync');
			});		

			$('.form-button-container, .additional-filter').removeClass("hidden");																	

		},
		
		getFilterName: function (){
			var products = '<option disabled selected>Select Product</option>';			
			_.each(this.collection.models[0].get('data'), function (model) {
				products += '<option value="'+model.id+'">'+model.name+'</option>';
			});
			return products;
		},		

		onclickgenerate: function(data) {
			var thisObj = this;				
			
			this.model = new Report();		
			this.model.fetchInventory(data['stacknumbers'], data['transportdatestart'], data['transportdateend']);													
			this.model.on('change', function() {
				thisObj.processData(thisObj.model, inventoryListTemplate, data['transportdatestart'], data['transportdateend']);
				this.off("change");
			});				
		},	

		events: {				
			'change #filtername': 'showFilter',
		},

		
	});

  return InventorySearchView;
  
});