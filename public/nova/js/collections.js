infoItemCollection= Backbone.Collection.extend ( {
	model: infoItemModel,
	id: "infocollection",
	initialize: function() {
		this.cat = "";
		this.brand = "";
		this.search = false;
		this.catSearch = false;
		this.loaded = false;
	},
	url: function() {
		if (this.search){		
			return "/" + window.localStorage.getItem('store') + "/products/search/" + this.cat;
		}else if(this.catSearch){
			return "/" + window.localStorage.getItem('store') + "/products/category/" + this.cat;
		}else{
			return "/" + window.localStorage.getItem('store') + '/products/category/' + this.cat + "?brandName=" + this.brand;
		}
	},
	contains: function(model) {
		return this.where({id: model.id}).length > 0 ? true : false;
	}
});

saveloadCollection = Backbone.Collection.extend ({
	save: function() {
		var modelArray = []
		var self = this;
		$.each(this.models, function(key, value){
			modelArray.push(value.get("id"));
		});
		window.localStorage.setItem(this.id, JSON.stringify(modelArray));
	},
	load: function() {
		this.loaded = false;
		var self = this;
		if (this.id in window.localStorage){
			var collection = JSON.parse(window.localStorage.getItem(this.id));
			if (collection.length == 0) {
				self.loaded = true;
			}
			$.each(collection, function(key, value){
				var model = new infoItemModel({id: value});
				self.push(model);
				model.fetch({
					success: function() {
						if (key == collection.length - 1) self.loaded=true;
					},
					error: function() {
						if (key == collection.length - 1) self.loaded=true;
						console.log("Server Connection Error! Please try again...")
					}
				});
			});
		} else {
			self.loaded = true;
		}
	},
	events: {
		"change": "save",
		"reset": "save"
	},
	contains: function(model) {
		return this.where({id: model.id}).length > 0 ? true : false;
	}
});
recentsCollection = saveloadCollection.extend ({
	model: infoItemModel,
	id: 'recents',
	initialize: function() {
		this.load();
	},
});
favouritesCollection = saveloadCollection.extend ({
	model: infoItemModel,
	id: 'favourites',
	url: '/products',
	currentFilter: '',
	initialize: function() {
		this.load();
		this.filtered = new Backbone.Collection();
		this.filtered.loaded = true;
	},
	setFilter: function(appliance) {
		this.filtered.reset(this.where({type: appliance}));
	}
});
compareCollection = saveloadCollection.extend ({
	model: infoItemModel,
	id: 'compare',
	initialize: function() {
		this.load();
	},
});
baselineCollection = saveloadCollection.extend ({
	model: infoItemModel,
	id: 'baseline',
	initialize: function() {
		this.loaded = false;
		var self = this;
		$.each(window.applianceTypes, function(key, name){
			var year = '2009';
			//if (name == 'refrigerator' || name=='television') year = '2008'
			var model = new infoItemModel({isOld: true, appliance: name, year: year, type: name, id: name});
			model.fetch({success: function(a, b) {
				self.push(a);
				if (key == window.applianceTypes.length - 1){
					self.loaded = true;
				};
			}});
		});
	},
});