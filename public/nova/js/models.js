infoItemModel = Backbone.Model.extend({
	//urlRoot: '/BestBuyCanada/products',
	id:"10180509",
	isScan: false,
	isOld: false,
	defaults: {
		name: "[Product Name]",
		sku: "[sku]",
		webid: "[Product Id]",
		usage: "[Power]",
		salePrice: "[Price]",
		image: "/multimedia/Products/500x500/101/10122/10122563.jpg",
		regularPrice: "[Price]",
		type: "Unavailable",
		appliance: "Unavailable",
		metrics: {"lifetimeCost": "Unavailable", "operatingCost": "Unavailable", "numberOfTreesPlanted": "Unavailable", "lightbulbRuntime": "Unavailable",  "computerUse": "Unavailable", "cupsOfCoffee": "Unavailable", "litresOfGasoline": "Unavailable", "numberOfCars": "Unavailable"}
	},
	initialize: function() {
		//this.set('sku', Math.random()*300);
		//this.set('urlRoot', '/' + window.localStorage.getItem('store') + '/products');
	},
	url: function() {
		if (this.get('isScan'))
			return '/' + window.localStorage.getItem('store') + '/products/upc/' + this.get('id');
		else if (this.get('isOld'))
			return '/' + window.localStorage.getItem('store') + '/products/compareto/' + this.get('appliance') + '/' + this.get('year');
		else
			return '/' + window.localStorage.getItem('store') + '/products/' + this.get('id'); 
	},
	parse: function(response) {
		if (response && response.name){
			response.name = response.name.split("(")[0];
			response.oldname = response.name;
			if (response.name.length > 40){
				response.name = response.name.slice(0,40) + "..."
			} 
		}
		//if (response && response.modelNumber){
		//	response.modelNumber = "WebID: " +response.modelNumber
		//}
		if (response && response.metrics) response.metrics["lifetimeCost"] = response.metrics["operatingCost"] * 14.5; //+ response.salePrice;
		if (response && response.sku) response.id = response.sku;
		if (typeof this.attributes != 'undefined' && this.get('isOld') && response) response.id = this.get('appliance');
		if (response && !response.type) response.type = "washer";
		if (typeof this.attributes != 'undefined' && response && this.get('appliance') && typeof response.type == "undefined") response.type = this.get('appliance'); 
		if (response && response.energuideRating != null) response.kwh = response.energuideRating;
		if (response && response.kwh) response.kwh = Math.round(response.kwh);
		else if(response && response.kwh == null) response.kwh = '?';
		console.log(response)
		return response;
	}
});

browsemenuitems = Backbone.Model.extend({
	//urlRoot: "/FutureShopCanada/categories",
	defaults: {
		//{name: "Appliances", hasSubs: true, 
		//	subCategories:[{name: "no server", hasSubs: true, 
		//		subCategories: [{name: "yeayyyy", hasSubs: false, subCategories:[]},{name: "no server", hasSubs:false, subCategories:[]},{name:"no server", hasSubs: false,subCategories:[]}, {name: "no server", hasSubs:false, subCategories:[]}]}]}
	},
	initialize: function() {
		//this.set("urlRoot", window.localStorage.getItem("store") + "/categories");
	},
	url: function() {
		return '/' + window.localStorage.getItem("store") + "/categories"
	}
});


reviewitems = Backbone.Model.extend({
	defaults: {
		id: 0
	},
	initialize: function() {
		this.noAPI = true;
	},
	url: function() {
		return '/api/v2/json/reviews/' + this.get("id");
	}
})


var oldSync = Backbone.sync;

Backbone.sync = function(method, model, options) {
    var url = _.isFunction(model.url) ? model.url() : model.url;
    if (url) {  // If no url, don't override, let Backbone.sync do its normal fail
        options = options || {};
    	if (model.noAPI)
    		options.url = 'http://www.' + localStorage.getItem("store").slice(0, -6) + ".com" + url;
    	else
        	options.url = window.serverURL + url;
        console.log(options.url)
    }
    // Let normal Backbone.sync do its thing
    return oldSync.call(this, method, model, options);
}