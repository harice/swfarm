define([
	'backbone',
	'views/base/AppView',
	'constant',
], function(Backbone, AppView, Const){

	var ListView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		renderList: function (page) {
			if(page)
				this.collection.setCurrentPage(page);
			else
				page = this.collection.getCurrentPage();
			this.collection.getModelsPerPage(page, Const.MAXITEMPERPAGE);
		},
		
		extendListEvents: function () {
			this.events = _.extend({}, this.eventsList, this.events);
			this.delegateEvents()
		},
		
		generatePagination: function (maxItem, maxItemPerPage) {
			if(maxItem == null)
				var maxItem = this.collection.getMaxItem();
			if(maxItemPerPage == null)
				var maxItemPerPage = Const.MAXITEMPERPAGE;
			
			$('.page-number').remove();
			
			var lastPage = Math.ceil(maxItem / maxItemPerPage);
			
			if(lastPage > 1) {
				$('.pagination').show();
				
				for(var i=1; i <= lastPage; i++) {
					var active = '';
					var activeValue = '';
					
					if(i == this.collection.getCurrentPage()) {
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
		
		eventsList: {
			'click .first-page' : 'gotoFirstPage',
			'click .last-page' : 'gotoLastPage',
			'click .page-number' : 'gotoPage',
			'click .search-local' : 'searchLocal',
		},
		
		gotoFirstPage: function () {
			if(this.collection.getCurrentPage() != 1) {
				this.collection.setCurrentPage(1);
				this.collection.getModelsPerPage(1 , Const.MAXITEMPERPAGE);
			}
			
			return false;
		},
		
		gotoLastPage: function () {
			var lastPage = Math.ceil(this.collection.getMaxItem() / Const.MAXITEMPERPAGE);
			if(this.collection.getCurrentPage() != lastPage) {
				this.collection.setCurrentPage(lastPage);
				this.collection.getModelsPerPage(lastPage , Const.MAXITEMPERPAGE);
			}
			
			return false;
		},
		
		gotoPage: function (ev) {
			var page = $(ev.target).attr('data-pagenum');
			if(this.collection.getCurrentPage() != page) {
				this.collection.setCurrentPage(page);
				this.collection.getModelsPerPage(page , Const.MAXITEMPERPAGE);
			}
			
			return false;
		},
		
		sortByField: function (sortField) {
			if(this.collection.getCurrentSort() == sortField) {
				var option = {};
				option[sortField] = !this.collection.getSort(sortField);
				this.collection.setSort(option);
			}
			
			this.collection.setCurrentSort(sortField);
			this.collection.setCurrentPage(1);
			this.collection.getModelsPerPage(1 , Const.MAXITEMPERPAGE);
			
			return false;
		},
		
		searchLocal: function () {
			var keyword = $('#search-keyword').val();
			
			this.collection.setSearch(keyword);
			this.collection.getModelsPerPage(1 , Const.MAXITEMPERPAGE);
			
			return false;
		},
		
	});

  return ListView;
  
});