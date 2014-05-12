// Filename: router.js
define([
	'backbone',
	'baserouter',
	'views/layout/HeaderView',
	'views/layout/SideMenuView',
	'views/layout/HomePageView',
	'views/admin/AdminView',
	'controllers/login/LoginController',
	'controllers/user/UserController',
	'controllers/role/RoleController',
	'controllers/permission/PermissionController',
	'controllers/audittrail/AuditTrailController',
	'controllers/profile/ProfileController',
	'controllers/account/AccountController',
    'controllers/contact/ContactController',
	'controllers/product/ProductController',
	'controllers/bid/BidController',
	'controllers/purchaseorder/PurchaseOrderController',
	'controllers/purchaseorder/POPickUpScheduleController',
	'controllers/purchaseorder/POWeightInfoController',
	'controllers/salesorder/SalesOrderController',
	'controllers/stack/StackLocationController',
	'controllers/trailer/TrailerController',
	'global',
	'constant',
	'models/session/SessionModel'
], function(Backbone,
			BaseRouter,
			HeaderView,
			SideMenuView,
			HomePageView,
			AdminView,
			LoginController,
			UserController,
			RoleController,
			PermissionController,
			AuditTrailController,
			ProfileController,
			AccountController,
			ContactController,
			ProductController,
			BidController,
			PurchaseOrderController,
			POPickUpScheduleController,
			POWeightInfoController,
			SalesOrderController,
			StackLocationController,
			TrailerController,
			Global,
			Const,
			Session) {
	
	var routerRoutes = {};
	
	//login
	routerRoutes[Const.URL.LOGIN] = 'showLoginPage';
	routerRoutes[Const.URL.LOGIN+'/'] = 'showLoginPage';
	routerRoutes[Const.URL.LOGIN+'/:action'] = 'showLoginPage';

	//logout
	routerRoutes[Const.URL.LOGOUT] = 'processLogOut';
	
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
  
	//product
	routerRoutes[Const.URL.PRODUCT] = 'showProductPage';
	routerRoutes[Const.URL.PRODUCT+'/'] = 'showProductPage';
	routerRoutes[Const.URL.PRODUCT+'/:action'] = 'showProductPage';
	routerRoutes[Const.URL.PRODUCT+'/:action/:id'] = 'showProductPage';
	
	//profile
	routerRoutes[Const.URL.PROFILE] = 'showProfilePage';
	routerRoutes[Const.URL.PROFILE+'/'] = 'showProfilePage';
	routerRoutes[Const.URL.PROFILE+'/:action'] = 'showProfilePage';
	routerRoutes[Const.URL.PROFILE+'/:action/'] = 'showProfilePage';
	
	//accounts
	routerRoutes[Const.URL.ACCOUNT] = 'showAccountPage';
	routerRoutes[Const.URL.ACCOUNT+'/'] = 'showAccountPage';
	routerRoutes[Const.URL.ACCOUNT+'/:action'] = 'showAccountPage';
	routerRoutes[Const.URL.ACCOUNT+'/:action/:id'] = 'showAccountPage';
    
    //contact
	routerRoutes[Const.URL.CONTACT] = 'showContactPage';
	routerRoutes[Const.URL.CONTACT+'/'] = 'showContactPage';
	routerRoutes[Const.URL.CONTACT+'/:action'] = 'showContactPage';
	routerRoutes[Const.URL.CONTACT+'/:action/:id'] = 'showContactPage';
	
	//bid
	routerRoutes[Const.URL.BID] = 'showBidPage';
	routerRoutes[Const.URL.BID+'/'] = 'showBidPage';
	routerRoutes[Const.URL.BID+'/:action'] = 'showBidPage';
	routerRoutes[Const.URL.BID+'/:action/:id'] = 'showBidPage';
	
	//po
	routerRoutes[Const.URL.PO] = 'showPOPage';
	routerRoutes[Const.URL.PO+'/'] = 'showPOPage';
	routerRoutes[Const.URL.PO+'/:action'] = 'showPOPage';
	routerRoutes[Const.URL.PO+'/:action/:id'] = 'showPOPage';
	
	//pickup schedule
	routerRoutes[Const.URL.PICKUPSCHEDULE+'/:poid'] = 'showPOPickupSchedulePage';
	routerRoutes[Const.URL.PICKUPSCHEDULE+'/:poid/'] = 'showPOPickupSchedulePage';
	routerRoutes[Const.URL.PICKUPSCHEDULE+'/:poid/:action'] = 'showPOPickupSchedulePage';
	routerRoutes[Const.URL.PICKUPSCHEDULE+'/:poid/:action/:id'] = 'showPOPickupSchedulePage';
	
	//weight info
	routerRoutes[Const.URL.WEIGHTINFO+'/:poid/:schedid'] = 'showPOWeightInfoPage';
	routerRoutes[Const.URL.WEIGHTINFO+'/:poid/:schedid/'] = 'showPOWeightInfoPage';
	routerRoutes[Const.URL.WEIGHTINFO+'/:poid/:schedid/:action'] = 'showPOWeightInfoPage';
	routerRoutes[Const.URL.WEIGHTINFO+'/:poid/:schedid/:action/:id'] = 'showPOWeightInfoPage';
	
	//so
	routerRoutes[Const.URL.SO] = 'showSOPage';
	routerRoutes[Const.URL.SO+'/'] = 'showSOPage';
	routerRoutes[Const.URL.SO+'/:action'] = 'showSOPage';
	routerRoutes[Const.URL.SO+'/:action/:id'] = 'showSOPage';
	
	//stack location
	routerRoutes[Const.URL.STACKLOCATION] = 'showStackPage';
	routerRoutes[Const.URL.STACKLOCATION+'/'] = 'showStackPage';
	routerRoutes[Const.URL.STACKLOCATION+'/:action'] = 'showStackPage';
	routerRoutes[Const.URL.STACKLOCATION+'/:action/:id'] = 'showStackPage';
	
	//trailer
	routerRoutes[Const.URL.TRAILER] = 'showTrailerPage';
	routerRoutes[Const.URL.TRAILER+'/'] = 'showTrailerPage';
	routerRoutes[Const.URL.TRAILER+'/:action'] = 'showTrailerPage';
	routerRoutes[Const.URL.TRAILER+'/:action/:id'] = 'showTrailerPage';
	
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

			if(!isAuth) {
				Backbone.View.prototype.showLogin();
			} else {
				Backbone.View.prototype.showContent();
			}

			if(path === '#/'+Const.URL.LOGOUT && isAuth)
			{
				Session.clear();
				Global.getGlobalVars().app_router.navigate('#/'+Const.URL.LOGIN, { trigger : true });
			}

			if(!needAuth && !isAuth){
				if(path != '#/'+Const.URL.LOGOUT)
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
				//this.currView.undelegateEvents();
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
			// Global.getGlobalVars().app_router.navigate('#/'+Const.URL.DASHBOARD, { trigger : true });
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
    
		app_router.on('route:showProductPage', function (action, id) {
			this.closeView();
			var productController = new ProductController();
			this.currView = productController.setAction(action, id);
			this.currView.render();
		});
		
		app_router.on('route:showProfilePage', function (action) {
			this.closeView();
			var profileController = new ProfileController();
			this.currView = profileController.setAction(action);
			this.currView.render();
		});
		
		app_router.on('route:showAccountPage', function (action, id) {
			this.closeView();
			var accountController = new AccountController();
			this.currView = accountController.setAction(action, id);
			this.currView.render();
		});
        
        app_router.on('route:showContactPage', function (action, id) {
			this.closeView();
			var contactController = new ContactController();
			this.currView = contactController.setAction(action, id);
			this.currView.render();
		});
		
		app_router.on('route:showBidPage', function (action, id) {
			this.closeView();
			var bidController = new BidController();
			this.currView = bidController.setAction(action, id);
			this.currView.render();
		});
		
		app_router.on('route:showPOPage', function (action, id) {
			this.closeView();
			var purchaseOrderController = new PurchaseOrderController();
			this.currView = purchaseOrderController.setAction(action, id);
			this.currView.render();
		});
		
		app_router.on('route:showPOPickupSchedulePage', function (poid, action, id) {
			this.closeView();
			var pickUpScheduleController = new POPickUpScheduleController();
			this.currView = pickUpScheduleController.setAction(poid, action, id);
			this.currView.render();
		});
		
		app_router.on('showPOWeightInfoPage', function (poid, schedid, action, id) {
			this.closeView();
			var poWeightInfoController = new POWeightInfoController();
			this.currView = poWeightInfoController.setAction(poid, schedid, action, id);
			this.currView.render();
		});
		
		app_router.on('route:showSOPage', function (action, id) {
			this.closeView();
			var salesOrderController = new SalesOrderController();
			this.currView = salesOrderController.setAction(action, id);
			this.currView.render();
		});
		
		app_router.on('route:showStackPage', function (action, id) {
			this.closeView();
			var stackLocationController = new StackLocationController();
			this.currView = stackLocationController.setAction(action, id);
			this.currView.render();
		});
		
		app_router.on('route:showTrailerPage', function (action, id) {
			this.closeView();
			var trailerController = new TrailerController();
			this.currView = trailerController.setAction(action, id);
			this.currView.render();
		});
		
		app_router.on('route:defaultAction', function (actions) {
			this.closeView();
			console.log('default page');
			this.currView = new HomePageView();
			this.currView.render();
		});

		Global.getGlobalVars().app_router = app_router;
		Backbone.history.start();
	};
	return { 
		initialize: initialize
	};
});
