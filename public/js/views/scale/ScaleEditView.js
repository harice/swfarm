define([
	'backbone',
	'bootstrapdatepicker',
	'views/scale/ScaleAddView',
	'jqueryvalidate',
	'jquerytextformatter',
	'models/scale/ScaleModel',
	'collections/account/AccountCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/scale/scaleAddTemplate.html',
	'global',
	'constant',
], function(Backbone,
			DatePicker,
			ScaleAddView,
			Validate,
			TextFormatter,
			ScaleModel,
			AccountCollection,
			contentTemplate,
			scaleAddTemplate,
			Global,
			Const
){

	var ScaleEditView = ScaleAddView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			var thisObj = this;
			this.scaleId = option.id;
			this.h1Title = 'Scale';
			this.h1Small = 'edit';
			
			this.scalerAccountCollection = new AccountCollection();
			this.scalerAccountCollection.on('sync', function() {
				thisObj.displayForm();
				thisObj.supplyScaleData();
				this.off('sync');
			});
			this.scalerAccountCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.model = new ScaleModel({id:this.scaleId});
			this.model.on('change', function() {
				thisObj.scalerAccountCollection.getScalerAccounts();
				this.off('change');
			});
		},
		
		otherInitializations: function () {
			this.initDeleteConfirmation();
		},
		
		render: function(){
			this.model.runFetch();
		},
		
		supplyScaleData: function () {
			this.$el.find('#account_id').val(this.model.get('account_id'));
			this.$el.find('#name').val(this.model.get('name'));
			this.$el.find('#rate').val(parseFloat(this.model.get('rate')).toFixed(2));
		},
		
		initDeleteConfirmation: function () {
			this.initConfirmationWindow('Are you sure you want to delete this scale?',
										'confirm-delete-scale',
										'Delete');
		},
	});

	return ScaleEditView;
  
});