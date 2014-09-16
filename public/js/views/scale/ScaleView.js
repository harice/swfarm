define([
	'backbone',
	'views/base/AppView',
	'text!templates/layout/contentTemplate.html',
	'text!templates/scale/scaleViewTemplate.html',
	'models/scale/ScaleModel',
	'constant'
], function(Backbone, AppView, contentTemplate, scaleViewTemplate, ScaleModel, Const){

	var ScaleView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),

		initialize: function(option) {
			this.initSubContainer();
            this.scaleId = option.id;
			var thisObj = this;

			this.model = new ScaleModel({id:option.id});
			this.model.on("change", function() {
				if(thisObj.subContainerExist())
					thisObj.displayScale();
				this.off("change");
			});
		},

		render: function(){
			this.model.runFetch();
			Backbone.View.prototype.refreshTitle('Scales','view');
		},

		displayScale: function () {
			var innerTemplateVariables = {
                _: _,
				scale:this.model,
				scale_url:'#/'+Const.URL.SCALE,
				scale_edit_url:'#/'+Const.URL.SCALE+'/'+Const.CRUD.EDIT
			};

            _.extend(innerTemplateVariables,Backbone.View.prototype.helpers);

			var innerTemplate = _.template(scaleViewTemplate, innerTemplateVariables);

			var variables = {
				h1_title: this.model.get('name'),
				sub_content_template: innerTemplate
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);

			this.initConfirmationWindow('Are you sure you want to delete this scale?',
										'confirm-delete-scale',
										'Delete',
                                        'Delete Scale');
		},

		events: {
			'click #go-to-previous-page': 'goToPreviousPage',
            'click #delete-scale': 'showDeleteConfirmationWindow',
			'click #confirm-delete-scale': 'deleteScale',
		},

        showDeleteConfirmationWindow: function () {
			this.showConfirmationWindow();
		},

		deleteScale: function (){
			var thisObj = this;

            this.model.destroy({
                success: function (model, response, options) {
                    thisObj.displayMessage(response);
                    //Global.getGlobalVars().app_router.navigate(Const.URL.CONTACT, {trigger: true});
					Backbone.history.history.back();
                },
                error: function (model, response, options) {
                    thisObj.displayMessage(response);
                },
                wait: true,
                headers: thisObj.model.getAuth()
            });
		}
	});

	return ScaleView;

});