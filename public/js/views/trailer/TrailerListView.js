define([
	'backbone',
	'views/base/ListView',
	'models/stack/StackLocationModel',
	'collections/trailer/TrailerCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/trailer/trailerListTemplate.html',
	'text!templates/trailer/trailerInnerListTemplate.html',
	'constant',
], function(Backbone,
			ListView,
			StackLocationModel,
			TrailerCollection,
			contentTemplate,
			trailerListTemplate,
			trailerInnerListTemplate,
			Const
){

	var TrailerListView = ListView.extend({
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
				'trailer_add_url' : '#/'+Const.URL.TRAILER+'/'+Const.CRUD.ADD,
			};
			var innerTemplate = _.template(trailerListTemplate, innerTemplateVar);
			
			var variables = {
				h1_title: 'Trailer',
				h1_small: 'list',
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
			
			this.initConfirmationWindow('Are you sure you want to delete this Stock Location?',
										'confirm-delete-sl',
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
			'click .delete-sl': 'preShowConfirmationWindow',
			'click #confirm-delete-sl': 'deleteStockLocation'
		},
		
		preShowConfirmationWindow: function (ev) {
			this.$el.find('#confirm-delete-sl').attr('data-id', $(ev.currentTarget).attr('data-id'));
			
			this.showConfirmationWindow();
			return false;
		},
		
		deleteStockLocation: function (ev) {
			var thisObj = this;
			var stackLocationModel = new StackLocationModel({id:$(ev.currentTarget).attr('data-id')});
			
            stackLocationModel.destroy({
                success: function (model, response, options) {
                    thisObj.displayMessage(response);
                    thisObj.renderList(1);
                },
                error: function (model, response, options) {
                    thisObj.displayMessage(response);
                },
                wait: true,
                headers: stackLocationModel.getAuth(),
            });
		},
	});

	return TrailerListView;
  
});