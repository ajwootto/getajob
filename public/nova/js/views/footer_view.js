
footer = Backbone.View.extend({
	initialize: function() {
		this.render();
	},
	render: function(){
		var template = _.template( $("#footertemplate").html(), {});
		$(this.el).html(template);
		bindTouch($(this.el).find("#scanbutton"), function(e) {
			headerroute.navigate("#scan", {trigger: true});
		});
		bindTouch($(this.el).find("#browsebutton"), function(e) {
			headerroute.navigate("#browse", {trigger: true});
		});
		bindTouch($(this.el).find("#comparebutton"), function(e) {
			headerroute.navigate("#compare", {trigger: true});
		});
	},
	events: {
	},
});
