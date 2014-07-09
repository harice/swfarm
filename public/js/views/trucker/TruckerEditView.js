define([
	'backbone',
	'bootstrapdatepicker',
	'views/trucker/TruckerAddView',
	'jqueryvalidate',
	'jquerytextformatter',
	'models/trucker/TruckerModel',
	'collections/account/AccountCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/trucker/truckerAddTemplate.html',
	'global',
	'constant',
], function(Backbone,
			DatePicker,
			TruckerAddView,
			Validate,
			TextFormatter,
			TruckerModel,
			AccountCollection,
			contentTemplate,
			truckerAddTemplate,
			Global,
			Const
){

	var TruckerEditView = TruckerAddView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			this.initSubContainer();
			var thisObj = this;
			this.trailerId = option.id;
			this.h1Title = 'Trucker';
			this.h1Small = 'edit';
			
			this.truckerAccountCollection = new AccountCollection();
			this.truckerAccountCollection.on('sync', function() {
				if(thisObj.subContainerExist()) {
					thisObj.displayForm();
					thisObj.supplyTruckerData();
				}
				this.off('sync');
			});
			this.truckerAccountCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.model = new TruckerModel({id:this.trailerId});
			this.model.on('change', function() {
				thisObj.truckerAccountCollection.getTrailerAccounts();
				this.off('change');
			});
		},
		
		otherInitializations: function () {
			this.initDeleteConfirmation();
		},
		
		render: function(){
			this.model.runFetch();
			Backbone.View.prototype.refreshTitle(this.h1Title,this.h1Small);
		},
		
		supplyTruckerData: function () {
			this.$el.find('#account_id').val(this.model.get('account_id'));
			this.$el.find('#number').val(this.model.get('number'));
		},
		
		initDeleteConfirmation: function () {
			this.initConfirmationWindow('Are you sure you want to delete this Trucker?',
										'confirm-delete-trucker',
										'Delete');
		},
	});

	return TruckerEditView;
  
});