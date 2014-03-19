define([
	'backbone',
	'text!templates/layout/contentTemplate.html',
	'text!templates/account/accountViewTemplate.html',
	'models/account/AccountModel',
	'global',
	'constant',
], function(Backbone, contentTemplate, accountViewTemplate, AccountModel, Global, Const){

	var AccountView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			var thisObj = this;
			
			this.model = new AccountModel({id:option.id});
			this.model.on("change", function() {
				thisObj.displayAccount();
				this.off("change");
			});
		},
		
		render: function(){
			this.model.runFetch();
		},
		
		displayAccount: function () {
			var innerTemplateVariables = {
				account:this.model,
				account_url:'#/'+Const.URL.ACCOUNT,
				account_edit_url:'#/'+Const.URL.ACCOUNT+'/'+Const.CRUD.EDIT,
			}
			var innerTemplate = _.template(accountViewTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: this.model.get('name'),
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
			
			var verifyDelete = confirm('Delete User?');
			if(verifyDelete) {
				this.model.destroy({
					success: function (model, response, options) {
						//console.log('success: UserModel.destroy');
						//console.log(response);
						Global.getGlobalVars().app_router.navigate(Const.URL.ACCOUNT, {trigger: true});
					},
					error: function (model, response, options) {
						//console.log('error: UserModel.destroy');
						console.log(response);
					},
					wait: true,
					headers: thisObj.model.getAuth(),
				});
			}
		},
	});

  return AccountView;
  
});