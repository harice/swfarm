define([
	'backbone',
	'views/base/ListView',
	'collections/stack/StackLocationCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/stack/stackLocationListTemplate.html',
	'text!templates/stack/stackLocationInnerListTemplate.html',
	'constant',
], function(Backbone,
			ListView,
			StackLocationCollection,
			contentTemplate,
			stackLocationListTemplate,
			stackLocationInnerListTemplate,
			Const
){

	var StackLocationListView = ListView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.extendListEvents();
			var thisObj = this;
			
			this.collection = new StackLocationCollection();
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
				'sl_add_url' : '#/'+Const.URL.STACKLOCATION+'/'+Const.CRUD.ADD,
			};
			var innerTemplate = _.template(stackLocationListTemplate, innerTemplateVar);
			
			var variables = {
				h1_title: 'Stack Location',
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
		},
		
		displayList: function () {
			
			var data = {
				sl_edit_url: '#/'+Const.URL.STACKLOCATION+'/'+Const.CRUD.EDIT,
				sls: this.collection.models,
				_: _ 
			};
			
			var innerListTemplate = _.template(stackLocationInnerListTemplate, data);
			$("#sl-list tbody").html(innerListTemplate);
			
			this.generatePagination();
		},
	});

	return StackLocationListView;
  
});