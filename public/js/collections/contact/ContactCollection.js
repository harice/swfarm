define([
	'backbone',
	'models/contact/ContactModel',
], function(Backbone, ContactModel){
	var ContactCollection = Backbone.Collection.extend({
        // url: '/apiv1/contact',
        url: '/json/contacts.json',
		model: ContactModel,
		options: {
			currentPage: 1,
			maxItem: 0,
            currentSort: 'name',
        sort: {
				name: true,
			},
			search: '',
		},
		initialize: function(){
			
		},
		
		getModelsPerPage: function(page, numPerPage) {
			this.setPaginationURL(page, numPerPage);
			this.getModels();
		},
		
		getModels: function () {
			var thisObj = this;
      
			this.sync('read', this, {
				success: function (data, textStatus, jqXHR) {
					if(textStatus == 'success') {
						var contacts = data.data;
						
						thisObj.reset();
						
						_.each(contacts, function (contact) {
							thisObj.add(new ContactModel(contact));
						});
						
						thisObj.options.maxItem = data.total;
						
						thisObj.trigger('sync');
					}
					else
						alert(jqXHR.statusText);
				},
				error:  function (jqXHR, textStatus, errorThrown) {
					thisObj.trigger('error');
					alert(jqXHR.statusText);
				},
				headers: thisObj.getAuth(),
			});
		},
		
		getDefaultURL: function () {
			// return '/apiv1/contact';
            return '/json/contacts.json';
		},
		
		setDefaultURL: function () {
			this.url = this.getDefaultURL();
		},
		
		setPaginationURL: function (page, numPerPage) {
			var searchURL = '';
			if(this.options.search != '')
				searchURL = '/search';
		
			var orderBy = (this.options.sort[this.options.currentSort])? 'asc' : 'desc';
			this.url = this.getDefaultURL() + searchURL + '?' + $.param({perpage: numPerPage, page: page, sortby:this.options.currentSort, orderby:orderBy, search:this.options.search});
		},
	});

	return ContactCollection;
});
