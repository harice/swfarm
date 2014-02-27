define([
	'backbone',
	'models/user/UserModel'
], function(Backbone, UserModel){
	var UserCollection = Backbone.Collection.extend({
		url: '/apiv1/users',
		model: UserModel,
		
		initialize: function(){
			
		}
	});

	return UserCollection;
});
