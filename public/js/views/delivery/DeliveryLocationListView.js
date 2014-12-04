define([
	'backbone',
	'views/base/AccordionListView',
	'views/base/GoogleMapsView',
	'models/delivery/DeliveryLocationModel',
	'collections/stack/StackLocationCollection',
	'collections/address/AddressCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/delivery/deliveryLocationListTemplate.html',
	'text!templates/delivery/deliveryLocationInnerListTemplate.html',
	'constant',
], function(Backbone,
			AccordionListView,
			GoogleMapsView,
			DeliveryLocationModel,
			StackLocationCollection,
			AddressCollection,
			contentTemplate,
			deliveryLocationListTemplate,
			deliveryLocationInnerListTemplate,
			Const
){

	var DeliveryLocationListView = AccordionListView.extend({
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
			Backbone.View.prototype.refreshTitle('Delivery Location','list');
		},
		
		displayStackLocation: function () {
			var innerTemplateVar = {
				'dl_add_url' : '#/'+Const.URL.DELIVERYLOCATION+'/'+Const.CRUD.ADD,
			};
			var innerTemplate = _.template(deliveryLocationListTemplate, innerTemplateVar);
			
			var variables = {
				h1_title: 'Delivery Location',
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
			
			this.googleMaps = new GoogleMapsView();
			this.googleMaps.initSetMapLocation();
			
			this.initConfirmationWindow('Are you sure you want to delete this Delivery Location?',
										'confirm-delete-dl',
										'Delete',
										'Delete Delivery Location');
										
			this.setListOptions();
		},
		
		displayList: function () {
			var data = {
                dl_url: '#/'+Const.URL.DELIVERYLOCATION,
				dl_edit_url: '#/'+Const.URL.DELIVERYLOCATION+'/'+Const.CRUD.EDIT,
				dls: this.collection.models,
				account_url: '#/'+Const.URL.ACCOUNT,
				collapsible_id: Const.DELIVERYLOCATION.COLLAPSIBLE.ID,
				_: _ 
			};
			
			var innerListTemplate = _.template(deliveryLocationInnerListTemplate, data);
			this.subContainer.find("#dl-list tbody").html(innerListTemplate);
			this.collapseSelected();
			this.generatePagination();
			
		},
		
		setListOptions: function () {
			var options = this.collection.listView; //console.log(options);
			
			if(options.search != '')
				this.collection.setSearch('');
		},
		
		events: {
            'click .sort-name' : 'sortName',
            'click .sort-account-name' : 'sortAccountName',
			'click tr.collapse-trigger': 'toggleAccordion',
			'click .delete-sl': 'preShowConfirmationWindow',
			'click #confirm-delete-dl': 'deleteDeliveryLocation',
			'click .show-map': 'showMap',
			'click #show-map-all': 'showMapAll',
			'click .stop-propagation': 'linkStopPropagation',
		},
                
        sortName: function () {
			this.sortByField('name');
		},
                
        sortAccountName: function () {
			this.sortByField('account_name');
		},
		
		toggleAccordion: function (ev) {
			var thisObj = this;
			this.toggleAccordionNormal(ev.currentTarget, Const.DELIVERYLOCATION.COLLAPSIBLE.ID);
			return false;
		},
		
		preShowConfirmationWindow: function (ev) {
			this.$el.find('#confirm-delete-dl').attr('data-id', $(ev.currentTarget).attr('data-id'));
			
			this.showConfirmationWindow();
			return false;
		},
		
		deleteDeliveryLocation: function (ev) {
			var thisObj = this;
			var deliveryLocationModel = new DeliveryLocationModel({id:$(ev.currentTarget).attr('data-id')});
			
            deliveryLocationModel.destroy({
                success: function (model, response, options) {
                    thisObj.displayMessage(response);
                    thisObj.renderList(1);
                },
                error: function (model, response, options) {
                    thisObj.displayMessage(response);
                },
                wait: true,
                headers: deliveryLocationModel.getAuth(),
            });
		},
		
		showMap: function (ev) {
			var thisObj = this;
			var element = $(ev.currentTarget);
			var id = element.attr('data-id');	
			var lat = '';
			var lng = '';				

			var model = new DeliveryLocationModel({id:id});
			model.fetch({
				success: function(model,response,options){
					if(model.get('latitude') && model.get('longitude')) {
						var markers = [{accountName:model.get('account_name'),name:model.get('name'),totalTons: model.get('totalTons'),lat:model.get('latitude'),lng:model.get('longitude')}];
						var draggable = {draggableMarker: false};
						thisObj.googleMaps.showModalSetLocation(markers, draggable);
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
			var options = {draggableMarker: false};
			
			_.each(this.collection.models, function (model) {
				if(model.get('latitude') && model.get('longitude')) {					
					markers.push({accountName:model.get('account_name'),name:model.get('name'),totalTons: model.get('totalTons'),lat:model.get('latitude'),lng:model.get('longitude')});
				}
			});
			
			this.googleMaps.showModalSetLocation(markers, options);
		},
		
		destroySubViews: function () {
			if(this.googleMaps != null)
				this.googleMaps.destroyView();
		},
	});

	return DeliveryLocationListView;
  
});