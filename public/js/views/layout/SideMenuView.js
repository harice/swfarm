define([
	'backbone',
	'text!templates/layout/sideMenuTemplate.html',
	'constant',
	'models/session/SessionModel',
	'jquerynanoscroller',
	'jquerypushmenu'
], function(Backbone, SideMenuTemplate, Const, Session, nanoScroller, jPushMenu){

	var SideMenuView = Backbone.View.extend({
		el: $("#cl-sidebar"),

		initialize: function() {
			_.bindAll(this,'sidebarCollapse','sideMenuToggle','sideParentMenu','showSideMenu');
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

			var compiledTemplate = _.template(SideMenuTemplate, innerTemplateVariables);
			this.$el.html(compiledTemplate);
		},

		events: {
			'click #sidebar-collapse' : 'sidebarCollapse',
			'click ul.cl-vnavigation li a' : 'sideParentMenu',
			'click .parent a' : 'sideMenuToggle',
			'click .cl-toggle' : 'showSideMenu'
		},

		sidebarCollapse: function(e) {
			var b = $("#sidebar-collapse")[0];
		    var w = $("#cl-wrapper");
		    var s = $(".cl-sidebar");
		    
		    if(w.hasClass("sb-collapsed")){
		      $(".fa",b).addClass("fa-angle-left").removeClass("fa-angle-right");
		      w.removeClass("sb-collapsed");
		    }else{
		      $(".fa",b).removeClass("fa-angle-left").addClass("fa-angle-right");
		      w.addClass("sb-collapsed");
		    }
		},

		sideParentMenu: function(e) {
			if(!$(e.currentTarget).closest('li').hasClass('parent')) {
				$("ul.cl-vnavigation li").removeClass('active');
				$(e.currentTarget).closest('li').addClass('active');
			}
		},

		sideMenuToggle: function(e) {
			if(!$("#cl-wrapper").hasClass('sb-collapsed')) {
				if($(e.currentTarget).parent().hasClass('open')) {
					$(e.currentTarget).parent().find("ul").slideUp(300, 'swing',function(){
			           $(e.currentTarget).parent().removeClass("open");
			        });
				} else {
					var ul = $(e.currentTarget).parent().find("ul");
			        ul.slideToggle(300, 'swing', function () {
			          $(e.currentTarget).parent().addClass('open');
			        	$("#cl-wrapper .nscroller").nanoScroller({ preventPageScrolling: true });
			        });
			    }

			    if(!$(e.currentTarget).closest('li').closest('ul').hasClass('sub-menu'))
			    	e.preventDefault();
			} else {
				e.preventDefault();
			}
		},

		showSideMenu: function(e) {
			var ul = $(".cl-vnavigation");
	        ul.slideToggle(300, 'swing', function () {});
	        e.preventDefault();
		}

	});

  return SideMenuView;
  
});