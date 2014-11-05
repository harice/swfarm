define([
	'backbone',
	'views/base/ListView',
	'collections/trucker/TruckerCollection',	
	'text!templates/account/truckerListTemplate.html',
	'text!templates/account/truckerInnerListTemplate.html',		
	'global',
	'constant',
], function(
	Backbone,
	ListView,				
	TruckerCollection,
	truckerListTemplate,
	truckerInnerListTemplate,	
	Global,
	Const
){

	var ContactsAccountView = ListView.extend({		

		initialize: function(options) {
			var thisObj = this;	
			this.extendListEvents();
			this.accountId = options.id;
			this.accountName = options.name;

			this.collection = new TruckerCollection();		
			this.collection.on('sync', function (){
				thisObj.displayList();
				this.off('sync');
			});			

		},
		
		render: function(){
			this.setUpContent();
			this.collection.getTruckerNumbersByAccount(this.accountId);			
		},	

		displayList: function(){			
			var data = {
				accountName: this.accountName,
                trucker_url: '#/'+Const.URL.TRUCKER,
				trucker_edit_url: '#/'+Const.URL.TRUCKER+'/'+Const.CRUD.EDIT,
				truckers: this.collection.models,
				truckertypes: Const.ACCOUNT.TRUCKERS,
				_: _ 
			};	
			
			_.extend(data,Backbone.View.prototype.helpers);
			var innerListTemplate = _.template(truckerInnerListTemplate, data);							
			this.$el.find("#trucker-list tbody").html(innerListTemplate);			

			this.generatePagination(this.collection.length, Const.MAXITEMPERPAGE);
		},

		setUpContent: function(){
			var variables = {
				_: _
			};

			var listTemplate = _.template(truckerListTemplate, variables);
			$('#account-tabpanes').append(listTemplate);
		},		

	});

  return ContactsAccountView;
  
});