define([
	'backbone',
	'views/base/ListView',
	'models/trailer/TrailerModel',
	'collections/trailer/TrailerCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/scale/scaleListTemplate.html',
	'text!templates/scale/scaleInnerListTemplate.html',
	'constant',
], function(Backbone,
			ListView,
			TrailerModel,
			TrailerCollection,
			contentTemplate,
			trailerListTemplate,
			trailerInnerListTemplate,
			Const
){

	var ScaleListView = ListView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.extendListEvents();
			var thisObj = this;
			
			this.collection = new TrailerCollection();
			this.collection.on('sync', function() {
				thisObj.displayList();
			});
			this.collection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		
		render: function(){
			this.displayStackLocation();
			this.renderList(1);
		},
		
		displayStackLocation: function () {
			var innerTemplateVar = {
				'scale_add_url' : '#/'+Const.URL.SCALE+'/'+Const.CRUD.ADD,
			};
			var innerTemplate = _.template(trailerListTemplate, innerTemplateVar);
			
			var variables = {
				h1_title: 'Scale',
				h1_small: 'list',
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
			
			this.initConfirmationWindow('Are you sure you want to delete this Trailer?',
										'confirm-delete-trailer',
										'Delete');
		},
		
		displayList: function () {
			
			var data = {
				trailer_edit_url: '#/'+Const.URL.TRAILER+'/'+Const.CRUD.EDIT,
				trailers: this.collection.models,
				_: _ 
			};
			
			var innerListTemplate = _.template(trailerInnerListTemplate, data);
			$("#trailer-list tbody").html(innerListTemplate);
			
			this.generatePagination();
		},
		
		events: {
			'click .delete-trailer': 'preShowConfirmationWindow',
			'click #confirm-delete-trailer': 'deleteTrailer'
		},
		
		preShowConfirmationWindow: function (ev) {
			this.$el.find('#confirm-delete-trailer').attr('data-id', $(ev.currentTarget).attr('data-id'));
			
			this.showConfirmationWindow();
			return false;
		},
		
		deleteTrailer: function (ev) {
			var thisObj = this;
			var trailerModel = new TrailerModel({id:$(ev.currentTarget).attr('data-id')});
			
            trailerModel.destroy({
                success: function (model, response, options) {
                    thisObj.displayMessage(response);
                    thisObj.renderList(1);
                },
                error: function (model, response, options) {
                    thisObj.displayMessage(response);
                },
                wait: true,
                headers: trailerModel.getAuth(),
            });
		},
	});

	return ScaleListView;
  
});