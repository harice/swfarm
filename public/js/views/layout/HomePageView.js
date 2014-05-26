define([
	'backbone',
	'views/base/AppView',
	'text!templates/layout/HomePageTemplate.html',
	'constant',
], function(Backbone, AppView, HomePageTemplate, Const){

	var HomePageView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.initSubContainer();
		},
		
		render: function(){
			var compiledTemplate = _.template(HomePageTemplate, {});
			this.subContainer.html(compiledTemplate);
		},
	});

  return HomePageView;
  
});