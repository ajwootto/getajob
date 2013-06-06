browsemenu = Backbone.View.extend({
	id: "browsemenucontent",
	isShowing: false,
	initialize: function() {
		this.items = new browsemenuitems({view: this});
		model: this.items;
		this.brands = false;
		this.brandcat = "";
		this.fetched = false;
	},
	//fetch products according to selected category and brand from server
	fetchProducts: function () {
		infoItemCollection.loaded = false;
		loadingDisplay(true);
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
			contentroute.navigate("#", {trigger: true});
			contentroute.navigate("#browse/category", {trigger: true});
			}
		});
	},
	render: function(){
		var template = _.template($("#browsemenutemplate").html(), {});
		$(this.el).html(template);
		var self = this;
		$("#backbutton").off();
		bindTouch($("#backbutton"), function() {
			self.currentcat = self.lastcat[self.lastcat.length - 1];
			if (self.lastcat.length > 1) {
				self.lastcat.pop();
			};
			self.currentid = 
			self.brands = false;
			self.render();
			self.backmessage.pop()
		
			$("#backbutton").html("Back");
		
		});
		var title = (self.currentcat.name.length > 10) ? self.currentcat.name.slice(0, 10) + "..." : self.currentcat.name;
		$(self.el).find("#browsetitle").html(title);
		
		var loopcollection = (self.brands) ? self.currentcat.brands : self.currentcat.subCategories
		$.each(loopcollection, function (index, value) {
			if (self.brands) {
				var name = value.replace(/ /g, "").replace(/&/g,"").replace(/,/g, "").replace(/"/g, "");
			} else {
				var name = value.name.replace(/ /g, "").replace(/&/g,"").replace(/,/g, "").replace(/"/g, "");
			};
			var slicedname;
			if (value.name && value.name.length > 30){
				slicedname = value.name.slice(0,30) + "...";
			} else if (value.name){
				slicedname = value.name;
			} else {
				slicedname = " ";
			}
			if (!self.brands && value.subCategories.length > 0) {
				$(self.el).append("<a id='"+name +"' href='#'>" + slicedname + "</a><br />");
				bindTouch($("#"+name), function() {
					self.lastcat.push(self.currentcat);
					self.currentcat = value;
					self.render();
					//$(self.el).find("#backbutton").html(value.name.slice(0,15) + "...");
					self.backmessage.push(value.name)
				});
			} else if (!self.brands && value.brands && value.brands.length > 0){
				$(self.el).append("<a id='"+name+"' href='#'>" + slicedname + "</a><br />");
				bindTouch($("#"+name), function() {
					self.brands = true;
					self.lastcat.push(self.currentcat);
					self.currentid = self.brandcat = value.id;
					self.currentcat = value;
				  	self.render();
				  	//$("#backbutton").html(value.name.slice(0,15) + "...");
				  	self.backmessage.push(value.name)
				});
			} else if (!self.brands && value.subCategories.length == 0){
				$(self.el).append("<a id='"+name+"' href='#'>" + slicedname + "</a><br />");
				bindTouch($("#"+name), function() {
					infoItemCollection.cat = value.id;
					self.hide();
					self.brands = false;
					self.fetchProducts();
				});
			} else if(self.brands){
				$(self.el).append("<a id='"+name+"' href='#'>" + value + "</a><br />");
				bindTouch($("#"+name), function() {
					infoItemCollection.cat = self.brandcat;
					infoItemCollection.brand = value;
					self.hide();
					self.fetchProducts();
				});
			};
		});
		$(self.el).append("<a id='all' href='#'>Show All</a><br />");
		bindTouch($("#all"), function() {
			infoItemCollection.cat = self.currentcat.id;
			infoItemCollection.catSearch = true;
			self.fetchProducts();
			infoItemCollection.catSearch = false;
		});
	},
	//toggles show/hide browse menu
	checkRender: function() {
		var self = this;
		if (this.isShowing) {
			this.hide();
		} else {
			$("body").append("<div id='browsecloser' class='contentcontainer'></div>")
			$("#browsemenu").html(this.el);
			$(".browsemenustuff").css({"z-index": "400", "display": "block"});
			$("#browsecloser").css({"z-index": "399", "background-color": "#121212", "opacity": "0.5", "position": "fixed", "display": "inline", "top": "3.5em", "bottom": "3.5em", "min-height": "0%"});
			//$("#browsemenubutton").css({"background": buttonactive, "color": "#fcfcfc", "box-shadow": "0 1px 0 rgba(255, 255, 255, 0.4), 0 1px 3px rgba(0, 0, 0, 0.4) inset"});
			$("#browsemenubutton").addClass("selected")
			var initTree = function() {
				//self.items.set("id", window.localStorage.getItem("store"));
				self.currentcat = self.items;
				self.lastcat = [self.items];
				self.currentid = self.items.id;
				self.backmessage = [];
				self.render();
			}
			if (!this.fetched){
				$("#loadingmessage").css("display", "block")
				this.items = new browsemenuitems({view: this});
				this.items.fetch({success: function(obj, response){
					self.items = response
					$("#loadingmessage").css("display", "none")
					initTree();
					self.fetched = true;
				},
				error: function(model, response){
					alert("Server connection error! Try again later...")
					self.hide();
					//self.fetched = true;
				}});
			} else {
				initTree();
			};
			this.isShowing = true;
			bindTouch($("#browsecloser"), function() {
				self.hide();
			});
		}
	},
	events: {
	},
	//hides browse menu
	hide: function() {
		$("#loadingmessage").css("display", "none")
		$("#browsecloser").removeAttr("style");
		$(".browsemenustuff").css({"z-index": "-1", "display": "none"});
		//$("#browsemenubutton").removeAttr("style");
		$("#browsemenubutton").removeClass("selected")
		$("#browsecloser").off();
		$("#browsecloser").remove();
		this.remove();
		this.isShowing=false;
		//reinitialize menu to starting state
		this.brands = false;
		this.brandcat = "";
	},
	//force reload of category tree
	invalidate: function() {
		this.fetched = false;
	}
});
