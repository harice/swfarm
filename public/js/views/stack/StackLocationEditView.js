define([
	'backbone',
	'bootstrapdatepicker',
	'views/stack/StackLocationAddView',
	'jqueryvalidate',
	'jquerytextformatter',
	'models/stack/StackLocationModel',
	'collections/account/AccountCollection',
	'collections/address/AddressCollection',
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
			AccountCollection,
			AddressCollection,
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

			this.options = {
				sectionFieldClone: null,
				sectionFieldCounter: 0,
				sectionFieldClass: ['name', 'description', 'id'],
				sectionFieldClassRequired: ['name'],
				sectionFieldExempt: [],
				sectionFieldSeparator: '.',
				removeComma: [],
			};

			this.producerAndWarehouseAccount = new AccountCollection();
			this.producerAndWarehouseAccount.on('sync', function() {
				if(thisObj.subContainerExist()) {
					thisObj.displayForm();
					thisObj.supplyStackLocationData();
				}
				this.off('sync');
			});
			this.producerAndWarehouseAccount.on('error', function(collection, response, options) {
				this.off('error');
			});

			this.model = new StackLocationModel({id:this.slId});
			this.model.on('change', function() {
				thisObj.producerAndWarehouseAccount.getProducerAndWarehouseAccount();
				this.off('change');
			});

			this.addressCollection = new AddressCollection();

		},

		otherInitializations: function () {
			this.initDeleteConfirmation();
		},

		render: function(){
			this.model.runFetch();
			Backbone.View.prototype.refreshTitle('Stack Location','edit');
		},

		supplyStackLocationData: function () {
			var thisObj = this;
			var section = this.model.get('section');

			this.subContainer.find('#account_id').val(this.model.get('account_id'));
			this.subContainer.find('#name').val(this.model.get('name'));
			this.subContainer.find('#description').val(this.model.get('description'));
			this.subContainer.find('#latitude').val(this.model.get('latitude'));
			this.subContainer.find('#longitude').val(this.model.get('longitude'));


			this.addressCollection.fetchStackAddress(this.model.get('account_id'));

			this.addressCollection.fetch({
				success: function (collection, response, options) {
					var address = thisObj.showAddressList();
					thisObj.$el.find('#address').html(address);
					var address_id = thisObj.model.get('address_id');
					thisObj.$el.find('#address').val(address_id);
				},
				error: function (collection, response, options) {
				},
				headers: this.addressCollection.getAuth()
			});


			var i= 0;
			_.each(section, function (s) {
				var sectionFields = (i > 0)? thisObj.addSection(): thisObj.subContainer.find('#section-list tbody .section-item:first-child');
				i++;

				sectionFields.find('.id').val(s.id);
				sectionFields.find('.name').val(s.name);
				sectionFields.find('.description').val(s.description);
			});
		},


		initDeleteConfirmation: function () {
			this.initConfirmationWindow('Are you sure you want to delete this Stack Location?',
										'confirm-delete-sl',
										'Delete',
                                        'Delete Stack Location');
		},

	});

	return StackLocationEditView;

});