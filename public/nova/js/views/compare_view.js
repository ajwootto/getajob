compareview = Backbone.View.extend({
	id:"compareview",
	initialize: function() {
		//this.render();
	},
	render: function(){
		var template = _.template( $("#comparetemplate").html(), {});
		var headertemplate = _.template($("#tabheadertemplate").html(), {});
		$(this.el).html(template);
		$("#body").prepend(headertemplate)
		var self = this;
		
		bindTouch($("#compclear"), function() {
			comparecollection.reset();
			window.localStorage.removeItem("compare");
			self.render();
		});

		var locked = 0;
		var infoitems = 6;
		var numcollapsed = 0;
		var oldsChosen = {};

		var compareView = $("#compareview");
		///Create collapsible row functionality
		var hideRow = function(index){
			var rowArrow = $(".rowarrow" + index)
			rowArrow.attr("collapsed", "true");
			$(".comprow" + index).addClass('collapsed');
			rowArrow.find(".collapsearrow").css({"border-bottom":"10px solid transparent", "border-top":"10px solid transparent", "border-left":"15px solid #2D2D2D"})
			var viewHeight = compareView.height();
			compareView.height(viewHeight -  viewHeight * 0.15);
			if (typeof iscroll != 'undefined' && iscroll)
				window.iscroll.refresh();
		}
		var showRow = function(index) {
			var rowArrow = $(".rowarrow" + index)
			rowArrow.attr("collapsed", "false");
			$(".comprow" + index).removeClass('collapsed');
			rowArrow.css({"border-bottom": "0"});
			rowArrow.find(".collapsearrow").css({"border-left":"10px solid transparent", "border-right":"10px solid transparent", "border-top":"15px solid #2D2D2D"})
			var viewHeight = compareView.height();
			compareView.height(viewHeight +  viewHeight * 0.15);
			if (typeof iscroll != 'undefined' && iscroll)
				window.iscroll.refresh();
		}
		var makeCollapseArrows = function(listid) {
			var rowHeight = 239
			var topSpace = 375
			var headerHeight = 39
			var collapseRowTemplate = _.template($("#collapseRowTemplate").html(), {});

			var makeRow = function(title, i) {

				compareView.append(collapseRowTemplate);
				var newRow = compareView.find('.collapseRow').not(".done")
				//newRow.css('top', i * rowHeight + topSpace).addClass("collapse" + i).addClass('done').data("id", i).html(metricTitles[i]);
				newRow.css('top', i * headerHeight + topSpace).addClass("collapse" + i).addClass('done').addClass("collapsed").data("id", i).append(title);
				hideRow(i);
				bindTouch(newRow, function(e) {
					if (e.originalEvent)
						var row = $(e.originalEvent.target)
					else
						var row = $(e.target)
					var id = row.data("id")
					console.log(id)
					if (row.hasClass('collapsed')) {
						row.removeClass('collapsed');
						row.find('img').attr('src', 'img/arrowdown.png');
						showRow(id);
						for (var a = 0; a <= infoitems; a++) {
							var item = compareView.find(".collapse" + a);
							item.css("top", a * headerHeight + topSpace);
							if (a > id)
								item.css("top", item.position().top + 200 - a*1);
							if (a != id) {
								hideRow(a);
								item.addClass("collapsed")
								item.find('img').attr('src', 'img/arrowright.png');

							}
						}
						if (typeof iscroll != 'undefined' && iscroll)
							window.iscroll.refresh();
					}
				});
			}
			if (comparecollection.models.length > 0){
				for (var i = infoitems; i >= 1; i--) {
					makeRow(metricTitles[i-1], i);
				};
				makeRow("Lifetime Energy Cost", 0);

			}
		};





		//An info item is one cell of information in a column
		var makeInfoItems = function(listid, infotemplate, model){
			var bartemplate = _.template($("#metricbartemplate").html(), {});
			var makeItem = function(metric, i) {
				var curColumn = $(listid);
				curColumn.find(".infoitemcontainer").append(infotemplate)
					.find(".infoitem").not(".done").attr("class", "infoitem done comprow" + i);
				var decimals = 0;
				if (metric.indexOf("operating") > -1 || metric.indexOf("lifetime") > -1) {
					decimals = 2;
				}
				if (model.get('metrics')) {
					curColumn.find(".infoitemcontainer").find(".comprow" + i).find("#infovalue").html(bartemplate);
					metricBarInit(round(model.get('metrics')[metric], decimals), 
						round(baselinecollection.get(model.get('type')).get('metrics')[metric], decimals), 
							curColumn.find(".comprow" + i));
				}
				var curRow = curColumn.find(".comprow" + i).find(".result")
				var rowResult = curRow.html()
				
				if ((metric.indexOf("lifetime") > -1 || metric.indexOf("operating") > -1) &&  rowResult != "Unavailable") {
					if (rowResult.split(".").length > 1 && rowResult.split(".")[1].length < 2)
						curRow.append("0");
					curRow.prepend("$");
				}

				if (metric.indexOf("lifetime") > -1)
					curColumn.find(".comprow" + i).find("img").attr("src", "img/gicons/operatingCost.png");
				else
					curColumn.find(".comprow" + i).find("img").attr("src", "img/gicons/" + metric + ".png");


				curColumn.find(".infoitemcontainer").find(".collapsearrowcontainer").on('touchstart', function(e){
					e.originalEvent.preventDefault();
				});
				curColumn.find(".collapsearrowcontainer").on('click', function(e) {
					e.preventDefault();
				});
			}
			makeItem("lifetimeCost", 0);
			for (var i=1; i<=infoitems; i++){
				makeItem(metricItems[i-1], i);
			};
			//curColumn.find(".averageText").css("top", "33%")
		}

		//Column info is what is shown at the top of the column (price etc.)
		var insertColumnInfo = function(key, listid, model){
			var itemtemplate = _.template($("#compareitemheadertemplate").html(), {});
			var curColumn = $(listid)
			curColumn.html(itemtemplate);
			var store = getStore();
			curColumn.find("#picture").html("<img id='image' width='150px' height='160px' src='http://www."+store+".ca" + model.get("image") +"''></img>");
			curColumn.find("#name").html(model.get('name'));
			curColumn.find("#energy").prepend(model.get('kwh') + ' kWh');
			checkEnergyStar(curColumn, model);
			//$(listid).find("#price").html("$" + model.get('salePrice'));
			/*if (round(model.get('metrics')[metricItems[0]], 2))
				curColumn.find("#lifetime").html("Life: $" + round(model.get('metrics')[metricItems[0]] * 13 + model.get('salePrice'), 2));
			else
				curColumn.find("#lifetime").html("Unavailable");*/
			var infotemplate = _.template($("#compareiteminfotemplate").html(), {});
			makeInfoItems(listid, infotemplate, model);
		}

		//Keep track of locked column variables
		var addLocked = function() {
			locked+=1;
			$("#slider").css("-webkit-transform", "translate3d(" + ($(document).width() / 3) * (locked) + "px, 0, 0)")
				.find(".collapseRow").css('left', -($(document).width() / 3) * locked);
			//resetCollapseArrows();
			if (locked == 1){
				$("#locked" + (locked)).find(".arrowtitle").remove();
			}
		};
		var removeLocked = function() {
			locked -= 1;
			$("#slider").css("-webkit-transform", "translate3d(" + ($(document).width()/ 3) * (locked) + "px, 0, 0)")
				.find(".collapseRow").css('left', -($(document).width() / 3) * locked);

			$.each(comparecollection.models, function(key2, model2){
				$("#" + model2.get('id')).find(".lockbutton").removeClass("locked");
			});
		};


		//Creates column template and calls columninfo and infoitem creators
		var populateColumn = function(key, model) {
			var style = (key == 0) ? "inline-block" : "none";
			var listid = model.get('id');
			$(self.el).find("#comparelist").append("<li style='width:" + ($(document).width() / 3) + "px; display:" + style + ";'id=" + listid + ">" + model.get('name') + "</li>");
			listid = "#" + listid;
			insertColumnInfo(key, listid, model);
			var curColumn = $(listid)
			var unlockColumn = function(e){
				if ($(e.originalEvent.target).attr("id")) {
					var lockid = $(e.originalEvent.target).attr("id");
					$(e.originalEvent.target).off();
				}else{
					var lockid = $(e.originalEvent.target).parent().attr("id");
					$(e.originalEvent.target).parent().off();
				}
				var listdiv = $("#locked"+(lockid)).attr("listdiv");
				$(listdiv).css({"display": "inline-block"})
					.find('.lockbutton').off();
				$('#locked' + (lockid)).css({"-webkit-transform": "translate3d(-550px," + $(".contentheader").height() + "px , 0)"})
				//move over the second locked column when first is unlocked
				lockid = parseInt(lockid);
				if (locked == 1) {
					self.bacon.calcPages;
				}
				if (locked > 1 && lockid < 2){
					$('#locked' + (lockid + 1)).css({"-webkit-transform": "translate3d(" + ($('#locked' + (lockid + 1)).offset().left - $('#locked' + (lockid + 1)).width()) + "px," + $(".contentheader").height() + "px, 0)"});
					$("#locked" + (lockid+1)).find(".arrowtitle").remove();
				}
				setTimeout(function() {
					$("#locked" +(lockid)).remove();
					bindLock(listdiv);
				}, 700);


				removeLocked();
			}

			var lockColumn = function(e, lockid) {
				var headerheight = $(".contentheader").height();
				$(self.el).prepend($(lockid).clone(true).attr({"id": "locked"+(locked+1), "class": "locked"}).css({"-webkit-transform": "translate3d(" + $(lockid).offset().left + "px," + (headerheight + 1) +"px, 0)"}));
				//$("#locked"+(locked+1)).css({"left": locked * $(lockid).width()});
				var lockedColumn = $("#locked"+(locked+1))
				lockedColumn.css({"-webkit-transform": "translate3d(" + (locked * $(lockid).width()) + "px," + (headerheight + 2) +"px, 0)"}).attr({"listdiv": lockid});
				lockedColumn.find(".locksymbol").attr("data-icon", "4");
				lockedColumn.find(".lockbutton,.removebutton").off();
				lockedColumn.find(".lockbutton").attr("id", locked + 1);
				lockedColumn.find(".removebutton").attr("id", locked + 1);
				//$("#slider").css("margin-left", $(lockid).width() * (locked + 1));
				$(lockid).css("display", "none");
				if (locked == 0) {
					self.bacon.calcPages();
				}
				bindTouch(lockedColumn.find(".lockbutton"), unlockColumn);
				bindTouch(lockedColumn.find(".removebutton"), function(e) {
					//comparecollection.remove(model);
					//comparecollection.save();
					unlockColumn(e);
					id = $("#locked" + (locked + 1)).attr('listdiv')
					$(id).find('.removebutton').trigger('manualtrigger')
					
					//$(self.el).find("ul").html("");
					//initializeCompareColumns(true);
					//makeCollapseArrows()
					
				});
				addLocked();
				
			};

			//Touch bindings for column buttons
			bindTouch(curColumn.find(".removebutton"), function() {
				comparecollection.remove(model);
				comparecollection.save();
				//$(self.el).find("ul").html("");
				curColumn.css('display', 'none');
				if(comparecollection.models.length > 2)
					self.bacon.calcPages();
				if(comparecollection.models.length < 1) {
					$(".collapseRow").css("display", "none")
				}
				//initializeCompareColumns(true);
			});
			bindTouch(curColumn.find(".detailslink"), function() {
				recentscollection.add(model, {at: 0});
				recentscollection.save();
				contentroute.navigate("#productdetails/" + model.get('id'), {trigger:true});
			});
			var bindLock = function(listid) {
				bindTouch(curColumn.find(".lockbutton"), function(e){
					if(locked < 2){
						lockColumn(e, listid);
					};
					
				})
			}
			bindLock(listid);
		};
		if (comparecollection.models.length == 0) {
			//fixes broken alert + touch behaviour
			setTimeout(function() {
				$(self.el).append("<p style='margin-left: 5em;'>No items added to compare!</p>");
			}, 0);
		};
		
		var filterColumns = function(appliance){
			var count = 0;
			var hidden = 0;
			$.each(comparecollection.models, function(key, model){
				if (model.get('type') != appliance){
					$("#" + model.get('id')).css("display", "none");
					hidden += 1;
					
				} else {
					$("#" + model.get('id')).css("display", "inline-block");
					count += 1;
				}

			});
			self.bacon.calcPages();

		};
		var removeOldColumn = function() {
			if ($("#oldcolumn").length > 0){
				$(self.el).find("#oldcolumn").remove();
				removeLocked();
				$.each(comparecollection.models, function(key, model){
					$("#" + model.get('id')).css("display", "inline-block");
				});
				var locked2 = $("#locked2")
				if (locked2.length > 0){
					locked2.find(".arrowtitle").remove();
					locked2.css({"-webkit-transform": "translate3d(" + ($('#locked2').offset().left - $('#locked2').width()) + "px," + $(".contentheader").height() + "px, 0)"})
						.attr("id", "locked1");
					$("#locked1").find(".lockbutton").attr("id", "1");
				};
			};
		};
		var hideOldSelector = function() {
			$("#oldselectcontainer").css("display", "none");
			$("#oldselectcontainer").find("*").off();
		};
		var insertOldColumn = function(appliance, name, oldAppliance) {
			removeOldColumn();
			//$(self.el).prepend($(lockid).clone(true).attr({"id": "oldcolumn", "class": "locked"}).css({"-webkit-transform": "translate3d(0" + headerheight +"px, 0)"}));
			$(self.el).prepend("<li class=locked id=oldcolumn style='-webkit-transform: translate3d(0, "+ ($(".contentheader").height() + 1) + "px, 0); display:inline-block; width:" + ($(document).width() / 3) + "px; left=0;'></li>");
			insertColumnInfo(0, "#oldcolumn", oldAppliance);
			//$("#oldcolumn").find("#picture").attr("id", "yeartext")
			//$("#oldcolumn").find("#yeartext").html($("select").val());
			var oldColumn = $("#oldcolumn");
			oldColumn.find(".compareitemheader").find("img").attr("src", "img/appliances/" + name.toLowerCase().slice(0,-1) + ".png");
			oldColumn.find("#name").html(name.slice(0,-1));
			//$("#oldcolumn").find("#energy").css({"text-align": "center", "width": "100%", "display": "inline-block"});
			oldColumn.find("#price").attr("id", "yearbutton").html((appliance == 'television') ? 2009 : $("select").val());
			oldColumn.find(".locksymbol").attr("data-icon", "'");
			oldColumn.find(".lockbutton").css("display", "none")
			if (appliance == "television") 
				$("#oldcolumn").find("#name").html('42" TV');
			bindTouch($("#oldcolumn").find("#yearbutton"), function() {
				showOldSelector(appliance, name);
				filterColumns(appliance);
			});
			$("#slider").css("-webkit-transform", "translate3d(" + $("#oldcolumn").width() + "px, 0, 0)");
			addLocked();
			bindTouch($("#oldcolumn").find(".removebutton"), function(e) {
				removeOldColumn();
				$.each(tabarray, function(key, appliance){
					$("#" + appliance).removeClass("selected");
				});
			});
			for (var i = 0; i < infoitems; i ++) {
				if ($("#slider").find(".comprow" + i).hasClass("collapsed")){
					compareView.find("#oldcolumn").find(".comprow" + i).addClass("collapsed");
				}
			}
		}
		var showOldSelector = function(appliance, name) {
			$("#oldselectcontainer").css("display", "block");
			var oldSelector = $("#oldselector");
			oldSelector.find("#currentappliance").html($("#" + appliance).html().slice(0,-1));
			if (appliance == 'television'){
				oldSelector.find("h1").html("Show 2009 TV comparison?");
				oldSelector.find("select").css("display", "none");
				oldSelector.find("#currentappliance").css("display", "none");
				oldSelector.find("label").css("display", "none");
			} else {
				oldSelector.find("h1").html("Select the year you purchased your current:");
				oldSelector.find("select").css("display", "inline-block");
				oldSelector.find("#currentappliance").css("display", "block");
				oldSelector.find("label").css("display", "inline-block");
			}
		
			bindTouch(oldSelector.find("span"), function() {
				hideOldSelector();
				removeOldColumn();
				filterColumns(appliance);
				//redoArrows();
			});
			bindTouch($("#oldbackground"), function() {
				hideOldSelector();
				removeOldColumn();
				filterColumns(appliance);
				//redoArrows();
			});
			bindTouch($("#oldgo"), function() {
				hideOldSelector();
				var oldAppliance = new infoItemModel({isOld: true, appliance: appliance, type: appliance, id: appliance, year: (appliance == "television") ? 2009 : $("select").val()});
				loadingDisplay(true);
				oldAppliance.fetch({success: function() {
					loadingDisplay(false);

					oldsChosen[appliance] = oldAppliance
					for (var i=1; i<3; i++){
						if ($("#locked"+i).length > 0){
							$("#locked"+i).remove();
							removeLocked();
						};
					};					
					insertOldColumn(appliance, name, oldAppliance);
					filterColumns(appliance);
				}, error: function() {
					alert("Server connection error! Try again later...");
					loadingDisplay(false);
				}});
			});
			bindTouch($("#oldcancel"), function() {
				hideOldSelector();
				removeOldColumn();
				filterColumns(appliance);
				//redoArrows();
			});
		}
		var tabTouch = function(appliance) {
			if (!$("#" + appliance).hasClass("selected")) {
				$.each(tabarray, function(key2, appliance2){
					$("#" + appliance2).removeClass("selected");					
				});
				$("#" + appliance).addClass("selected");
				if (!oldsChosen[appliance]){
					showOldSelector(appliance, $("#" + appliance).html());
				} else {

					insertOldColumn(appliance, $("#" + appliance).html(), oldsChosen[appliance]);
				}
				filterColumns(appliance);
			} else {
				$.each(tabarray, function(key2, appliance2){
					$("#" + appliance2).removeClass("selected");					
				});
				$.each(comparecollection.models, function(key, model){
					$("#" + model.get('id')).css("display", "inline-block");
				});
				self.bacon.calcPages();
				removeOldColumn();
			};
		}
		var tabarray = ["dishwasher", "washer", "dryer", "refrigerator", "freezer", "electricRange", "television"];
		$.each(tabarray, function (key, appliance){
			var count = 0;
			$.each(comparecollection.models, function(key2, model){
				if (model.get('type') == appliance)
					count += 1;
			});
			if (count > 0){
				bindTouch($("#" + appliance), function() {
					tabTouch(appliance);
				});
			} else {
				$("#" + appliance).addClass("disabled");
			};
		});

		
		var initializeCompareColumns = function(removing) {
			var compcounter = 0;
			if (!comparecollection.loaded)
				loadingDisplay(true);
			var compinterval = setInterval(function() {
				compcounter += 1
				if (comparecollection.loaded) {
					clearInterval(compinterval);
					$.each(comparecollection.models, function(key2, model2) {
						populateColumn(key2, model2);
					});

					//if (comparecollection.models.length < 2) {
					//	$("#comparelist").append("<li style='width:" + ($(document).width() / 3) + "px; height: 600px; display:none;'></li>")
					//};
					if (comparecollection.models.length > 0)
						makeCollapseArrows();
					if (typeof window.iscroll != 'undefined' && window.iscroll != null) {
						window.iscroll.destroy();
						window.iscroll = null;
					};
					compareView.append("<div style= 'height:10em; width:100%;'></div>")
					compareView.css("height", '');
					window.iscroll = new iScroll("body", {childIndex: 2, hScroll: false, lockDirection: true, vScrollbar: false});	
					if (comparecollection.models.length > 1){
						self.bacon = new CompBaconSwipe(document.getElementById('slider'), 
							{scrollsVertically: false, individual: true, preventVertScroll: true}, ($(document).width() - 1) / 3, 600, comparecollection.length);
					};
					$("#comparelist").width($("#comparelist").width() + 10);
					loadingDisplay(false);
					$("#body").scrollTop(0);

					

					if (window.lastCompare && !removing && comparecollection.where({type: window.lastCompare}).length > 0) {
						tabTouch(window.lastCompare);
					} else {
						$(".tab").each(function(key2, tab){
							if ($(this).hasClass("selected"))
								filterColumns($(this).attr('id'));
						});
					};

					$(".collapse0").trigger('manualtrigger');
				} else if (compcounter > 300) {
					loadingDisplay(false);
					alert("Server Connection Error, try again later....");
					clearInterval(compinterval);
				};
			});
		};
		initializeCompareColumns(false);
	}
});
