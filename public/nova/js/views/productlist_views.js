recents = Backbone.View.extend({
	id: "recents",
	initialize: function() {
		//this.render();
	},
	render: function(){
		destroyScroll();
		var template = _.template($("#recentstemplate").html(), {});
		var headertemplate = _.template($("#recentsheadertemplate").html(), {});
		$(this.el).html(template);
		if (!$("#body").find(".contentheaderspacer").length)
			$("#body").prepend(headertemplate);
		var self = this;
		bindTouch($("#recentsclear"), function() {
			recentscollection.reset();
			window.localStorage.removeItem("recents");
			self.render();
		});
		makeView(this, recentscollection);
	},
	events: {
	},
});





favourites = Backbone.View.extend({
	id: "favourites",
	curFilter: null,
	initialize: function() {
		//this.render();
	},
	render: function(){
		destroyScroll();
		var template = _.template( $("#favouritestemplate").html(), {});
		var headertemplate = _.template($("#favouritesheadertemplate").html(), {});
		var self = this;

		$(this.el).html(template);
		if (!$("#body").find(".contentheaderspacer").length)
			$("#body").prepend(headertemplate);

		if (self.curFilter) {
			favouritescollection.setFilter(self.curFilter)
			makeView(this, favouritescollection.filtered);
		} else
			makeView(this, favouritescollection);
		console.log($("#favedit"))
		$("#favedit").attr("active", "false");

		$(".tab").each(function() {
			var tabAppliance = $(this).attr('id');
			if (favouritescollection.where({type: tabAppliance}).length < 1) {
				$(this).addClass('disabled');
			} else {
				bindTouch($(this), function(e) {
					var tab = $(e.target);
					if (tab.hasClass('selected')) {
						$(".contentheaderbutton").removeClass('selected');
						self.curFilter = null;
						self.render();
					} else {
						$(".contentheaderbutton").removeClass('selected');
						tab.addClass('selected');
						self.curFilter = tabAppliance;
						self.render();
					}
				});
			};
		});
		bindTouch($("#favedit"), function() {
			$.each(favouritescollection.models, function(key, value){
				var wrapper = $(value.get('view').el).find("#scfont");
				if ($("#favedit").attr("active") == "false"){
					wrapper.attr("oldColor", wrapper.css('color'));
					wrapper.attr("data-icon", "+");
					wrapper.css("color", "#FF0000");
					$("#favedit").html("Save");
					$(value.get('view').el).css("-webkit-transition", "top 0.1s linear");
					$(value.get("view").el).find("#selectcomparebutton").off();
					bindTouch($(value.get("view").el).find("#selectcomparebutton"), function() {
						favouritescollection.remove(value);
						$(value.get("view").el).remove();
						$.each(favouritescollection.models, function(key2, value2) {
							$(value2.get('view').el).css("top", topOrigins[key2] + 'px');
						});
						topOrigins.pop();
						favouritescollection.save();
					});
				} else {
					$("#favedit").html("Edit");
					wrapper.attr("data-icon", ",")
					wrapper.css("color", wrapper.attr('oldColor'));
					value.get("view").bindComp();
				}
			});
			var active = $("#favedit").attr('active');
			$("#favedit").attr('active', (active == "true") ? "false" : "true");
		});
		bindTouch($("#favclear"), function() {
			favouritescollection.reset();
			window.localStorage.removeItem('favourites');
			self.render();
		})
	},
	events: {
	},
});

browseselected = Backbone.View.extend({
	id: "browseselected",
	initialize: function() {

	},
	render: function(category) {
		destroyScroll();

		var template = _.template( $("#browseselectedtemplate").html(), {});
		var headertemplate = _.template($("#browseheadertemplate").html(), {});
		$(this.el).html(template);
		if (!$("#body").find(".contentheaderspacer").length)
			$("#body").prepend(headertemplate);
		var self = this;
		makeView(this, infoItemCollection);
		bindTouch($("#browsesort"), function() {
			toggleDisplay($("#sortmenu"));
		});
		$("#sortmenu").find("a").each(function(index, element) {
			var that = this;
			bindTouch($(this), function() {
				toggleDisplay($("#sortmenu"));
				infoItemCollection.comparator = function(model) {
					if (model.get($(that).attr('id')) == "?") 
						return 999999;
					else
						return model.get($(that).attr('id'));
				}	
				infoItemCollection.sort();
				if ($(that).attr('class') == 'reverse') {
					infoItemCollection.comparator = function(model) {
						return -infoItemCollection.indexOf(model);
					}
					infoItemCollection.sort();
				}
				self.render();
			});
		});
	}
})  