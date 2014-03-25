define([
	'backbone',
	'models/contact/ContactModel',
	'collections/contact/ContactCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/contact/contactListTemplate.html',
	'text!templates/contact/contactInnerListTemplate.html',
	'constant',
], function(Backbone, ContactModel, ContactCollection, contentTemplate, contactListTemplate, contactInnerListTemplate, Const){

	var ContactListView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			var thisObj = this;
			
			this.collection = new ContactCollection();
			this.collection.on('sync', function() {
				//console.log('collection.on.sync')
				thisObj.displayList();
			});
			
			this.collection.on('error', function(collection, response, options) {
				//console.log('collection.on.error')
				//console.log(collection);
				//console.log(response);
				//console.log(options);
				this.off('error');
			});
		},
		
		render: function(){
			this.displayContact();
			this.collection.options.currentPage = 1;
			this.collection.getModelsPerPage(this.collection.options.currentPage , Const.MAXITEMPERPAGE);
		},
		
		displayContact: function () {
			var innerTemplate = _.template(contactListTemplate, {'contact_add_url' : '#/'+Const.URL.CONTACT+'/'+Const.CRUD.ADD});
			
			var variables = {
				h1_title: "Contacts",
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
			
			this.generatePagination(this.collection.options.maxItem, Const.MAXITEMPERPAGE);
		},
		
		generatePagination: function (maxItem, maxItemPerPage) {
			$('.page-number').remove();
			
			var lastPage = Math.ceil(maxItem / maxItemPerPage);
			
			if(lastPage > 1) {
				$('.pagination').show();
				
				for(var i=1; i <= lastPage; i++) {
					var active = '';
					var activeValue = '';
					
					if(i == this.collection.options.currentPage) {
						active = ' class="active"';
						activeValue = ' <span class="sr-only">(current)</span>';
					}
						
					$('.pagination .last-page').parent().before('<li'+active+'><a class="page-number" href="#" data-pagenum="'+i+'">'+i+activeValue+'</a></li>');
				}
			}
			else {
				$('.pagination').hide();
			}
		},
		
		events: {
			'click .first-page' : 'gotoFirstPage',
			'click .last-page' : 'gotoLastPage',
			'click .page-number' : 'gotoPage',
            'click .sort-name' : 'sortName',
            'click .sort-account' : 'sortAccount',
			'click .contact-search' : 'searchContact',
		},
		
		gotoFirstPage: function () {
			if(this.collection.options.currentPage != 1) {
				this.collection.options.currentPage = 1;
				this.collection.getModelsPerPage(1 , Const.MAXITEMPERPAGE);
			}
			
			return false;
		},
		
		gotoLastPage: function () {
			var lastPage = Math.ceil(this.collection.options.maxItem / Const.MAXITEMPERPAGE);
			if(this.collection.options.currentPage != lastPage) {
				this.collection.options.currentPage = lastPage;
				this.collection.getModelsPerPage(lastPage , Const.MAXITEMPERPAGE);
			}
			
			return false;
		},
		
		gotoPage: function (ev) {
			var page = $(ev.target).attr('data-pagenum');
			if(this.collection.options.currentPage != page) {
				this.collection.options.currentPage = page;
				this.collection.getModelsPerPage(page , Const.MAXITEMPERPAGE);
			}
			
			return false;
		},
            
        sortName: function () {
			this.sortByField('lastname');
		},
                
        sortAccount: function () {
			this.sortByField('account');
		},
		
		sortByField: function (sortField) {
			if(this.collection.options.currentSort == sortField)
				this.collection.options.sort[sortField] = !this.collection.options.sort[sortField];
			
			this.collection.options.currentSort = sortField;
			this.collection.options.currentPage = 1;
			this.collection.getModelsPerPage(1 , Const.MAXITEMPERPAGE);
			
			return false;
		},
            
    searchContact: function () {
			var keyword = $('#search-keyword').val();
			
			this.collection.options.search = keyword;
			this.collection.getModelsPerPage(1 , Const.MAXITEMPERPAGE);
			
			return false;
		},
		
	});

  return ContactListView;
  
});