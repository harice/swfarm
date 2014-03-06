define([
	'backbone',
	'text!templates/layout/contentTemplate.html',
	'text!templates/audittrail/auditTrailListTemplate.html',
	'constant',
], function(Backbone, contentTemplate, auditTrailListTemplate, Const){

	var AuditTrailListView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			
		},
		
		render: function(){
			this.displayAuditTrail();
		},
		
		displayAuditTrail: function () {
			var innerTemplate = _.template(roleListTemplate, {'role_add_url' : '#/'+Const.URL.ROLE+'/'+Const.CRUD.ADD});
			
			var variables = {
				h1_title: "Roles",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
		},
		
	});

  return AuditTrailListView;
  
});