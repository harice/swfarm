define([
	'backbone',
	'jqueryvalidate',
	'text!templates/layout/contentTemplate.html',
	'text!templates/role/roleAddTemplate.html',
	'global',
	'constant',
], function(Backbone, Validate, contentTemplate, roleAddTemplate, Global, Const){

	var RoleAddView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			//console.log('RoleAdd.js:init');
		},
		
		render: function(){
			var innerTemplateVariables = {
				'role_url' : '#/'+Const.URL.ROLE
			};
			var innerTemplate = _.template(roleAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: "Add Role",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
			
			/*var validate = $('#addUserForm').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					var userModel = new UserModel(data);
					userModel.save(null, {success: function (model, response, options) {
						//console.log('success: add role');
						Global.getGlobalVars().app_router.navigate(Const.URL.USER, {trigger: true});
					}, error: function (model, response, options) {
						//console.log('error: add role');
						if(typeof response.responseJSON.error == 'undefined')
							validate.showErrors(response.responseJSON);
						else
							alert(response.responseText);
					}});
				}
			});*/
		},
		
	});

  return RoleAddView;
  
});