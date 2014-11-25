define([
	'backbone',
	'views/account/AccountAddView',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'bootstrapmultiselect',
	'models/account/AccountModel',
	'models/account/AccountExtrasModel',
	'collections/address/CityCollection',
	'collections/address/ZipCodeCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/account/accountAddTemplate.html',
	'text!templates/account/accountAddressTemplate.html',
	'global',
	'constant',
], function(Backbone,
			AccountAddView,
			Validate,
			TextFormatter,
			PhoneNumber,
			bootstrapMultiSelect,
			AccountModel,
			AccountExtrasModel,
			CityCollection,
			ZipCodeCollection,
			contentTemplate,
			accountAddTemplate,
			accountAddressTemplate,
			Global,
			Const
){

	var AccountEditView = AccountAddView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			this.initSubContainer();
			var thisObj = this;
			this.accountId = option.id;
			this.h1Title = 'Account';
			this.h1Small = 'edit';
		
			this.options = {
				addressFieldClone: null,
				addressFieldCounter: 0,
				addressFieldClass: ['type', 'street', 'state', 'city', 'zipcode', 'country', 'id', 'latitude', 'longitude'],
				addressFieldClassRequired: ['street', 'state', 'city', 'zipcode'],
				addressFieldSeparator: '.',
			};
			
			this.accountExtrasModel = new AccountExtrasModel();
			this.accountExtrasModel.on("change", function() {
				thisObj.model.runFetch();
				this.off("change");
			});
			
			this.model = new AccountModel({id:this.accountId});
			this.model.on("change", function() {
				if(thisObj.subContainerExist()) {
					thisObj.displayForm();
					thisObj.supplyAccountData();
					thisObj.maskInputs();
					thisObj.focusOnFirstField();
				}
				this.off("change");
			});
		},
		
		render: function(){
			this.accountExtrasModel.runFetch();
			Backbone.View.prototype.refreshTitle('Accounts','edit');
		},
		
		supplyAccountData: function () {
			var thisObj = this;
			$('#name').val(this.model.get('name'));
			
			var acctype = [];
			_.each(this.model.get('accounttype'), function(t){
				acctype.push(t.id);
			});
			$('#accounttype').val(acctype);
			$('#accounttype').multiselect('refresh');

			$('#website').val(this.model.get('website'));
			$('#description').val(this.model.get('description'));
			$('#phone').val(this.model.get('phone'));
			
			var addresses = this.model.get('address');
			
			var i = 0;
			_.each(addresses, function (address) {
				var addressFields = (i > 0)? thisObj.addAddressFields(): thisObj.$el.find('#account-adresses > .address-fields-container:first-child');
				i++;
				
				if(i > 0)
					addressFields.find('.type').val(address.type);
				
				addressFields.find('.id').val(address.id);
				addressFields.find('.street').val(address.street);
				addressFields.find('.city').val(address.city);
				addressFields.find('.state').val(address.address_states[0].id);
				addressFields.find('.zipcode').val(address.zipcode);
				addressFields.find('.latitude').val(address.latitude);
				addressFields.find('.longitude').val(address.longitude);
			});
		},
	});

  return AccountEditView;
  
});