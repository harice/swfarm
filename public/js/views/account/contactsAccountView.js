define([
	'backbone',
	'views/base/ListView',
	'models/contact/ContactModel',
	'models/account/AccountModel',
	'collections/contact/ContactCollection',
	'text!templates/account/contactListTemplate.html',
	'text!templates/account/contactInnerListTemplate.html',
	'global',
	'constant',
], function(
	Backbone,
	ListView,			
	Contact,
	Account,
	ContactCollection,
	contactListTemplate,
	contactInnerListTemplate,
	Global,
	Const
){

	var ContactsAccountView = ListView.extend({		

		initialize: function(options) {
			var thisObj = this;	
			this.extendListEvents();
			this.accountId = options.id;
			this.accountName = options.name;

			this.collection = new ContactCollection();				
			this.collection.on('sync', function (){
				thisObj.displayList();
				this.off('sync');
			});			

		},
		
		render: function(){
			this.setUpContent();
			this.collection.getContactsByAccountId(this.accountId);			
		},	

		displayList: function(){			
			var data = {
				accountName: this.accountName,
                contact_url: '#/'+Const.URL.CONTACT,
				contact_edit_url: '#/'+Const.URL.CONTACT+'/'+Const.CRUD.EDIT,
				account_url: '#/'+Const.URL.ACCOUNT,
				contacts: this.collection.models,
				_: _ 
			};					
			
			var innerListTemplate = _.template(contactInnerListTemplate, data);							
			this.$el.find("#contact-list tbody").html(innerListTemplate);

			this.generatePagination(this.collection.length, Const.MAXITEMPERPAGE);
		},

		setUpContent: function(){
			var variables = {
				_: _
			};

			var listTemplate = _.template(contactListTemplate, variables);
			this.$el.append(listTemplate);
		},		

	});

  return ContactsAccountView;
  
});