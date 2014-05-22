define([
	'backbone',
	'bootstrapdatepicker',
	'views/stack/StackLocationAddView',
	'jqueryvalidate',
	'jquerytextformatter',
	'models/stack/StackLocationModel',
	'collections/product/ProductCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/stack/stackLocationAddTemplate.html',
	'global',
	'constant'
], function(Backbone,
			DatePicker,
			StackLocationAddView,
			Validate,
			TextFormatter,
			StackLocationModel,
			ProductCollection,
			contentTemplate,
			stackLocationAddTemplate,
			Global,
			Const
){

	var StackLocationEditView = StackLocationAddView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			this.initSubContainer();
			var thisObj = this;
			this.slId = option.id;
			this.h1Title = 'Stack Location';
			this.h1Small = 'add';
			
			this.productCollection = new ProductCollection();
			this.productCollection.on('sync', function() {
				if(thisObj.subContainerExist()) {
					thisObj.displayForm();
					thisObj.supplyStackLocationData();
				}
				this.off('sync');
			});
			this.productCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.model = new StackLocationModel({id:this.slId});
			this.model.on('change', function() {
				thisObj.productCollection.getAllModel();
				this.off('change');
			});
		},
		
		otherInitializations: function () {
			this.initDeleteConfirmation();
		},
		
		render: function(){
			this.model.runFetch();
		},
		
		supplyStackLocationData: function () {
			this.$el.find('#location').val(this.model.get('location'));
			this.$el.find('#stacknumber').val(this.model.get('stacknumber'));
			this.$el.find('#product_id').val(this.model.get('product_id'));
		},
		
		initDeleteConfirmation: function () {
			this.initConfirmationWindow('Are you sure you want to delete this Stock Location?',
										'confirm-delete-sl',
										'Delete');
		},
	});

	return StackLocationEditView;
  
});