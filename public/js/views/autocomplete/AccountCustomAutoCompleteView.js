define([
	'backbone',
	'views/autocomplete/CustomAutoCompleteView'
], function(Backbone, CustomAutoCompleteView){
    
	var AccountCustomAutoCompleteView = CustomAutoCompleteView.extend({
		
		filter: function (keyword) {
			var thisObj = this;
            var keyword = keyword.toLowerCase();
			this.collection.fetch({
				success: function (collection, response, options) {
					thisObj.loadResult(collection.models, keyword);
				},
				error: function (collection, response, options) {
				},
				headers: this.collection.getAuth(),
				data: {'name' : keyword},
			});
        },
    });
    
    return AccountCustomAutoCompleteView;
});