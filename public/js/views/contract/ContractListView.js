define([
	'backbone',
	'views/base/AccordionListView',
	'models/contract/ContractModel',
	'collections/contract/ContractCollection',
	'collections/contract/SalesOrderDetailsByProductCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/contract/contractListTemplate.html',
	'text!templates/contract/contractInnerListTemplate.html',
	'text!templates/contract/salesOrderDetailsByProductItemTemplate.html',
	'constant',
    'global'
], function(Backbone,
			AccordionListView,
			ContractModel,
			ContractCollection,
			SalesOrderDetailsByProductCollection,
			contentTemplate,
			contractListTemplate,
			contractInnerListTemplate,
			salesOrderDetailsByProductItemTemplate,
			Const,
            Global
){

	var ContractListView = AccordionListView.extend({
		el: $("#"+Const.CONTAINER.MAIN),

		initialize: function() {
			this.extendListEvents();
			this.initSubContainer();

			var thisObj = this;

			this.collection = new ContractCollection();
			this.collection.on('sync', function() {
                _.each(this.models, function (model) {
					if(model.get('contract_date_start'))
						model.set('contract_date_start', thisObj.convertDateFormat(model.get('contract_date_start').split(' ')[0], 'yyyy-mm-dd', thisObj.dateFormat, '-'));
					if(model.get('contract_date_end'))
						model.set('contract_date_end', thisObj.convertDateFormat(model.get('contract_date_end').split(' ')[0], 'yyyy-mm-dd', thisObj.dateFormat, '-'));
//					if(model.get('totalPrice'))
//						model.set('totalPrice', thisObj.addCommaToNumber(parseFloat(model.get('totalPrice')).toFixed(2)));
				});

				if(thisObj.subContainerExist())
					thisObj.displayList();
			});
			this.collection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},

		render: function(){
			this.displayContract();
			this.renderList(this.collection.listView.currentPage);
			Backbone.View.prototype.refreshTitle('Contract','list');
		},

		displayContract: function () {
			var innerTemplateVar = {
				'contract_add_url' : '#/'+Const.URL.CONTRACT+'/'+Const.CRUD.ADD
			};
			var innerTemplate = _.template(contractListTemplate, innerTemplateVar);

			var variables = {
				h1_title: 'Contract',
				h1_small: 'list',
				sub_content_template: innerTemplate
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);

            this.initCalendars();
			this.setListOptions();
		},

		displayList: function () {
            var contracts = this.collection.models;

			var data = {
				account_url: '#/'+Const.URL.ACCOUNT,
                contract_url: '#/'+Const.URL.CONTRACT,
				contract_edit_url: '#/'+Const.URL.CONTRACT+'/'+Const.CRUD.EDIT,
				contracts: this.collection.models,
				collapsible_id: Const.CONTRACT.COLLAPSIBLE.ID,
				_: _
			};

            _.extend(data,Backbone.View.prototype.helpers);

			var innerListTemplate = _.template(contractInnerListTemplate, data);
			this.subContainer.find("#contract-list tbody").html(innerListTemplate);
			this.collapseSelected();
			this.generatePagination();
		},

		setListOptions: function () {
			var options = this.collection.listView;

			if(options.search != '')
				this.collection.setSearch('');

			if(options.filters.contract_date_start != '')
				this.collection.setFilter('contract_date_start', '');

			if(options.filters.contract_date_end != '')
				this.collection.setFilter('contract_date_end', '');           
		},

        initCalendars: function () {
			var thisObj = this;

			this.$el.find('#filter-contract-date-start .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: this.dateFormat,
			}).on('changeDate', function (ev) {
				var selectedDate = $('#filter-contract-date-start .input-group.date input').val();
				thisObj.$el.find('#filter-contract-date-end .input-group.date').datepicker('setStartDate', selectedDate);
				var date = '';
				if(selectedDate != '' && typeof selectedDate != 'undefined')
					date = thisObj.convertDateFormat(selectedDate, thisObj.dateFormat, 'yyyy-mm-dd', '-');

				thisObj.collection.setFilter('contract_date_start', date);
				thisObj.renderList(1);
			});

			this.$el.find('#filter-contract-date-end .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: this.dateFormat,
			}).on('changeDate', function (ev) {
				var selectedDate = $('#filter-contract-date-end .input-group.date input').val();
				thisObj.$el.find('#filter-contract-date-start .input-group.date').datepicker('setEndDate', selectedDate);
				var date = '';
				if(selectedDate != '' && typeof selectedDate != 'undefined')
					date = thisObj.convertDateFormat(selectedDate, thisObj.dateFormat, 'yyyy-mm-dd', '-');

				thisObj.collection.setFilter('contract_date_end', date);
				thisObj.renderList(1);
			});
		},

		events: {
            'click .sort-contract-number' : 'sortContractNumber',
			'click #contract-accordion tr.collapse-trigger': 'toggleAccordion',
			'click .stop-propagation': 'linkStopPropagation',
            'click .close-contract': 'showCloseConfirmationWindow',
			'click #confirm-close-contract': 'closeContract',
		},

        showCloseConfirmationWindow: function (ev) {
			var id = $(ev.currentTarget).attr('data-id');
			this.initConfirmationWindow('Are you sure you want to close this contract?',
										'confirm-close-contract',
										'Close Contract',
										'Close Contract',
										false);
			this.showConfirmationWindow();
			this.$el.find('#modal-confirm #confirm-close-contract').attr('data-id', id);
			return false;
		},

        closeContract: function (ev) {
			var thisObj = this;
			var id = $(ev.currentTarget).attr('data-id');

			var contractModel = new ContractModel({id:id});
			contractModel.setCloseURL();
			contractModel.save(
				null,
				{
					success: function (model, response, options) {
						thisObj.hideConfirmationWindow('modal-confirm', function () {
//							thisObj.subContainer.find('#'+Const.CONTRACT.COLLAPSIBLE.ID+id+' .editable-button').remove();
//							thisObj.subContainer.find('.collapse-trigger[data-id="'+id+'"] .td-status').html('<label class="label label-default">Closed</label>');
						});
                        Backbone.history.stop();
                        Backbone.history.start();

						thisObj.displayMessage(response);
                        $('body').removeClass('modal-open');
                        $('.modal-backdrop').hide();
					},
					error: function (model, response, options) {
						thisObj.hideConfirmationWindow();
						if(typeof response.responseJSON.error == 'undefined')
							alert(response.responseJSON);
						else
							thisObj.displayMessage(response);
					},
                    wait: true,
					headers: contractModel.getAuth(),
				}
			);
		},

        sortContractNumber: function () {
			this.sortByField('contract_number');
		},

		toggleAccordion: function (ev) {
			var thisObj = this;

			this.toggleAccordionAndRequestACollection(ev.currentTarget,
				Const.CONTRACT.COLLAPSIBLE.ID,
				SalesOrderDetailsByProductCollection,
				function (collection, id) {
					var collapsibleId = Const.CONTRACT.COLLAPSIBLE.ID+id;
					$('#'+collapsibleId).find('.sales-order-details-by-product').html(thisObj.generateSalesOrderDetailsByProduct(collection.models, id));
				}
			);

			return false;
		},

		generateSalesOrderDetailsByProduct: function (models) {
			var data = {
				products: models,
				contract_url: '/#/'+Const.URL.CONTRACT,
				sales_order_url: '/#/'+Const.URL.SO,
                purchase_order_url: '/#/'+Const.URL.PO,
				_: _
			};

            _.extend(data,Backbone.View.prototype.helpers);

			return _.template(salesOrderDetailsByProductItemTemplate, data);
		},
	});

	return ContractListView;

});