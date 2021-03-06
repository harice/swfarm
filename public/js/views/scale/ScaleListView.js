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
			this.initSubContainer();
			
			var thisObj = this;
			
			this.collection = new ScaleCollection();
			this.collection.on('sync', function() {
				_.each(this.models, function (model) {
					model.set('rate', thisObj.addCommaToNumber(model.get('rate')));
				});
			
				if(thisObj.subContainerExist())
					thisObj.displayList();
			});
			this.collection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		
		render: function(){
			this.displayScale();
			this.renderList(this.collection.listView.currentPage);
			Backbone.View.prototype.refreshTitle('Scale','list');
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
			this.subContainer.html(compiledTemplate);
			
			this.initConfirmationWindow('Are you sure you want to delete this Scale?',
										'confirm-delete-scale',
										'Delete',
										'Delete Scale');

			this.setListOptions();
		},
		
		displayList: function () {
			var data = {
                scale_url: '#/'+Const.URL.SCALE,
				scale_edit_url: '#/'+Const.URL.SCALE+'/'+Const.CRUD.EDIT,
				scales: this.collection.models,
				_: _ 
			};
			
			var innerListTemplate = _.template(trailerInnerListTemplate, data);
			this.subContainer.find("#scale-list tbody").html(innerListTemplate);
			
			this.generatePagination();
		},

		setListOptions: function () {
			var options = this.collection.listView;
			//console.log(options);
			
			if(options.search != '')
				this.collection.setSearch('');
			
		},
		
		events: {
            'click .sort-name' : 'sortName',
            'click .sort-account-name' : 'sortAccountName',
			'click .delete-scale': 'preShowConfirmationWindow',
			'click #confirm-delete-scale': 'deleteScale'
		},
                
        sortName: function () {
			this.sortByField('name');
		},
                
        sortAccountName: function () {
			this.sortByField('account_name');
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
                    thisObj.renderList(thisObj.collection.listView.currentPage);
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