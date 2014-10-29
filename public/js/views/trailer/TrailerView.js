define([
	'backbone',
	'views/base/AppView',
	'text!templates/layout/contentTemplate.html',
	'text!templates/trailer/trailerViewTemplate.html',
	'models/trailer/TrailerModel',
	'constant'
], function(Backbone, AppView, contentTemplate, trailerViewTemplate, TrailerModel, Const){

	var TrailerView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),

		initialize: function(option) {
			this.initSubContainer();
            this.trailerId = option.id;
			var thisObj = this;			

			this.model = new TrailerModel({id:option.id});
			this.model.on("change", function() {
				if(thisObj.subContainerExist()){
					thisObj.displayTrailer();					
				}
				this.off("change");
			});
			
		},

		render: function(){
			this.model.runFetch();
			Backbone.View.prototype.refreshTitle('Trailer','view');			
		},		

		displayTrailer: function () {
			var innerTemplateVariables = {
				trailer:this.model,
				trailer_url:'#/'+Const.URL.TRAILER,
				trailer_edit_url:'#/'+Const.URL.TRAILER+'/'+Const.CRUD.EDIT
			};

			var innerTemplate = _.template(trailerViewTemplate, innerTemplateVariables);

			var variables = {
				h1_title: this.model.get('name'),
				sub_content_template: innerTemplate
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);

			this.initConfirmationWindow('Are you sure you want to delete this trailer?',
										'confirm-delete-trailer',
										'Delete',
                                        'Delete Trailer');
		},

		events: {
			'click #go-to-previous-page': 'goToPreviousPage',
            'click #delete-trailer': 'showDeleteConfirmationWindow',
			'click #confirm-delete-trailer': 'deleteTrailer',
		},

        showDeleteConfirmationWindow: function () {
			this.showConfirmationWindow();
		},

		deleteTrailer: function (){
			var thisObj = this;

            this.model.destroy({
                success: function (model, response, options) {
                    thisObj.displayMessage(response);
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

	return TrailerView;

});