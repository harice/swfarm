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
			this.stackNumber = option.id;
			this.h1Title = 'Stack Number Transaction';
			this.h1Small = 'list';
			
			this.collection = new StackNumberCollection();
			this.collection.setFilter('stacknumber', this.stackNumber);
			this.collection.listView.searchURLForFilter = false;
			this.collection.on('sync', function() {
				if(thisObj.subContainerExist()) {
					thisObj.displayStackNumber();
					thisObj.displayList();
				}
			});
			this.collection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		
		render: function(){
			this.renderList(1);
			Backbone.View.prototype.refreshTitle(this.h1Title, this.h1Small);
		},
		
		displayStackNumber: function () {
			var innerTemplateVar = {
				product_stacknumber: this.collection.getOtherData('productname')+' '+this.collection.getOtherData('stacknumber'),
				total_on_hand: this.addCommaToNumber(parseFloat(this.collection.getOtherData('onHandTons')).toFixed(3)),
			};
			var innerTemplate = _.template(stackNumberListTemplate, innerTemplateVar);
			
			var variables = {
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
		},
		
		displayList: function () {
			
			var data = {
				po_url: '#/'+Const.URL.PO,
				weight_info_url: '/#/'+Const.URL.POWEIGHTINFO,
				stacknumbers: this.collection.models,
				_: _ 
			};
			
			_.extend(data,Backbone.View.prototype.helpers);
			
			var innerListTemplate = _.template(stackNumberInnerListTemplate, data);
			this.subContainer.find("#stacknumber-list tbody").html(innerListTemplate);
			
			this.generatePagination();
		},
		
		events: {
			'click #go-to-previous-page': 'goToPreviousPage',
		},
	});

	return StackNumberView;
  
});