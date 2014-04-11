define([
	'backbone',
	'text!templates/layout/headerTemplate.html',
	'constant',
	'models/session/SessionModel',
], function(Backbone, headerTemplate, Const, Session){

	var HeaderView = Backbone.View.extend({
		el: $("#header"),


		initialize: function() {
			_.bindAll(this,'navDropDownHandler','navMainHandler');
		},
		
		render: function(){
			var innerTemplateVariables = {
				'admin_url': '#/'+Const.URL.ADMIN,
				'user_url': '#/'+Const.URL.USER,
				'role_url': '#/'+Const.URL.ROLE,
				'permission_url': '#/'+Const.URL.PERMISSION,
				'audittrail_url': '#/'+Const.URL.AUDITTRAIL,

				'contact_url'	: '#/'+Const.URL.CONTACT,
				'accounts_url'	: '#/'+Const.URL.ACCOUNT,
				'purchases_url'	: '#/',
				
				'bid_url'       : '#/'+Const.URL.BID,
				'purchase_order_url': '#/'+Const.URL.PO,
                'weightinfo_url': '#/'+Const.URL.WEIGHTINFO,
				
				'sales_url'		: '#/',
				'inventory_url'	: '#/',
				'product_url'	: '#/'+Const.URL.PRODUCT,
				'reports_url'	: '#/',

				'logout_url'	: '#/'+Const.URL.LOGOUT,
				'login_url'		: '#/'+Const.URL.LOGIN,
				
				'profile_view_url'	: '#/'+Const.URL.PROFILE,
				'profile_edit_url'		: '#/'+Const.URL.PROFILE+'/'+Const.CRUD.EDIT,
				
				'menu'			: Const.MENU,
				'token'			: Session.get('token'),
				'permission'	: Session.get('permission'),
				'su'			: Session.get('su'),
			};

			var compiledTemplate = _.template(headerTemplate, innerTemplateVariables);
			this.$el.html(compiledTemplate);
		},

		events: {
			'click ul.navbar-nav li' : 'navMainHandler',
			'click ul.navbar-nav li ul li' : 'navDropDownHandler'
		},

		navDropDownHandler: function(e) {
			$("ul.navbar-nav li").removeClass('active');
			$(e.currentTarget).closest('ul').closest('li').addClass('active');
		},

		navMainHandler: function(e) {
			$("ul.navbar-nav li").removeClass('active');
			$(e.currentTarget).addClass('active');
			$("ul.navbar-nav li a").blur();
		},

	});

  return HeaderView;
  
});
