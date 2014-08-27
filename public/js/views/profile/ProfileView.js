define([
	'backbone',
	'views/base/AppView',
	'text!templates/layout/contentTemplate.html',
	'text!templates/profile/profileViewTemplate.html',
	'models/user/UserModel',
	'models/session/SessionModel',
	'global',
	'constant',
], function(Backbone, AppView, contentTemplate, profileViewTemplate, UserModel, SessionModel, Global, Const){

	var profileView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.initSubContainer();
			var thisObj = this;
			
			this.model = new UserModel({id:SessionModel.get('su')});
			this.model.on("change", function() {
				// if(this.hasChanged('firstname') && this.hasChanged('lastname') && this.hasChanged('email') && this.hasChanged('username')) {
					thisObj.displayUser(this);
					this.off("change");
				// }
			});
		},
		
		render: function(){
			this.model.runFetch();
		},
		
		displayUser: function (userModel) {
			var innerTemplateVariables = {
				user:userModel,
				user_pic_default: Const.PLACEHOLDER.PROFILEPIC,
				profile_edit_url: '#/'+Const.URL.PROFILE+'/'+Const.CRUD.EDIT,
			}
			var innerTemplate = _.template(profileViewTemplate, innerTemplateVariables);

			var variables = {
				h1_title: this.model.get('name'),
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
		},
		
	});

  return profileView;
  
});