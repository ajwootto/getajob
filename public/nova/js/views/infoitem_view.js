 infoItemView = Backbone.View.extend ( {
 	initialize: function() {
 		this.isBrowseItem = true;
 		if (this.model){
 			this.model.bind('change', this.render, this);
 		}
 		this.moveView = false;
 		this.viewKey = 0;
 		this.selfkey = 0;
 		this.startY = 0;
 		self.rowheight = 0;
 		this.updown = "";
 	},
 	
 	browsing: function(areWe){
 		if (!areWe){
 			this.isBrowseItem = false;
 		}
 	},
 	render: function() {
 		var template = _.template( $("#browseinfotemplate").html(), {});
 		$(this.el).html(template);
		//fill view areas with proper information from model
		$(this.el).find("#id").html(this.model.get("sku"));
		var firstWord = this.model.get("name").split(" ")[0]
		$(this.el).find("#name").html(firstWord);
		$(this.el).find("#name2").html(this.model.get("name").slice(firstWord.length));
		$(this.el).find("#webid").html(this.model.get("modelNumber"));
		$(this.el).find('#productlink').attr('href', '#productdetails/' + this.model.get('id'));
		$(this.el).find("#price").html("$" + this.model.get("salePrice"));
		if (this.model.get("salePrice") < this.model.get("regularPrice")) {
			$(this.el).find("#price").css("color", "#AA0000");
		};
		$(this.el).find("#usage").html(this.model.get("kwh") + " kWh");
		var store = getStore();
		this.$el.find("#productpicture").append("<img width='150px' height='160px' src='http://www." + store + ".ca" + this.model.get("image") + "'/>");
		checkEnergyStar($(this.el), this.model);
		this.isDragging = false;
		this.mouseMoved = false;
		if (favouritescollection.where({id: this.model.id}).length > 0 && this.isBrowseItem){
			$(this.el).find("#favwrapper").css("color", "#fec30b");
			$(this.el).find("#favwrapper").find("span").attr("data-icon", "$")
		} else {
			$(this.el).find("#favwrapper").css("color", "#000000");
			$(this.el).find("#favwrapper").find("span").attr("data-icon", "%")
		};
		if (comparecollection.where({id: this.model.id}).length > 0){
			$(this.el).find("#scwrapper").css("color", "#7FCC00");
		} else {
			$(this.el).find("#scwrapper").css("color", "#000000");
		}
		this.bindComp();
		this.bindRecent();
		if (!this.isBrowseItem) {
			this.bindDrag();

		} else{
			this.bindFav();
		};
	},
	moveDiv: function(e, touching) {
		//establish mouse position and location to move divs to
		var self = this;
		var y;
		if (touching){
			y = e.touches[0].pageY + $('#body').scrollTop();
			e = e.touches[0]
		} else {
			y = e.pageY + $("#body").scrollTop();
		};	

		////////
		self.rowheight = $(self.el).find("#productlink").height();
		//make all view items absolute position
		$.each(favouritescollection.models, function(key, model) {
			var value = model.get('view'); 
		 	if (value.el == self.el) {
		 		self.selfkey = key;
		 	} else {
		 		$(value.el).removeAttr('style');
		 		$(value.el).css({"top": topOrigins[key], "left": 0, "position": "absolute", "width": "100%", "height": self.rowheight, "-webkit-transition": "top 0.1s linear"});
		 	}
		});
		ypos = y - (self.startY - topOrigins[self.selfkey]);
		$(self.el).removeAttr('style');
		$(self.el).css({"position": "absolute", "top": ypos + "px", "left": "0", "width": "100%", "z-index": "199"})
		//////////
		if (e.clientY > $("#footer").offset().top - 50) {
			this.updown = "down"
		} else if (e.clientY < 150) {
			this.updown = "up"
		} else {
			this.updown = ""
		};
		if (this.updown == "down") {
			//window.scrollBy(0, 20);
		} else if (this.updown == "up") {
			//window.scrollBy(0,-20);
		};
		//determine which divs need to move out of the way to create a space by finding lowest div on the page that is above currently moving one
		var highest = 0;
		self.viewKey = 0;  
		$.each(favouritescollection.models, function(key, model) {
			var value = model.get('view');
		 	if (value.el != self.el){
		 		if (topOrigins[key] <= y && (topOrigins[key] + self.rowheight) > y) {
		 			highest = topOrigins[key];
		 			self.moveView = value;
		 			self.viewKey = key;
		 		}; 
		 	} else if(y >= topOrigins[self.selfkey] && y < topOrigins[self.selfkey] + self.rowheight){
		 			self.moveView = favouritescollection.at(self.selfkey).get('view');
		 			self.viewKey = self.selfkey;
		 			highest = topOrigins[self.selfkey];
		 	}
		});
		//fix for dragging below bottom list item
		var lastDivKey = topOrigins.length - 1;
		if (highest == 0 && y > topOrigins[lastDivKey]){
			highest = topOrigins[lastDivKey];
			self.moveView = favouritescollection.at(lastDivKey).get('view');
			self.viewKey = lastDivKey;
		}
		////////////////
		//if a div was found which needs to be moved, move it (up if it started below the active div, or down if it started above)
		if (self.moveView){
		 	$.each(favouritescollection.models, function(key, model){
		 		var value = model.get('view');
		 		if (topOrigins[key] <= highest && topOrigins[key] > topOrigins[self.selfkey] && value.el != self.el){
		 			$(value.el).css({"top": topOrigins[key] - self.rowheight});
		 			//$(value.el).css({"-webkit-transition": "-webkit-transform 0.7s linear", "-webkit-transform": "translate3d(0,-" + self.rowheight +"px, 0)"});
		 			//$(value.el).data("anim", "true");
		 		} else if (topOrigins[key] >= highest && topOrigins[key] < topOrigins[self.selfkey] && value.el != self.el) {
		 			$(value.el).css({"top": topOrigins[key] + self.rowheight});
					//$(value.el).css({"-webkit-transition": "-webkit-transform 0.7s linear", "-webkit-transform": "translate3d(0," + self.rowheight +"px, 0)"});		 	
		 			//$(value.el).data("anim", "true");
		 		}
		 	})
		}
		 //////////////////
	},
	mousedown: function(e, touching) {
	  		this.isDragging = true;
	  		mouseMoved = false;
	  		if (touching){
	  			this.startY = e.touches[0].pageY + $("#body").scrollTop();
	  		} else {
	  			this.startY = e.pageY + $("#body").scrollTop();
	  		}
	},
	mouseup: function(e) {
		var self = this;
  		if (this.isDragging){
  			this.isDragging = false;
	  		if (mouseMoved){
			
				$(self.el).css({"position": "absolute", "top": topOrigins[self.viewKey]});
				
			
			
				favouritescollection.remove(self.model);
				favouritescollection.add(self.model, {at: self.viewKey}); 
				favouritescollection.save();
				$.each(favouritescollection.models, function(key, value){
					$(value.get('view').el).css("z-index", 150-key);
					//$(value.get('view').el).find("#webid").html(150-key);
				}); 
			}
		};
	},
	mousemove: function(e, touching) {
	  	if (this.isDragging) {
			mouseMoved = true;
			this.mouseticks += 1;                      
			if (this.mouseticks == 3){
				this.mouseticks = 0;
				this.moveDiv(e, touching);
			};
		}
	},
	bindDrag: function(){
		var self = this;
		$(this.el).find("#favwrapper").html("<span data-icon='&#x2f;'></span>");
	  	$(this.el).find("#favbutton").mousedown(function(e) {
	  		e.preventDefault();
	  		self.mousedown(e, false)
	  	});
		$(this.el).find("#favbutton").on('touchstart', function(e){
			e.originalEvent.preventDefault();
			self.mousedown(e.originalEvent, true);
		});
		$(this.el).find("#favbutton").mouseup(function(e) {
			e.preventDefault();
			self.mouseup(e);
		});
		$(this.el).find("#favbutton").on('touchend', function(e){
			e.originalEvent.preventDefault();
			self.mouseup(e.originalEvent);
		});
		this.mouseticks = 0;
		$(this.el).find("#favbutton").mousemove(function(e){
			e.preventDefault;
			self.mousemove(e, false)
		});
		$(this.el).find("#favbutton").on('touchmove', function(e){
			e.originalEvent.preventDefault();
			self.mousemove(e.originalEvent, true)
		});
	},
	bindFav: function() {
		var self=this;
		var addFav = function() {
			if (favouritescollection.contains(self.model)) {
				favouritescollection.remove(self.model);
	  			$(self.el).find("#favwrapper").css("color", "#000000");
	  			$(self.el).find("#favwrapper").find("span").attr("data-icon", "%")
	  			favouritescollection.save();
			} else {
				favouritescollection.push(self.model);
	  			$(self.el).find("#favwrapper").css("color", "#fec30b");
	  			$(self.el).find("#favwrapper").find("span").attr("data-icon", "$")
	  			favouritescollection.save();
			}
		};
		
	  	bindTouch($(this.el).find("#favbutton"), function(e) {
	  		addFav();
	  	})
	
	},

	bindRecent: function() {
		var self = this;
		var addRecent = function() {
			recentscollection.remove(self.model);
			recentscollection.add(self.model, {at: 0});
			recentscollection.save();
		}
		
		bindTouch($(this.el).find("#productlink"), function(e) {
			addRecent();
			contentroute.navigate("#productdetails/" + self.model.get('id'), {trigger: true});
		});
	},
		///////////

		//adds click listener for compare button to add item to compare collection
	bindComp: function() {
		var self = this;
		var compToggle = function() {
			if (comparecollection.where({id: self.model.id}).length == 0){
				comparecollection.push(self.model);
				$(self.el).find("#scfont").css("color", "#7FCC00");
				$(self.el).find("#productdetailscompareicon").css("color", "#7FCC00");
				comparecollection.save();
				window.lastCompare = self.model.get('type');
			} else {
				comparecollection.remove(self.model);
				$(self.el).find("#scfont").css({"color": "#000000"});
				$(self.el).find("#productdetailscompareicon").css({"color": "#000000"});
				comparecollection.save();
			};
		};
	
		bindTouch($(this.el).find("#selectcomparebutton"), function(e) {
			compToggle();
		})
	},
});
