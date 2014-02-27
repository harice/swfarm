define([
	'backbone',
	'models/user/UserModel'
], function($, _, Backbone, UserModel){
	var UserCollection = Backbone.Collection.extend({
		model: UserModel,
		
		initialize: function(){
			
		}
	});

	return UserCollection;
});
