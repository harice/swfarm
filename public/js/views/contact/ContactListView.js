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
			
			var thisObj = this;
			
			this.collection = new ContactCollection();
			this.collection.on('sync', function() {
				thisObj.displayList();
			});
			
			this.collection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		
		render: function(){
			this.displayContact();
			this.renderList(1);
		},
		
		displayContact: function () {
			var innerTemplate = _.template(contactListTemplate, {'contact_add_url' : '#/'+Const.URL.CONTACT+'/'+Const.CRUD.ADD});
			
			var variables = {
				h1_title: "Contacts",
				h1_small: "list",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
		},
		
		displayList: function () {
			var data = {
				contact_url: '#/'+Const.URL.CONTACT,
				contact_edit_url: '#/'+Const.URL.CONTACT+'/'+Const.CRUD.EDIT,
				contacts: this.collection.models,
				_: _ 
			};
			
			var innerListTemplate = _.template( contactInnerListTemplate, data );
			$("#contact-list tbody").html(innerListTemplate);
			
			this.generatePagination();
		},
		
		events: {
            'click .sort-name' : 'sortName',
            'click .sort-account' : 'sortAccount',
            'change .checkall' : 'checkAll'
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
	});

  return ContactListView;
  
});