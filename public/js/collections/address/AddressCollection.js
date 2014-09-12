define([
	'backbone',
	'collections/base/AppCollection',
	'models/address/AddressModel',
], function(Backbone, AppCollection, AddressModel){
	var AddressCollection = AppCollection.extend({
		url: '/apiv1/bid/getProducerAddress',
		model: AddressModel,
		initialize: function() {
			this.setDefaultURL('/apiv1/bid/getProducerAddress');
		},
		
		fetchAddresses: function (producerId) {
			this.formatURL(producerId);
			this.getModels();
		},
		
		formatURL: function (data) {
			this.url = this.getDefaultURL() + '?producerId=' + data;
		},

		fetchStackAddress: function(id){
			this.url= '/apiv1/account/getStackAddress/'+ id;
		}
	});

	return AddressCollection;
});
