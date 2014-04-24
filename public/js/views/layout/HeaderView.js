define([
	'backbone',
	'text!templates/layout/headerTemplate.html',
	'constant',
	'models/session/SessionModel',
], function(Backbone, headerTemplate, Const, Session){

	var HeaderView = Backbone.View.extend({
		el: $("#head-nav"),


		initialize: function() {
			_.bindAll(this,'profileMenuHandler');
		},
		
		render: function(){
			var innerTemplateVariables = {

				'logout_url'	: '#/'+Const.URL.LOGOUT,
				
				'profile_view_url'	: '#/'+Const.URL.PROFILE,
				'profile_edit_url'		: '#/'+Const.URL.PROFILE+'/'+Const.CRUD.EDIT,
				
				'menu'			: Const.MENU,
				'token'			: Session.get('token'),
				'permission'	: Session.get('permission'),
				'su'			: Session.get('su'),
				'full_name'		: Session.get('firstname') + ' ' + Session.get('lastname'),
			};

			var compiledTemplate = _.template(headerTemplate, innerTemplateVariables);
			this.$el.html(compiledTemplate);
		},

		events: {
			'click .profile_menu' : 'profileMenuHandler'
		},

		profileMenuHandler: function(e) {
			$("ul.cl-vnavigation li").removeClass('active');
		}

	});

  return HeaderView;
  
});
