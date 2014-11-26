define([
	'backbone',
	'views/base/AppView',
	'models/order/OrderScheduleVariablesModel',
    'models/settings/SettingsModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/settings/settingsAddTemplate.html',
	'global',
	'constant',
], function(Backbone,
			AppView,
			OrderScheduleVariablesModel,
            SettingsModel,
			contentTemplate,
			trailerAddTemplate,
			Global,
			Const
){

	var SettingsEditView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),

		initialize: function() {
			this.initSubContainer();
			var thisObj = this;
			this.h1Title = 'Settings';
			this.h1Small = 'edit';

			this.model = new OrderScheduleVariablesModel();
			this.model.on('change', function() {
				if(thisObj.subContainerExist()) {
					thisObj.displayForm();
					thisObj.supplySettingsData();
					thisObj.maskInputs();
					thisObj.focusOnFirstField();
				}

				this.off('change');
			});

            this.settingsModel = new SettingsModel();
		},

		render: function(){
			this.model.runFetch();
			Backbone.View.prototype.refreshTitle('Settings','manage');
		},

		displayForm: function () {
			var thisObj = this;

			var innerTemplateVariables = {};

			var innerTemplate = _.template(trailerAddTemplate, innerTemplateVariables);

			var variables = {
				h1_title: this.h1Title,
				h1_small: this.h1Small,
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);

			this.initValidateForm();
            // this.maskInputs();
		},

		initValidateForm: function () {
			var thisObj = this;

			var validate = $('#sheduleSettingsForm').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject(); //console.log(data);

					/*var trailerModel = new TrailerModel(data);

					trailerModel.save(
						null,
						{
							success: function (model, response, options) {
								thisObj.displayMessage(response);
								Global.getGlobalVars().app_router.navigate(Const.URL.TRAILER, {trigger: true});
							},
							error: function (model, response, options) {
								if(typeof response.responseJSON.error == 'undefined')
									validate.showErrors(response.responseJSON);
								else
									thisObj.displayMessage(response);
							},
							headers: trailerModel.getAuth(),
						}
					);*/

					return false;
				},
			});
		},

		supplySettingsData: function () {
			this.$el.find('#freight_rate').val(this.model.get('freight_rate'));
			this.$el.find('#loading_rate').val(this.model.get('loading_rate'));
			this.$el.find('#unloading_rate').val(this.model.get('unloading_rate'));
			this.$el.find('#trailer_percentage_rate').val(this.model.get('trailer_percentage_rate'));
			this.$el.find('#fuel_rate').val(this.model.get('fuel_rate'));
		},

        events: {
            'click #save': 'bulkUpdateSettings'
        },

        bulkUpdateSettings: function() {
            thisObj = this;

            var data = [];
            data['settings'] = {
                'freight_rate': {
                    id: 1,
                    name: 'freight_rate',
                    value: this.$el.find('#freight_rate').val()
                },
                'loading_rate': {
                    id: 2,
                    name: 'loading_rate',
                    value: this.$el.find('#loading_rate').val()
                },
                'unloading_rate': {
                    id: 3,
                    name: 'unloading_rate',
                    value: this.$el.find('#unloading_rate').val()
                },
                'trailer_percentage_rate': {
                    id: 4,
                    name: 'trailer_percentage_rate',
                    value: this.$el.find('#trailer_percentage_rate').val()
                },
                'fuel_rate': {
                    id: 5,
                    name: 'fuel_rate',
                    value: this.$el.find('#fuel_rate').val()
                }
            };

            this.settingsModel.updateURL();
            this.settingsModel.save(data, {
//                success: function() {
//                    console.log('Updated Settings!');
//                },
                success: function (model, response, options) {
                    thisObj.displayMessage(response);
                    Global.getGlobalVars().app_router.navigate(Const.URL.SETTINGS, {trigger: true});
                },
                error: function() {
                    console.log('Update fails!');
                },
                headers: this.settingsModel.getAuth()
            });
        },

        updateSettings: function() {
            this.saveSetting({'id': 1, 'name': 'freight_rate', 'value': this.$el.find('#freight_rate').val()});
            this.saveSetting({'id': 2, 'name': 'loading_rate', 'value': this.$el.find('#loading_rate').val()});
            this.saveSetting({'id': 3, 'name': 'unloading_rate', 'value': this.$el.find('#unloading_rate').val()});
            this.saveSetting({'id': 4, 'name': 'trailer_percentage_rate', 'value': this.$el.find('#trailer_percentage_rate').val()});
            this.saveSetting({'id': 5, 'name': 'fuel_rate', 'value': this.$el.find('#fuel_rate').val()});
        },

        saveSetting: function(data) {
            this.settingsModel.save(data, {
                success: function() {
                    console.log('Updated Settings!');
                },
                error: function() {
                    console.log('Update fails!');
                },
                headers: this.settingsModel.getAuth()
            });
        }
	});

	return SettingsEditView;

});
