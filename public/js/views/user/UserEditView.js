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

	var UserEditView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		options: {
			imagetype: '',
			imagesize: '', 
			imagename: '',
			imagedata: '',
			imageremove: false,
			fileFileClone: null,
		},
		
		initialize: function(option) {
			var thisObj = this;
			
			this.model = new UserModel({id:option.id});
			this.model.on("change", function() {
				if(this.hasChanged('firstname') && this.hasChanged('lastname') && this.hasChanged('email') && this.hasChanged('username')) {
					thisObj.displayUser();
					this.off("change");
				}
			});
			
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
			this.model.runFetch();
		},
		
		displayUser: function() {
			var thisObj = this;
			
			var innerTemplateVariables = {
				user_id: this.model.get('id'),
				'user_url' : '#/'+Const.URL.USER
			};
			var innerTemplate = _.template(userAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: "Edit User",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
			
			this.fileFileClone = $("#profile-pic").clone(true);
			
			this.$el.find('#firstname').val(this.model.get('firstname'));
			this.$el.find('#lastname').val(this.model.get('lastname'));
			this.$el.find('#suffix').val(this.model.get('suffix'));
			this.$el.find('#email').val(this.model.get('email'));
			this.$el.find('#position').val(this.model.get('position'));
			this.$el.find('#emp_no').val(this.model.get('emp_no'));
			this.$el.find('#phone').val(this.model.get('phone'));
			this.$el.find('#mobile').val(this.model.get('mobile'));
			this.$el.find('#username').val(this.model.get('username'));
			
			if(this.model.get('profileimg') != null && this.model.get('profileimg') != '') {
				$('#profile-pic-preview img').attr('src', this.model.get('profileimg')+"?qwert="+(new Date().getTime())); 
				$('#profile-pic-upload').hide();
				$('#profile-pic-preview').show();
				$('.cancel-remove-image').show();
			}
			
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
					else {
						if(thisObj.options.imageremove)
							data.imageremove = true;
					}
					
					var userModel = new UserModel(data);
					userModel.save(null, {success: function (model, response, options) {
						//console.log('success: add user');
						Global.getGlobalVars().app_router.navigate(Const.URL.USER, {trigger: true});
					}, error: function (model, response, options) {
						//console.log('error: add user');
						if(response.responseJSON)
							validate.showErrors(response.responseJSON);
						else
							alert(response.responseText);
					},
					headers: userModel.getAuth(),});
				},
			});
			
			this.collection.getAllModels();
		},
		
		displayRoles: function (userRoles){
			var userRoles = this.model.get('roles');
			var checkboxes = '';
			_.each(this.collection.models, function (role) {
				
				var roleId = role.get('id');
				var checked = '';
				
				for(var key in userRoles) {
					if(typeof userRoles[key] !== 'function' && userRoles[key].id == roleId) {
						checked = ' checked';
						break;
					}
				}
				
				checkboxes += '<div class="checkbox"><label><input type="checkbox" name="roles" value="'+roleId+'"'+checked+'>'+role.get('name')+'</label></div>';
			});
			
			$('.user-role-container').html(checkboxes);
			$('.form-button-container').show();
		},
		
		events: {
			'change .profile-pic' : 'readFile',
			'click .remove-image' : 'resetImageField',
			'click .cancel-remove-image' : 'cancelRemoveImage',
		},
		
		readFile: function (ev) {
			var thisObj = this;
			
			var file = ev.target.files[0];
			
			var reader = new FileReader();
			reader.onload = function (event) {
				thisObj.options.imagetype =  file.type;
				thisObj.options.imagesize = file.size; 
				thisObj.options.imagename = file.name;
				thisObj.options.imagedata = event.target.result;
				
				$('#profile-pic-preview img').attr('src', event.target.result); 
				$('#profile-pic-upload').hide();
				$('#profile-pic-preview').show();
				//console.log(thisObj.options);
			};
			
			reader.readAsDataURL(file);
		},
		
		resetImageField: function () {
			var clone = this.fileFileClone.clone(true);
			$("#profile-pic").replaceWith(clone);
			
			this.options.imagetype = '';
			this.options.imagesize = ''; 
			this.options.imagename = '';
			this.options.imagedata = '';
			this.options.imageremove = true;
			
			$('#profile-pic-preview').hide();
			$('#profile-pic-upload').show();
			
			return false;
		},
		
		cancelRemoveImage: function () {
			this.options.imageremove = false;
			$('#profile-pic-preview img').attr('src', this.model.get('profileimg')+"?qwert="+(new Date().getTime())); 
			$('#profile-pic-upload').hide();
			$('#profile-pic-preview').show();
			
			return false;
		},
	});

  return UserEditView;
  
});