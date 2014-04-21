define([
	'backbone',
	'views/autocomplete/AutoCompleteView'
], function(Backbone, AutoCompleteView){
    
	var CustomAutoCompleteView = AutoCompleteView.extend({
		
		initialize: function (options) {
            this.fields = [];
			this.fieldsDefault =  ['id', 'name'];
			
			_.extend(this, options);
			
			this.fields = _.union(this.fields, this.fieldsDefault);
            this.filter = _.debounce(this.filter, this.wait);
			
			this.autoCompleteResult = [];
			
			this.initEvents();
        },
		
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
			
			this.afterLoadResult();
        },
		
		afterLoadResult: function () {
			var thisObj = this;
			this.autoCompleteResult = [];
			_.each(this.collection.models, function (model) {
				var resultData = {};
				for(var i = 0; i < thisObj.fields.length; i++) {
					var fieldName = thisObj.fields[i];
					resultData[fieldName] = model.get(fieldName);
				}
				
				thisObj.autoCompleteResult.push(resultData);
			});
		},
		
		activateFirstItem: function() {
			this.$el.find('li:first-child').addClass('active');
		},
		
		initEvents: function () {
			var thisObj = this;
			
			this.input.on('blur', function () {
				var labelField = $(this);
				var idField = thisObj.hidden;
				var result = thisObj.resultIsInFetchedData(labelField.val(), idField.val());
				
				if(!thisObj.$el.is(':hover')) {
					if(result !== false) {
						if(result.id != null) {
							labelField.val(result.name);
							idField.val(result.id);
						}
						else
							labelField.val(result.name);
						
						var id = (result.id)? result.id : idField.val();
						thisObj.typeInCallback(thisObj.getResultDataById(id));
					}
					else {
						labelField.val('');
						idField.val('');
						thisObj.typeInEmptyCallback();
					}
					
					labelField.siblings('.autocomplete').hide();
				}
			});
		},
		
		getResultDataById: function (id) {			
			for(var i = 0; i < this.autoCompleteResult.length; i++) {
				if(this.autoCompleteResult[i].id == id)
					return this.autoCompleteResult[i];
			}
			
			return false;
		},
		
		resultIsInFetchedData: function (name, id) {
			if(name != null) {
				for(var i = 0; i < this.autoCompleteResult.length; i++) {
					if(this.autoCompleteResult[i].name.toLowerCase() == name.toLowerCase()) {
						
						if(id != null && id != '' && parseInt(id) == parseInt(this.autoCompleteResult[i].id))
							return {name:this.autoCompleteResult[i].name};
						
						return {name:this.autoCompleteResult[i].name, id:this.autoCompleteResult[i].id};
					}
				}
			}
			
			return false;
		},
		
		deAlloc: function () {
			this.input.off('blur');
			this.close();
		},
		
		typeInCallback: function () {},
		typeInEmptyCallback: function () {},
        // callback definitions
        onSelect: function () {}
    });
    
    return CustomAutoCompleteView;
});