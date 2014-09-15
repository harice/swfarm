define([
	'backbone',
	'views/base/AccordionListView',
	'views/base/GoogleMapsView',
	'models/stack/StackLocationModel',
	'collections/stack/StackLocationCollection',
	'collections/address/AddressCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/stack/stackLocationListTemplate.html',
	'text!templates/stack/stackLocationInnerListTemplate.html',
	'constant',
], function(Backbone,
			AccordionListView,
			GoogleMapsView,
			StackLocationModel,
			StackLocationCollection,
			AddressCollection,
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

			this.addressCollection = new AddressCollection();
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
			
			this.googleMaps = new GoogleMapsView();
			this.googleMaps.initSetMapLocation();
			
			this.initConfirmationWindow('Are you sure you want to delete this Stock Location?',
										'confirm-delete-sl',
										'Delete',
										'Delete Stack Location');
										
			this.setListOptions();
		},
		
		displayList: function () {
			
			var data = {
                sl_url: '#/'+Const.URL.STACKLOCATION,
				sl_edit_url: '#/'+Const.URL.STACKLOCATION+'/'+Const.CRUD.EDIT,
				sls: this.collection.models,
				collapsible_id: Const.STACKLOCATION.COLLAPSIBLE.ID,
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
            'click .sort-name' : 'sortName',
            'click .sort-account-name' : 'sortAccountName',
			'click tr.collapse-trigger': 'toggleAccordion',
			'click .delete-sl': 'preShowConfirmationWindow',
			'click #confirm-delete-sl': 'deleteStockLocation',
			'click .show-map': 'showMap',
			'click #show-map-all': 'showMapAll',
		},
                
        sortName: function () {
			this.sortByField('name');
		},
                
        sortAccountName: function () {
			this.sortByField('account_name');
		},
		
		toggleAccordion: function (ev) {
			var thisObj = this;
			this.toggleAccordionNormal(ev.currentTarget, Const.STACKLOCATION.COLLAPSIBLE.ID);
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
		
		showMap: function (ev) {
			var thisObj = this;
			var element = $(ev.currentTarget);
			var id = element.attr('data-id');	
			var lat = '';
			var lng = '';	
			
			var model = new StackLocationModel({id:id});
			model.fetch({
				success: function(model,response,options){
					if(model.get('latitude') && model.get('longitude')) {
						var markers = [{accountName:model.get('account_name'),name:model.get('name'),lat:model.get('latitude'),lng:model.get('longitude')}];
						thisObj.googleMaps.showModalSetLocation(markers);
					}
					else
						thisObj.displayGritter('Map location not set for this stack location. Edit this stack location and add a map location.');	
				},
				error: function(model, response, options){

				},
				headers: model.getAuth(),
			});
		},
		
		showMapAll: function (ev) {
			var markers = [];
			var i = 0;
			
			_.each(this.collection.models, function (model) {
				if(model.get('latitude') && model.get('longitude')) {
					markers.push({accountName:model.get('account_name'),name:model.get('name'),lat:model.get('latitude'),lng:model.get('longitude')});
				}
			});
			
			this.googleMaps.showModalSetLocation(markers);
		},
		
		destroySubViews: function () {
			if(this.googleMaps != null)
				this.googleMaps.destroyView();
		},
	});

	return StackLocationListView;
  
});