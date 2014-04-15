define([
	'backbone',
	'views/base/AppView',
	'text!templates/layout/contentTemplate.html',
	'text!templates/account/accountViewTemplate.html',
	'models/account/AccountModel',
    'views/notification/NotificationView',
	'global',
	'constant',
], function(Backbone, AppView, contentTemplate, accountViewTemplate, AccountModel, NotificationView, Global, Const){

	var AccountView = AppView.extend({
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
			//console.log(this.model);
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
			
			var verifyDelete = confirm('Are you sure you want to delete this account?');
			if(verifyDelete) {
				this.model.destroy({
					success: function (model, response, options) {
						var message = new NotificationView({ type: 'success', text: 'Account has been deleted.' });
						Global.getGlobalVars().app_router.navigate(Const.URL.ACCOUNT, {trigger: true});
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

  return AccountView;
  
});