/*
 * BaconSwipe 1.0
 * Adapted from:
 * Swipe 1.0
 * Brad Birdsall, Prime
 * Copyright 2011, Licensed GPL & MIT
 *
*/
window.CompBaconSwipe = function(element, options, cellPaddedWidth, cellPaddedHeight, columns) {

  // return immediately if element doesn't exist
  if (!element) return null;

  var _this = this;

  ///////
  //OPTIONS
  ////
  this.options = options || {};
  this.index = this.options.startSlide || 0;
  this.vindex = this.options.vindex || 0;
  this.speed = this.options.speed || 300;
  this.callback = this.options.callback || function() {};
  this.delay = this.options.auto || 0;
  this.individual = this.options.individual || false;
  this.scrollsVertically = this.options.scrollsVertically == null ? true : this.options.scrollsVertically;
  this.columns = columns;
  this.preventVertScroll = this.options.preventVertScroll || false;

  // reference dom elements
  this.container = element;
  this.element = this.container.children[0]; // the slide pane/<ul>

  // static css
  this.container.style.overflow = 'hidden';
  this.element.style.listStyle = 'none';
  this.element.style.margin = 0;

  // trigger slider initialization
  this.setup(cellPaddedWidth, cellPaddedHeight);

  // begin auto slideshow
  this.begin();

  // add event listeners
  if (this.element.addEventListener) {
    this.element.addEventListener('touchstart', this, false);
    this.element.addEventListener('touchmove', this, false);
    this.element.addEventListener('touchend', this, false);
    this.element.addEventListener('webkitTransitionEnd', this, false);
    this.element.addEventListener('msTransitionEnd', this, false);
    this.element.addEventListener('oTransitionEnd', this, false);
    this.element.addEventListener('transitionend', this, false);
    window.addEventListener('resize', this, false);
  }

};

CompBaconSwipe.prototype = {

  setup: function(cellwidth, cellheight) {

    // get and measure amt of slides
    this.slides = this.element.children;
    this.length = this.slides.length;
    this.horizontalMove = false;
    // return immediately if their are less than two slides
    if (this.length < 2) return null;

    // determine width of each slide
    this.width = ("getBoundingClientRect" in this.container) ? this.container.getBoundingClientRect().width : this.container.offsetWidth;
    this.height = ("getBoundingClientRect" in this.container) ? this.container.getBoundingClientRect().height : this.container.offsetHeight;


    // return immediately if measurement fails
    if (!this.width || !this.height) return null;

    // hide slider element but keep positioning during setup
    this.container.style.visibility = 'hidden';

    // set sizing attributes
    var index = this.slides.length;

    console.log('width:', this.container.getBoundingClientRect().width, "cellwidth:", cellwidth);
    var extrawidth = this.width%cellwidth;
    var cellsperrow = Math.floor(this.width/cellwidth);
    var marginRight = extrawidth/cellsperrow;
    console.log(extrawidth, cellsperrow);

//define the horizontal size
    this.cellhorizontalsize = marginRight + cellwidth + 1;
//set the UL width
    this.element.style.width = this.columns*(this.cellhorizontalsize)+'px';

//calculate heights
    var rows = 0;   
    var extraheight = this.height;
    while(extraheight > 0) {
      rows++;
      extraheight -= cellheight;
    } 
    extraheight += cellheight;
    var marginBottom = extraheight/(rows - 1);
    this.cellverticalsize = cellheight + marginBottom;

//set the number of "pages" the slider will slide through depending on if a "page" is an individual grid item or a full viewport's worth of grid items
    if(this.individual) {
        this.hpages = this.columns - 2;
        this.vpages = rows;
    }
    else {
        this.hpages = Math.ceil(this.columns/(this.width/cellwidth)); 
      this.vpages = Math.ceil(rows/(this.height/cellheight));
    }
//set sizing variables for each cell
    while (index--) {

      var el = this.slides[index];
      el.style.width =  cellwidth+ 'px';
      //el.style.height = cellheight+'px';
      el.style.marginRight = marginRight+'px';
      el.style.marginBottom = marginBottom +'px';
      el.style.display = 'inline-block';
      el.style.verticalAlign = 'top';
    }
   // this.slides[this.slides.length - 1].style.borderRight = 'none';

    this.element.style.webkitTransform = 'translate(0, 0)';
    // set start position and force translate to remove initial flickering
    this.slide(this.index, 0); 
    this.vslide(this.vindex, 0);

    // show slider element
    this.container.style.visibility = 'visible';

  },

  slide: function(index, duration) {

    var style = this.element.style;
    // fallback to default speed
    if (duration == undefined) {
        duration = this.speed;
    }
    // set duration speed (0 represents 1-to-1 scrolling)
    style.webkitTransitionDuration = style.MozTransitionDuration = style.msTransitionDuration = style.OTransitionDuration = style.transitionDuration = duration + 'ms';

    // translate to given index position
    /*if(this.individual) {
      style.MozTransform = style.webkitTransform = 'translate3d(' + -(index * this.cellhorizontalsize) + 'px,0,0)';
      style.msTransform = style.OTransform = 'translateX(' + -(index * this.cellhorizontalsize) + 'px)';
    } else {
      style.MozTransform = style.webkitTransform = 'translate3d(' + -(index * this.width) + 'px,0,0)';
      style.msTransform = style.OTransform = 'translateX(' + -(index * this.width) + 'px)';

    }*/
    if(this.individual) {
      style.MozTransform = style.webkitTransform = 'translate3d(' + -(index * this.cellhorizontalsize) + 'px,0,0)';
        style.msTransform = style.OTransform = 'translateX(' + -(index * this.cellhorizontalsize) + 'px)';
        style.webkitBackfaceVisibility = "hidden";
        style.webkitPerspective = 500;
    } else { 
      style.MozTransform = style.webkitTransform = 'translate3d(' + -(index * this.width) + 'px,' + -(this.vindex * this.height) + 'px,0)';
      style.msTransform = style.OTransform = 'translateX(' + -(index * this.width) + 'px)';
      style.webkitBackfaceVisibility = "hidden";
      style.webkitPerspective = 1000;
    }
    // set new index to allow for expression arguments
    this.index = index;

  },

  vslide: function(vindex, duration) {
  var style = this.element.style;
        if (duration == undefined)
    duration = this.speed;
  style.webkitTransitionDuration = style.MozTransitionDuration = style.msTransitionDuration = style.OTransitionDuration = style.transitionDuration = duration + 'ms';
  /*if(this.individual) {
          style.MozTransform = style.webkitTransform = 'translate3d(0,' + -(vindex * this.cellverticalsize) + 'px,0)';
        style.msTransform = style.OTransform = 'translateY(' + -(vindex * this.cellverticalsize) + 'px)';
      } else { 
          style.MozTransform = style.webkitTransform = 'translate3d(0,' + -(vindex * this.height) + 'px,0)';
          style.msTransform = style.OTransform = 'translateY(' + -(vindex * this.height) + 'px)';
  }*/
  if(this.individual) {
          style.MozTransform = style.webkitTransform = 'translate3d(' + -(this.index * this.cellhorizontalsize) + 'px,' + -(vindex * this.cellverticalsize) + 'px,0)';
        style.msTransform = style.OTransform = 'translateY(' + -(vindex * this.cellverticalsize) + 'px)';
      } else { 
          style.MozTransform = style.webkitTransform = 'translate3d(' + -(this.index * this.width) + 'px,' + -(vindex * this.height) + 'px,0)';
          style.msTransform = style.OTransform = 'translateY(' + -(vindex * this.height) + 'px)';
  }
  this.vindex = vindex;
  },

  getPos: function() {
    
    // return current index position
    return this.index;

  },

  prev: function(delay) {

    // cancel next scheduled automatic transition, if any
    this.delay = delay || 0;
    clearTimeout(this.interval);

    // if not at first slide
    if (this.index) this.slide(this.index-1, this.speed);

  },

  next: function(delay) {

    // cancel next scheduled automatic transition, if any
    this.delay = delay || 0;
    clearTimeout(this.interval);

    if (this.index < this.hpages - 1) this.slide(this.index+1, this.speed); // if not last slide
    else this.slide(0, this.speed); //if last slide return to start

  },

  begin: function() {

    var _this = this;

    this.interval = (this.delay)
      ? setTimeout(function() { 
        _this.next(_this.delay);
      }, this.delay)
      : 0;
  },
  
  stop: function() {
    this.delay = 0;
    clearTimeout(this.interval);
  },
  
  resume: function() {
    this.delay = this.options.auto || 0;
    this.begin();
  },

  handleEvent: function(e) {
    switch (e.type) {
      case 'touchstart': this.onTouchStart(e); break;
      case 'touchmove': this.onTouchMove(e); break;
      case 'touchend': this.onTouchEnd(e); break;
      case 'webkitTransitionEnd':
      case 'msTransitionEnd':
      case 'oTransitionEnd':
      case 'transitionend': this.transitionEnd(e); break;
      case 'resize': this.setup(); break;
    }
  },

  transitionEnd: function(e) {
    
    if (this.delay) this.begin();

    this.callback(e, this.index, this.slides[this.index]);

  },

  onTouchStart: function(e) {
    
    // prevent native scrolling 
    if (this.preventVertScroll)
      e.preventDefault();

    this.start = {

      // get touch coordinates for delta calculations in onTouchMove
      pageX: e.touches[0].pageX,
      pageY: e.touches[0].pageY,
      scroll: $("#body").scrollTop(),
      // set initial timestamp of touch sequence
      time: Number( new Date() )

    };

    // used for testing first onTouchMove event
    this.isScrolling = undefined;

    this.locked = false;
    this.horizontalMove = false
    // reset deltaX and Y
    this.deltaX = 0;
    this.deltaY = 0;

    // set transition time to 0 for 1-to-1 touch movement
    this.element.style.MozTransitionDuration = this.element.style.webkitTransitionDuration = 0;
    
    this.matrix = new WebKitCSSMatrix(window.getComputedStyle(this.element).webkitTransform);
    //e.stopPropagation();
  },

  onTouchMove: function(e) {
    // ensure swiping with one touch and not pinching
    if(e.touches.length > 1 || e.scale && e.scale !== 1) return;
    this.deltaX = e.touches[0].pageX - this.start.pageX;
    this.deltaY = e.touches[0].pageY - this.start.pageY;
    if(!this.scrollsVertically && Math.abs(this.deltaX) > Math.abs(this.deltaY) && !this.locked){
      this.horizontalMove = true;
      this.locked = true;
      if (typeof window.iscroll != 'undefined') {
        window.iscroll.vScroll = false;
      }
    } else if (!this.horizontalMove) {
      //$("#body").scrollTop(this.start.scroll - this.deltaY);
      this.locked = true;
    }
    //$("#body").css('overflowY', 'hidden'); 
    // determine if scrolling test has run - one time test
    if ( typeof this.isScrolling == 'undefined') {
      this.isScrolling = !!( this.isScrolling || Math.abs(this.deltaX) < Math.abs(this.deltaY) );
    }
    var tempindex = (!this.index && this.deltaX > 0 || this.index == this.hpages - 1 && this.deltaX < 0 ) 
      ? this.index
      : this.index - Math.floor(this.deltaX / this.cellhorizontalsize);
    tempindex = (tempindex < 1) ? 0 : tempindex;
    if (this.deltaX < 0 && this.index != this.hpages - 1) 
      tempindex -= 1
    tempindex = (tempindex > this.hpages - 1) ? this.hpages - 1 : tempindex;

    //increase resistance if first or last slide
    if (this.deltaX > 0)
      var extraX =  this.index * this.cellhorizontalsize;
    else
      var extraX = -((this.hpages - 1) - this.index) * this.cellhorizontalsize;

    this.deltaX = (!tempindex && this.deltaX > 0 || tempindex == this.hpages - 1 && this.deltaX < 0 ) 
  ? (extraX + (this.deltaX - extraX)/(this.cellhorizontalsize/20))///Math.abs(this.deltaX- extraX)/this.cellhorizontalsize + 1) //decrease deltaX proportionately
  : this.deltaX;              //otherwise leave it alone
   // this.deltaX = (this.deltaX < 0) ? extraX - this.deltaX : extraX + this.deltaX;

    this.deltaY = this.deltaY/
  ( (!this.vindex && this.deltaY > 0      //if on first row sliding down
    || this.index == this.vpages - 1 && this.deltaY < 0 ) //or on bottom row sliding up
  ? (Math.abs(this.deltaY)/this.cellverticalsize + 1)
  : 1);
      if (this.individual && this.isScrolling && this.scrollsVertically) {
    this.element.style.webkitTransform = this.matrix.translate(0,this.deltaY);
      } else if (this.isScrolling && this.scrollsVertically) {
    this.element.style.webkitTransform = this.matrix.translate(0,this.deltaY);  
      } else if (this.individual && this.horizontalMove) {
    this.element.style.webkitTransform = this.matrix.translate(this.deltaX, 0);
      } else if (this.horizontalMove){
    this.element.style.webkitTransform = this.matrix.translate(this.deltaX,0); 
      } 
      //e.stopPropagation();

  },

  onTouchEnd: function(e) {

    // determine if slide attempt triggers next/prev slide
    var isValidSlide; 
    // determine if slide attempt is past start and end
    var isPastBounds; 
    var indexchange = 0;
    this.locked = false;
    window.iscroll.vScroll = true;
    // if not scrolling vertically
      if (!this.isScrolling || !this.scrollsVertically) {
        isValidSlide = (Math.abs(this.deltaX) > 20) || (Math.abs(this.deltaX) > this.cellhorizontalsize/2);
        isPastBounds = (!this.index && this.deltaX > 0) || (this.index == this.hpages - 1 && this.deltaX < 0);
        if (isValidSlide && !isPastBounds){
          if (!this.individual) {
            indexchange = (this.deltaX < 0 ? 1: -1);
          }
          else if (this.horizontalMove){
            indexchange = (this.deltaX < 0) ? -Math.floor(this.deltaX/this.cellhorizontalsize) : -Math.ceil(this.deltaX/this.cellhorizontalsize)
            if ((this.index + indexchange) > this.hpages - 1)
              indexchange = this.hpages - 1 - this.index;
            else if (this.index + indexchange < 0)
              indexchange = -this.index;
          }
        }
        // call slide function with slide end value based on isValidSlide and isPastBounds tests
        this.slide( this.index + indexchange, this.speed );
      } else if (this.isScrolling && this.scrollsVertically) {
          isValidSlide = (Math.abs(this.deltaY) > 20) || (Math.abs(this.deltaY) > this.cellverticalsize/2);
          isPastBounds = (!this.vindex && this.deltaY > 0) || (this.vindex == this.vpages -1 && this.deltaY < 0);
          if (!this.individual) {
            indexchange = (this.deltaY < 0 ? 1: -1);
          } else {
            indexchange = -Math.floor(this.deltaX/this.cellverticalsize);
            if ((this.vindex + indexchange) > this.vpages - 1)
              indexchange = this.vpages - 1 - this.vindex;
            else if (this.vindex + indexchange < 0)
              indexchange = -this.vindex;
          }
            // call slide function with slide end value based on isValidSlide and isPastBounds tests
        this.vslide( this.vindex + (isValidSlide && !isPastBounds ? (this.deltaY < 0 ? 1 : -1) : 0 ), this.speed );
      }
        
    //e.stopPropagation();
  },



  //NOVA STUFF
  columnHidden: function() {
    this.hpages -= 1
  },
  columnShown: function() {
    this.hpages ++
  },
  getPages: function() {
    return this.hpages
  },
  setPages: function(pages) {
    if (pages > 1){
      this.hpages = pages;
    } else {
      this.hpages = 1;
    }
  },
  columnReset: function() {
    if(this.individual) {
        this.hpages = this.columns - 1;
    }
    else {
        this.hpages = Math.ceil(this.columns/(this.width/cellwidth)); 
    }
  },
  calcPages: function() {
    this.hpages = this.columns - 2;
    var slides = this.element.children;
    var that = this;
    console.log($(this.element).parent().parent().find('li'))
    var locked = $(this.element).parent().parent().find('.locked').each(function() {
      console.log('li found')
      that.hpages += 1;
    });
    var index = slides.length;
    while (index--) {
      if ($(slides[index]).css('display') == 'none') {
        this.hpages -= 1;
      }
    }
    
    if (this.hpages < 1)
      this.hpages = 1;
  }
};

