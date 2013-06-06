

var makeView = function(self, collection){
	
	if (typeof iscroll != 'undefined' && iscroll != null) {
		iscroll.destroy();
		iscroll = null;
	};
	bindTouch($("#searchbar"), function() {
		window.scrollTo(0,0);
		$("#searchbar").select();
	});
	var iterations = 0
	var rowheight = 0;
	$.each(intervals, function(key, value){
		clearInterval(value);
	});
	if (!collection.loaded)
		loadingDisplay(true);
	//var appendstring = ''
	var interval = setInterval(function() {
		iterations += 1
		if (collection.loaded){
			topOrigins = [];
			collection.each(function(value, key, list){
				var infomodel = value;
				var infoview = new infoItemView({model: infomodel, id: key});
				if (collection == favouritescollection){
					infoview.isBrowseItem = false;
				}
				infomodel.set("view", infoview);
				infoview.render();
				//appendstring = appendstring + $(infoview.el).html();
				$(self.el).append(infoview.el);
			});
			//$(self.el).append(appendstring);
			if (collection.models.length > 0) {
				rowheight = $("#browseinfocontainer").height();
				$.each(collection.models, function(key, value){
					topOrigins.push($(value.get('view').el).offset().top);
				})  
			} else if(collection.id == "infocollection") {
				alert("No items to show!");
			}
			
			if (collection.id == 'favourites'){
				makeSpacer(self);
			} else {
				$(self.el).append("<div style='height:" + rowheight/1.2 + "px; width:100%;'></div>");
				if (collection == infoItemCollection) {
					window.iscroll = new iScroll("body", {childIndex: 3, hScroll: false, vScrollbar: true});
				} else
					window.iscroll = new iScroll("body", {childIndex: 2, hScroll: false, vScrollbar: true});
			}
			loadingDisplay(false);
			clearInterval(interval);
		} else if (iterations > 300) {
			loadingDisplay(false);
			alert("Server connection error! Please try again...")
			clearInterval(interval);
		}
	}, 100);
	intervals.push(interval);
};

var makeSpacer = function(self) {
	if (favouritescollection.models.length > 0){
		var rowheight = $(favouritescollection.at(0).get('view').el).find("#productlink").height();
		$.each(favouritescollection.models, function(key, model) {
			var value = model.get('view');
			$(value.el).css({"position": "absolute", "top": topOrigins[key], "width": "100%", "height": rowheight, "z-index": 150 - key});	
		});
		$("#spacer").remove();
		 $(self.el).append("<div id = 'spacer' style='width:100%; height:" + (rowheight * (favouritescollection.models.length + 0.2)) + "px; position: relative; z-index:5;'></div>");
	}
};

var bindTouch = function(target, func){
	target.click = false;
	var deltaX = 0;
	var deltaY = 0;
	var startX = 0;
	var startY = 0;
	target.off('touchstart');
	target.off('touchend');
	if (window.disableClick){
		target.on('click', function(e){
			e.preventDefault();
		});
	};
	target.on('touchstart', function(e) {
		//e.originalEvent.preventDefault();
		startY = e.originalEvent.touches[0].pageY;
		startX = e.originalEvent.touches[0].pageX;
		target.click = true;
	});
	var endfunc = function(e) {
		//e.originalEvent.preventDefault();

		deltaX = e.originalEvent.changedTouches[0].pageX - startX;
		deltaY = e.originalEvent.changedTouches[0].pageY - startY;
		if (Math.abs(deltaX) < 50 && Math.abs(deltaY) < 50){
			if(target.click){
				target.click = false;
				target.trigger("touchclick");
				func(e);
			};
		};
	}
	target.on('touchend', endfunc);
	target.on('manualtrigger', function(e) { 
		func(e) 
	});
}
var getStore = function() {
	if (window.localStorage.getItem('store') == 'FutureShopCanada'){
		return "futureshop";
	} else {
		return "bestbuy";
	}
}
var loadingDisplay = function(show) {
	if (show) {
		$("#contentloadingmessage").css("display", "inline-block");
	} else {
		$("#contentloadingmessage").css("display", "none");
	}
}
var toggleDisplay = function(id) {
	if (id.css("display") == "none") {
		id.css("display", "block");
	} else {
		id.css("display", "none");
	}
}
var metricBarInit = function(result, average, id){
	if (average > -1)
		id.find(".averageNum").append(average);
	else
		id.find(".averageNum").append("Unavailable");
	if (result > -1)
		id.find(".result").append(result);
	else
		id.find(".result").append("Unavailable");
	//convert the energy usage into a bar height based on the average energy usage
	function percentToHeight (result, average) {
		var percent = (result - average) * ((1/average)*100); //calculates the actual usage as a fraction of the average usage
		var height = id.find("#staticBox").height() + percent; //turns the fraction into a height value, based on the total height of the box
		return height/2; //since the average is set to half of the box height, divide the bar height by two
	}

	var bar = id.find("#bar");
	var barHeight = percentToHeight(result, average); //sets the height of the bar
	var boxHeight = id.find("#staticBox").height(); //sets the height of the box
	var average = boxHeight/2; //sets the average value

	bar.height(barHeight); //set the div (id=bar)'s height to the returned value of percentToHeight 
	bar.css("margin-top", boxHeight - barHeight); //change the top margin value based on height of the bar

	//checks to see if the bar is larger than the box
	//if it is, then set the bar height equal to the height of the box
	if (barHeight > boxHeight) {
		bar.height(boxHeight);
		bar.css("margin-top", "0");
	}

	//sets the colour of the bar based on its value relative to the average
	if (barHeight > average + 1/average*1000) {
		bar.css("background-color", "#FF3030");
	} else if (barHeight < average + 1/average*1000 && barHeight > average - 1/average*1000) {
		bar.css("background-color", "#FFE600");
	} else {
		bar.css("background-color", "#4CBB17");
	}
};
var checkEnergyStar = function (container, model){
	if (model.get('hasEnergyStar'))
		container.find(".energystar").addClass("show");
}
var round = function(number, decimals){
	var multiplier = Math.pow(10, decimals);
	return Math.round(number * multiplier)/multiplier
}
var destroyScroll = function() {
	if (typeof window.iscroll != 'undefined' && window.iscroll != null) {
		window.iscroll.destroy();
		window.iscroll = null;
	};
}

var logUsage = function(used) {
	
}
