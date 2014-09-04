define([
	'backbone',
	'bootstrapdatepicker',
	'views/trucker/TruckerAddView',
	'jqueryvalidate',
	'jquerytextformatter',
	'models/trucker/TruckerModel',
	'collections/account/AccountCollection',
	'collections/account/AccountTypeCollection',
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
			AccountTypeCollection,
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
			this.truckerId = option.id;
			this.h1Title = 'Trucker';
			this.h1Small = 'edit';
			this.selectedTruckerAccountId = null;

			this.accountTypeCollection = new AccountTypeCollection();
			this.accountTypeCollection.on('sync', function() {
				if(thisObj.subContainerExist()) {
					thisObj.displayForm();
					thisObj.supplyTruckerData();
				}
				this.off('sync');
			});
			this.accountTypeCollection.on('error', function(collection, response, options) {
				this.off('error');
			});

			this.truckerAccountCollection = new AccountCollection();
			this.truckerAccountCollection.on('sync', function() {
				thisObj.generateTruckerDropdown();
                thisObj.hideFieldThrobber();
			});
			this.truckerAccountCollection.on('error', function(collection, response, options) {
				//this.off('error');
			});

			this.model = new TruckerModel({id:this.truckerId});
			this.model.on('change', function() {
				thisObj.accountTypeCollection.getTruckType();
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
			this.$el.find('#truckerAccountType_id').val(this.model.get('account').accounttype[0].id);
			this.fetchTruckerAccounts(this.model.get('account').accounttype[0].id, this.model.get('account').id);
			this.$el.find('#trucknumber').val(this.model.get('trucknumber'));
			this.$el.find('#fee').val(this.addCommaToNumber(this.model.get('fee')));
		},

		initDeleteConfirmation: function () {
			this.initConfirmationWindow('Are you sure you want to delete this Trucker?',
										'confirm-delete-trucker',
										'Delete');
		},
	});

	return TruckerEditView;

});