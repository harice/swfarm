define([
	'backbone',
	'views/base/AppView',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'text!templates/layout/contentTemplate.html',
	'text!templates/contact/contactAddTemplate.html',
	'models/contact/ContactModel',
    'models/account/AccountModel',
    'collections/account/AccountNameCollection',
	'collections/account/AccountAutocompleteCollection',
    'views/autocomplete/AutoCompleteView',
	'views/autocomplete/AccountCustomAutoCompleteView',
	'global',
	'constant',
], function(Backbone,
			AppView,
			Validate,
			TextFormatter,
			PhoneNumber,
			contentTemplate,
			contactAddTemplate,
			ContactModel,
            AccountModel,
			AccountNameCollection,
			AccountAutocompleteCollection,
			AutoCompleteView,
			AccountCustomAutoCompleteView,
			Global,
			Const
){

	var ContactAddView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),

		initialize: function() {
			this.initSubContainer();
			this.contactId = null;
			this.h1Title = 'Contact';
			this.h1Small = 'add';
		},

		render: function(){
            this.displayForm();
            Backbone.View.prototype.refreshTitle('Contacts','add');
		},

		displayForm: function(){
			var thisObj = this;

			this.accountAutoCompleteView = null;

            var innerTemplateVariables = {
				'contact_url' : '#/'+Const.URL.CONTACT
			};

			if(this.contactId != null)
				innerTemplateVariables['contact_id'] = this.contactId;

			var innerTemplate = _.template(contactAddTemplate, innerTemplateVariables);

			var variables = {
				h1_title: this.h1Title,
				h1_small: this.h1Small,
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);

			this.$el.find('.capitalize').textFormatter({type:'capitalize'});
			this.$el.find('.lowercase').textFormatter({type:'lowercase'});
			// this.$el.find('.phone-number').phoneNumber({'divider':'-', 'dividerPos': new Array(3,7)});
			// this.$el.find('.mobile-number').phoneNumber({'divider':'-', 'dividerPos': new Array(3,7)});
            this.maskInputs();

            this.initValidateForm();
			this.initAccountAutocomplete();
		},

		initValidateForm: function () {
			var thisObj = this;

			var validate = $('#addContactForm').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					var contactModel = new ContactModel(data);
					contactModel.save(
                        null,
                        {
							success: function (model, response, options) {
								thisObj.displayMessage(response);
								//Global.getGlobalVars().app_router.navigate(Const.URL.CONTACT, {trigger: true});
								Backbone.history.history.back();
							},
							error: function (model, response, options) {
								if(typeof response.responseJSON.error == 'undefined')
									validate.showErrors(response.responseJSON);
								else
									thisObj.displayMessage(response);
							},
							headers: contactModel.getAuth(),
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
				}
			});
		},

		initAccountAutocomplete: function () {
			var thisObj = this;

			var accountAutocompleteCollection = new AccountAutocompleteCollection();
			this.accountAutoCompleteView = new AccountCustomAutoCompleteView({
                input: $('#account'),
				hidden: $('#account_id'),
                collection: accountAutocompleteCollection,
            });

			this.accountAutoCompleteView.render();
		},

        hasRate: function (account_id) {
            var account = new AccountModel({id: account_id});

            account.fetch({
                success: function (account) {
                	var ids = _.pluck(account.get("accounttype"), 'id');
                	var accountwithrates = [ Const.ACCOUNT_TYPE.LOADER, Const.ACCOUNT_TYPE.OPERATOR, Const.ACCOUNT_TYPE.TRUCKER, Const.ACCOUNT_TYPE.SWFTRUCKER ];
                	var hasrate = _.find(ids, function(t){ return _.contains(accountwithrates,parseInt(t)); });

                	if(hasrate) $('#rate').attr("disabled", false);
                	else {
                		$('#rate').val('0.00');
                        $('#rate').attr("disabled", true);
                	}
                },
                error: function (model, response, options) {
                    console.log('Fail to fetch account.');
                },
                headers: account.getAuth(),
            });
        },

        survey: function (selector, callback)
        {
            var input = $(selector);
            var oldvalue = input.val();
            setInterval(function(){
                if (input.val()!=oldvalue) {
                    oldvalue = input.val();
                    callback();
                }
            }, 100);
        },

		events: {
            'click #go-to-previous-page': 'goToPreviousPage',
            'change #account': 'toggleRate'
		},

        toggleRate: function (ev)
        {
            var that = this;

            this.survey('#account_id', function () {
                var account_id = $('#addContactForm #account_id').val();
                that.hasRate(account_id);
            });
        },

		destroySubViews: function () {
			this.accountAutoCompleteView.destroyView();
		},
	});

    return ContactAddView;
});

