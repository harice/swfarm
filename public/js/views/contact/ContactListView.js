define([
	'backbone',
	'views/base/ListView',
	'models/contact/ContactModel',
	'collections/contact/ContactCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/contact/contactListTemplate.html',
	'text!templates/contact/contactInnerListTemplate.html',
	'constant',
], function(Backbone, ListView, ContactModel, ContactCollection, contentTemplate, contactListTemplate, contactInnerListTemplate, Const){

	var ContactListView = ListView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.extendListEvents();
			this.initSubContainer();
			
			var thisObj = this;
			
			this.collection = new ContactCollection();
			this.collection.on('sync', function() {
				if(thisObj.subContainerExist()){
					thisObj.displayList();
				}					
			});
			
			this.collection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		
		render: function(){
			this.displayContact();
			this.renderList(this.collection.listView.currentPage);
			Backbone.View.prototype.refreshTitle('Contacts','list');
		},
		
		displayContact: function () {
			var innerTemplate = _.template(contactListTemplate, {'contact_add_url' : '#/'+Const.URL.CONTACT+'/'+Const.CRUD.ADD});
			
			var variables = {
				h1_title: "Contacts",
				h1_small: "list",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
			
			this.initConfirmationWindow('Are you sure you want to delete this contact?',
										'confirm-delete-contact',
										'Delete',
										'Delete Contact');

			this.setListOptions();
		},
		
		displayList: function () {
			var data = {
				contact_url: '#/'+Const.URL.CONTACT,
				contact_edit_url: '#/'+Const.URL.CONTACT+'/'+Const.CRUD.EDIT,
				account_url: '#/'+Const.URL.ACCOUNT,
				contacts: this.collection.models,
				_: _ 
			};
			
			var innerListTemplate = _.template( contactInnerListTemplate, data );
			this.subContainer.find("#contact-list tbody").html(innerListTemplate);
			
			this.generatePagination();
		},

		setListOptions: function () {
			var options = this.collection.listView;
			//console.log(options);
			
			if(options.search != '')
				this.$el.find('#search-keyword').val(options.search);
			
		},
		
		events: {
            'click .sort-name' : 'sortName',
            'click .sort-account' : 'sortAccount',
            'change .checkall' : 'checkAll',
			'click .delete-contact': 'preShowConfirmationWindow',
			'click #confirm-delete-contact': 'deleteContact',
		},

		checkAll: function () {
			if($('.checkall').is(':checked')) {
				$('.contactids').prop('checked',true);
			} else {
				$('.contactids').prop('checked',false);
			}
		},
            
        sortName: function () {
			this.sortByField('lastname');
		},
                
        sortAccount: function () {
			this.sortByField('account');
		},
		
		preShowConfirmationWindow: function (ev) {
			this.$el.find('#confirm-delete-contact').attr('data-id', $(ev.currentTarget).attr('data-id'));
			
			this.showConfirmationWindow();
			return false;
		},
		
		deleteContact: function (ev) {
			var thisObj = this;
			var contactModel = new ContactModel({id:$(ev.currentTarget).attr('data-id')});
			
            contactModel.destroy({
                success: function (model, response, options) {
                    thisObj.displayMessage(response);
                    thisObj.renderList(thisObj.collection.listView.currentPage);
                },
                error: function (model, response, options) {
                    thisObj.displayMessage(response);
                },
                wait: true,
                headers: contactModel.getAuth(),
            });
		},
	});

  return ContactListView;
  
});