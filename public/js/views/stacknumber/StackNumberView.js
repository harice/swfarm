define([
	'backbone',
	'views/base/ListView',
	'collections/stacknumber/StackNumberCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/stacknumber/stackNumberListTemplate.html',
	'text!templates/stacknumber/stackNumberInnerListTemplate.html',
	'constant',
], function(Backbone,
			ListView,
			StackNumberCollection,
			contentTemplate,
			stackNumberListTemplate,
			stackNumberInnerListTemplate,
			Const
){

	var StackNumberView = ListView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			this.extendListEvents();
			this.initSubContainer();
			
			var thisObj = this;
			this.stackNumberId = option.id;
			this.h1Title = 'Stack Number Transaction';
			this.h1Small = 'list';
			
			this.collection = new StackNumberCollection();
			this.collection.on('sync', function() {
				if(thisObj.subContainerExist())
					thisObj.displayList();
			});
			this.collection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		
		render: function(){
			this.displayStackNumber();
			this.renderList(1);
			Backbone.View.prototype.refreshTitle(this.h1Title, this.h1Small);
		},
		
		displayStackNumber: function () {
			var innerTemplateVar = {};
			var innerTemplate = _.template(stackNumberListTemplate, innerTemplateVar);
			
			var variables = {
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
		},
		
		displayList: function () {
			
			var data = {
				stacknumbers: this.collection.models,
				_: _ 
			};
			
			var innerListTemplate = _.template(stackNumberInnerListTemplate, data);
			this.subContainer.find("#stacknumber-list tbody").html(innerListTemplate);
			
			this.generatePagination();
		},
		
		events: {
		},
	});

	return StackNumberView;
  
});