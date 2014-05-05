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
	'constant',
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
			var thisObj = this;
			this.slId = option.id;
			this.h1Title = 'Stack Location';
			this.h1Small = 'add';
			
			this.productCollection = new ProductCollection();
			this.productCollection.on('sync', function() {
				thisObj.displayForm();
				thisObj.supplyStackLocationData()
				this.off('sync');
			});
			this.productCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.model = new StackLocationModel({id:this.soId});
			this.model.on('change', function() {
				thisObj.productCollection.getAllModel();
				this.off('change');
			});
		},
		
		render: function(){
			this.model.runFetch();
		},
		
		supplyStackLocationData: function () {
			
		},
	});

	return StackLocationEditView;
  
});