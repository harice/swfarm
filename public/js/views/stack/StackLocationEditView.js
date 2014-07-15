define([
	'backbone',
	'bootstrapdatepicker',
	'views/stack/StackLocationAddView',
	'jqueryvalidate',
	'jquerytextformatter',
	'models/stack/StackLocationModel',
	'collections/account/AccountCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/stack/stackLocationAddTemplate.html',
	'global',
	'constant'
], function(Backbone,
			DatePicker,
			StackLocationAddView,
			Validate,
			TextFormatter,
			StackLocationModel,
			AccountCollection,
			contentTemplate,
			stackLocationAddTemplate,
			Global,
			Const
){

	var StackLocationEditView = StackLocationAddView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			this.initSubContainer();
			var thisObj = this;
			this.slId = option.id;
			this.h1Title = 'Stack Location';
			this.h1Small = 'add';
			
			this.options = {
				sectionFieldClone: null,
				sectionFieldCounter: 0,
				sectionFieldClass: ['name', 'description', 'id'],
				sectionFieldClassRequired: ['name'],
				sectionFieldExempt: [],
				sectionFieldSeparator: '.',
				removeComma: [],
			};
			
			this.producerAndWarehouseAccount = new AccountCollection();
			this.producerAndWarehouseAccount.on('sync', function() {
				if(thisObj.subContainerExist()) {
					thisObj.displayForm();
					thisObj.supplyStackLocationData();
				}
				this.off('sync');
			});
			this.producerAndWarehouseAccount.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.model = new StackLocationModel({id:this.slId});
			this.model.on('change', function() {
				thisObj.producerAndWarehouseAccount.getProducerAndWarehouseAccount();
				this.off('change');
			});
		},
		
		otherInitializations: function () {
			this.initDeleteConfirmation();
		},
		
		render: function(){
			this.model.runFetch();
			Backbone.View.prototype.refreshTitle('Stack Location','edit');
		},
		
		supplyStackLocationData: function () {
			var thisObj = this;
			var section = this.model.get('section');
			
			this.$el.find('#account_id').val(this.model.get('account_id'));
			this.$el.find('#name').val(this.model.get('name'));
			this.$el.find('#description').val(this.model.get('description'));
			
			var i= 0;
			_.each(section, function (s) {
				var sectionFields = (i > 0)? thisObj.addSection(): thisObj.$el.find('#section-list tbody .section-item:first-child');
				i++;
				
				sectionFields.find('.id').val(s.id);
				sectionFields.find('.name').val(s.name);
				sectionFields.find('.description').val(s.description);
			});
		},
		
		initDeleteConfirmation: function () {
			this.initConfirmationWindow('Are you sure you want to delete this Stock Location?',
										'confirm-delete-sl',
										'Delete');
		},
	});

	return StackLocationEditView;
  
});