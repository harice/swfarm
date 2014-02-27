define([
	'backbone',
], function(Backbone) {

	var UserModel = Backbone.Model.extend({
		urlRoot: '/apiv1/users',
	});

	return UserModel;

});
