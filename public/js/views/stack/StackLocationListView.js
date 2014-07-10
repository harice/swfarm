define([
	'backbone',
	'views/base/AccordionListView',
	'models/stack/StackLocationModel',
	'collections/stack/StackLocationCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/stack/stackLocationListTemplate.html',
	'text!templates/stack/stackLocationInnerListTemplate.html',
	'constant',
], function(Backbone,
			AccordionListView,
			StackLocationModel,
			StackLocationCollection,
			contentTemplate,
			stackLocationListTemplate,
			stackLocationInnerListTemplate,
			Const
){

	var StackLocationListView = AccordionListView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.extendListEvents();
			this.initSubContainer();
			
			var thisObj = this;
			
			this.collection = new StackLocationCollection();
			this.collection.on('sync', function() {
				if(thisObj.subContainerExist())
					thisObj.displayList();
			});
			this.collection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		
		render: function(){
			this.displayStackLocation();
			this.renderList(this.collection.listView.currentPage);
			Backbone.View.prototype.refreshTitle('Stack Location','list');
		},
		
		displayStackLocation: function () {
			var innerTemplateVar = {
				'sl_add_url' : '#/'+Const.URL.STACKLOCATION+'/'+Const.CRUD.ADD,
			};
			var innerTemplate = _.template(stackLocationListTemplate, innerTemplateVar);
			
			var variables = {
				h1_title: 'Stack Location',
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
			
			this.initConfirmationWindow('Are you sure you want to delete this Stock Location?',
										'confirm-delete-sl',
										'Delete',
										'Delete Stack Location');
										
			this.setListOptions();
		},
		
		displayList: function () {
			
			var data = {
				sl_edit_url: '#/'+Const.URL.STACKLOCATION+'/'+Const.CRUD.EDIT,
				sls: this.collection.models,
				collapsible_id: Const.PO.COLLAPSIBLE.ID,
				_: _ 
			};
			
			var innerListTemplate = _.template(stackLocationInnerListTemplate, data);
			this.subContainer.find("#sl-list tbody").html(innerListTemplate);
			this.collapseSelected();
			this.generatePagination();
		},
		
		setListOptions: function () {
			var options = this.collection.listView; //console.log(options);
			
			if(options.search != '')
				this.$el.find('#search-keyword').val(options.search);
		},
		
		events: {
			'click tr.collapse-trigger': 'toggleAccordion',
			'click .delete-sl': 'preShowConfirmationWindow',
			'click #confirm-delete-sl': 'deleteStockLocation'
		},
		
		toggleAccordion: function (ev) {
			var thisObj = this;
			this.toggleAccordionNormal(ev.currentTarget);
			return false;
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

	return StackLocationListView;
  
});