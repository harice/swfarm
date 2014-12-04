define([
	'backbone',
	'views/base/ListView',
	'models/trucker/TruckerModel',
    'models/account/AccountExtrasModel',
	'collections/trucker/TruckerCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/trucker/truckerListTemplate.html',
    'text!templates/trucker/truckerFilterTemplate.html',
	'text!templates/trucker/truckerInnerListTemplate.html',
	'constant',
], function(Backbone,
			ListView,
			TruckerModel,
            AccountExtrasModel,
			TruckerCollection,
			contentTemplate,
			truckerListTemplate,
            truckerFilterTemplate,
			truckerInnerListTemplate,
			Const
){

	var TruckerListView = ListView.extend({
		el: $("#"+Const.CONTAINER.MAIN),

		initialize: function() {
			this.extendListEvents();
			this.initSubContainer();

			var thisObj = this;
			this.h1Title = 'Trucker';
			this.h1Small = 'list';

			this.collection = new TruckerCollection();
			this.collection.on('sync', function() {
				if(thisObj.subContainerExist()){
					thisObj.displayList();						
				}
			});
			this.collection.on('error', function(collection, response, options) {
				this.off('error');
			});
			this.model = new AccountExtrasModel();
			this.model.on('change', function() {
				if(thisObj.subContainerExist()) {
					thisObj.displayTrucker();
					thisObj.renderList(thisObj.collection.listView.currentPage);
				}
				this.off('change');
			});

		},

		render: function(){
//			this.displayTrucker();
            this.model.runFetch();
			Backbone.View.prototype.refreshTitle(this.h1Title,this.h1Small);
		},

		displayTrucker: function () {
            var filterTemplate = _.template(truckerFilterTemplate, {'filters' : this.model.get('accountTypes')});

			var innerTemplateVar = {
				'trucker_add_url' : '#/'+Const.URL.TRUCKER+'/'+Const.CRUD.ADD,
                'type_filters': filterTemplate
			};

			var innerTemplate = _.template(truckerListTemplate, innerTemplateVar);

			var variables = {
				h1_title: 'Trailer',
				h1_small: 'list',
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);

			this.initConfirmationWindow('Are you sure you want to delete this Trucker?',
										'confirm-delete-trucker',
										'Delete',
										'Delete Trucker');

			this.setListOptions();
		},

		displayList: function () {
			var data = {
                trucker_url: '#/'+Const.URL.TRUCKER,
				trucker_edit_url: '#/'+Const.URL.TRUCKER+'/'+Const.CRUD.EDIT,
				truckers: this.collection.models,
				truckertypes: Const.ACCOUNT.TRUCKERS,
				account_url: '#/'+Const.URL.ACCOUNT,
				_: _
			};

            _.extend(data,Backbone.View.prototype.helpers);
			var innerListTemplate = _.template(truckerInnerListTemplate, data);
			this.subContainer.find("#trucker-list tbody").html(innerListTemplate);

			this.generatePagination();
		},

		setListOptions: function () {
			var options = this.collection.listView;
			//console.log(options);
			
			if(options.search != '')
				this.collection.setSearch('');

			if(options.filters.type != '')
				this.collection.setFilter('filter','');
			
		},

		events: {
            'click .sort-trucknumber' : 'sortTruckNumber',
            'change .accounttypeFilter' : 'filterByType',
			'change .checkall' : 'checkAll',
			'click .delete-trucker': 'preShowConfirmationWindow',
			'click #confirm-delete-trucker': 'deleteTrucker'
		},

        sortTruckNumber: function () {
			this.sortByField('trucknumber');
		},

        checkAll: function () {
			if($('.checkall').is(':checked')) {
				$('.accountids').prop('checked',true);
			} else {
				$('.accountids').prop('checked',false);
			}
		},

        filterByType: function (ev) {
			var filter = $(ev.target).val();
			this.collection.setFilter('filter',filter);
			this.renderList(1);
			return false;
		},

		preShowConfirmationWindow: function (ev) {
			this.$el.find('#confirm-delete-trucker').attr('data-id', $(ev.currentTarget).attr('data-id'));

			this.showConfirmationWindow();
			return false;
		},

		deleteTrucker: function (ev) {
			var thisObj = this;
			var truckerModel = new TruckerModel({id:$(ev.currentTarget).attr('data-id')});

            truckerModel.destroy({
                success: function (model, response, options) {
                    thisObj.displayMessage(response);
                    thisObj.renderList(thisObj.collection.listView.currentPage);
                },
                error: function (model, response, options) {
                    thisObj.displayMessage(response);
                },
                wait: true,
                headers: truckerModel.getAuth(),
            });
		},
	});

	return TruckerListView;

});