define([
	'backbone',
	'bootstrapdatepicker',
	'views/trailer/TrailerAddView',
	'jqueryvalidate',
	'jquerytextformatter',
	'models/trailer/TrailerModel',
	'collections/account/AccountCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/trailer/trailerAddTemplate.html',
	'global',
	'constant',
], function(Backbone,
			DatePicker,
			TrailerAddView,
			Validate,
			TextFormatter,
			TrailerModel,
			AccountCollection,
			contentTemplate,
			trailerAddTemplate,
			Global,
			Const
){

	var TrailerEditView = TrailerAddView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			var thisObj = this;
			this.trailerId = option.id;
			this.h1Title = 'Trailer';
			this.h1Small = 'add';
			
			this.trailerAccountCollection = new AccountCollection();
			this.trailerAccountCollection.on('sync', function() {
				thisObj.displayForm();
				thisObj.supplyTralerData();
				this.off('sync');
			});
			this.trailerAccountCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.model = new TrailerModel({id:this.trailerId});
			this.model.on('change', function() {
				thisObj.trailerAccountCollection.getTrailerAccounts();
				this.off('change');
			});
		},
		
		otherInitializations: function () {
			this.initDeleteConfirmation();
		},
		
		render: function(){
			this.model.runFetch();
		},
		
		supplyTralerData: function () {
			this.$el.find('#account_id').val(this.model.get('account_id'));
			this.$el.find('#number').val(this.model.get('number'));
		},
		
		initDeleteConfirmation: function () {
			this.initConfirmationWindow('Are you sure you want to delete this Trailer?',
										'confirm-delete-trailer',
										'Delete');
		},
	});

	return TrailerEditView;
  
});