define([
	'backbone',
	'jqueryvalidate',
	'jquerytextformatter',
	'text!templates/layout/contentTemplate.html',
	'text!templates/role/roleAddTemplate.html',
	'models/role/RoleModel',
    'views/notification/NotificationView',
	'global',
	'constant',
], function(Backbone, Validate, TextFormatter, contentTemplate, roleAddTemplate, RoleModel, NotificationView, Global, Const){

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
			
			this.$el.find('.capitalize').textFormatter({type:'capitalize'});
			
			var validate = $('#addRolesForm').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					console.log(data);
					var roleModel = new RoleModel(data);
					roleModel.save(null, {success: function (model, response, options) {
                        var message = new NotificationView({ type: 'success', text: 'Role has been created.' });
						console.log(response);
						console.log(options);
						Global.getGlobalVars().app_router.navigate(Const.URL.ROLE, {trigger: true});
					}, error: function (model, response, options) {
                        var message = new NotificationView({ type: 'error', text: 'Sorry! An error occurred in the process.' });
						if(typeof response.responseJSON.error == 'undefined')
							validate.showErrors(response.responseJSON);
						else
							alert(response.responseText);
					},
					headers: roleModel.getAuth(),});
				}
			});
		},
		
	});

  return RoleAddView;
  
});