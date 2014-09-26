define([
	'backbone',
	'collections/base/AppCollection',
	'models/inventory/StackNumberModel',
], function(Backbone, AppCollection, StackLocationModel){
	var StackNumberCollection = AppCollection.extend({
		url: '/apiv1/inventory/stacklist',
		model: StackLocationModel,
		initialize: function() {
			this.setDefaultURL(this.url);
		},
		
		getStackNumbersByProduct: function (option) {			
			if(option.account_id == undefined){
				this.url = this.getDefaultURL()+'?productId='+option.id;
			}
			else {				
				this.url = this.getDefaultURL()+'?productId='+option.id+'&accountId='+option.account_id;
			}
			this.getModels(option);
		},
	});

	return StackNumberCollection;
});
