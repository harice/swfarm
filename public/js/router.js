// Filename: router.js
define([
	'backbone',
	'baserouter',
	'views/layout/HeaderView',
	'views/admin/AdminView',
	'controllers/login/LoginController',
	'controllers/user/UserController',
	'controllers/role/RoleController',
	'controllers/permission/PermissionController',
	'controllers/audittrail/AuditTrailController',
	'global',
	'constant',
	'models/session/SessionModel'
], function(Backbone, BaseRouter, HeaderView, AdminView, LoginController, UserController, RoleController, PermissionController, AuditTrailController, Global, Const, Session) {
	
	var routerRoutes = {};

	//login
	routerRoutes[Const.URL.LOGIN] = 'showLoginPage';
	routerRoutes[Const.URL.LOGIN+'/'] = 'showLoginPage';
	routerRoutes[Const.URL.USER+'/:action'] = 'showLoginPage';
	
	//admin
	routerRoutes[Const.URL.ADMIN] = 'showAdminPage';
	routerRoutes[Const.URL.ADMIN+'/'] = 'showAdminPage';
	
	//user
	routerRoutes[Const.URL.USER] = 'showUserPage';
	routerRoutes[Const.URL.USER+'/'] = 'showUserPage';
	routerRoutes[Const.URL.USER+'/:action'] = 'showUserPage';
	routerRoutes[Const.URL.USER+'/:action/:id'] = 'showUserPage';
	
	//role
	routerRoutes[Const.URL.ROLE] = 'showRolePage';
	routerRoutes[Const.URL.ROLE+'/'] = 'showRolePage';
	routerRoutes[Const.URL.ROLE+'/:action'] = 'showRolePage';
	routerRoutes[Const.URL.ROLE+'/:action/:id'] = 'showRolePage';
	
	//permission
	routerRoutes[Const.URL.PERMISSION] = 'showPermissionPage';
	routerRoutes[Const.URL.PERMISSION+'/'] = 'showPermissionPage';
	routerRoutes[Const.URL.PERMISSION+'/:id'] = 'showPermissionPage';
	
	//audittrail
	routerRoutes[Const.URL.AUDITTRAIL] = 'showAuditTrailPage';
	routerRoutes[Const.URL.AUDITTRAIL+'/'] = 'showAuditTrailPage';
	routerRoutes[Const.URL.AUDITTRAIL+'/:table'] = 'showAuditTrailPage';
	routerRoutes[Const.URL.AUDITTRAIL+'/:table/:id'] = 'showAuditTrailPage';
	
	
	routerRoutes['*actions'] = 'defaultAction';

	var AppRouter = BaseRouter.extend({
		routes:routerRoutes,

		requiresAuthExcept : ['#/login'],

		preventAccessWhenAuth : ['#/login'],

		before : function(params, next){
			var isAuth = Session.get('token');
			var path = Backbone.history.location.hash;
			var needAuth = _.contains(this.requiresAuthExcept, path);
			var cancelAccess = _.contains(this.preventAccessWhenAuth, path);

			if(!needAuth && !isAuth){
				Session.set('redirectFrom', path);
				Global.getGlobalVars().app_router.navigate('#/'+Const.URL.LOGIN, { trigger : true });
			}else if(isAuth && cancelAccess){
				Global.getGlobalVars().app_router.navigate('#/'+Const.URL.DASHBOARD, { trigger : true });
			}else{
			  return next();
			}
		},

		after : function(){
			//empty
		},

		fetchError : function(error){
			if(error.status === 403){
				Session.clear();
				Global.getGlobalVars().app_router.navigate('#/'+Const.URL.LOGIN, { trigger : true });
			}
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

		app_router.on('route:showLoginPage',function (action) {
			this.closeView();
			var loginController = new LoginController();
			this.currView = loginController.setAction(action);
			this.currView.render();
		});
		
		app_router.on('route:showAdminPage', function () {
			this.closeView();
			this.currView = new AdminView();
			this.currView.render();
		});
		
		app_router.on('route:showUserPage', function (action, id) {
			this.closeView();
			var userController = new UserController();
			this.currView = userController.setAction(action, id);
			this.currView.render();
		});
		
		app_router.on('route:showRolePage', function (action, id) {
			this.closeView();
			var roleController = new RoleController();
			this.currView = roleController.setAction(action, id);
			this.currView.render();
		});
		
		app_router.on('route:showPermissionPage', function (id) {
			this.closeView();
			var permissionController = new PermissionController();
			this.currView = permissionController.setAction(id);
			this.currView.render();
		});
		
		app_router.on('route:showAuditTrailPage', function (table, id) {
			this.closeView();
			var auditTrailController = new AuditTrailController();
			this.currView = auditTrailController.setAction(table, id);
			this.currView.render();
		});
		
		app_router.on('route:defaultAction', function (actions) {
			this.closeView();
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
