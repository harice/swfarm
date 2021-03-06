define([
	'backbone',
	'bootstrapdatepicker',
	'views/base/AppView',
	'views/base/ListView',
	'jqueryvalidate',
	'jquerytextformatter',
	'models/trailer/TrailerModel',
	'collections/account/AccountCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/trailer/trailerAddTemplate.html',
	'global',
	'constant',
], function(Backbone,
			DatePicker,
			AppView,
			ListView,
			Validate,
			TextFormatter,
			TrailerModel,
			AccountCollection,
			contentTemplate,
			trailerAddTemplate,
			Global,
			Const
){

	var TrailerAddView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),

		initialize: function() {
			this.initSubContainer();
			var thisObj = this;
			this.trailerId = null;
			this.h1Title = 'Trailer';
			this.h1Small = 'add';

			this.trailerAccountCollection = new AccountCollection();
			this.trailerAccountCollection.on('sync', function() {
				if(thisObj.subContainerExist())
					thisObj.displayForm();
				this.off('sync');
			});
			this.trailerAccountCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},

		render: function(){
			this.trailerAccountCollection.getTrailerAccounts();
			Backbone.View.prototype.refreshTitle('Trailer','add');
		},

		displayForm: function () {
			var thisObj = this;

			var innerTemplateVariables = {};

			if(this.trailerId != null)
				innerTemplateVariables['trailer_id'] = this.trailerId;

			var innerTemplate = _.template(trailerAddTemplate, innerTemplateVariables);

			var variables = {
				h1_title: this.h1Title,
				h1_small: this.h1Small,
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);

			this.generateTrailerAccount();
			this.focusOnFirstField();
			this.initValidateForm();

			this.otherInitializations();
		},

		initValidateForm: function () {
			var thisObj = this;

			var validate = $('#trailerForm').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					//data['rate'] = '0.00';
					//console.log(data);
					var trailerModel = new TrailerModel(data);

					trailerModel.save(
						null,
						{
							success: function (model, response, options) {
								thisObj.displayMessage(response);
								//Global.getGlobalVars().app_router.navigate(Const.URL.TRAILER, {trigger: true});
								Backbone.history.history.back();
							},
							error: function (model, response, options) {
								if(typeof response.responseJSON.error == 'undefined')
									validate.showErrors(response.responseJSON);
								else
									thisObj.displayMessage(response);
							},
							headers: trailerModel.getAuth(),
						}
					);
				},
			});
		},

		generateTrailerAccount: function () {
			var options = '';
			_.each(this.trailerAccountCollection.models, function (model) {
				options += '<option value="'+model.get('id')+'">'+model.get('name')+'</option>';
			});

			this.$el.find('#account_id').append(options);
		},

		events: {
			'click #go-to-previous-page': 'goToPreviousPage',
			'click #delete-trailer': 'showDeleteConfirmationWindow',
			'click #confirm-delete-trailer': 'deleteTrailer'
		},

		deleteTrailer: function () {
			var thisObj = this;

            this.model.destroy({
                success: function (model, response, options) {
                    thisObj.displayMessage(response); 
					Global.getGlobalVars().app_router.navigate(Const.URL.TRAILER, {trigger: true});
                },
                error: function (model, response, options) {
                    thisObj.displayMessage(response);
                },
                wait: true,
                headers: thisObj.model.getAuth(),
            });
		},

        showDeleteConfirmationWindow: function () {
			this.showConfirmationWindow();
		},

		otherInitializations: function () {},
	});

	return TrailerAddView;

});