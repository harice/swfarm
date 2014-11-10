define([
	'backbone',
	'views/base/ListView',
	'collections/stack/StackLocationCollection',	
	'text!templates/account/locationListTemplate.html',
	'text!templates/account/locationInnerListTemplate.html',	
	'global',
	'constant',
], function(
	Backbone,
	ListView,				
	LocationCollection,
	locationListTemplate,
	locationInnerListTemplate,	
	Global,
	Const
){

	var ContactsAccountView = ListView.extend({		

		initialize: function(options) {
			var thisObj = this;	
			this.extendListEvents();
			this.accountId = options.id;
			this.accountName = options.name;

			this.collection = new LocationCollection();		
			this.collection.on('sync', function (){
				thisObj.displayList();
				this.off('sync');
			});			

		},
		
		render: function(){
			this.setUpContent();
			this.collection.setSearch(this.accountName);
			this.renderList(this.collection.listView.currentPage);	
		},	

		displayList: function(){			
			var data = {
				accountName: this.accountName,
                sl_url: '#/'+Const.URL.STACKLOCATION,
				sl_edit_url: '#/'+Const.URL.STACKLOCATION+'/'+Const.CRUD.EDIT,
				sls: this.collection.models,
				collapsible_id: Const.STACKLOCATION.COLLAPSIBLE.ID,
				_: _ 
			};	
			
			var innerListTemplate = _.template(locationInnerListTemplate, data);							
			this.$el.find("#sl-list tbody").html(innerListTemplate);			

			this.generatePagination();
		},

		setUpContent: function(){
			var variables = {
				_: _
			};

			var listTemplate = _.template(locationListTemplate, variables);
			this.$el.html(listTemplate);
		},		

	});

  return ContactsAccountView;
  
});