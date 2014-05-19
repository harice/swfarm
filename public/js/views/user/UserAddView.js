define([
	'backbone',
    'views/base/AppView',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'text!templates/layout/contentTemplate.html',
	'text!templates/user/userAddTemplate.html',
	'models/user/UserModel',
	'collections/role/RoleCollection',
	'global',
	'constant',
], function(Backbone, AppView, Validate, TextFormatter, PhoneNumber, contentTemplate, userAddTemplate, UserModel, RoleCollection, Global, Const){

	var UserAddView = AppView.extend({
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
			
			this.events = _.extend({}, Backbone.View.prototype.inputFormattingEvents, this.events);
			this.delegateEvents();
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
			
			this.$el.find('.capitalize').textFormatter({type:'capitalize'});
			this.$el.find('.lowercase').textFormatter({type:'lowercase'});
			// this.$el.find('.phone-number').phoneNumber({'divider':'-', 'dividerPos': new Array(3,7)});
			// this.$el.find('.mobile-number').phoneNumber({'divider':'-', 'dividerPos': new Array(3,7)});
            this.maskInputs();
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
					
					userModel.save(
                        null,
                        {
							success: function (model, response, options) {
								thisObj.displayMessage(response);
								Global.getGlobalVars().app_router.navigate(Const.URL.USER, {trigger: true});
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
			'click .remove-image' : 'resetImageField',
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
			
			$('#profile-pic-preview').hide();
			$('#profile-pic-upload').show();
			
			return false;
		},
	});

  return UserAddView;
  
});