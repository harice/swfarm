define([
	'backbone',
], function(Backbone) {

	var UserModel = Backbone.Model.extend({
		urlRoot: '/user',
	});

	return UserModel;

});
