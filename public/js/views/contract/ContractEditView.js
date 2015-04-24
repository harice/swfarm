define([
	'backbone',
	'views/contract/ContractAddView',
	'jqueryui',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'views/autocomplete/CustomAutoCompleteView',
	'collections/account/AccountCustomerCollection',
	'collections/product/ProductCollection',
	'models/contract/ContractModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/contract/contractAddTemplate.html',
	'text!templates/contract/contractProductItemTemplate.html',
	'global',
	'constant'
], function(Backbone,
			ContractAddView,
			JqueryUI,
			Validate,
			TextFormatter,
			PhoneNumber,
			CustomAutoCompleteView,
			AccountCustomerCollection,
			ProductCollection,
			ContractModel,
			contentTemplate,
			contractAddTemplate,
			productItemTemplate,
			Global,
			Const
){

	var SalesOrderEditView = ContractAddView.extend({
		el: $("#"+Const.CONTAINER.MAIN),

		customerAutoCompleteView: null,

		initialize: function(option) {
			this.initSubContainer();
			var thisObj = this;
			this.soId = option.id;
			this.h1Title = 'Contract';
			this.h1Small = 'edit';

			this.productAutoCompletePool = [];
			this.options = {
				productFieldClone: null,
				productFieldCounter: 0,
				productFieldClass: ['product_id', 'tons', 'bales', 'id'],
				productFieldClassRequired: ['product_id', 'tons', 'bales'],
				productFieldExempt: [],
				productFieldSeparator: '.',
				removeComma: ['unitprice', 'tons', 'bales']
			};

			this.productCollection = new ProductCollection();
			this.productCollection.on('sync', function() {
				_.each(this.models, function (productModels) {
					thisObj.productAutoCompletePool.push({
						label:productModels.get('name'),
						value:productModels.get('name'),
						id:productModels.get('id')
					});
				});

				if(thisObj.subContainerExist()) {
					thisObj.displayForm();
					thisObj.supplyContractData();
					$('#account').focus();
				}
				this.off('sync');
			});
			this.productCollection.on('error', function(collection, response, options) {
				this.off('error');
			});

			this.model = new ContractModel({id:this.soId});
			this.model.on('change', function() {
				thisObj.productCollection.getAllModel();
				this.off('change');
			});
		},

		render: function(){
			this.model.runFetch();
			Backbone.View.prototype.refreshTitle('Contract','edit');
		},

		supplyContractData: function () {
			var thisObj = this;

            var status = this.model.get('status');
			var account = this.model.get('account');
            var address = this.model.get('account').address;
			var products = this.model.get('products');

			this.$el.find('#contract_number').val(this.model.get('contract_number'));
			this.customerAutoCompleteView.autoCompleteResult = [{name:account.name, id:account.id, address:address}];
			this.$el.find('#account').val(account.name);
			this.$el.find('#account_id').val(account.id);
            this.$el.find('#status').val(status.name);
			this.$el.find('#status_id').val(status.id);
			this.$el.find('#street').val(address[0].street);
			this.$el.find('#state').val(address[0].address_states[0].state);
			this.$el.find('#city').val(address[0].city);
			this.$el.find('#zipcode').val(address[0].zipcode);
			this.$el.find('#dateofsale').val(this.convertDateFormat(this.model.get('created_at').split(' ')[0], 'yyyy-mm-dd', thisObj.dateFormat, '-'));

			var startDate = this.convertDateFormat(this.model.get('contract_date_start').split(' ')[0], 'yyyy-mm-dd', thisObj.dateFormat, '-');
			var endDate = this.convertDateFormat(this.model.get('contract_date_end').split(' ')[0], 'yyyy-mm-dd', thisObj.dateFormat, '-');
			this.$el.find('#start-date .input-group.date').datepicker('update', startDate);
			this.$el.find('#start-date .input-group.date').datepicker('setEndDate', endDate);
			this.$el.find('#end-date .input-group.date').datepicker('update', endDate);
			this.$el.find('#end-date .input-group.date').datepicker('setStartDate', startDate);

			var i= 0;
			_.each(products, function (product) {
				var productFields = (i > 0)? thisObj.addProduct(): thisObj.$el.find('#product-list tbody .product-item:first-child');
				i++;

				productFields.find('.id').val(product.id);
				productFields.find('.product_id').val(product.id);
				productFields.find('.tons').val(thisObj.addCommaToNumber(parseFloat(product.pivot.tons).toFixed(3)));
				productFields.find('.bales').val(thisObj.addCommaToNumber(product.pivot.bales));
			});
		},
	});

  return SalesOrderEditView;

});