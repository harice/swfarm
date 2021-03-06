define([
	'backbone',
    'views/base/AppView',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'text!templates/layout/contentTemplate.html',
	'text!templates/profile/profileEditTemplate.html',
	'models/profile/ProfileModel',
	'models/session/SessionModel',
	'global',
	'constant',
], function(Backbone, AppView, Validate, TextFormatter, PhoneNumber, contentTemplate, profileEditTemplate, ProfileModel, SessionModel, Global, Const){

	var ProfileEditView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		options: {
			imagetype: '',
			imagesize: '', 
			imagename: '',
			imagedata: '',
			imageremove: false,
			fileFileClone: null,
		},
		
		initialize: function() {
			var thisObj = this;
			this.model = new ProfileModel({id:parseInt(SessionModel.get('su'))});
			this.model.on("change", function() {
				console.log(thisObj.model);
				thisObj.displayUser();
				this.off("change");
				// if(this.hasChanged('firstname') && this.hasChanged('lastname') && this.hasChanged('email') && this.hasChanged('username')) {
				// }
			});
		},
		
		render: function(){
			this.model.runFetch();			
			Backbone.View.prototype.refreshTitle('Profile','settings');
		},
		
		displayUser: function() {
			var thisObj = this;
			
			var innerTemplateVariables = {
				user_id: this.model.get('id'),
				'user_url' : '#/'+Const.URL.PROFILE
			};

			console.log(this.model.get('id'));
			var innerTemplate = _.template(profileEditTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: "Profile Settings",
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
					
					var userModel = new ProfileModel(data);
					userModel.save(
						null,
						{
							success: function (model, response, options) {
								thisObj.displayMessage(response);
								Global.getGlobalVars().app_router.navigate(Const.URL.PROFILE, {trigger: true});
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
				
				rules: {
					password_confirmation: {
						equalTo: '#password',
						required: '#password:filled',
					},
				},
				messages: {
					password_confirmation: {
						equalTo: 'Password does not match',
					},
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
			
			$('.form-button-container').show();
		},
		
		events: {
			'change .profile-pic' : 'readFile',
			'click .remove-image' : 'resetImageField',
			'click .cancel-remove-image' : 'cancelRemoveImage',
			'click #go-to-previous-page': 'goToPreviousPage',
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

  return ProfileEditView;
  
});