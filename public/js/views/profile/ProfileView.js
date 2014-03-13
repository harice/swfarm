define([
	'backbone',
	'text!templates/layout/contentTemplate.html',
	'text!templates/profile/profileViewTemplate.html',
	'models/user/UserModel',
	'models/session/SessionModel',
	'global',
	'constant',
], function(Backbone, contentTemplate, profileViewTemplate, UserModel, SessionModel, Global, Const){

	var profileView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			var thisObj = this;
			
			this.model = new UserModel({id:SessionModel.get('su')});
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
			}
			var innerTemplate = _.template(profileViewTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: userModel.get('lastname')+', '+userModel.get('firstname')+' '+userModel.get('suffix'),
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
		},
		
	});

  return profileView;
  
});