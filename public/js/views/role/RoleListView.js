define([
	'backbone',
	'models/role/RoleModel',
	'collections/role/RoleCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/role/roleListTemplate.html',
	'text!templates/role/roleInnerListTemplate.html',
	'constant',
], function(Backbone, RoleModel, RoleCollection, contentTemplate, roleListTemplate, roleInnerListTemplate, Const){

	var RoleListView = Backbone.View.extend({
		el: $("#content"),
		
		initialize: function() {
			this.collection = new RoleCollection();
		},
		
		render: function(){
			this.displayRole();
			this.collection.options.currentPage = 1;
			this.collection.getModelsPerPage(this.collection.options.currentPage , Const.MAXITEMPERPAGE, this.displayList);
		},
		
		displayRole: function () {
			var innerTemplate = _.template(roleListTemplate, {'role_add_url' : '#/'+Const.URL.ROLE+'/'+Const.CRUD.ADD});
			
			var variables = {
				h1_title: "Roles",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
		},
		
		displayList: function (roleCollection) {
			var data = {
				role_url: '#/'+Const.URL.ROLE,
				role_edit_url: '#/'+Const.URL.ROLE+'/'+Const.CRUD.EDIT,
				permission_edit_url: '#/'+Const.URL.PERMISSION,
				roles: roleCollection.models,
				_: _ 
			};
			
			var innerListTemplate = _.template( roleInnerListTemplate, data );
			$("#role-list tbody").html(innerListTemplate);
			
			$('.page-number').remove();
			var lastPage = Math.ceil(roleCollection.options.maxItem / Const.MAXITEMPERPAGE);
			
			if(lastPage > 1) {
				$('.pagination').show();
				
				for(var i=1; i <= lastPage; i++) {
					var active = '';
					var activeValue = '';
					
					if(i == roleCollection.options.currentPage) {
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
		},
		
		gotoFirstPage: function () {
			if(this.collection.options.currentPage != 1) {
				this.collection.options.currentPage = 1;
				this.collection.getModelsPerPage(1 , Const.MAXITEMPERPAGE, this.displayList);
			}
			
			return false;
		},
		
		gotoLastPage: function () {
			var lastPage = Math.ceil(this.collection.options.maxItem / Const.MAXITEMPERPAGE);
			if(this.collection.options.currentPage != lastPage) {
				this.collection.options.currentPage = lastPage;
				this.collection.getModelsPerPage(lastPage , Const.MAXITEMPERPAGE, this.displayList);
			}
			
			return false;
		},
		
		gotoPage: function (ev) {
			var page = $(ev.target).attr('data-pagenum');
			if(this.collection.options.currentPage != page) {
				this.collection.options.currentPage = page;
				this.collection.getModelsPerPage(page , Const.MAXITEMPERPAGE, this.displayList);
			}
			
			return false;
		},
		
	});

  return RoleListView;
  
});