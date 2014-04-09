define([
	'backbone',
	'views/autocomplete/AutoCompleteView'
], function(Backbone, AutoCompleteView){
    
	var AccountLoaderAutoCompleteView = AutoCompleteView.extend({
        filter: function (keyword) {
			var thisObj = this;
            var keyword = keyword.toLowerCase();
			this.collection.formatURL(keyword);
			this.collection.fetch({
				success: function (collection, response, options) {
					thisObj.loadResult(collection.models, keyword);
				},
				error: function (collection, response, options) {
				},
				headers: this.collection.getAuth()
			});
        },

		loadResult: function (model, keyword) {
            this.currentText = keyword;
            this.show().reset();
            if (model.length) {
                _.forEach(model, this.addItem, this);
				this.activateFirstItem();
                this.show();
            } else {
                this.hide();
            }
			
			this.trigger('loadResult');
        },
		
		activateFirstItem: function() {
			this.$el.find('li:first-child').addClass('active');
		},
		
        // callback definitions
        onSelect: function () {}
    });
    
    return AccountLoaderAutoCompleteView;
});