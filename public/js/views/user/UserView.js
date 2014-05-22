define([
	'backbone',
	'views/base/AppView',
	'text!templates/layout/contentTemplate.html',
	'text!templates/user/userViewTemplate.html',
	'models/user/UserModel',
	'global',
	'constant',
], function(Backbone, AppView, contentTemplate, userViewTemplate, UserModel, Global, Const){

	var UserView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			this.initSubContainer();
			var thisObj = this;
			
			this.model = new UserModel({id:option.id});
			this.model.on("change", function() {
				if(thisObj.subContainerExist())
					thisObj.displayUser(this);
				this.off("change");
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
			this.subContainer.html(compiledTemplate);
		},
		
		events: {
			'click #go-to-previous-page': 'goToPreviousPage',
			'click #delete' : 'removeUser',
		},
		
		removeUser: function (){
			var thisObj = this;
            
            this.model.destroy({
                success: function (model, response, options) {
                    thisObj.displayMessage(response);
                    //Global.getGlobalVars().app_router.navigate(Const.URL.USER, {trigger: true});
					Backbone.history.history.back();
                },
                error: function (model, response, options) {
                    thisObj.displayMessage(response);
                },
                wait: true,
                headers: thisObj.model.getAuth(),
            });
		},
		
	});

  return UserView;
  
});