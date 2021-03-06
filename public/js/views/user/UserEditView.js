define([
	'backbone',
    'views/user/UserAddView',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'text!templates/layout/contentTemplate.html',
	'text!templates/user/userAddTemplate.html',
	'models/user/UserModel',
	'collections/role/RoleCollection',
	'global',
	'constant',
], function(Backbone, UserAddView, Validate, TextFormatter, PhoneNumber, contentTemplate, userAddTemplate, UserModel, RoleCollection, Global, Const){

	var UserEditView = UserAddView.extend({
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
			this.initSubContainer();
			var thisObj = this;
			
			this.model = new UserModel({id:option.id});
			this.model.on("change", function() {
				if(thisObj.subContainerExist()){
					thisObj.displayUser();
					thisObj.focusOnFirstField();
				}
				this.off("change");
			});
			
			this.collection = new RoleCollection();
			this.collection.on('sync', function() {
				//console.log('collection.on.sync')
				if(thisObj.subContainerExist())
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
			Backbone.View.prototype.refreshTitle('Users','edit');

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
			this.subContainer.html(compiledTemplate);
			
			this.$el.find('.capitalize').textFormatter({type:'capitalize'});
			this.$el.find('.lowercase').textFormatter({type:'lowercase'});
			// this.$el.find('.phone-number').phoneNumber({'divider':'-', 'dividerPos': new Array(3,7)});
			// this.$el.find('.mobile-number').phoneNumber({'divider':'-', 'dividerPos': new Array(3,7)});
            this.maskInputs();
			this.fileFileClone = $("#profile-pic").clone(true);
			
			this.$el.find('#firstname').val(this.model.get('firstname'));
			this.$el.find('#lastname').val(this.model.get('lastname'));
			this.$el.find('#suffix').val(this.model.get('suffix'));
			this.$el.find('#email').val(this.model.get('email'));
			this.$el.find('#position').val(this.model.get('position'));
			this.$el.find('#emp_no').val(this.model.get('emp_no'));
			this.$el.find('#phone').val(this.model.get('phone'));
			this.$el.find('#mobile').val(this.model.get('mobile'));
			
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
					userModel.save(
						null,
						{
							success: function (model, response, options) {
								thisObj.displayMessage(response);
								//Global.getGlobalVars().app_router.navigate(Const.URL.USER, {trigger: true});
								Backbone.history.history.back();
							},
							error: function (model, response, options) {
								if(typeof response.responseJSON.error == 'undefined')
									validate.showErrors(response.responseJSON);
								else
									thisObj.displayMessage(response);
							},
							headers: userModel.getAuth(),
						}
					);
				},
				
				messages: {
					phone: {
                        minlength: 'Please enter a valid phone number.',
						maxlength: 'Please enter a valid phone number.',
					},
                    
                    mobile: {
                        minlength: 'Please enter a valid mobile number.',
						maxlength: 'Please enter a valid mobile number.',
					},
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
			'click #go-to-previous-page': 'goToPreviousPage',
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