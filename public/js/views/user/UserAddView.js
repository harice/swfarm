define([
	'backbone',
	'jqueryvalidate',
	'text!templates/layout/contentTemplate.html',
	'text!templates/user/userAddTemplate.html',
	'models/user/UserModel',
	'collections/role/RoleCollection',
	'global',
	'constant',
], function(Backbone, Validate, contentTemplate, userAddTemplate, UserModel, RoleCollection, Global, Const){

	var UserAddView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		options: {
			imagetype: '',
			imagesize: '', 
			imagename: '',
			imagedata: '',
			fileFileClone: null,
		},
		
		initialize: function() {
			var thisObj = this;
			
			this.collection = new RoleCollection();
			this.collection.on('sync', function() {
				//console.log('collection.on.sync')
				thisObj.displayRoles();
				this.off('sync');
			});
			
			this.collection.on('error', function(collection, response, options) {
				//console.log('collection.on.error')
				//console.log(collection);
				//console.log(response);
				//console.log(options);
				this.off('error');
			});
		},
		
		render: function(){
			var thisObj = this;
			
			var innerTemplateVariables = {
				'user_url' : '#/'+Const.URL.USER
			};
			var innerTemplate = _.template(userAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: "Add User",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
			
			this.fileFileClone = $("#profile-pic").clone(true);
			
			var validate = $('#addUserForm').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					
					if(typeof data.roles != 'undefined' && typeof data.roles != 'string')
						data.roles = data.roles.join(',');
					
					if(thisObj.options.imagename != '') {
						data.imagetype = thisObj.options.imagetype;
						data.imagesize = thisObj.options.imagesize; 
						data.imagename = thisObj.options.imagename;
						data.imagedata = thisObj.options.imagedata;
					}
					
					var userModel = new UserModel(data);
					
					userModel.save(null, {success: function (model, response, options) {
						//console.log('success: add user');
						Global.getGlobalVars().app_router.navigate(Const.URL.USER, {trigger: true});
					}, error: function (model, response, options) {
						//console.log('error: add user');
						if(typeof response.responseJSON.error == 'undefined')
							validate.showErrors(response.responseJSON);
						else
							alert(response.responseText);
					},
					headers: userModel.getAuth(),
					});
				}
			});
			
			this.collection.getAllModels();
		},
		
		displayRoles: function (){
			var checkboxes = '';
			_.each(this.collection.models, function (role) {
				checkboxes += '<div class="checkbox"><label><input type="checkbox" name="roles" value="'+role.get('id')+'">'+role.get('name')+'</label></div>';
			});
			
			$('.user-role-container').html(checkboxes);
			$('.form-button-container').show();
		},
		
		events: {
			'change .profile-pic' : 'readFile',
			'click #remove-image' : 'resetImageField',
		},
		
		readFile: function (ev) {
			$('#remove-image').show();
			
			var thisObj = this;
			
			var file = ev.target.files[0];
			
			var reader = new FileReader();
			reader.onload = function (event) {
				thisObj.options.imagetype =  file.type;
				thisObj.options.imagesize = file.size; 
				thisObj.options.imagename = file.name;
				thisObj.options.imagedata = event.target.result;
				//console.log(thisObj.options);
			};
			
			reader.readAsDataURL(file);
		},
		
		resetImageField: function () {
			var clone = this.fileFileClone.clone(true);
			$("#profile-pic").replaceWith(clone);
			$('#remove-image').hide();
			
			this.options.imagetype = '';
			this.options.imagesize = ''; 
			this.options.imagename = '';
			this.options.imagedata = '';
			
			return false;
		},
	});

  return UserAddView;
  
});