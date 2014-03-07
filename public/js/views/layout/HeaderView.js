define([
	'backbone',
	'text!templates/layout/headerTemplate.html',
	'constant'
], function(Backbone, headerTemplate, Const){

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
