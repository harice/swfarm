define([
	'backbone',
	'views/base/ListView',
	'collections/scale/ScaleCollection',	
	'text!templates/account/scaleListTemplate.html',
	'text!templates/account/scaleInnerListTemplate.html',	
	'global',
	'constant',
], function(
	Backbone,
	ListView,				
	ScaleCollection,
	scaleListTemplate, 
	scaleInnerListTemplate, 			
	Global,
	Const
){

	var ContactsAccountView = ListView.extend({		

		initialize: function(options) {
			var thisObj = this;	
			this.extendListEvents();
			this.accountId = options.id;
			this.accountName = options.name;

			this.collection = new ScaleCollection();		
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
                scale_url: '#/'+Const.URL.SCALE,
				scale_edit_url: '#/'+Const.URL.SCALE+'/'+Const.CRUD.EDIT,
				scales: this.collection.models,
				_: _ 
			};	
			
			var innerListTemplate = _.template(scaleInnerListTemplate, data);							
			this.$el.find("#scale-list tbody").html(innerListTemplate);			

			this.generatePagination();
		},

		setUpContent: function(){
			var variables = {
				_: _
			};

			var listTemplate = _.template(scaleListTemplate, variables);
			this.$el.html(listTemplate);
		},		

	});

  return ContactsAccountView;
  
});