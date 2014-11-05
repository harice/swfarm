define([
	'backbone',
	'views/base/ListView',
	'collections/account/TrailerCollection',		
	'text!templates/account/trailerListTemplate.html',
	'text!templates/account/trailerInnerListTemplate.html',		
	'global',
	'constant',
], function(
	Backbone,
	ListView,				
	TrailerCollection,
	trailerListTemplate,
	trailerInnerListTemplate,		
	Global,
	Const
){

	var ContactsAccountView = ListView.extend({		

		initialize: function(options) {
			var thisObj = this;	
			this.extendListEvents();
			this.accountId = options.id;
			this.accountName = options.name;

			this.collection = new TrailerCollection();		
			this.collection.on('sync', function (){
				thisObj.displayList();
				this.off('sync');
			});			

		},
		
		render: function(){
			this.setUpContent();
			this.collection.getTrailerByAccountId(this.accountId);			
		},	

		displayList: function(){			
			var data = {
				accountName: this.accountName,
                trailer_url: '#/'+Const.URL.TRAILER,
				trailer_edit_url: '#/'+Const.URL.TRAILER+'/'+Const.CRUD.EDIT,
				trailers: this.collection.models,
				_: _ 
			};	
			
			var innerListTemplate = _.template(trailerInnerListTemplate, data);							
			this.$el.find("#trailer-list tbody").html(innerListTemplate);			

			this.generatePagination(this.collection.length, Const.MAXITEMPERPAGE);
		},

		setUpContent: function(){
			var variables = {
				_: _
			};

			var listTemplate = _.template(trailerListTemplate, variables);
			$('#account-tabpanes').append(listTemplate);
		},		

	});

  return ContactsAccountView;
  
});