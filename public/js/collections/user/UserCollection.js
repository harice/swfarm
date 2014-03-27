define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/user/UserModel',
], function(Backbone, ListViewCollection, UserModel){

	var UserCollection = ListViewCollection.extend({
		url: '/apiv1/users',
		model: UserModel,

		initialize: function(){
			this.runInit();
			this.addDefaultURL('/apiv1/users');
			this.setSortOptions(
				{
					currentSort: 'lastname',
					sort: {
						firstname: true,
						lastname: true,
						email: true,
					},
				}
			);
		},
	});

	return UserCollection;
});
