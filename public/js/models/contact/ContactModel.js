define([
	'backbone',
	'global',
	'constant',
], function(Backbone, Global, Const) {

	var ContactModel = Backbone.Model.extend({
//        url: '/json/contact.json',
//		defaults: {
//            name: '',
//            description: '',
//        },
//		runFetch: function () {
//			var thisObj = this;
//			this.fetch({
//				success: function(model, response, options) {
//					//console.log('success: UserModel.fetch()');
//					if(typeof response.error != 'undefined') {
//						alert(response.message);
//						Global.getGlobalVars().app_router.navigate(Const.URL.CONTACT, {trigger: true});
//					}
//				},
//				error: function(model, response, options) {
//					//console.log('error: UserModel.fetch()');
//				},
//				headers: thisObj.getAuth(),
//			});
//		},
	});

	return ContactModel;

});
