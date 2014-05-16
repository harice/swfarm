define([
	'backbone',
	'views/base/ListView',
	'models/scale/ScaleModel',
	'collections/scale/ScaleCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/scale/scaleListTemplate.html',
	'text!templates/scale/scaleInnerListTemplate.html',
	'constant',
], function(Backbone,
			ListView,
			ScaleModel,
			ScaleCollection,
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
			
			this.collection = new ScaleCollection();
			this.collection.on('sync', function() {
				thisObj.displayList();
			});
			this.collection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		
		render: function(){
			this.displayScale();
			this.renderList(1);
		},
		
		displayScale: function () {
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
			
			this.initConfirmationWindow('Are you sure you want to delete this Scale?',
										'confirm-delete-scale',
										'Delete');
		},
		
		displayList: function () {
			var data = {
				scale_edit_url: '#/'+Const.URL.SCALE+'/'+Const.CRUD.EDIT,
				scales: this.collection.models,
				_: _ 
			};
			
			var innerListTemplate = _.template(trailerInnerListTemplate, data);
			$("#scale-list tbody").html(innerListTemplate);
			
			this.generatePagination();
		},
		
		events: {
			'click .delete-scale': 'preShowConfirmationWindow',
			'click #confirm-delete-scale': 'deleteTrailer'
		},
		
		preShowConfirmationWindow: function (ev) {
			this.$el.find('#confirm-delete-scale').attr('data-id', $(ev.currentTarget).attr('data-id'));
			
			this.showConfirmationWindow();
			return false;
		},
		
		deleteScale: function (ev) {
			var thisObj = this;
			var scaleModel = new ScaleModel({id:$(ev.currentTarget).attr('data-id')});
			
            scaleModel.destroy({
                success: function (model, response, options) {
                    thisObj.displayMessage(response);
                    thisObj.renderList(1);
                },
                error: function (model, response, options) {
                    thisObj.displayMessage(response);
                },
                wait: true,
                headers: scaleModel.getAuth(),
            });
		},
	});

	return ScaleListView;
  
});