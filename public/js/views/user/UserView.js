define([
	'backbone',
	'text!templates/layout/contentTemplate.html',
	'text!templates/user/userViewTemplate.html',
	'models/user/UserModel',
    'views/notification/NotificationView',
	'global',
	'constant',
], function(Backbone, contentTemplate, userViewTemplate, UserModel, NotificationView, Global, Const){

	var UserView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			var thisObj = this;
			
			this.model = new UserModel({id:option.id});
			this.model.on("change", function() {
				if(this.hasChanged('firstname') && this.hasChanged('lastname') && this.hasChanged('email') && this.hasChanged('username')) {
					thisObj.displayUser(this);
					this.off("change");
				}
			});
		},
		
		render: function(){
			this.model.runFetch();
		},
		
		displayUser: function (userModel) {
			var innerTemplateVariables = {
				user:userModel,
				user_url:'#/'+Const.URL.USER,
				user_edit_url:'#/'+Const.URL.USER+'/'+Const.CRUD.EDIT,
				user_pic_default: Const.PLACEHOLDER.PROFILEPIC,
			}
			var innerTemplate = _.template(userViewTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: userModel.get('lastname')+', '+userModel.get('firstname')+' '+userModel.get('suffix'),
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
		},
		
		events: {
			'click #delete' : 'removeUser',
		},
		
		removeUser: function (){
			var thisObj = this;
			
			var verifyDelete = confirm('Are you sure you want to delete this user?');
			if(verifyDelete) {
				this.model.destroy({
					success: function (model, response, options) {
                        var message = new NotificationView({ type: 'success', text: 'User has been deleted.' });
						Global.getGlobalVars().app_router.navigate(Const.URL.USER, {trigger: true});
					},
					error: function (model, response, options) {
						var message = new NotificationView({ type: 'error', text: 'Sorry! An error occurred in the process.' });
					},
					wait: true,
					headers: thisObj.model.getAuth(),
				});
			}
		},
		
	});

  return UserView;
  
});