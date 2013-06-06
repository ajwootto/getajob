productdetails = Backbone.View.extend({
	id: "productdetails",
	initialize: function(){
		this.identification = 0.0;
	},
	render: function() {
		var template = _.template( $("#productdetailstemplate").html(), {});
		var gridtemplate = _.template( $('#productdetailsgriditemtemplate').html(), {});
		var bartemplate = _.template($("#metricbartemplate").html(), {});
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

		$(this.el).html(template);
		bindTouch($("#productdetailsbackbutton"), function() {
			contentroute.navigate("#");
			contentroute.navigate("#back", {trigger:true});
		});
		
		var self = this;
		
		var quantity;
		var baseline = baselinecollection.get(infomodel.get('type'));
		var updateMetric = function(time, id) {
			var decimals = 0;
			if (metricTitles[id].indexOf("Annual") > -1)
				var decimals = 2;
				//$("#details" + id).find("#griditemtitle").html(metricTitles[id].slice(0, -8) + "\n($ " + $("#details" + id).find("select option:selected").text() + ')');
			if (typeof infomodel.get('metrics')[metricItems[id]] == "number") 
				$("#details" + id).find(".result").html(round(infomodel.get('metrics')[metricItems[id]] * time * quantity, decimals));
				$("#details" + id).attr('class', time);
			if (typeof baseline.get('metrics')[metricItems[id]] == "number")
				$("#details" + id).find("#averageNum").html(round(baseline.get('metrics')[metricItems[id]] * time * quantity, decimals));
		}
		var populateFields =function() {
			var el = $(self.el)
			el.find("#productdetailssku").html(infomodel.get("sku"));
			el.find("#productdetailsname").html(infomodel.get("oldname"));
			checkEnergyStar(el, infomodel);
			el.find("#productdetailsmodelnumber").html(infomodel.get("modelNumber"));
			el.find("#productdetailsprice").css("display", "none");
			//el.find("#productdetailsprice").html("Price: $" + round(infomodel.get("regularPrice") * quantity, 2));
			//if (infomodel.get('regularPrice') > infomodel.get('salePrice') ) {
				//el.find("#productdetailssaleprice").html("Sale Price: $" + round(infomodel.get("salePrice") * quantity, 2));
			//} else {
				el.find("#productdetailssaleprice").html(" ");
				el.find("#productdetailssaleprice").css("display", "none");
			//}
			el.find("#productdetailslifetime").html("Lifetime Energy Cost: $" + round(infomodel.get("metrics")["lifetimeCost"] * quantity || 0, 2));
			if (typeof infomodel.get("kwh") == "number") {
				var kwhvalue = round(infomodel.get("kwh") * quantity, 2);
			} else {
				var kwhvalue = "?";
			}

			$(self.el).find("#productdetailskwh").html(kwhvalue + " kWh/year");
			var store = getStore();
			$(self.el).find("#productdetailspicturecontainer").html("<img width='200px' height='210px' style='' src='http://www." + store + ".ca" + infomodel.get("image") + "'/>");
			
			if (favouritescollection.where({id: infomodel.id}).length > 0)
				$(this.el).find("#productdetailsfavouriteicon").css("color", "#D9D919");
			if (comparecollection.where({id: infomodel.id}).length > 0)
				$(this.el).find("#productdetailscompareicon").css("color", "#7FCC00");

			for (var i=0; i<6; i++){
				var display = (i==0) ? "inline-block" : "none";
				$(self.el).find("#slider").find("#slidelist").append("<li id='details" + i +"'style='display:" + display + ";'>" + gridtemplate +"</li>")
				if (metricTitles[i].indexOf("Annual") > -1) 
					$(self.el).find("#slider").find("#slidelist").find("#details" + i).find("#griditemtitle").html("Energy Cost");
				else
					$(self.el).find("#slider").find("#slidelist").find("#details" + i).find("#griditemtitle").html(metricTitles[i]);

				if (metricTitles[i].indexOf("Annual")) {
					var decimals = 0;
				} else {
					var decimals = 2;
					//$(self.el).find("#slider").find("#slidelist").find("#details" + i).find("#griditemtitle").html(metricTitles[i].slice(0, -8) + "\n($ " + $("#details" + i).find("select option:selected").text() + ')');
				}
				if (infomodel.get("metrics")){
					$(self.el).find("#slider").find("#slidelist").find("#details" + i).find("#griditemvalue").html(bartemplate);

					var time = $("#details" + i).attr("class") || "1"
					time = parseFloat(time)
					if (typeof infomodel.get('metrics')[metricItems[i]] == "number") {
						var result = round(infomodel.get('metrics')[metricItems[i]] * quantity * time, decimals)
					} else {
						var result = "Unavailable"
					}

					if (typeof baseline.get('metrics')[metricItems[i]] == "number") {
						var average = round(baseline.get('metrics')[metricItems[i]] * quantity * time, decimals)
						$(self.el).find
					} else {
						var average = "Unavailable"
					}
					metricBarInit(result,average,$(self.el).find("#slider").find("#details" + i).find(".metricbarcontainer"));
					if (result != "Unavailable" && metricTitles[i].indexOf("Annual") > -1) {
						if ($("#details" + i).find(".result").html().split(".")[1].length < 2)
							$("#details" + i).find(".result").append("0");
						$("#details" + i).find(".result").prepend("$");
					}
					$("#details" + i).find("img").attr("src", "img/icons/" + metricItems[i] + ".png");

				};
				$("#details" + i).find("select").attr("id", "select" + i);
			}
			
		}
		quantity = 1
		populateFields();

		$("#quantityselector").change(function(e){
			quantity = $(this).val();
			populateFields();
		});
		$("#slider").find("select").each(function() {
			$(this).change(function() {
				var id= $(this).attr('id').charAt($(this).attr('id').length - 1);
				updateMetric(parseFloat($(this).val()), id);
			});
		})
		var width = ($('#slider').width()/3);
		var height = $('#slider').height();
		$('#slider').find('li').css('height', height + 'px');
		$('#slider').find('li').css('width', width - 2 + 'px');
		new CompBaconSwipe( document.getElementById('slider'),{scrollsVertically: false}, width, height, 6);

		if (comparecollection.contains(infomodel))
			$(self.el).find("#productdetailscompareicon").css("color", "#7FCC00");
		if (favouritescollection.contains(infomodel))
			$(self.el).find("#productdetailsfavouriteicon").css("color", "#D9D919");


		var compToggle = function() {
			if (!comparecollection.contains(infomodel)){
				comparecollection.push(infomodel);
				$(self.el).find("#productdetailscompareicon").css("color", "#7FCC00");
				comparecollection.save();
			} else {
				comparecollection.remove(infomodel);
				$(self.el).find("#productdetailscompareicon").css({"color": "#676767"});
				comparecollection.save();
			};
		};
		bindTouch($(this.el).find("#productdetailscompare"), function() {
			compToggle();
		})

		var addFav = function() {
			if (favouritescollection.contains(infomodel)) {
				favouritescollection.remove(infomodel);
	  			$(self.el).find("#productdetailsfavouriteicon").css("color", "#676767");
	  			favouritescollection.save();
			} else {
				favouritescollection.push(infomodel);
	  			$(self.el).find("#productdetailsfavouriteicon").css("color", "#D9D919");
	  			favouritescollection.save();
			}
		};
		bindTouch($(this.el).find("#productdetailsfavourite"), function() {
			addFav()
		});

		bindTouch($(this.el).find("#productdetailsreviews"), function() {
			contentroute.navigate("#reviews/" + self.identification, {trigger: true});
		});
		if (typeof infomodel.get('metrics')[metricItems[0]] == "string") {
			alert("No energy data available for this appliance!");
		}

	},
	events: {
	},
});
