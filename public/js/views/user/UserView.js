define([
	'backbone',
	'text!templates/layout/contentTemplate.html',
	'text!templates/user/userViewTemplate.html',
	'models/user/UserModel',
	'global',
	'constant',
], function(Backbone, contentTemplate, userViewTemplate, UserModel, Global, Const){

	var UserView = Backbone.View.extend({
		el: $("#content"),
		
		initialize: function(option) {
			this.model = new UserModel({id:option.id});
		},
		
		render: function(){
			var thisObj = this;
			
			this.model.fetch({
				success: function(model, response, options) {
					console.log(response.error);
					if(typeof response.error == 'undefined') {
						thisObj.displayUser(model);
					}
					else {
						alert(response.message);
						Global.getGlobalVars().app_router.navigate(Const.URL.USER, {trigger: true});
					}
				},
				error: function(model, response, options) {
					console.log('error');
				},
			});
		},
		
		displayUser: function (userModel) {
			var innerTemplateVariables = {
				user:userModel,
				user_url:'#/'+Const.URL.USER,
				user_edit_url:'#/'+Const.URL.USER+'/'+Const.CRUD.EDIT,
				user_delete_url:'',
			}
			var innerTemplate = _.template(userViewTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: userModel.get('lastname')+', '+userModel.get('firstname')+' '+userModel.get('suffix'),
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
		},
		
	});

  return UserView;
  
});