define([
	'backbone',
	'views/base/AccordionListView',
	'models/stack/StackLocationModel',
	'collections/stack/StackLocationCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/commission/commissionListTemplate.html',
	'text!templates/stack/stackLocationInnerListTemplate.html',
	'constant',
], function(Backbone,
			AccordionListView,
			StackLocationModel,
			StackLocationCollection,
			contentTemplate,
			commissionListTemplate,
			stackLocationInnerListTemplate,
			Const
){

	var CommissionListView = AccordionListView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.extendListEvents();
			this.initSubContainer();
			
			var thisObj = this;
			
			/*this.collection = new StackLocationCollection();
			this.collection.on('sync', function() {
				if(thisObj.subContainerExist())
					thisObj.displayList();
			});
			this.collection.on('error', function(collection, response, options) {
				this.off('error');
			});*/
		},
		
		render: function(){
			this.displayStackLocation();
			//this.renderList(this.collection.listView.currentPage);
			Backbone.View.prototype.refreshTitle('Commission','list');
		},
		
		displayStackLocation: function () {
			var innerTemplateVar = {};
			var innerTemplate = _.template(commissionListTemplate, innerTemplateVar);
			
			var variables = {
				h1_title: 'Commission',
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
			this.setListOptions();
		},
		
		displayList: function () {
			
			/*var data = {
                sl_url: '#/'+Const.URL.STACKLOCATION,
				sl_edit_url: '#/'+Const.URL.STACKLOCATION+'/'+Const.CRUD.EDIT,
				sls: this.collection.models,
				collapsible_id: Const.PO.COLLAPSIBLE.ID,
				_: _ 
			};
			
			var innerListTemplate = _.template(stackLocationInnerListTemplate, data);
			this.subContainer.find("#commission-list tbody").html(innerListTemplate);
			this.collapseSelected();
			this.generatePagination();*/
		},
		
		setListOptions: function () {
			/*var options = this.collection.listView; //console.log(options);
			
			if(options.search != '')
				this.$el.find('#search-keyword').val(options.search);*/
		},
		
		events: {
			'click tr.collapse-trigger': 'toggleAccordion',
		},
		
		toggleAccordion: function (ev) {
			/*var thisObj = this;
			this.toggleAccordionNormal(ev.currentTarget);
			return false;*/
		},
	});

	return CommissionListView;
  
});