browseheader = Backbone.View.extend({
	initialize: function() {

	},
	render: function(){
		var template = _.template( $("#headerbrowsetemplate").html(), {});
		$(this.el).html(template);
		var self = this;
		var button = $("#storeselectorbutton")
		if (window.localStorage.getItem("store") == "FutureShopCanada") {
			button.css("background-color", "#AA0000");
			button.html("FS");
			button.attr("store", "futureshop");
		} else {
			button.css("background-color", "#0000AA");
			button.html("BB");
			button.attr("store", "bestbuy");
		};
		bindTouch($(this.el).find("#browsemenubutton"), function (e) {
			browsemenus.checkRender();
		});
		bindTouch($(this.el).find("#recentsbutton"), function (e) {
			headerroute.navigate("#browse/recents", {trigger: true});
		});
		bindTouch($(this.el).find("#favouritesbutton"), function (e){
			headerroute.navigate("#browse/favourites", {trigger: true});
		});
		bindTouch($(this.el).find("#settingsbutton"), function() {
			setTimeout(function() {
				var infowindow = $("#infowindowcontainer");
				toggleDisplay(infowindow);
			}, 10);
		});
		$("#searchbar").off();
		$("#searchbar").change(function() {
			infoItemCollection.loaded = false;
			infoItemCollection.search = true;
			infoItemCollection.cat = $("#searchbar").val();
			loadingDisplay(true);
			$("#contentloadingmessage").html("<p>SEARCHING</p>");
			infoItemCollection.fetch({
				success: function(a, b) {
					infoItemCollection.reset();
					$.each(b, function(key, value){	
						value.id = value.sku;	
						value.name = value.name.split("(")[0];
						if (value.name.length > 30){
							value.name = value.name.slice(0,30) + "...";
						}	
						infoItemCollection.push(value)
					});
					infoItemCollection.loaded = true;
					loadingDisplay(false);
					$("#contentloadingmessage").html("<p>LOADING</p>");
					$("#searchbar").blur();
					infoItemCollection.search = false;
					if (b.length == 0) alert("No results found");
					contentroute.navigate("#", {trigger: true});
					contentroute.navigate("#browse/category", {trigger: true});
				},
				error: function() {
					alert("Server connection error. Please try again...");
					loadingDisplay(false);
					$("#searchbar").blur();
					$("#contentloadingmessage").html("<p>LOADING</p>");
				}
			});
		});
		var clearStorage = function() {
			favouritescollection.reset();
			recentscollection.reset();
			comparecollection.reset();
			contentroute.navigate("#browse/favourites", {trigger: true});
			contentroute.navigate("#browse/recents", {trigger:true});
			window.localStorage.removeItem("favourites");
			window.localStorage.removeItem("compare");
			window.localStorage.removeItem("recents");
			browsemenus.invalidate();
		};
		
		bindTouch($("#storeselectorbutton"), function() {
			setTimeout(function() {
				if (confirm("This will delete all saved data. Continue?")){
					if (button.attr("store") == "futureshop") {
						button.css("background-color", "#0000AA");
						button.html("BB");
						button.attr("store", "bestbuy");
						clearStorage();
						window.localStorage.setItem("store", "BestBuyCanada");
					} else {
						button.css("background-color", "#AA0000");
						button.html("FS");
						button.attr("store", "futureshop");
						clearStorage();
						window.localStorage.setItem("store", "FutureShopCanada");
					};
				}
			}, 0);
			
		});
	},
	events: {
	},
});


scanheader = Backbone.View.extend({
	initialize: function() {
	},
	render: function(){
		var template = _.template( $("#headerscantemplate").html(), {});
		$(this.el).html(template);
	},
	events: {
	},
});


compareheader = Backbone.View.extend({
	initialize: function() {
	},
	render: function(){
		var template = _.template( $("#headercomparetemplate").html(), {});
		$(this.el).html(template);
	},
	events: {
	},
});

