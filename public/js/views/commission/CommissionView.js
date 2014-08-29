define([
	'backbone',
	'views/base/ListView',
	'collections/salesorder/SOWeightInfoCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/commission/userCommissionTemplate.html',
	'text!templates/stacknumber/stackNumberInnerListTemplate.html',
	'constant',
], function(Backbone,
			ListView,
			SOWeightInfoCollection,
			contentTemplate,
			userCommissionTemplate,
			stackNumberInnerListTemplate,
			Const
){

	var CommissionView = ListView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			this.extendListEvents();
			this.initSubContainer();
			
			var thisObj = this;
			this.userId = option.id;
			this.h1Title = 'User Commission';
			this.h1Small = '';
			
			this.collection = new SOWeightInfoCollection();
			this.collection.setFilter('userId', this.userId);
			this.collection.listView.searchURLForFilter = false;
			this.collection.setDefaultURL('/apiv1/commission/getClosedWeightTicketByUserIncludingWithCommission');
			this.collection.on('sync', function() {
				if(thisObj.subContainerExist()) {
					thisObj.displayUserCommission();
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
		
		displayUserCommission: function () {
			var innerTemplateVar = {
				product_stacknumber: '',
				total_on_hand: '',
			};
			
			var innerTemplate = _.template(userCommissionTemplate, innerTemplateVar);
			
			var variables = {
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
		},
		
		displayList: function () {
			
			/*var data = {
				stacknumbers: this.collection.models,
				_: _ 
			};
			
			_.extend(data,Backbone.View.prototype.helpers);
			
			var innerListTemplate = _.template(stackNumberInnerListTemplate, data);
			this.subContainer.find("#user-commission-list tbody").html(innerListTemplate);
			
			this.generatePagination();*/
		},
		
		events: {
			'click #go-to-previous-page': 'goToPreviousPage',
		},
	});

	return CommissionView;
  
});