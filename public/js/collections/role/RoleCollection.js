define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/role/RoleModel',
], function(Backbone, ListViewCollection, RoleModel){
	var RoleCollection = ListViewCollection.extend({
		url: '/apiv1/roles',
		model: RoleModel,
		options: {
			currentPage: 1,
			maxItem: 0,
		},
		initialize: function(){
			this.runInit();
			this.setDefaultURL('/apiv1/roles');
		},
		
		getAllModels: function () {
			var thisObj = this;
			this.setGetAllURL();
			this.fetch({
				success: function (collection, response, options) {
				},
				error: function (collection, response, options) {
					if(typeof response.responseJSON.error == 'undefined')
						alert(response.responseJSON);
					else
						alert(response.responseText);
				},
				headers: thisObj.getAuth(),
			})
		},
		
		setGetAllURL: function () {
			this.url = this.getDefaultURL()+'/all';
		},
	});

	return RoleCollection;
});
