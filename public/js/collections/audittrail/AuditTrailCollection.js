define([
	'backbone',
	'models/role/RoleModel',
], function(Backbone, RoleModel){
	var AuditTrailCollection = Backbone.Collection.extend({
		url: '/apiv1/audit',
		model: RoleModel,
		options: {
			currentPage: 1,
			maxItem: 0,
			currentSort: 'created_at',
			sort: {
				created_at: true,
			},
			show: {
				type: null,
				id: null,
			},
		},
		initialize: function(){
			this.options.show.type = null;
			this.options.show.id = null;
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
						var roles = data.data;
						
						thisObj.reset();
						
						_.each(roles, function (role) {
							thisObj.add(new RoleModel(role));
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
			});
		},
		
		getDefaultURL: function () {
			return '/apiv1/audit';
		},
		
		setDefaultURL: function () {
			this.url = this.getDefaultURL();
		},
		
		setGetAllURL: function () {
			this.url = this.getDefaultURL()+'/all';
		},
		
		setPaginationURL: function (page, numPerPage) {	
			var orderBy = (this.options.sort[this.options.currentSort])? 'asc' : 'desc';
			var type = (this.options.show.type != null)? this.options.show.type : '';
			var dataId = (this.options.show.id != null)? this.options.show.id : '';	
			
			this.url = this.getDefaultURL() + '?' + $.param({perpage: numPerPage, page: page, sortby:this.options.currentSort, orderby:orderBy, type:type, data_id:dataId});
		},
	});

	return AuditTrailCollection;
});
