scanview = Backbone.View.extend({
	id:"scanview",
	initialize: function() {

	},
	render: function(){
		var template = _.template( $("#scantemplate").html(), {});
		$(this.el).html(template);
	}
});
