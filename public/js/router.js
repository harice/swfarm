// Filename: router.js
define([
	'backbone',
	'views/layout/HeaderView',
	'views/admin/AdminView',
	'controllers/user/UserController',
	'global',
], function(Backbone, HeaderView, AdminView, UserController, Global) {

	var AppRouter = Backbone.Router.extend({
		routes: {
		// Define some URL routes
			'administration/': 'showAdminPage',
			'administration/users/*action': 'showUserPage',

			// Default
			'*actions': 'defaultAction'
		},
		currView:null,
		closeView: function () {
			if(this.currView) {
				this.currView.close();
				this.currView.undelegateEvents();
			}
		},
	});
	
	var initialize = function(){
		var app_router = new AppRouter;
		
		app_router.on('route:showAdminPage', function () {
			this.closeView();
			this.currView = new AdminView();
			this.currView.render();
		});
		
		app_router.on('route:showUserPage', function (action) {
			this.closeView();
			var userController = new UserController();
			this.currView = userController.setAction(action);
			this.currView.render();
		});
		
		app_router.on('route:defaultAction', function (actions) {
			console.log('default page');
		});
		
		Global.getGlobalVars().app_router = app_router;
		
		var headerView = new HeaderView();
        headerView.render();
		
		Backbone.history.start();
	};
	return { 
		initialize: initialize
	};
});
