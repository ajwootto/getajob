//Routes to change content of body
var contentroutes = Backbone.Router.extend({
  initialize: function(el) {
    this.el = el;
    this.recents = new recents();
    this.favourites = new favourites();
    //this.scan = new scanview();
    this.compare = new compareview();
    this.browseselected = new browseselected();
    this.productdetails = new productdetails();
    this.reviews = new reviewsview();
  },
  routes: {
    "browse/recents": "recents",
    "productdetails/:id": "productdetails",
    "browse/favourites": "favourites",
    "browse/category": "browse",
    "scanview": "scan",
    "compareview": "compare",
    "back": "back",
    "reviews/:id": "reviews"
   
  },
  currentView: null,
  lastView: [],
  switchView: function(view, isBack) {
    if (this.currentView && !isBack) {
        this.lastView.push(this.currentView);
        console.log(this.lastView)
        $(this.currentView.el).find("*").andSelf().unbind();
        this.currentView.remove();
    }
    if (view == this.productdetails)
      $("#body").css("background-color", "white");
    else 
      $("#body").css("background-color", "#CFCFCF");
    this.el.html(view.el);
    view.render();
    
    //$(view.el).find("*").css({"-webkit-perspective": "1000", "-webkit-backface-visibility": "hidden"})
    $("#infowindowcontainer").css("display", "none");
    bindTouch($("#infowindowbackground"), function() {
      $("#infowindowcontainer").css("display", "none");
    });
    this.currentView = view;
    window.scrollTo(0, 0);
  },
  recents: function(){
  //$("#recentsbutton").css({"background": buttonactive,"box-shadow": "0 1px 0 rgba(255, 255, 255, 0.4), 0 1px 3px rgba(0, 0, 0, 0.4) inset"});
    //$("#favouritesbutton").removeAttr("style");
    $("#recentsbutton").addClass("selected");
    $("#favouritesbutton").removeClass("selected");
    if (!this.currentView || this.currentView && this.currentView.id != 'recents'){
      this.switchView(this.recents, false);
    }
  },
  favourites: function() {
   // $("#favouritesbutton").css({"background": buttonactive,"box-shadow": "0 1px 0 rgba(255, 255, 255, 0.4), 0 1px 3px rgba(0, 0, 0, 0.4) inset"});
    //$("#recentsbutton").removeAttr("style");
    $("#recentsbutton").removeClass("selected");
    $("#favouritesbutton").addClass("selected");
    this.switchView(this.favourites, false);

  },
  productdetails: function(id) {
    $("#recentsbutton").removeAttr("style");
    $("#favouritesbutton").removeAttr("style");
    this.productdetails.identification = id;
    this.switchView(this.productdetails, false);
  },
  browse: function() {
    $("#recentsbutton").removeAttr("style");
    $("#favouritesbutton").removeAttr("style");
    browsemenus.hide();
    this.switchView(this.browseselected, false);
  },
  back: function() {
    if (this.lastView.length > 0){
      var last = this.lastView.pop();
     if ($(last.el).attr('id') == "recents" || $(last.el).attr('id') == "favourites") {
        $("#" + $(last.el).attr('id') + "button").css({"background": buttonactive,"box-shadow": "0 1px 0 rgba(255, 255, 255, 0.4), 0 1px 3px rgba(0, 0, 0, 0.4) inset"});
      };
      this.switchView(last, true);
    };
  },
  reviews: function(id) {
    $("#recentsbutton").removeAttr("style");
    $("#favouritesbutton").removeAttr("style");
    browsemenus.hide();
    this.reviews.identification = id;
    this.switchView(this.reviews, false);
  },
//////
//Bind the scan button
////
  scan: function() {
    var self = this;
	   window.plugins.barcodeScanner.scan(
		function (result) {
			if(result.cancelled == 1) {
				alert('Scan Cancelled'); 
			}
			else {
				//navigator.notification.alert(
    				//'You scanned something, but this build doesn\'t use barcodes yet\nScanned Message: ' + result.text,  // message
				//null,         // callback
    	//			'Game Over',            // title
				//'GOT IT'                  // buttonName
		//	);}
     var infomodel = new infoItemModel({id: result.text, isScan: true});
     loadingDisplay(true);
     infomodel.fetch({success: function() {
        loadingDisplay(false);
        console.log(infomodel)
        if (infomodel.get('sku') != "[sku]"){
          infoItemCollection.push(infomodel);
          recentscollection.remove(infomodel);
          recentscollection.add(infomodel, {at: 0});
          recentscollection.save();
          contentroute.navigate("#browse/recents", {trigger: true});
          contentroute.navigate("#productdetails/" + infomodel.get('id'), {trigger:true});
        } else {
          alert('Invalid barcode data:' + result.text);
        }
     },
        error: function() {
          loadingDisplay(false);
          alert('Server connection error! Please try again...');
        }});
    }
       headerroute.navigate("#browse", {trigger: true});
		},
		function (error){
			alert('Scanning error');
		}, null
	);

  },                                  
  compare: function() {
    this.switchView(this.compare);
  }
  
});


//Changes content of header bar"
var headerroutes = Backbone.Router.extend({
  initialize: function(el) {
    this.el = el;
    this.browse = new browseheader();
    this.compare = new compareheader();
    this.scan = new scanheader();


  },
  routes: {
    "compare": "compare",
    "scan": "scan",
    "browse": "browse"
  },
  currentView: null,
  switchView: function(view) {
    if (this.currentView) {
        this.currentView.remove();
    }
    this.el.html(view.el);
    view.render();
    this.currentView = view;
  },
  browse: function(){
    $("#browsebutton").addClass("active");
    $("#scanbutton").removeClass("active");
    $("#comparebutton").removeClass("active");
    this.switchView(this.browse);
    contentroute.navigate("#browse/recents", {trigger: true});
    window.scrollTo(0, 0);
  },
  compare: function() {
    $("#browsebutton").removeClass("active");
    $("#comparebutton").addClass("active");
    $("#scanbutton").removeClass("active");
    browsemenus.hide();
    this.switchView(this.compare);
    contentroute.navigate("#compareview", {trigger:true});
  },
  scan: function() {
    $("#browsebutton").removeClass("active");
     $("#scanbutton").addClass("active");
    $("#comparebutton").removeClass("active");
     browsemenus.hide();
    //this.switchView(this.scan);

    contentroute.navigate("#scanview", {trigger: true});
  }
  
});
