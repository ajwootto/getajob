reviewsview = Backbone.View.extend({
	id: "reviews",
	initialize: function() {
		this.identification = 0.0
	},
	render: function() {
		var self = this;

		if (typeof iscroll != 'undefined' && iscroll != null) {
			iscroll.destroy();
			iscroll = null;
		};
		var headertemplate = _.template($("#reviewsheadertemplate").html(), {});
		var reviewviewtemplate = _.template($("#reviewviewtemplate").html(), {});
		$(this.el).html(reviewviewtemplate);
		if (!$("#body").find(".contentheaderspacer").length)
			$("#body").prepend(headertemplate);

		var infomodel = new infoItemModel({id: this.identification})
		if (recentscollection.contains(infomodel)){
			infomodel = recentscollection.where({id: this.identification})[0];
		} else if (favouritescollection.contains(infomodel)) {
			infomodel = favouritescollection.where({id: this.identification})[0];
		} else if (infoItemCollection.contains(infomodel)) {
			infomodel = infoItemCollection.where({id: this.identification})[0];
			if (infomodel.get('isScan')){
				infoItemCollection.remove(infomodel);
			}
		} else if (comparecollection.contains(infomodel)) {
			infomodel = comparecollection.where({id: this.identification})[0];
		} else {
			infomodel.fetch();
		}
		bindTouch($("#productdetailsbackbutton"), function() {
			contentroute.navigate("#back", {trigger:true});
		});
		var infoview = new infoItemView({model: infomodel});
		infomodel.set("view", infoview);
		infoview.render();
		$(this.el).append(infoview.el);

		loadingDisplay(true)

		var reviewitem = new reviewitems({id: this.identification});
		reviewitem.fetch({ success:function() {
			loadingDisplay(false)
			for (var i= 0; i<=reviewitem.get('customerRating'); i++){
				$(".averagereviewstars").find("#" + i).css("color", "#D9D919");
				$(".averagereviewstars").find("#" + i).attr("data-icon", "$");
			}
			if (reviewitem.get("reviews").length == 0) {
				$(self.el).append("<div style='margin:5em 0 0 0; text-align: center; width:100%; font-size:2em;'>No product reviews to show!</div>");
			};

			$.each(reviewitem.get("reviews"), function(key, review){
				var reviewtemplate = _.template($("#reviewitemtemplate").html(), {});
				$(self.el).append(reviewtemplate);
				$("#review").attr("id", "review" + key);
				$(self.el).find("#review" + key).find(".header").html(review.title);
				$(self.el).find("#review" + key).find(".content").html(review.comment);

				if ($(self.el).find("#review" + key).find(".content").css("height") && parseInt($(self.el).find("#review" + key).find(".content").css("height").slice(0, -2)) > 150){
					$(self.el).find("#review" + key).find(".expandtext").css("display", "block");
					bindTouch($(self.el).find("#review" + key).find(".content"), function(e) {
						if (parseInt($(e.target).parent().css("height").slice(0, -2)) > 200) {
							$(e.target).parent().css("height", "12em");
							$(self.el).find("#review" + key).find(".expandtext").html("touch review to expand")
							window.iscroll.refresh();
							$(self.el).find("#review" + key).find(".expandtext").css('box-shadow', '0px 5px 25px black');

						}
						else{
							$(e.target).parent().css("height", "auto");
							$(self.el).find("#review" + key).find(".expandtext").html("touch review to collapse")
							window.iscroll.refresh();
							$(self.el).find("#review" + key).find(".expandtext").css('box-shadow', '0px 0px 0px #000');
						}
					});
				} else {
					$(self.el).find("#review" + key).find(".expandtext").remove();
				}
				
				$(self.el).find("#review" + key).find(".date").html(review.submissionTime.slice(0, 10));
				var score = review.rating;
				for (var i=0; i <= score; i++) {
					$("#review" + key).find(".reviewstars").find("#" + i).css("color", "#D9D919");
					$("#review" + key).find(".reviewstars").find("#" + i).attr('data-icon', '$');
				};
			});
			$(self.el).append("<div style='height:6em; width:100%;'></div>");
			window.iscroll = new iScroll("body", {hScroll: false, vScrollbar: true, childIndex: 2});
			
		}, error: function() {
			loadingDisplay(false)
			alert("Server connection error, try again later...");
		}})

	}
})

