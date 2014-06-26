/**
 * af.actionsheet - an actionsheet for html5 mobile apps
 * Copyright 2012 - Intel
 */
/* EXAMPLE
  You can pass in an HTML string that will get rendered

  $(document.body).actionsheet('<a >Back</a><a onclick="alert(\'hi\');" >Show Alert 3</a><a onclick="alert(\'goodbye\');">Show Alert 4</a>');

  You can also use an arra of objects to show each item.  There are three propertyes
    text - the text to display
    cssClasses - extra css classes
    handler - click handler function

  $(document.body).actionsheet(
    [{
        text: 'back',
        cssClasses: 'red',
        handler: function () {
            $.ui.goBack();
        }
    }, {
        text: 'show alert 5',
        cssClasses: 'blue',
        handler: function () {
            alert("hi");
        }
    }, {
        text: 'show alert 6',
        cssClasses: '',
        handler: function () {
            alert("goodbye");
        }
    }]
  );

 */
 /* global af*/
(function($) {
    "use strict";
    $.fn.actionsheet = function(opts) {
        var tmp;
        for (var i = 0; i < this.length; i++) {
            tmp = new actionsheet(this[i], opts);
        }
        return this.length === 1 ? tmp : this;
    };
    var actionsheet = (function() {
        var actionsheet = function(elID, opts) {
            if (typeof elID === "string" || elID instanceof String) {
                this.el = document.getElementById(elID);
            } else {
                this.el = elID;
            }
            if (!this.el) {
                window.alert("Could not find element for actionsheet " + elID);
                return;
            }

            if (this instanceof actionsheet) {
                if (typeof(opts) === "object") {
                    for (var j in opts) {
                        this[j] = opts[j];
                    }
                }
            } else {
                return new actionsheet(elID, opts);
            }

            //  try {
            var that = this;
            var markStart = "<div id='af_actionsheet'><div style='width:100%'>";
            var markEnd = "</div></div>";
            var markup;
            var noop=function(){};
            if (typeof opts === "string") {
                markup = $(markStart + opts + "<a href='javascript:;' class='cancel'>Cancel</a>" + markEnd);
            } else if (typeof opts === "object") {
                markup = $(markStart + markEnd);
                var container = $(markup.children().get(0));
                opts.push({
                    text: "Cancel",
                    cssClasses: "cancel"
                });
                for (var i = 0; i < opts.length; i++) {
                    var item = $("<a href='javascript:;'>" + (opts[i].text || "TEXT NOT ENTERED") + "</a>");
                    item[0].onclick = (opts[i].handler || noop);
                    if (opts[i].cssClasses && opts[i].cssClasses.length > 0)
                        item.addClass(opts[i].cssClasses);
                    container.append(item);
                }
            }
            $(elID).find("#af_actionsheet").remove();
            $(elID).find("#af_action_mask").remove();
            $(elID).append(markup);

            markup.vendorCss("Transition", "all 0ms");
            markup.cssTranslate("0,0");
            markup.css("top", window.innerHeight + "px");
            this.el.style.overflow = "hidden";
            markup.on("click", "a", function() {
                that.hideSheet();
                return false;
            });
            this.activeSheet = markup;
            $(elID).append("<div id='af_action_mask' style='position:absolute;top:0px;left:0px;right:0px;bottom:0px;z-index:9998;background:rgba(0,0,0,.4)'/>");
            setTimeout(function() {
                markup.vendorCss("Transition", "all 300ms");
                markup.cssTranslate("0," + (-(markup.height())) + "px");
            }, 10);
            $("#af_action_mask").bind("touchstart touchmove touchend click",function(e){
                e.preventDefault();
                e.stopPropagation();
            });

        };
        actionsheet.prototype = {
            activeSheet: null,
            hideSheet: function() {
                var that = this;
                this.activeSheet.off("click", "a", function() {
                    that.hideSheet();
                });
                $(this.el).find("#af_action_mask").unbind("click").remove();
                this.activeSheet.vendorCss("Transition", "all 0ms");
                var markup = this.activeSheet;
                var theEl = this.el;
                setTimeout(function() {
                    markup.vendorCss("Transition", "all 300ms");
                    markup.cssTranslate("0,0px");
                    setTimeout(function() {
                        markup.remove();
                        markup = null;
                        theEl.style.overflow = "none";
                    }, 500);
                }, 10);
            }
        };
        return actionsheet;
    })();
})(af);
/**
 * af.css3animate - a css3 animation library that supports chaning/callbacks
 * Copyright 2013 - Intel
 */
 /*  EXAMPLE

  $("#animate").css3Animate({
        width: "100px",
        height: "100px",
        x: "20%",
        y: "30%",
        time: "1000ms",
        opacity: .5,
        callback: function () {
            //execute when finished
        }
    });

    //Chain animations
    $("#animate").css3Animate({
        x: 20,
        y: 30,
        time: "300ms",
        callback: function () {
            $("#animate").css3Animate({
                x: 20,
                y: 30,
                time: "500ms",
                previous: true,
                callback: function () {
                    reset();
                }
            });
        }
    });
 */

 /* global af*/
 /* global numOnly*/
(function($) {
    "use strict";
    var cache = [];
    var objId = function(obj) {
        if (!obj.afCSS3AnimateId) obj.afCSS3AnimateId = $.uuid();
        return obj.afCSS3AnimateId;
    };
    var getEl = function(elID) {
        if (typeof elID === "string" || elID instanceof String) {
            return document.getElementById(elID);
        } else if ($.is$(elID)) {
            return elID[0];
        } else {
            return elID;
        }
    };
    var getCSS3Animate = function(obj, options) {
        var tmp, id, el = getEl(obj);
        //first one
        id = objId(el);
        if (cache[id]) {
            cache[id].animate(options);
            tmp = cache[id];
        } else {
            tmp = css3Animate(el, options);
            cache[id] = tmp;
        }
        return tmp;
    };
    $.fn.css3Animate = function(opts) {
        //keep old callback system - backwards compatibility - should be deprecated in future versions
        if (!opts.complete && opts.callback) opts.complete = opts.callback;
        //first on
        var tmp = getCSS3Animate(this[0], opts);
        opts.complete = null;
        opts.sucess = null;
        opts.failure = null;
        for (var i = 1; i < this.length; i++) {
            tmp.link(this[i], opts);
        }
        return tmp;
    };


    $.css3AnimateQueue = function() {
        return new css3Animate.queue();
    };
    var translateOpen = $.feat.cssTransformStart;
    var translateClose = $.feat.cssTransformEnd;
    var transitionEnd = $.feat.cssPrefix.replace(/-/g, "") + "TransitionEnd";
    transitionEnd = ($.os.fennec || $.feat.cssPrefix === "" || $.os.ie) ? "transitionend" : transitionEnd;

    transitionEnd = transitionEnd.replace(transitionEnd.charAt(0), transitionEnd.charAt(0).toLowerCase());

    var css3Animate = (function() {

        var css3Animate = function(elID, options) {
            if (!(this instanceof css3Animate)) return new css3Animate(elID, options);

            //start doing stuff
            this.callbacksStack = [];
            this.activeEvent = null;
            this.countStack = 0;
            this.isActive = false;
            this.el = elID;
            this.linkFinishedProxy = $.proxy(this.linkFinished, this);

            if (!this.el) return;

            this.animate(options);

            var that = this;
            af(this.el).bind("destroy", function() {
                var id = that.el.afCSS3AnimateId;
                that.callbacksStack = [];
                if (cache[id]) delete cache[id];
            });
        };
        css3Animate.prototype = {
            animate: function(options) {

                //cancel current active animation on this object
                if (this.isActive) this.cancel();
                this.isActive = true;

                if (!options) {
                    window.alert("Please provide configuration options for animation of " + this.el.id);
                    return;
                }

                var classMode = !! options.addClass;
                var scale, time;
                var timeNum = numOnly(options.time);
                if (classMode) {
                    //class defines properties being changed
                    if (options.removeClass) {
                        af(this.el).replaceClass(options.removeClass, options.addClass);
                    } else {
                        af(this.el).addClass(options.addClass);
                    }

                } else {
                    //property by property

                    if (timeNum === 0) options.time = 0;

                    if (!options.y) options.y = 0;
                    if (!options.x) options.x = 0;
                    if (options.previous) {
                        var cssMatrix = new $.getCssMatrix(this.el);
                        options.y += numOnly(cssMatrix.f);
                        options.x += numOnly(cssMatrix.e);
                    }
                    if (!options.origin) options.origin = "0% 0%";

                    if (!options.scale) options.scale = "1";

                    if (!options.rotateY) options.rotateY = "0";
                    if (!options.rotateX) options.rotateX = "0";
                    if (!options.skewY) options.skewY = "0";
                    if (!options.skewX) options.skewX = "0";


                    if (!options.timingFunction) options.timingFunction = "linear";

                    //check for percent or numbers
                    if (typeof(options.x) === "number" || (options.x.indexOf("%") === -1 && options.x.toLowerCase().indexOf("px") === -1 && options.x.toLowerCase().indexOf("deg") === -1)) options.x = parseInt(options.x, 10) + "px";
                    if (typeof(options.y) === "number" || (options.y.indexOf("%") === -1 && options.y.toLowerCase().indexOf("px") === -1 && options.y.toLowerCase().indexOf("deg") === -1)) options.y = parseInt(options.y, 10) + "px";

                    var trans = "translate" + translateOpen + (options.x) + "," + (options.y) + translateClose + " scale(" + parseFloat(options.scale) + ") rotate(" + options.rotateX + ")";
                    if (!$.os.opera)
                        trans += " rotateY(" + options.rotateY + ")";
                    trans += " skew(" + options.skewX + "," + options.skewY + ")";
                    this.el.style[$.feat.cssPrefix + "Transform"] = trans;
                    this.el.style[$.feat.cssPrefix + "BackfaceVisibility"] = "hidden";
                    var properties = $.feat.cssPrefix + "Transform";
                    if (options.opacity !== undefined) {
                        this.el.style.opacity = options.opacity;
                        properties += ", opacity";
                    }
                    if (options.width) {
                        this.el.style.width = options.width;
                        properties = "all";
                    }
                    if (options.height) {
                        this.el.style.height = options.height;
                        properties = "all";
                    }
                    this.el.style[$.feat.cssPrefix + "TransitionProperty"] = "all";

                    if (("" + options.time).indexOf("s") === -1) {
                        scale = "ms";
                        time = options.time + scale;
                    } else if (options.time.indexOf("ms") !== -1) {
                        scale = "ms";
                        time = options.time;
                    } else {
                        scale = "s";
                        time = options.time + scale;
                    }
                    if (options.delay) {
                        this.el.style[$.feat.cssPrefix + "TransitionDelay"] = options.delay;
                    }

                    this.el.style[$.feat.cssPrefix + "TransitionDuration"] = time;
                    this.el.style[$.feat.cssPrefix + "TransitionTimingFunction"] = options.timingFunction;
                    this.el.style[$.feat.cssPrefix + "TransformOrigin"] = options.origin;

                }

                //add callback to the stack

                this.callbacksStack.push({
                    complete: options.complete,
                    success: options.success,
                    failure: options.failure
                });
                this.countStack++;

                var that = this,
                    duration;
                var style = window.getComputedStyle(this.el);
                if (classMode) {
                    //get the duration
                    duration = style[$.feat.cssPrefix + "TransitionDuration"];
                    timeNum = numOnly(duration);
                    options.time = timeNum;
                    if (duration.indexOf("ms") !== -1) {
                        scale = "ms";
                    } else {
                        scale = "s";
                        options.time *= 1000;
                    }
                }

                //finish asap
                if (timeNum === 0 || (scale === "ms" && timeNum < 5) || style.display === "none") {
                    //the duration is nearly 0 or the element is not displayed, finish immediatly
                    $.asap($.proxy(this.finishAnimation, this, [false]));
                    //this.finishAnimation();
                    //set transitionend event
                } else {
                    //setup the event normally

                    this.activeEvent = function(event) {
                        clearTimeout(that.timeout);
                        that.finishAnimation(event);
                        that.el.removeEventListener(transitionEnd, that.activeEvent, false);
                    };
                    that.timeout = setTimeout(this.activeEvent, numOnly(options.time) + 50);
                    this.el.addEventListener(transitionEnd, this.activeEvent, false);

                }

            },
            addCallbackHook: function(callback) {
                if (callback) this.callbacksStack.push(callback);
                this.countStack++;
                return this.linkFinishedProxy;
            },
            linkFinished: function(canceled) {
                if (canceled) this.cancel();
                else this.finishAnimation();
            },
            finishAnimation: function(event) {
                if (event && event.preventDefault) event.preventDefault();
                if (!this.isActive) return;

                this.countStack--;

                if (this.countStack === 0) this.fireCallbacks(false);
            },
            fireCallbacks: function(canceled) {
                this.clearEvents();

                //keep callbacks after cleanup
                // (if any of the callbacks overrides this object, callbacks will keep on fire as expected)
                var callbacks = this.callbacksStack;

                //cleanup
                this.cleanup();

                //fire all callbacks
                for (var i = 0; i < callbacks.length; i++) {
                    var complete = callbacks[i].complete;
                    var success = callbacks[i].success;
                    var failure = callbacks[i].failure;
                    //fire callbacks
                    if (typeof(complete) === "function") complete(canceled);
                    //success/failure
                    if (canceled && typeof(failure) === "function") failure();
                    else if (typeof(success) === "function") success();
                }
            },
            cancel: function() {
                if (!this.isActive) return;
                this.fireCallbacks(true); //fire failure callbacks
            },
            cleanup: function() {
                this.callbacksStack = [];
                this.isActive = false;
                this.countStack = 0;
            },
            clearEvents: function() {
                if (this.activeEvent) {
                    this.el.removeEventListener(transitionEnd, this.activeEvent, false);
                }
                this.activeEvent = null;
            },
            link: function(elID, opts) {
                var callbacks = {
                    complete: opts.complete,
                    success: opts.success,
                    failure: opts.failure
                };
                opts.complete = this.addCallbackHook(callbacks);
                opts.success = null;
                opts.failure = null;
                //run the animation with the replaced callbacks
                getCSS3Animate(elID, opts);
                //set the old callback back in the obj to avoid strange stuff
                opts.complete = callbacks.complete;
                opts.success = callbacks.success;
                opts.failure = callbacks.failure;
                return this;
            }
        };

        return css3Animate;
    })();

    css3Animate.queue = function() {
        return {
            elements: [],
            push: function(el) {
                this.elements.push(el);
            },
            pop: function() {
                return this.elements.pop();
            },
            run: function() {
                var that = this;
                if (this.elements.length === 0) return;
                if (typeof(this.elements[0]) === "function") {
                    var func = this.shift();
                    func();
                }
                if (this.elements.length === 0) return;
                var params = this.shift();
                if (this.elements.length > 0) {
                    params.complete = function(canceled) {
                        if (!canceled) that.run();
                    };
                }
                css3Animate(document.getElementById(params.id), params);
            },
            shift: function() {
                return this.elements.shift();
            }
        };
    };
})(af);


/**
  * @license MIT - https://github.com/darius/requestAnimationFrame/commit/4f27a5a21902a883330da4663bea953b2f96cb15#diff-9879d6db96fd29134fc802214163b95a

    http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
    requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
    MIT license

    Adapted from https://gist.github.com/paulirish/1579671 which derived from 
    http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

    requestAnimationFrame polyfill by Erik Möller.
    Fixes from Paul Irish, Tino Zijdel, Andrew Mao, Klemen Slavič, Darius Bacon
*/



if (!Date.now)
    Date.now = function() {
        "use strict";
        return new Date().getTime();
    };

(function() {
    "use strict";
    var vendors = ["webkit", "moz","ms"];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
        var vp = vendors[i];
        window.requestAnimationFrame = window[vp+"RequestAnimationFrame"];
        window.cancelAnimationFrame = (window[vp+"CancelAnimationFrame"] || window[vp+"CancelRequestAnimationFrame"]);
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
        var lastTime = 0;
        window.requestAnimationFrame = function(callback) {
            var now = Date.now();
            var nextTime = Math.max(lastTime + 16, now);
            return setTimeout(function() { callback(lastTime = nextTime); },
                              nextTime - now);
        };
        window.cancelAnimationFrame = clearTimeout;
    }
}());


/**
 * af.animate  - an experimental animation library that uses matrices and requestAnimationFrame
 * Only supports x/y now and is used by the scroller library
 * Copyright 2013 - Intel
 */

(function($) {
    "use strict";
    var cache = [];
    var objId = function(obj) {
        if (!obj.afAnimateId) obj.afAnimateId = $.uuid();
        return obj.afAnimateId;
    };
    var getEl = function(elID) {
        if (typeof elID === "string" || elID instanceof String) {
            return document.getElementById(elID);
        } else if ($.is$(elID)) {
            return elID[0];
        } else {
            return elID;
        }
    };
    var getAnimate = function(obj, options) {
        var tmp, id, el = getEl(obj);
        //first one
        id = objId(el);
        if (cache[id]) {
            if(options)
                cache[id].animate(options);
            tmp = cache[id];
        } else {
            tmp = Animate(el, options);
            cache[id] = tmp;
        }
        return tmp;
    };
    $.fn.animate = function(opts) {
        var tmp = getAnimate(this[0], opts);
        return tmp;
    };



    var Animate = function(elID, options) {
        if (!(this instanceof Animate)) return new Animate(elID, options);

        this.el=elID;
        //start doing stuff
        if (!this.el) return;

        if(options)
            this.animate(options);

        var that = this;
        af(this.el).bind("destroy", function() {
            var id = that.el.afAnimateId;
            if (cache[id]) delete cache[id];
        });
    };
    Animate.prototype = {
        animationTimer:null,
        isAnimating:false,
        startX:0,
        startY:0,
        runTime:0,
        endX:0,
        endY:0,
        currX:0,
        currY:0,
        animationStartTime:0,
        pauseTime:0,
        completeCB:null,
        easingFn:"linear",
        animateOpts:{},
        updateCb:null,
        animate: function(options) {
            var that=this;
            if(that.isAnimating) return;
            that.isAnimating=true;
            window.cancelAnimationFrame(that.animationTimer);
            if (!options) {
                options={
                    x:0,
                    y:0,
                    duration:0
                };
            }
            this.easingFn=options.easing||"linear";

            this.completeCB=options.complete||null;
            this.updateCB=options.update||null;
            this.runTime=numOnly(options.duration);
            options.complete&&(delete options.complete);
            this.animateOpts=options;
            this.startTime=Date.now();
            this.startMatrix=$.getCssMatrix(this.el);

            if(this.runTime===0)
                this.doAnimate();
        },
        start:function(){
            this.doAnimate();
        },
        doAnimate:function(){
            var now = Date.now(), nextX, nextY,easeStep,that=this;

            if (this.runTime===0||(now >= this.startTime + this.runTime)) {
                that.setPosition(this.animateOpts.x,this.animateOpts.y);
                that.isAnimating = false;
                if(this.updateCB)
                    this.updateCB({x:this.animateOpts.x,y:this.animateOpts.y});
                if(this.completeCB)
                    this.completeCB();
                return;
            }

            now = (now - this.startTime) / this.runTime;
            now=now>1?1:now;
            easeStep = tweens[this.easingFn](now);
            nextX = (this.animateOpts.x - this.startMatrix.e) * easeStep + this.startMatrix.e;
            nextY = (this.animateOpts.y - this.startMatrix.f) * easeStep + this.startMatrix.f;
            this.setPosition(nextX,nextY);
            if(this.updateCB)
                this.updateCB({x:nextX,y:nextY});

            if (this.isAnimating)
                this.animationTimer = window.requestAnimationFrame(function(){that.doAnimate();});
        },
        setPosition:function(x,y){
            this.el.style[$.feat.cssPrefix+"Transform"]="matrix3d( 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, "+x+", "+y+", 0, 1 )";
            this.currX=x;
            this.currY=y;
        },
        stop:function(){
            this.isAnimating=false;
            window.cancelAnimationFrame(this.animationTimer);
            this.pauseTime=Date.now()-this.startTime;
        },
        resume:function(){
            this.isAnimating=true;
            this.startTime=Date.now()-this.pauseTime;
            this.doAnimate();
        }
    };


    var tweens = {
        linear:function (k) {
            return k;
        },
        easeOutSine:function (k) {
            return Math.sin(k * Math.PI / 2 );
        }
    };
})(af);
/**
 * af.passwordBox - password box replacement for html5 mobile apps on android due to a bug with CSS3 translate3d
 * @copyright 2011 - Intel
 */
 /* global af*/
(function ($) {
    "use strict";
    $.passwordBox = function () {
        return new passwordBox();
    };

    var passwordBox = function () {
            this.oldPasswords = {};
        };
    passwordBox.prototype = {
        showPasswordPlainText: false,
        getOldPasswords: function (elID) {
         //   if ($.os.android == false) return; -  iOS users seem to want this too, so we'll let everyone join the party
            var container = elID && document.getElementById(elID) ? document.getElementById(elID) : document;
            if (!container) {
                window.alert("Could not find container element for passwordBox " + elID);
                return;
            }
            var sels = container.getElementsByTagName("input");
            for (var i = 0; i < sels.length; i++) {
                if (sels[i].type !== "password") continue;

                if($.os.webkit){
                    sels[i].type = "text";
                    $(sels[i]).vendorCss("TextSecurity","disc");
                }
            }
        },

        changePasswordVisiblity: function (what, id) {
            what = parseInt(what,10);
            var theEl = document.getElementById(id);

            if (what === 1) { //show
                $(theEl).vendorCss("TextSecurity","none");
            } else {
                $(theEl).vendorCss("TextSecurity","disc");
            }
            if(!$.os.webkit) {
                if(what === 1)
                    theEl.type="text";
                else
                    theEl.type="password";
            }
            theEl = null;
        }
    };
})(af);
/**
 * af.scroller 
 * created by Intel with modifications by Carlos Ouro @ Badoo and Intel
 * Supports iOS native touch scrolling
 * Optimizations and bug improvements by Intel
 * @copyright Intel
 */
 /* global numOnly*/
(function ($) {
    "use strict";
    var HIDE_REFRESH_TIME = 325; // hide animation of pull2ref duration in ms
    var cache = [];
    var objId = function (obj) {
        if (!obj.afScrollerId) obj.afScrollerId = $.uuid();
        return obj.afScrollerId;
    };
    $.fn.scroller = function (opts) {
        var tmp, id;
        for (var i = 0; i < this.length; i++) {
            //cache system
            id = objId(this[i]);
            if (!cache[id]) {
                if (!opts) opts = {};
                if (!$.feat.nativeTouchScroll) opts.useJsScroll = true;

                tmp = scroller(this[i], opts);
                cache[id] = tmp;
            } else {
                tmp = cache[id];
            }
        }
        return this.length === 1 ? tmp : this;
    };
    var boundTouchLayer = false;

    function checkConsistency(id) {
        if (!cache[id].el) {
            delete cache[id];
            return false;
        }
        return true;
    }

    function bindTouchLayer() {
        //use a single bind for all scrollers
        if ($.os.android && !$.os.chrome && $.os.webkit) {
            var androidFixOn = false;
            //connect to touchLayer to detect editMode
            $.bind($.touchLayer, ["cancel-enter-edit", "exit-edit"], function () {
                if (androidFixOn) {
                    androidFixOn = false;
                    //dehactivate on scroller
                    for (var el in cache)
                        if (checkConsistency(el) && cache[el].androidFormsMode) cache[el].stopFormsMode();
                }
            });
        }
        boundTouchLayer = true;
    }
    var scroller = (function () {
        var jsScroller, nativeScroller;

        //initialize and js/native mode selector
        var scroller = function (elID, opts) {

            var el;

            if (!boundTouchLayer && $.touchLayer && $.isObject($.touchLayer)) bindTouchLayer();
            else if (!$.touchLayer || !$.isObject($.touchLayer)) $.touchLayer = {};
            if (typeof elID === "string" || elID instanceof String) {
                el = document.getElementById(elID);
            } else {
                el = elID;
            }
            if (!el) {
                window.alert("Could not find element for scroller " + elID);
                return;
            }
            var checkClassEl=$(el);
            if(opts.hasParent)
                checkClassEl=checkClassEl.parent();
            if(checkClassEl.hasClass("x-scroll"))
                opts.horizontalScroll=true;
            if(checkClassEl.hasClass("y-scroll"))
                opts.verticalScroll=true;
            if ($.os.desktop)
                return new scrollerCore(el, opts);
            else if (opts.useJsScroll) return new jsScroller(el, opts);
            return new nativeScroller(el, opts);

        };

        //parent abstract class (common functionality)
        var scrollerCore = function (el, opts) {
            this.el = el;
            this.afEl = $(this.el);
            for (var j in opts) {
                this[j] = opts[j];
            }
        };
        scrollerCore.prototype = {
            //core default properties
            refresh: false,
            refreshContent: "Pull to Refresh",
            refreshHangTimeout: 2000,
            refreshHeight: 60,
            refreshElement: null,
            refreshCancelCB: null,
            refreshRunning: false,
            scrollTop: 0,
            scrollLeft: 0,
            preventHideRefresh: true,
            verticalScroll: true,
            horizontalScroll: false,
            refreshTriggered: false,
            moved: false,
            eventsActive: false,
            rememberEventsActive: false,
            scrollingLocked: false,
            autoEnable: true,
            blockFormsFix: false,
            loggedPcentY: 0,
            loggedPcentX: 0,
            infinite: false,
            infiniteEndCheck: false,
            infiniteTriggered: false,
            scrollSkip: false,
            scrollTopInterval: null,
            scrollLeftInterval: null,
            bubbles:true,
            lockBounce:false,
            initScrollProgress:false,
            _scrollTo: function (params, time) {
                time = parseInt(time, 10);
                if (time === 0 || isNaN(time)) {
                    this.el.scrollTop = Math.abs(params.y);
                    this.el.scrollLeft = Math.abs(params.x);
                    return;
                }

                var singleTick = 10;
                var distPerTick = (this.el.scrollTop - params.y) / Math.ceil(time / singleTick);
                var distLPerTick = (this.el.scrollLeft - params.x) / Math.ceil(time / singleTick);
                var self = this;
                var toRunY = Math.ceil(this.el.scrollTop - params.y) / distPerTick;
                var toRunX = Math.ceil(this.el.scrollLeft - params.x) / distPerTick;
                var xRun =0, yRun = 0;
                self.scrollTopInterval = window.setInterval(function () {
                    self.el.scrollTop -= distPerTick;
                    yRun++;
                    if (yRun >= toRunY) {
                        self.el.scrollTop = params.y;
                        clearInterval(self.scrollTopInterval);
                    }
                }, singleTick);

                self.scrollLeftInterval = window.setInterval(function () {
                    self.el.scrollLeft -= distLPerTick;
                    xRun++;
                    if (xRun >= toRunX) {
                        self.el.scrollLeft = params.x;
                        clearInterval(self.scrollLeftInterval);
                    }
                }, singleTick);
            },
            enable: function () {},
            disable: function () {},
            hideScrollbars: function () {},
            addPullToRefresh: function () {},
            /**
             * We do step animations for "native" - iOS is acceptable and desktop browsers are fine
             * instead of css3
             */
            _scrollToTop: function (time) {
                this._scrollTo({
                    x: 0,
                    y: 0
                }, time);
            },
            _scrollToBottom: function (time) {
                this._scrollTo({
                    x: 0,
                    y: this.el.scrollHeight - this.el.offsetHeight
                }, time);
            },
            scrollToBottom: function (time) {
                return this._scrollToBottom(time);
            },
            scrollToTop: function (time) {
                return this._scrollToTop(time);
            },

            //methods
            init: function (el, opts) {
                this.el = el;
                this.afEl = $(this.el);
                this.defaultProperties();
                for (var j in opts) {
                    this[j] = opts[j];
                }
                //assign self destruct
                var that = this;
                var orientationChangeProxy = function (e) {
                    //no need to readjust if disabled...
                    if (that.eventsActive && !$.feat.nativeTouchScroll&&(!$.ui || ($.ui.activeDiv === that.container)) ) {
                        that.adjustScroll();
                    }
                };
                this.afEl.bind("destroy", function () {
                    that.disable(true); //with destroy notice
                    var id = that.el.afScrollerId;
                    if (cache[id]) delete cache[id];
                    $.unbind($.touchLayer, "orientationchange-reshape", orientationChangeProxy);
                });
                $.bind($.touchLayer, "orientationchange-reshape", orientationChangeProxy);
                $(window).bind("resize", orientationChangeProxy);
            },
            needsFormsFix: function (focusEl) {
                return this.useJsScroll && this.isEnabled() && this.el.style.display !== "none" && $(focusEl).closest(this.afEl).size() > 0;
            },
            handleEvent: function (e) {
                if (!this.scrollingLocked) {
                    switch (e.type) {
                    case "touchstart":
                        clearInterval(this.scrollTopInterval);
                        this.preventHideRefresh = !this.refreshRunning; // if it's not running why prevent it xD
                        this.moved = false;
                        this.onTouchStart(e);
                        if(!this.bubbles)
                            e.stopPropagation();
                        break;
                    case "touchmove":

                        this.onTouchMove(e);
                        if(!this.bubbles)
                            e.stopPropagation();
                        break;
                    case "touchend":
                        this.onTouchEnd(e);
                        if(!this.bubbles)
                            e.stopPropagation();
                        break;
                    case "scroll":
                        this.onScroll(e);
                        break;
                    }
                }
            },
            coreAddPullToRefresh: function (rEl) {
                if (rEl) this.refreshElement = rEl;
                //Add the pull to refresh text.  Not optimal but keeps from others overwriting the content and worrying about italics
                //add the refresh div
                var afEl;
                if (this.refreshElement === null) {
                    var orginalEl = document.getElementById(this.container.id + "_pulldown");
                    if (orginalEl !== null) {
                        afEl = $(orginalEl);
                    } else {
                        afEl = $("<div id='" + this.container.id + "_pulldown' class='afscroll_refresh' style='position:relative;height:60px;text-align:center;line-height:60px;font-weight:bold;'>" + this.refreshContent + "</div>");
                    }
                } else {
                    afEl = $(this.refreshElement);
                }
                var el = afEl.get(0);

                this.refreshContainer = $("<div style='overflow:hidden;height:0;width:100%;display:none;background:inherit;-webkit-backface-visibility: hidden !important;'></div>");
                $(this.el).prepend(this.refreshContainer.prepend(el));
                this.refreshContainer = this.refreshContainer[0];
            },
            fireRefreshRelease: function (triggered) {
                if (!this.refresh || !triggered) return;
                this.setRefreshContent("Refreshing...");
                var autoCancel = $.trigger(this, "refresh-release", [triggered]) !== false;
                this.preventHideRefresh = false;
                this.refreshRunning = true;
                if (autoCancel) {
                    var that = this;
                    if (this.refreshHangTimeout > 0) this.refreshCancelCB = setTimeout(function () {
                            that.hideRefresh();
                        }, this.refreshHangTimeout);
                }
            },
            setRefreshContent: function (content) {
                $(this.container).find(".afscroll_refresh").html(content);
            },
            lock: function () {
                if (this.scrollingLocked) return;
                this.scrollingLocked = true;
                this.rememberEventsActive = this.eventsActive;
                if (this.eventsActive) {
                    this.disable();
                }
            },
            unlock: function () {
                if (!this.scrollingLocked) return;
                this.scrollingLocked = false;
                if (this.rememberEventsActive) {
                    this.enable();
                }
            },
            scrollToItem: function (el, where) { //TODO: add functionality for x position
                if (!$.is$(el)) el = $(el);
                var newTop,itemPos,panelTop,itemTop;
                if (where === "bottom") {
                    itemPos = el.offset();
                    newTop = itemPos.top - this.afEl.offset().bottom + itemPos.height;
                    newTop += 4; //add a small space
                } else {
                    itemTop = el.offset().top;
                    newTop = itemTop - document.body.scrollTop;
                    panelTop = this.afEl.offset().top;
                    if (document.body.scrollTop < panelTop) {
                        newTop -= panelTop;
                    }
                    newTop -= 4; //add a small space
                }

                this.scrollBy({
                    y: newTop,
                    x: 0
                }, 0);
            },
            setPaddings: function (top, bottom) {
                var el = $(this.el);
                var curTop = numOnly(el.css("paddingTop"));
                el.css("paddingTop", top + "px").css("paddingBottom", bottom + "px");
                //don't let padding mess with scroll
                this.scrollBy({
                    y: top - curTop,
                    x: 0
                });
            },
            //freak of mathematics, but for our cases it works
            divide: function (a, b) {
                return b !== 0 ? a / b : 0;
            },
            isEnabled: function () {
                return this.eventsActive;
            },
            addInfinite: function () {
                this.infinite = true;
            },
            clearInfinite: function () {
                this.infiniteTriggered = false;
                this.scrollSkip = true;
            },
            scrollTo:function (pos, time) {
                return this._scrollTo(pos, time);
            },
            updateP2rHackPosition:function(){}
        };

        //extend to jsScroller and nativeScroller (constructs)
        jsScroller = function (el, opts) {
            this.init(el, opts);

            if(opts.hasParent)
                this.container = this.el.parentNode;
            else {
                //copy/etc
                var $div=$.create("div",{});
                $div.append($(this.el).contents());
                $(this.el).append($div);
                this.container=this.el;
                this.el=$div.get(0);
            }
            this.container.afScrollerId = el.afScrollerId;
            this.afEl = $(this.container);

            if (this.container.style.overflow !== "hidden") this.container.style.overflow = "hidden";

            this.addPullToRefresh(null, true);
            if(opts.autoEnable)
                this.autoEnable=opts.autoEnable;
            if (this.autoEnable) this.enable(true);
            var scrollDiv;
            //create vertical scroll
            if (this.verticalScroll && this.verticalScroll === true && this.scrollBars === true) {
                scrollDiv = createScrollBar(5, 20);
                scrollDiv.style.top = "0px";
                if (this.vScrollCSS) scrollDiv.className = this.vScrollCSS;
                //scrollDiv.style.opacity = "0";
                scrollDiv.style.display="none";
                this.container.appendChild(scrollDiv);
                this.vscrollBar = scrollDiv;
                scrollDiv = null;
            }
            //create horizontal scroll
            if (this.horizontalScroll && this.horizontalScroll === true && this.scrollBars === true) {
                scrollDiv = createScrollBar(20, 5);
                scrollDiv.style.bottom = "0px";

                if (this.hScrollCSS) scrollDiv.className = this.hScrollCSS;
                //scrollDiv.style.opacity = "0";
                scrollDiv.style.display="none";
                this.container.appendChild(scrollDiv);
                this.hscrollBar = scrollDiv;
                scrollDiv = null;
            }
            if (this.horizontalScroll) this.el.style.cssFloat = "left";

            this.el.hasScroller = true;
        };
        nativeScroller = function (el, opts) {
            if(opts.nativeParent){
                el=el.parentNode;
            }
            this.init(el, opts);
            var $el = $(el);

            if (opts.replaceParent === true) {
                var oldParent = $el.parent();

                $el.css("height", oldParent.height()).css("width", oldParent.width());
                $el.insertBefore($el.parent());
                //$el.parent().parent().append($el);
                oldParent.remove();
            }
            this.container = this.el;
            $el.css("-webkit-overflow-scrolling", "touch");

            if(opts.autoEnable)
                this.autoEnable=opts.autoEnable;
            if(this.autoEnable)
                this.enable();
        };
        nativeScroller.prototype = new scrollerCore();
        jsScroller.prototype = new scrollerCore();

        ///Native scroller
        nativeScroller.prototype.defaultProperties = function () {

            this.refreshContainer = null;
            this.dY = this.cY = 0;
            this.dX = this.cX = 0;
            this.cancelPropagation = false;
            this.loggedPcentY = 0;
            this.loggedPcentX = 0;
            this.xReset=0;
            this.yReset=0;
            var that = this;
            this.adjustScrollOverflowProxy = function () {
                that.afEl.css("overflow", "auto");
                that.afEl.parent().css("overflow","hidden");
            };
        };
        nativeScroller.prototype.enable = function (firstExecution) {
            if (this.eventsActive) return;
            this.eventsActive = true;
            //unlock overflow
            this.el.style.overflow = "auto";
            //this.el.parentNode.style.overflow="hidden";
            //set current scroll

            if (!firstExecution) this.adjustScroll();
            //set events

            this.el.addEventListener("touchstart", this, false);
            this.el.addEventListener("scroll", this, false);
            this.updateP2rHackPosition();
        };
        nativeScroller.prototype.disable = function (destroy) {
            if (!this.eventsActive) return;
            //log current scroll
            this.logPos(this.el.scrollLeft, this.el.scrollTop);
            //lock overflow
            if (!destroy&&!$.ui) {
                this.el.style.overflow = "hidden";
            }
            //remove events
            this.el.removeEventListener("touchstart", this, false);
            this.el.removeEventListener("touchmove", this, false);
            this.el.removeEventListener("touchend", this, false);
            this.el.removeEventListener("scroll", this, false);
            this.eventsActive = false;
        };
        nativeScroller.prototype.addPullToRefresh = function (el, leaveRefresh) {
            if (!leaveRefresh) this.refresh = true;
            if (this.refresh && this.refresh === true) {
                this.coreAddPullToRefresh(el);
                this.refreshContainer.style.position = "absolute";
                this.refreshContainer.style.top = "-60px";
                this.refreshContainer.style.height = "60px";
                this.refreshContainer.style.display = "block";
                this.updateP2rHackPosition();
            }
        };
        nativeScroller.prototype.updateP2rHackPosition=function(){
            if(!this.refresh)
                return $(this.el).find(".p2rhack").remove();
            var el=$(this.el).find(".p2rhack");
            if(el.length === 0){
                $(this.el).append("<div class='p2rhack' style='position:absolute;width:1px;height:1px;opacity:0;background:transparent;z-index:-1;-webkit-transform:translate3d(-1px,0,0);'></div>");
                el=$(this.el).find(".p2rhack");
            }

            el.css("top",this.el.scrollHeight+this.refreshHeight+1+"px");
        };
        nativeScroller.prototype.onTouchStart = function (e) {
            this.lastScrollInfo= {
                top:0
            };
            this.xReset=this.yReset=0;
            if(this.verticalScroll){
                if(this.el.scrollTop===0&&this.refresh){
                    this.el.scrollTop=1;
                    this.yReset=-1;
                }
                if(this.el.scrollTop===(this.el.scrollHeight - this.el.clientHeight)&&this.infinite){
                    this.el.scrollTop-=1;
                    this.yReset=1;
                }
            }

            if(this.horizontalScroll){
                if(this.el.scrollLeft===0){
                    this.el.scrollLeft=1;
                    this.xReset=-1;
                }
                if(this.el.scrollLeft===(this.el.scrollWidth-this.el.clientWidth)){
                    this.el.scrollLeft-=1;
                    this.xReset=1;
                }
            }
            if (this.refreshCancelCB) clearTimeout(this.refreshCancelCB);
            //get refresh ready
            if(this.refresh)
                this.el.addEventListener("touchend",this,false);

            this.el.addEventListener("touchmove", this,false);
            this.dY = e.touches[0].pageY;
            this.dX = e.touches[0].pageX;
            this.startTop=this.el.scrollTop;
            this.startLeft=this.el.scrollLeft;
            if (this.refresh || this.infinite) {


                if (this.refresh && this.dY < 0) {
                    this.showRefresh();

                }
            }
        };
        nativeScroller.prototype.onTouchMove = function (e) {
            var newcY = e.touches[0].pageY - this.dY;
            var newcX = e.touches[0].pageX - this.dX;

            //var scorllTop
            var atTop=(this.el.scrollHeight-this.el.scrollTop)===this.el.clientHeight&&newcY<0;
            var atRight=(this.el.scrollWidth-this.el.scrollLeft)===this.el.clientWidth&&newcX<0;
            var preventDefault=e.target.tagName.toLowerCase()!=="input";
            if(this.verticalScroll){
                if(this.startTop===0&&this.el.scrollTop===0&&newcY>0)
                    preventDefault&&e.preventDefault();
            }
            if(this.horizontalScroll&&this.startTop===0&&this.el.scrollLeft===0&&newcX>0){
                preventDefault&&e.preventDefault();
            }

            if(this.verticalScroll&&atTop){
                preventDefault&&e.preventDefault();

            }
            if(this.horizontalScroll&&atRight){
                preventDefault&&e.preventDefault();
            }

            if (!this.moved) {
                $.trigger(this, "scrollstart", [this.el,{x:newcX,y:newcY}]);
                $.trigger($.touchLayer, "scrollstart", [this.el,{x:newcX,y:newcY}]);
                if(!this.refresh)
                    this.el.addEventListener("touchend", this, false);
                this.moved = true;
            }

            if(this.horizontalScroll){
                if(Math.abs(newcY)>Math.abs(newcX)){
                    e.preventDefault();
                }
            }

            //check for trigger
            if (this.refresh && (this.el.scrollTop < -this.refreshHeight)) {
                this.showRefresh();
            //check for cancel when refresh is running
            } else if (this.refresh && this.refreshTriggered && this.refreshRunning && (this.el.scrollTop > this.refreshHeight)) {
                this.refreshTriggered = false;
                this.refreshRunning = false;
                if (this.refreshCancelCB) clearTimeout(this.refreshCancelCB);
                this.hideRefresh(false);
                this.setRefreshContent("Pull to Refresh");
                $.trigger(this, "refresh-cancel");
            //check for cancel when refresh is not running
            } else if (this.refresh && this.refreshTriggered && !this.refreshRunning && (this.el.scrollTop > -this.refreshHeight)) {
                this.refreshTriggered = false;
                this.refreshRunning = false;
                if (this.refreshCancelCB) clearTimeout(this.refreshCancelCB);
                this.hideRefresh(false);
                this.setRefreshContent("Pull to Refresh");
                $.trigger(this, "refresh-cancel");
            }

            this.cY = newcY;
            this.cX = newcX;
            this.lastScrollInfo.top=this.cY;

            if(this.initScrollProgress){
                $.trigger(this,"scroll",[{x:-this.el.scrollLeft,y:-this.el.scrollTop}]);
                $.trigger($.touchLayer,"scroll",[{x:-this.el.scrollLeft,y:-this.el.scrollTop}]);
            }

        };
        nativeScroller.prototype.showRefresh = function () {
            if (!this.refreshTriggered) {
                this.refreshTriggered = true;
                this.setRefreshContent("Release to Refresh");
                $.trigger(this, "refresh-trigger");
            }
        };
        nativeScroller.prototype.onTouchEnd = function (e) {

            var triggered = this.el.scrollTop <= -(this.refreshHeight);
            var that=this;
            this.fireRefreshRelease(triggered, true);
            if(!this.moved){
                this.el.scrollTop+=this.yReset;
                this.el.scrollLeft+=this.xReset;
            }
            if (triggered&&this.refresh) {
                //lock in place
                //that.refreshContainer.style.position = "";
                //iOS has a bug that it will jump when scrolling back up, so we add a fake element while we reset the pull to refresh position
                //then we remove it right away
                var tmp=$.create("<div style='height:"+this.el.clientHeight+this.refreshHeight+"px;width:1px;-webkit-transform:translated3d(-1px,0,0)'></div>");
                $(this.el).append(tmp);
                that.refreshContainer.style.top = "0px";
                that.refreshContainer.style.position="";
                setTimeout(function(){
                    tmp.remove();
                });
            }

            //this.dY = this.cY = 0;
            this.el.removeEventListener("touchmove", this, false);
            this.el.removeEventListener("touchend", this, false);
            this.infiniteEndCheck = true;
            if (this.infinite && !this.infiniteTriggered && ((this.el.scrollTop) >= (this.el.scrollHeight - this.el.clientHeight))) {
                this.infiniteTriggered = true;
                $.trigger(this, "infinite-scroll");
                this.infiniteEndCheck = true;
            }
            this.touchEndFired = true;
            //pollyfil for scroll end since webkit doesn"t give any events during the "flick"
            var max = 200;
            var self = this;
            var currPos = {
                top: this.el.scrollTop,
                left: this.el.scrollLeft
            };
            var counter = 0;
            clearInterval(self.nativePolling);
            self.nativePolling = setInterval(function () {
                counter++;
                if(counter === parseInt(max/8,10)) {
                    if(self.initScrollProgress){
                        $.trigger(self,"scroll",[{x:-self.el.scrollLeft+self.cX,y:-self.el.scrollTop+self.cY}]);
                        $.trigger($.touchLayer,"scroll",[{x:-self.el.scrollLeft+self.cX,y:-self.el.scrollTop+self.cY}]);
                    }
                }
                if (counter >= max) {
                    clearInterval(self.nativePolling);
                    if(self.initScrollProgress){
                        $.trigger(self,"scroll",[{x:-self.el.scrollLeft,y:-self.el.scrollTop}]);
                        $.trigger($.touchLayer,"scroll",[{x:-self.el.scrollLeft,y:-self.el.scrollTop}]);
                    }

                    return;
                }
                if (self.el.scrollTop !== currPos.top || self.el.scrollLeft !== currPos.left) {
                    clearInterval(self.nativePolling);
                    $.trigger($.touchLayer, "scrollend", [self.el]); //notify touchLayer of this elements scrollend
                    $.trigger(self, "scrollend", [self.el]);
                    if(self.initScrollProgress){
                        $.trigger(self,"scroll",[{x:-self.el.scrollLeft,y:-self.el.scrollTop}]);
                        $.trigger($.touchLayer,"scroll",[{x:-self.el.scrollLeft,y:-self.el.scrollTop}]);
                    }
                }

            }, 20);
        };
        nativeScroller.prototype.hideRefresh = function (animate) {

            if (this.preventHideRefresh) return;

            var that = this;
            var endAnimationCb = function (canceled) {
                that.refreshContainer.style.top = "-60px";
                that.refreshContainer.style.position = "absolute";
                that.dY = that.cY = 0;
                if (!canceled) { //not sure if this should be the correct logic....
                    that.el.style[$.feat.cssPrefix + "Transform"] = "none";
                    that.el.style[$.feat.cssPrefix + "TransitionProperty"] = "none";
                    that.el.scrollTop = 0;
                    that.logPos(that.el.scrollLeft, 0);
                    that.refreshRunning = false;
                    that.setRefreshContent("Pull to Refresh");
                    $.trigger(that, "refresh-finish");
                }
            };

            if (animate === false || !that.afEl.css3Animate) {
                endAnimationCb();
            } else {
                that.afEl.css3Animate({
                    y: (that.el.scrollTop - that.refreshHeight) + "px",
                    x: "0%",
                    time: HIDE_REFRESH_TIME + "ms",
                    complete: endAnimationCb
                });
            }
            this.refreshTriggered = false;
            //this.el.addEventListener("touchend", this, false);
        };
        nativeScroller.prototype.hideScrollbars = function () {};
        nativeScroller.prototype.scrollTo = function (pos, time) {
            this.logPos(pos.x, pos.y);
            pos.x *= -1;
            pos.y *= -1;
            return this._scrollTo(pos, time);
        };
        nativeScroller.prototype.scrollBy = function (pos, time) {
            pos.x += this.el.scrollLeft;
            pos.y += this.el.scrollTop;
            this.logPos(this.el.scrollLeft, this.el.scrollTop);
            return this._scrollTo(pos, time);
        };
        nativeScroller.prototype.scrollToBottom = function (time) {
            //this.el.scrollTop = this.el.scrollHeight;
            this._scrollToBottom(time);
            this.logPos(this.el.scrollLeft, this.el.scrollTop);
        };
        nativeScroller.prototype.onScroll = function (e) {
            if (this.infinite && this.touchEndFired) {
                this.touchEndFired = false;
                return;
            }
            if (this.scrollSkip) {
                this.scrollSkip = false;
                return;
            }
            if (this.infinite) {

                if (!this.infiniteTriggered && (this.el.scrollTop >= (this.el.scrollHeight - this.el.clientHeight))) {
                    this.infiniteTriggered = true;
                    $.trigger(this, "infinite-scroll");
                    this.infiniteEndCheck = true;
                }
            }

            var that = this;
            if (this.infinite && this.infiniteEndCheck && this.infiniteTriggered) {

                this.infiniteEndCheck = false;
                $.trigger(that, "infinite-scroll-end");
            }
        };
        nativeScroller.prototype.logPos = function (x, y) {

            this.loggedPcentX = this.divide(x, (this.el.scrollWidth));
            this.loggedPcentY = this.divide(y, (this.el.scrollHeight));
            this.scrollLeft = x;
            this.scrollTop = y;

            if (isNaN(this.loggedPcentX))
                this.loggedPcentX = 0;
            if (isNaN(this.loggedPcentY))
                this.loggedPcentY = 0;

        };
        nativeScroller.prototype.adjustScroll = function () {
            this.adjustScrollOverflowProxy();

            this.el.scrollLeft = this.loggedPcentX * (this.el.scrollWidth);
            this.el.scrollTop = this.loggedPcentY * (this.el.scrollHeight);
            this.logPos(this.el.scrollLeft, this.el.scrollTop);
        };

        //JS scroller
        jsScroller.prototype.defaultProperties = function () {
            this.boolScrollLock = false;
            this.currentScrollingObject = null;
            this.elementInfo = null;
            this.verticalScroll = true;
            this.horizontalScroll = false;
            this.scrollBars = true;
            this.vscrollBar = null;
            this.hscrollBar = null;
            this.hScrollCSS = "scrollBar";
            this.vScrollCSS = "scrollBar";
            this.firstEventInfo = null;
            this.moved = false;
            this.preventPullToRefresh = true;
            this.isScrolling = false;
            this.androidFormsMode = false;
            this.refreshSafeKeep = false;
            this.lastScrollbar = "";
            this.finishScrollingObject = null;
            this.container = null;
            this.scrollingFinishCB = null;
            this.loggedPcentY = 0;
            this.loggedPcentX = 0;
            this.androidPerfHack=0;
        };

        function createScrollBar(width, height) {
            var scrollDiv = document.createElement("div");
            scrollDiv.style.position = "absolute";
            scrollDiv.style.width = width + "px";
            scrollDiv.style.height = height + "px";
            scrollDiv.style[$.feat.cssPrefix + "BorderRadius"] = "2px";
            scrollDiv.style.borderRadius = "2px";
            scrollDiv.style.display="none";
            scrollDiv.className = "scrollBar";
            scrollDiv.style.background = "black";
            return scrollDiv;
        }

        jsScroller.prototype.enable = function (firstExecution) {
            if (this.eventsActive) return;
            this.eventsActive = true;
            if (!firstExecution) this.adjustScroll();
            else
                this.scrollerMoveCSS({
                    x: 0,
                    y: 0
                }, 0);
            //add listeners
            this.container.addEventListener("touchstart", this, false);
            this.container.addEventListener("touchmove", this, false);
            this.container.addEventListener("touchend", this, false);

        };
        jsScroller.prototype.adjustScroll = function () {
            //set top/left
            var size = this.getViewportSize();
            this.scrollerMoveCSS({
                x: Math.round(this.loggedPcentX * (this.el.clientWidth - size.w)),
                y: Math.round(this.loggedPcentY * (this.el.clientHeight - size.h))
            }, 0);
        };
        jsScroller.prototype.disable = function () {
            if (!this.eventsActive) return;
            //log top/left
            var cssMatrix = this.getCSSMatrix(this.el);
            this.logPos((numOnly(cssMatrix.e) - numOnly(this.container.scrollLeft)), (numOnly(cssMatrix.f) - numOnly(this.container.scrollTop)));
            //remove event listeners
            this.container.removeEventListener("touchstart", this, false);
            this.container.removeEventListener("touchmove", this, false);
            this.container.removeEventListener("touchend", this, false);
            this.eventsActive = false;
        };
        jsScroller.prototype.addPullToRefresh = function (el, leaveRefresh) {
            if (!leaveRefresh) this.refresh = true;
            if (this.refresh && this.refresh === true) {
                this.coreAddPullToRefresh(el);
                this.el.style.overflow = "visible";
            }
        };
        jsScroller.prototype.hideScrollbars = function () {
            if (this.hscrollBar) {
                this.hscrollBar.style.display="none";
                this.hscrollBar.style[$.feat.cssPrefix + "TransitionDuration"] = "0ms";
            }
            if (this.vscrollBar) {
                this.vscrollBar.style.display="none";
                this.vscrollBar.style[$.feat.cssPrefix + "TransitionDuration"] = "0ms";
            }
        };

        jsScroller.prototype.getViewportSize = function () {
            var style = window.getComputedStyle(this.container);
            if (isNaN(numOnly(style.paddingTop))) window.alert((typeof style.paddingTop) + "::" + style.paddingTop + ":");
            return {
                h: (this.container.clientHeight > window.innerHeight ? window.innerHeight : this.container.clientHeight - numOnly(style.paddingTop) - numOnly(style.paddingBottom)),
                w: (this.container.clientWidth > window.innerWidth ? window.innerWidth : this.container.clientWidth - numOnly(style.paddingLeft) - numOnly(style.paddingRight))
            };
        };

        jsScroller.prototype.onTouchStart = function (event) {

            this.moved = false;
            this.currentScrollingObject = null;

            $(this.el).animate().stop();

            if (!this.container) return;
            if (this.refreshCancelCB) {
                clearTimeout(this.refreshCancelCB);
                this.refreshCancelCB = null;
            }
            if (this.scrollingFinishCB) {
                clearTimeout(this.scrollingFinishCB);
                this.scrollingFinishCB = null;
            }

            //disable if locked
            if (event.touches.length !== 1 || this.boolScrollLock) return;

            // Allow interaction to legit calls, like select boxes, etc.
            if (event.touches[0].target && event.touches[0].target.type !== undefined) {
                var tagname = event.touches[0].target.tagName.toLowerCase();

                if (tagname === "select" ) // stuff we need to allow
                // access to legit calls
                    return;
            }

            //default variables
            var scrollInfo = {
                //current position
                top: 0,
                left: 0,
                //current movement
                speedY: 0,
                speedX: 0,
                absSpeedY: 0,
                absSpeedX: 0,
                deltaY: 0,
                deltaX: 0,
                absDeltaY: 0,
                absDeltaX: 0,
                y: 0,
                x: 0,
                duration: 0
            };

            //element info
            this.elementInfo = {};
            var size = this.getViewportSize();
            this.elementInfo.bottomMargin = size.h;
            this.elementInfo.maxTop = (this.el.clientHeight - this.elementInfo.bottomMargin);
            if (this.elementInfo.maxTop < 0) this.elementInfo.maxTop = 0;
            this.elementInfo.divHeight = this.el.clientHeight;
            this.elementInfo.rightMargin = size.w;
            this.elementInfo.maxLeft = (this.el.clientWidth - this.elementInfo.rightMargin);
            if (this.elementInfo.maxLeft < 0) this.elementInfo.maxLeft = 0;
            this.elementInfo.divWidth = this.el.clientWidth;
            this.elementInfo.hasVertScroll = this.verticalScroll || this.elementInfo.maxTop > 0;
            this.elementInfo.hasHorScroll = this.elementInfo.maxLeft > 0;
            this.elementInfo.requiresVScrollBar = this.vscrollBar && this.elementInfo.hasVertScroll;
            this.elementInfo.requiresHScrollBar = this.hscrollBar && this.elementInfo.hasHorScroll;

            //save event
            this.saveEventInfo(event);
            this.saveFirstEventInfo(event);

            //get the current top
            var cssMatrix = this.getCSSMatrix(this.el);
            scrollInfo.top = numOnly(cssMatrix.f) - numOnly(this.container.scrollTop);
            scrollInfo.left = numOnly(cssMatrix.e) - numOnly(this.container.scrollLeft);

            this.container.scrollTop = this.container.scrollLeft = 0;
            this.currentScrollingObject = this.el;

            //get refresh ready
            if (this.refresh && scrollInfo.top === 0) {
                this.refreshContainer.style.display = "block";
                this.refreshHeight = this.refreshContainer.firstChild.clientHeight;
                this.refreshContainer.firstChild.style.top = (-this.refreshHeight) + "px";
                this.refreshContainer.style.overflow = "visible";
                this.preventPullToRefresh = false;
            } else if (scrollInfo.top < 0) {
                this.preventPullToRefresh = true;
                if (this.refresh) this.refreshContainer.style.overflow = "hidden";
            }

            //set target
            scrollInfo.x = scrollInfo.left;
            scrollInfo.y = scrollInfo.top;

            //vertical scroll bar
            if (this.setVScrollBar(scrollInfo, 0, 0)) {
                if (this.container.clientWidth > window.innerWidth)
                    this.vscrollBar.style.right =  "0px";
                else
                    this.vscrollBar.style.right = "0px";
                this.vscrollBar.style[$.feat.cssPrefix + "Transition"] = "";
                $(this.vscrollBar).animate().stop();
            }

            //horizontal scroll
            if (this.setHScrollBar(scrollInfo, 0, 0)) {
                if (this.container.clientHeight > window.innerHeight)
                    this.hscrollBar.style.top = (window.innerHeight - numOnly(this.hscrollBar.style.height)) + "px";
                else
                    this.hscrollBar.style.bottom = numOnly(this.hscrollBar.style.height);
                this.hscrollBar.style[$.feat.cssPrefix + "Transition"] = "";
                $(this.hscrollBar).animate().stop();
            }

            //save scrollInfo
            this.lastScrollInfo = scrollInfo;
            this.hasMoved = false;

            if(this.elementInfo.maxTop === 0 && this.elementInfo.maxLeft === 0 && this.lockBounce)
                this.scrollToTop(0);
            else
                this.scrollerMoveCSS(this.lastScrollInfo, 0);

            this.scrollerMoveCSS(this.lastScrollInfo, 0);

        };
        jsScroller.prototype.getCSSMatrix = function (el) {
            if (this.androidFormsMode) {
                //absolute mode
                var top = parseInt(el.style.marginTop,10);
                var left = parseInt(el.style.marginLeft,10);
                if (isNaN(top)) top = 0;
                if (isNaN(left)) left = 0;
                return {
                    f: top,
                    e: left
                };
            } else {
                //regular transform

                var obj = $.getCssMatrix(el);
                return obj;
            }
        };
        jsScroller.prototype.saveEventInfo = function (event) {
            this.lastEventInfo = {
                pageX: event.touches[0].pageX,
                pageY: event.touches[0].pageY,
                time: event.timeStamp
            };
        };
        jsScroller.prototype.saveFirstEventInfo = function (event) {
            this.firstEventInfo = {
                pageX: event.touches[0].pageX,
                pageY: event.touches[0].pageY,
                time: event.timeStamp
            };
        };
        jsScroller.prototype.setVScrollBar = function (scrollInfo, time, timingFunction) {
            if (!this.elementInfo.requiresVScrollBar) return false;
            var newHeight = (parseFloat(this.elementInfo.bottomMargin / this.elementInfo.divHeight) * this.elementInfo.bottomMargin) + "px";
            if(numOnly(newHeight) > this.elementInfo.bottomMargin)
                newHeight = this.elementInfo.bottomMargin+"px";
            if (newHeight !== this.vscrollBar.style.height)
                this.vscrollBar.style.height = newHeight;

            var pos = (this.elementInfo.bottomMargin - numOnly(this.vscrollBar.style.height)) - (((this.elementInfo.maxTop + scrollInfo.y) / this.elementInfo.maxTop) * (this.elementInfo.bottomMargin - numOnly(this.vscrollBar.style.height)));
            if (pos > this.elementInfo.bottomMargin) pos = this.elementInfo.bottomMargin;
            if (pos < 0) pos = 0;

            this.scrollbarMoveCSS(this.vscrollBar, {
                x: 0,
                y: pos
            }, time, timingFunction);
            return true;
        };
        jsScroller.prototype.setHScrollBar = function (scrollInfo, time, timingFunction) {
            if (!this.elementInfo.requiresHScrollBar) return false;
            var newWidth = (parseFloat(this.elementInfo.rightMargin / this.elementInfo.divWidth) * this.elementInfo.rightMargin) + "px";
            if (newWidth !== this.hscrollBar.style.width)
                this.hscrollBar.style.width = newWidth;

            var pos = (this.elementInfo.rightMargin - numOnly(this.hscrollBar.style.width)) - (((this.elementInfo.maxLeft + scrollInfo.x) / this.elementInfo.maxLeft) * (this.elementInfo.rightMargin - numOnly(this.hscrollBar.style.width)));
            if (pos > this.elementInfo.rightMargin) pos = this.elementInfo.rightMargin;
            if (pos < 0) pos = 0;

            this.scrollbarMoveCSS(this.hscrollBar, {
                x: pos,
                y: 0
            }, time, timingFunction);
            return true;
        };

        jsScroller.prototype.onTouchMove = function (event) {

            if (this.currentScrollingObject === null) return;
            //event.preventDefault();
            var scrollInfo = this.calculateMovement(event);
            this.calculateTarget(scrollInfo);

            this.lastScrollInfo = scrollInfo;
            if (!this.moved) {
                $.trigger(this, "scrollstart",[this.el,{x:this.lastScrollInfo.top,y:this.lastScrollInfo.left}]);
                $.trigger($.touchLayer, "scrollstart", [this.el,{x:this.lastScrollInfo.top,y:this.lastScrollInfo.left}]);
                if (this.elementInfo.requiresVScrollBar) this.vscrollBar.style.display="block";
                if (this.elementInfo.requiresHScrollBar) this.hscrollBar.style.display="block";
            }
            this.moved = true;


            if (this.refresh && scrollInfo.top === 0) {
                this.refreshContainer.style.display = "block";
                this.refreshHeight = this.refreshContainer.firstChild.clientHeight;
                this.refreshContainer.firstChild.style.top = (-this.refreshHeight) + "px";
                this.refreshContainer.style.overflow = "visible";
                this.preventPullToRefresh = false;
            } else if (scrollInfo.top < 0) {
                this.preventPullToRefresh = true;
                if (this.refresh) this.refreshContainer.style.overflow = "hidden";
            }


            this.saveEventInfo(event);
            if (this.isScrolling===false){ // && (this.lastScrollInfo.x != this.lastScrollInfo.left || this.lastScrollInfo.y != this.lastScrollInfo.top)) {
                this.isScrolling = true;
                if (this.onScrollStart) this.onScrollStart();
            }
            //proceed normally
            var cssMatrix = this.getCSSMatrix(this.el);
            this.lastScrollInfo.top = numOnly(cssMatrix.f);
            this.lastScrollInfo.left = numOnly(cssMatrix.e);

            this.recalculateDeltaY(this.lastScrollInfo);
            this.recalculateDeltaX(this.lastScrollInfo);

            //boundaries control
            this.checkYboundary(this.lastScrollInfo);
            if (this.elementInfo.hasHorScroll) this.checkXboundary(this.lastScrollInfo);


            //pull to refresh elastic
            var positiveOverflow = this.lastScrollInfo.y > 0 && this.lastScrollInfo.deltaY > 0;
            var negativeOverflow = this.lastScrollInfo.y < -this.elementInfo.maxTop && this.lastScrollInfo.deltaY < 0;
            var overflow,pcent,baseTop;
            if (positiveOverflow || negativeOverflow) {
                overflow = positiveOverflow ? this.lastScrollInfo.y : -this.lastScrollInfo.y - this.elementInfo.maxTop;
                pcent = (this.container.clientHeight - overflow) / this.container.clientHeight;
                if (pcent < 0.5) pcent = 0.5;
                //cur top, maxTop or 0?
                baseTop = 0;
                if ((positiveOverflow && this.lastScrollInfo.top > 0) || (negativeOverflow && this.lastScrollInfo.top < -this.elementInfo.maxTop)) {
                    baseTop = this.lastScrollInfo.top;
                } else if (negativeOverflow) {
                    baseTop = -this.elementInfo.maxTop;
                }
                var changeY = this.lastScrollInfo.deltaY * pcent;
                var absChangeY = Math.abs(this.lastScrollInfo.deltaY * pcent);
                if (absChangeY < 1) changeY = positiveOverflow ? 1 : -1;
                this.lastScrollInfo.y = baseTop + changeY;
            }

            if(this.elementInfo.hasHorScroll){
                positiveOverflow = this.lastScrollInfo.x > 0 && this.lastScrollInfo.deltaX > 0;
                negativeOverflow = this.lastScrollInfo.x < -this.elementInfo.maxLeft && this.lastScrollInfo.deltaX < 0;
                if (positiveOverflow || negativeOverflow) {
                    overflow = positiveOverflow ? this.lastScrollInfo.x : -this.lastScrollInfo.x - this.elementInfo.maxLeft;
                    pcent = (this.container.clientWidth - overflow) / this.container.clientWidth;
                    if (pcent < 0.5) pcent = 0.5;
                //cur top, maxTop or 0?
                    baseTop = 0;
                    if ((positiveOverflow && this.lastScrollInfo.left > 0) || (negativeOverflow && this.lastScrollInfo.left < -this.elementInfo.maxLeft)) {
                        baseTop = this.lastScrollInfo.left;
                    } else if (negativeOverflow) {
                        baseTop = -this.elementInfo.maxLeft;
                    }
                    var changeX = this.lastScrollInfo.deltaX * pcent;
                    var absChangeX = Math.abs(this.lastScrollInfo.deltaX * pcent);
                    if (absChangeX < 1) changeX = positiveOverflow ? 1 : -1;
                    this.lastScrollInfo.x = baseTop + changeX;
                }
            }
            if(this.lockBounce||(!this.refresh)){

                if(this.lastScrollInfo.x>0){
                    this.lastScrollInfo.x=0;
                  //  this.hscrollBar.style.display="none";
                }
                else if(this.lastScrollInfo.x*-1>this.elementInfo.maxLeft){
                    this.lastScrollInfo.x=this.elementInfo.maxLeft*-1;
                   // this.hscrollBar.style.display="none";
                }
                if(this.lastScrollInfo.y>0){
                    this.lastScrollInfo.y=0;
                    //this.vscrollBar.style.display="none";
                }
                else if(this.lastScrollInfo.y*-1>this.elementInfo.maxTop){
                   // this.vscrollBar.style.display="none";
                    this.lastScrollInfo.y=this.elementInfo.maxTop*-1;
                }
            }

            //move

            this.scrollerMoveCSS(this.lastScrollInfo, 0);
            this.setVScrollBar(this.lastScrollInfo, 0, 0);
            this.setHScrollBar(this.lastScrollInfo, 0, 0);

            //check refresh triggering
            if (this.refresh && !this.preventPullToRefresh) {
                if (!this.refreshTriggered && this.lastScrollInfo.top > this.refreshHeight) {
                    this.refreshTriggered = true;
                    this.setRefreshContent("Release to Refresh");
                    $.trigger(this, "refresh-trigger");
                } else if (this.refreshTriggered && this.lastScrollInfo.top < this.refreshHeight) {
                    this.refreshTriggered = false;
                    this.setRefreshContent("Pull to Refresh");
                    $.trigger(this, "refresh-cancel");
                }
            }

            if (this.infinite && !this.infiniteTriggered) {
                if ((Math.abs(this.lastScrollInfo.top) > (this.el.clientHeight - this.container.clientHeight))) {
                    this.infiniteTriggered = true;
                    $.trigger(this, "infinite-scroll");
                }
            }

        };

        jsScroller.prototype.calculateMovement = function (event, last) {
            //default variables
            var scrollInfo = {
                //current position
                top: 0,
                left: 0,
                //current movement
                speedY: 0,
                speedX: 0,
                absSpeedY: 0,
                absSpeedX: 0,
                deltaY: 0,
                deltaX: 0,
                absDeltaY: 0,
                absDeltaX: 0,
                y: 0,
                x: 0,
                duration: 0
            };

            var prevEventInfo = last ? this.firstEventInfo : this.lastEventInfo;
            var pageX = last ? event.pageX : event.touches[0].pageX;
            var pageY = last ? event.pageY : event.touches[0].pageY;
            var time = last ? event.time : event.timeStamp;

            scrollInfo.deltaY = this.elementInfo.hasVertScroll ? pageY - prevEventInfo.pageY : 0;
            scrollInfo.deltaX = this.elementInfo.hasHorScroll ? pageX - prevEventInfo.pageX : 0;
            scrollInfo.time = time;


            scrollInfo.duration = time - prevEventInfo.time;
            return scrollInfo;
        };

        jsScroller.prototype.calculateTarget = function (scrollInfo) {
            scrollInfo.y = this.lastScrollInfo.y + scrollInfo.deltaY;
            scrollInfo.x = this.lastScrollInfo.x + scrollInfo.deltaX;
            if(Math.abs(scrollInfo.deltaY)>0)
                scrollInfo.y+=(scrollInfo.deltaY>0?1:-1)*(this.elementInfo.divHeight*this.androidPerfHack);
            if(Math.abs(scrollInfo.deltaX)>0)
                scrollInfo.x+=(scrollInfo.deltaX>0?1:-1)*(this.elementInfo.divWidth*this.androidPerfHack);
        };
        jsScroller.prototype.checkYboundary = function (scrollInfo) {
            var minTop = this.container.clientHeight / 2;
            var maxTop = this.elementInfo.maxTop + minTop;
            //y boundaries
            if (scrollInfo.y > minTop) scrollInfo.y = minTop;
            else if (-scrollInfo.y > maxTop) scrollInfo.y = -maxTop;
            else return;
            this.recalculateDeltaY(scrollInfo);
        };
        jsScroller.prototype.checkXboundary = function (scrollInfo) {
            //x boundaries

            var minLeft=this.container.clientWidth/2;
            var maxLeft=this.elementInfo.maxLeft+minLeft;

            if (scrollInfo.x > minLeft) scrollInfo.x = minLeft;
            else if (-scrollInfo.x > maxLeft) scrollInfo.x = -maxLeft;
            else return;

            this.recalculateDeltaX(scrollInfo);
        };
        jsScroller.prototype.recalculateDeltaY = function (scrollInfo) {
            //recalculate delta
            var oldAbsDeltaY = Math.abs(scrollInfo.deltaY);
            scrollInfo.deltaY = scrollInfo.y - scrollInfo.top;
            var newAbsDeltaY = Math.abs(scrollInfo.deltaY);
            //recalculate duration at same speed
            scrollInfo.duration = scrollInfo.duration * newAbsDeltaY / oldAbsDeltaY;

        };
        jsScroller.prototype.recalculateDeltaX = function (scrollInfo) {
            //recalculate delta
            var oldAbsDeltaX = Math.abs(scrollInfo.deltaX);
            scrollInfo.deltaX = scrollInfo.x - scrollInfo.left;
            var newAbsDeltaX = Math.abs(scrollInfo.deltaX);
            //recalculate duration at same speed
            scrollInfo.duration = scrollInfo.duration * newAbsDeltaX / oldAbsDeltaX;

        };

        jsScroller.prototype.hideRefresh = function (animate) {
            var that = this;
            if (this.preventHideRefresh) return;
            var endAnimationCb = function () {
                that.setRefreshContent("Pull to Refresh");
                $.trigger(that, "refresh-finish");
            };
            this.scrollerMoveCSS({x: 0, y: 0}, HIDE_REFRESH_TIME);
            if (animate === false || !that.afEl.css3Animate) {
                endAnimationCb();
            } else {
                that.afEl.css3Animate({
                    time: HIDE_REFRESH_TIME + "ms",
                    complete: endAnimationCb
                });
            }
            this.refreshTriggered = false;
        };

        jsScroller.prototype.setMomentum = function (scrollInfo) {
            var deceleration = 0.0008;

            //calculate movement speed
            scrollInfo.speedY = this.divide(scrollInfo.deltaY, scrollInfo.duration);
            scrollInfo.speedX = this.divide(scrollInfo.deltaX, scrollInfo.duration);

            scrollInfo.absSpeedY = Math.abs(scrollInfo.speedY);
            scrollInfo.absSpeedX = Math.abs(scrollInfo.speedX);

            scrollInfo.absDeltaY = Math.abs(scrollInfo.deltaY);
            scrollInfo.absDeltaX = Math.abs(scrollInfo.deltaX);

            //set momentum
            if (scrollInfo.absDeltaY > 0) {
                scrollInfo.deltaY += (scrollInfo.deltaY < 0 ? -1 : 1) * (scrollInfo.absSpeedY * scrollInfo.absSpeedY) / (2 * deceleration);
                scrollInfo.absDeltaY = Math.abs(scrollInfo.deltaY);
                scrollInfo.duration = scrollInfo.absSpeedY / deceleration;
                scrollInfo.speedY = scrollInfo.deltaY / scrollInfo.duration;
                scrollInfo.absSpeedY = Math.abs(scrollInfo.speedY);
                if (scrollInfo.absSpeedY < deceleration * 100 || scrollInfo.absDeltaY < 5) scrollInfo.deltaY = scrollInfo.absDeltaY = scrollInfo.duration = scrollInfo.speedY = scrollInfo.absSpeedY = 0;
            } else if (scrollInfo.absDeltaX) {
                scrollInfo.deltaX += (scrollInfo.deltaX < 0 ? -1 : 1) * (scrollInfo.absSpeedX * scrollInfo.absSpeedX) / (2 * deceleration);
                scrollInfo.absDeltaX = Math.abs(scrollInfo.deltaX);
                scrollInfo.duration = scrollInfo.absSpeedX / deceleration;
                scrollInfo.speedX = scrollInfo.deltaX / scrollInfo.duration;
                scrollInfo.absSpeedX = Math.abs(scrollInfo.speedX);
                if (scrollInfo.absSpeedX < deceleration * 100 || scrollInfo.absDeltaX < 5) scrollInfo.deltaX = scrollInfo.absDeltaX = scrollInfo.duration = scrollInfo.speedX = scrollInfo.absSpeedX = 0;
            } else scrollInfo.duration = 0;
        };

        jsScroller.prototype.onTouchEnd = function (event) {

            if (this.currentScrollingObject === null || !this.moved) return;

            //event.preventDefault();
            this.finishScrollingObject = this.currentScrollingObject;
            this.currentScrollingObject = null;

            var scrollInfo = this.calculateMovement(this.lastEventInfo, true);

            if (!this.androidFormsMode) {
                this.setMomentum(scrollInfo);
            }
            this.calculateTarget(scrollInfo);

            

            //get the current top
            var cssMatrix = this.getCSSMatrix(this.el);
            scrollInfo.top = numOnly(cssMatrix.f);
            scrollInfo.left = numOnly(cssMatrix.e);

            //boundaries control
            this.checkYboundary(scrollInfo);

            if (this.elementInfo.hasHorScroll) this.checkXboundary(scrollInfo);


            var triggered = !this.preventPullToRefresh && (scrollInfo.top > this.refreshHeight || scrollInfo.y > this.refreshHeight);
            this.fireRefreshRelease(triggered, scrollInfo.top > 0);

            //refresh hang in
            if (this.refresh && triggered) {
                scrollInfo.y = this.refreshHeight;
                scrollInfo.duration = HIDE_REFRESH_TIME;
                //top boundary
            } else if (scrollInfo.y >= 0) {
                scrollInfo.y = 0;
                if (scrollInfo.top >= 0) scrollInfo.duration = HIDE_REFRESH_TIME;
                //lower boundary
            } else if (-scrollInfo.y > this.elementInfo.maxTop || this.elementInfo.maxTop === 0) {
                scrollInfo.y = -this.elementInfo.maxTop;
                if (-scrollInfo.top > this.elementInfo.maxTop) scrollInfo.duration = HIDE_REFRESH_TIME;
                //all others
            }
            if(this.elementInfo.hasHorScroll){
                if(scrollInfo.x>=0)
                {
                    scrollInfo.x=0;
                    if(scrollInfo.left>=0&&this.refresh) scrollInfo.duration=HIDE_REFRESH_TIME;
                }
                else if(-scrollInfo.x>this.elementInfo.maxLeft||this.elementInfo.maxLeft===0){
                    scrollInfo.x=-this.elementInfo.maxLeft;
                    if(-scrollInfo.left>this.elementInfo.maxLeft&&this.refresh) scrollInfo.duration=HIDE_REFRESH_TIME;
                }
            }
            if ((scrollInfo.x === scrollInfo.left && scrollInfo.y === scrollInfo.top) || this.androidFormsMode)
                scrollInfo.duration = 0;

            this.scrollerMoveCSS(scrollInfo, scrollInfo.duration, "cubic-bezier(0.33,0.66,0.66,1)");
            this.setVScrollBar(scrollInfo, scrollInfo.duration, "cubic-bezier(0.33,0.66,0.66,1)");
            this.setHScrollBar(scrollInfo, scrollInfo.duration, "cubic-bezier(0.33,0.66,0.66,1)");
            this.setFinishCalback(scrollInfo.duration);
            if (this.infinite && !this.infiniteTriggered) {
                if ((Math.abs(scrollInfo.y) >= (this.el.clientHeight - this.container.clientHeight))) {
                    var self = this;
                    setTimeout(function(){
                        self.infiniteTriggered = true;
                        $.trigger(self, "infinite-scroll");
                    },scrollInfo.duration-50);
                }
            }
        };

        //finish callback
        jsScroller.prototype.setFinishCalback = function (duration) {
            var that = this;
            this.scrollingFinishCB = setTimeout(function () {
                that.hideScrollbars();
                $.trigger($.touchLayer, "scrollend", [that.el]); //notify touchLayer of this elements scrollend
                $.trigger(that, "scrollend", [that.el]);
                that.isScrolling = false;
                that.elementInfo = null; //reset elementInfo when idle)
                if (that.infinite&&that.infiniteTriggered) $.trigger(that, "infinite-scroll-end");
            }, duration);
        };

        //Android Forms Fix
        jsScroller.prototype.startFormsMode = function () {
            if (this.blockFormsFix) return;
            //get prev values
            var cssMatrix = this.getCSSMatrix(this.el);
            //toggle vars
            this.refreshSafeKeep = this.refresh;
            this.refresh = false;
            this.androidFormsMode = true;
            //set new css rules
            this.el.style[$.feat.cssPrefix + "Transform"] = "none";
            this.el.style[$.feat.cssPrefix + "Transition"] = "none";
            this.el.style[$.feat.cssPrefix + "Perspective"] = "none";

            //set position
            this.scrollerMoveCSS({
                x: numOnly(cssMatrix.e),
                y: numOnly(cssMatrix.f)
            }, 0);

            //container
            this.container.style[$.feat.cssPrefix + "Perspective"] = "none";
            this.container.style[$.feat.cssPrefix + "BackfaceVisibility"] = "visible";
            //scrollbars
            if (this.vscrollBar) {
                this.vscrollBar.style[$.feat.cssPrefix + "Transform"] = "none";
                this.vscrollBar.style[$.feat.cssPrefix + "Transition"] = "none";
                this.vscrollBar.style[$.feat.cssPrefix + "Perspective"] = "none";
                this.vscrollBar.style[$.feat.cssPrefix + "BackfaceVisibility"] = "visible";
            }
            if (this.hscrollBar) {
                this.hscrollBar.style[$.feat.cssPrefix + "Transform"] = "none";
                this.hscrollBar.style[$.feat.cssPrefix + "Transition"] = "none";
                this.hscrollBar.style[$.feat.cssPrefix + "Perspective"] = "none";
                this.hscrollBar.style[$.feat.cssPrefix + "BackfaceVisibility"] = "visible";
            }
        };
        jsScroller.prototype.stopFormsMode = function () {
            if (this.blockFormsFix) return;
            //get prev values
            var cssMatrix = this.getCSSMatrix(this.el);
            //toggle vars
            this.refresh = this.refreshSafeKeep;
            this.androidFormsMode = false;
            //set new css rules
            this.el.style[$.feat.cssPrefix + "Perspective"] = 1000;
            this.el.style.marginTop = 0;
            this.el.style.marginLeft = 0;
            this.el.style[$.feat.cssPrefix + "Transition"] = "0ms linear"; //reactivate transitions
            //set position
            this.scrollerMoveCSS({
                x: numOnly(cssMatrix.e),
                y: numOnly(cssMatrix.f)
            }, 0);
            //container
            this.container.style[$.feat.cssPrefix + "Perspective"] = 1000;
            this.container.style[$.feat.cssPrefix + "BackfaceVisibility"] = "hidden";
            //scrollbars
            if (this.vscrollBar) {
                this.vscrollBar.style[$.feat.cssPrefix + "Perspective"] = 1000;
                this.vscrollBar.style[$.feat.cssPrefix + "BackfaceVisibility"] = "hidden";
            }
            if (this.hscrollBar) {
                this.hscrollBar.style[$.feat.cssPrefix + "Perspective"] = 1000;
                this.hscrollBar.style[$.feat.cssPrefix + "BackfaceVisibility"] = "hidden";
            }
        };

        jsScroller.prototype.scrollerMoveCSS = function (distanceToMove, time, timingFunction) {
            if (!time) time = 0;
            if (!timingFunction) timingFunction = "linear";
            time = numOnly(time);
            var self=this;

            if (this.el && this.el.style) {

                //do not touch the DOM if disabled
                if (this.eventsActive) {
                    if (this.androidFormsMode) {
                        this.el.style.marginTop = Math.round(distanceToMove.y) + "px";
                        this.el.style.marginLeft = Math.round(distanceToMove.x) + "px";
                    } else {
                        var opts={
                            x:distanceToMove.x,
                            y:distanceToMove.y,
                            duration:time,
                            easing:"easeOutSine"
                        };

                        if(self.initScrollProgress){
                            opts.update=function(pos){
                                $.trigger(self,"scroll",[pos]);
                                $.trigger($.touchLayer,"scroll",[pos]);
                            };
                        }
                        $(this.el).animate(opts).start();
                    }
                }
                // Position should be updated even when the scroller is disabled so we log the change
                this.logPos(distanceToMove.x, distanceToMove.y);
            }
        };
        jsScroller.prototype.logPos = function (x, y) {

            var size;
            if (!this.elementInfo) {
                size = this.getViewportSize();
            } else {
                size = {
                    h: this.elementInfo.bottomMargin,
                    w: this.elementInfo.rightMargin
                };
            }

            this.loggedPcentX = this.divide(x, (this.el.clientWidth - size.w));
            this.loggedPcentY = this.divide(y, (this.el.clientHeight - size.h));
            this.scrollTop = y;
            this.scrollLeft = x;
        };
        jsScroller.prototype.scrollbarMoveCSS = function (el, distanceToMove, time, timingFunction) {
            if (!time) time = 0;
            if (!timingFunction) timingFunction = "linear";

            if (el && el.style) {
                if (this.androidFormsMode) {
                    el.style.marginTop = Math.round(distanceToMove.y) + "px";
                    el.style.marginLeft = Math.round(distanceToMove.x) + "px";
                } else {
                    $(el).animate({x:distanceToMove.x,y:distanceToMove.y,duration:time,easing:"easeOutSine"}).start();
                }
            }
        };
        jsScroller.prototype.scrollTo = function (pos, time) {
            if (!time) time = 0;
            this.scrollerMoveCSS(pos, time);
        };
        jsScroller.prototype.scrollBy = function (pos, time) {
            var cssMatrix = this.getCSSMatrix(this.el);
            var startTop = numOnly(cssMatrix.f);
            var startLeft = numOnly(cssMatrix.e);
            this.scrollTo({
                y: startTop - pos.y,
                x: startLeft - pos.x
            }, time);
        };
        jsScroller.prototype.scrollToBottom = function (time) {
            this.scrollTo({
                y: -1 * (this.el.clientHeight - this.container.clientHeight),
                x: 0
            }, time);
        };
        jsScroller.prototype.scrollToTop = function (time) {
            this.scrollTo({
                x: 0,
                y: 0
            }, time);
        };
        return scroller;
    })();
})(af);/**
 * copyright: 2011 Intel
 * description:  This script will replace all drop downs with friendly select controls.  Users can still interact
 * with the old drop down box as normal with javascript, and this will be reflected
 */

 /* global af*/
 /* global numOnly*/
(function($) {
    /*jshint camelcase: false,
    validthis:true
    */
    "use strict";
    function updateOption(prop, oldValue, newValue) {
        if (newValue === true) {
            if (!this.getAttribute("multiple"))
                $.selectBox.updateMaskValue(this.parentNode.id, this.text, this.value);
            this.parentNode.value = this.value;
        }
        return newValue;
    }

    function updateIndex(prop, oldValue, newValue) {
        if (this.options[newValue]) {
            if (!this.getAttribute("multiple"))
                $.selectBox.updateMaskValue(this.linker, this.options[newValue].value, this.options[newValue].text);
            this.value = this.options[newValue].value;
        }
        return newValue;
    }

    function destroy(e) {
        var el = e.target;
        $(el.linker).remove();
        delete el.linker;
        e.stopPropagation();
    }
    $.selectBox = {
        scroller: null,
        currLinker: null,
        getOldSelects: function(elID) {
            if (!$.os.android || $.os.androidICS) return;
            if (!$.fn.scroller) {
                window.alert("This library requires af.scroller");
                return;
            }
            var container = elID && document.getElementById(elID) ? document.getElementById(elID) : document;
            if (!container) {
                window.alert("Could not find container element for af.selectBox " + elID);
                return;
            }
            var sels = container.getElementsByTagName("select");
            var that = this;
            for (var i = 0; i < sels.length; i++) {

                var el = sels[i];
                el.style.display = "none";
                var fixer = $.create("div", {
                    className: "afFakeSelect"
                });
                fixer.get(0).linker = sels[i];
                el.linker = fixer.get(0);
                fixer.insertAfter(sels[i]);

                el.watch("selectedIndex", updateIndex);
                for (var j = 0; j < el.options.length; j++) {
                    var currInd = j;
                    el.options[j].watch("selected", updateOption);
                    if (el.options[j].selected)
                        fixer.html(el.options[j].text);
                }
                $(el).one("destroy", destroy);
            }
            that.createHtml();
        },
        updateDropdown: function(el) {
            if (!el) return;
            for (var j = 0; j < el.options.length; j++) {
                if (el.options[j].selected) el.linker.innerHTML = el.options[j].text;
            }
            el = null;
        },
        initDropDown: function(el) {

            var that = this;
            if (el.disabled) return;
            if (!el || !el.options || el.options.length === 0) return;
            var htmlTemplate = "";
            var foundInd = 0;
            var $scr = $("#afSelectBoxfix");
            $scr.html("<ul></ul>");
            var $list = $scr.find("ul");
            for (var j = 0; j < el.options.length; j++) {
                var currInd = j;
                el.options[j].watch("selected", updateOption);
                var checked = (el.options[j].selected) ? "selected" : "";
                if (checked) foundInd = j + 1;
                var row = $.create("li", {
                    html: el.options[j].text,
                    className: checked
                });
                row.data("ind", j);
                $list.append(row);
            }
            $("#afModalMask").show();
            try {
                if (foundInd > 0 && el.getAttribute("multiple") !== "multiple") {
                    var scrollToPos = 0;
                    var scrollThreshold = numOnly($list.find("li").computedStyle("height"));
                    var theHeight = numOnly($("#afSelectBoxContainer").computedStyle("height"));
                    if (foundInd * scrollThreshold >= theHeight) scrollToPos = (foundInd - 1) * -scrollThreshold;
                    this.scroller.scrollTo({
                        x: 0,
                        y: scrollToPos
                    });
                }
            } catch (e) {
                console.log("error init dropdown" + e);
            }

            var selClose = $("#afSelectClose").css("display") === "block" ? numOnly($("#afSelectClose").height()) : 0;
            $("#afSelectWrapper").height((numOnly($("#afSelectBoxContainer").height()) - selClose) + "px");

        },
        updateMaskValue: function(linker, value, val2) {

            $(linker).html(val2);
        },
        setDropDownValue: function(el, value) {

            if (!el) return;
            var $el = $(el);

            value = parseInt(value, 10);
            if (!el.getAttribute("multiple")) {
                el.selectedIndex = value;
                $el.find("option").prop("selected", false);
                $el.find("option:nth-child(" + (value + 1) + ")").prop("selected", true);
                this.scroller.scrollTo({
                    x: 0,
                    y: 0
                });
                this.hideDropDown();
            } else {
                //multi select

                // var myEl = $el.find("option:nth-child(" + (value + 1) + ")").get(0);
                var myList = $("#afSelectBoxfix li:nth-child(" + (value + 1) + ")");
                if (myList.hasClass("selected")) {
                    myList.removeClass("selected");
                    //  myEl.selected = false;
                } else {
                    myList.addClass("selected");
                    //  myEl.selected = true;
                }
            }
            $(el).trigger("change");
            el = null;
        },
        hideDropDown: function() {
            $("#afModalMask").hide();
            $("#afSelectBoxfix").html("");
        },
        createHtml: function() {
            var that = this;
            if (document.getElementById("afSelectBoxfix")) {
                return;
            }
            $(document).ready(function() {
                $(document).on("click", ".afFakeSelect", function(e) {
                    if (this.linker.disabled)
                        return;
                    that.currLinker = this;

                    if (this.linker.getAttribute("multiple") === "multiple")
                        $("#afSelectClose").show();
                    else
                        $("#afSelectClose").hide();
                    that.initDropDown(this.linker);

                });
                var container = $.create("div", {
                    id: "afSelectBoxContainer"
                });
                var modalDiv = $.create("div", {
                    id: "afSelectBoxfix"
                });
                var modalWrapper = $.create("div", {
                    id: "afSelectWrapper"
                });
                modalWrapper.css("position", "relative");
                modalWrapper.append(modalDiv);
                var closeDiv = $.create("div", {
                    id: "afSelectClose",
                    html: "<a id='afSelectDone'>Done</a> <a id='afSelectCancel'>Cancel</a>"
                });

                var modalMask = $.create("div", {
                    id:"afModalMask"
                });

                var $afui = $("#afui");
                container.prepend(closeDiv).append(modalWrapper);
                modalMask.append(container);
                if ($afui.length > 0) $afui.append(modalMask);
                else document.body.appendChild(modalMask.get(0));
                that.scroller = $.query("#afSelectBoxfix").scroller({
                    scroller: false,
                    verticalScroll: true,
                    vScrollCSS: "afselectscrollBarV",
                    hasParent:true
                });

                $("#afModalMask").on("click",function(e){
                    var $e=$(e.target);
                    if($e.closest("#afSelectBoxContainer").length === 0)
                        that.hideDropDown();
                });

                $("#afSelectBoxfix").on("click", "li", function(e) {
                    var $el = $(e.target);
                    that.setDropDownValue(that.currLinker.linker, $el.data("ind"));
                });
                $("#afSelectBoxContainer").on("click", "a", function(e) {
                    if (e.target.id === "afSelectCancel")
                        return that.hideDropDown();
                    var $sel = $(that.currLinker.linker);
                    $sel.find("option").prop("selected", false);

                    $("#afSelectBoxfix li").each(function(el) {
                        var $el = $(this);
                        if ($el.hasClass("selected")) {
                            var ind = parseInt($el.data("ind"), 10);
                            $sel.find("option:nth-child(" + (ind + 1) + ")").prop("selected", true);
                            that.currLinker.innerHTML = $el.html();
                        }
                    });

                    that.hideDropDown();
                    e.stopPropagation();
                    e.preventDefault();
                    return false;
                });

            });
        }
    };

    //The following is based off Eli Grey's shim
    //https://gist.github.com/384583
    //We use HTMLElement to not cause problems with other objects
    if (!HTMLElement.prototype.watch) {
        HTMLElement.prototype.watch = function(prop, handler) {
            var oldval = this[prop],
                newval = oldval,
                getter = function() {
                    return newval;
                },
                setter = function(val) {
                    oldval = newval;
                    newval = handler.call(this, prop, oldval, val);
                    return newval;
                };
            if (delete this[prop]) { // can't watch constants
                if (HTMLElement.defineProperty) { // ECMAScript 5
                    HTMLElement.defineProperty(this, prop, {
                        get: getter,
                        set: setter,
                        enumerable: false,
                        configurable: true
                    });
                } else if (HTMLElement.prototype.__defineGetter__ && HTMLElement.prototype.__defineSetter__) { // legacy
                    HTMLElement.prototype.__defineGetter__.call(this, prop, getter);
                    HTMLElement.prototype.__defineSetter__.call(this, prop, setter);
                }
            }
        };
    }
    if (!HTMLElement.prototype.unwatch) {
        HTMLElement.prototype.unwatch = function(prop) {
            var val = this[prop];
            delete this[prop]; // remove accessors
            this[prop] = val;
        };
    }
})(af);
//Touch events are based from zepto/touch.js
//Many modifications and enhancements made
/**
 * Simply include this in your project to get access to the following touch events on an element
 * tap
 * doubleTap
 * singleTap
 * longPress
 * swipe
 * swipeLeft
 * swipeRight
 * swipeUp
 * swipeDown
 */
/* global af*/
(function($) {
    "use strict";
    var touch = {}, touchTimeout;

    function parentIfText(node) {
        return "tagName" in node ? node : node.parentNode;
    }

    function swipeDirection(x1, x2, y1, y2) {
        var xDelta = Math.abs(x1 - x2), yDelta = Math.abs(y1 - y2);
        if (xDelta >= yDelta) {
            return (x1 - x2 > 0 ? "Left" : "Right");
        } else {
            return (y1 - y2 > 0 ? "Up" : "Down");
        }
    }

    var longTapDelay = 750;
    function longTap() {
        if (touch.last && (Date.now() - touch.last >= longTapDelay)) {
            touch.el.trigger("longTap");
            touch = {};
        }
    }
    var longTapTimer;
    $(document).ready(function() {
        var prevEl;
        $(document.body).bind("touchstart", function(e) {
            if (e.originalEvent)
                e = e.originalEvent;
            if (!e.touches || e.touches.length === 0) return;
            var now = Date.now(), delta = now - (touch.last || now);
            if (!e.touches || e.touches.length === 0) return;
            touch.el = $(parentIfText(e.touches[0].target));
            touchTimeout && clearTimeout(touchTimeout);
            touch.x1 = e.touches[0].pageX;
            touch.y1 = e.touches[0].pageY;
            touch.x2 = touch.y2 = 0;
            if (delta > 0 && delta <= 250)
                touch.isDoubleTap = true;
            touch.last = now;
            longTapTimer = setTimeout(longTap, longTapDelay);

            if ($.ui.useAutoPressed && !touch.el.data("ignore-pressed"))
                touch.el.addClass("pressed");
            if (prevEl && $.ui.useAutoPressed && !prevEl.data("ignore-pressed") && prevEl[0] !== touch.el[0])
                prevEl.removeClass("pressed");
            prevEl = touch.el;
        }).bind("touchmove", function(e) {
            if(e.originalEvent)
                e = e.originalEvent;
            touch.x2 = e.touches[0].pageX;
            touch.y2 = e.touches[0].pageY;
            clearTimeout(longTapTimer);
        }).bind("touchend", function(e) {
            if(e.originalEvent)
                e=e.originalEvent;
            if (!touch.el)
                return;
            if ($.ui.useAutoPressed && !touch.el.data("ignore-pressed"))
                touch.el.removeClass("pressed");
            if (touch.isDoubleTap) {
                touch.el.trigger("doubleTap");
                touch = {};
            } else if (touch.x2 > 0 || touch.y2 > 0) {
                (Math.abs(touch.x1 - touch.x2) > 30 || Math.abs(touch.y1 - touch.y2) > 30) &&
                touch.el.trigger("swipe") &&
                touch.el.trigger("swipe" + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)));
                touch.x1 = touch.x2 = touch.y1 = touch.y2 = touch.last = 0;
            } else if ("last" in touch) {
                touch.el.trigger("tap");
                touchTimeout = setTimeout(function() {
                    touchTimeout = null;
                    if (touch.el)
                        touch.el.trigger("singleTap");
                    touch = {};
                }, 250);
            }
        }).bind("touchcancel", function() {
            if(touch.el && $.ui.useAutoPressed && !touch.el.data("ignore-pressed"))
                touch.el.removeClass("pressed");
            touch = {};
            clearTimeout(longTapTimer);
        });
    });

    ["swipe", "swipeLeft", "swipeRight", "swipeUp", "swipeDown", "doubleTap", "tap", "singleTap", "longTap"].forEach(function(m) {
        $.fn[m] = function(callback) {
            return this.bind(m, callback);
        };
    });
})(af);//TouchLayer contributed by Carlos Ouro @ Badoo
//un-authoritive layer between touches and actions on the DOM
//(un-authoritive: listeners do not require useCapture)
//handles overlooking JS and native scrolling, panning,
//no delay on click, edit mode focus, preventing defaults, resizing content,
//enter/exit edit mode (keyboard on screen), prevent clicks on momentum, etc
//It can be used independently in other apps but it is required by jqUi
//Object Events
//Enter Edit Mode:
//pre-enter-edit - when a possible enter-edit is actioned - happens before actual click or focus (android can still reposition elements and event is actioned)
//cancel-enter-edit - when a pre-enter-edit does not result in a enter-edit
//enter-edit - on a enter edit mode focus
//enter-edit-reshape - focus resized/scrolled event
//in-edit-reshape - resized/scrolled event when a different element is focused
//Exit Edit Mode
//exit-edit - on blur
//exit-edit-reshape - blur resized/scrolled event
//Other
//orientationchange-reshape - resize event due to an orientationchange action
//reshape - window.resize/window.scroll event (ignores onfocus "shaking") - general reshape notice
/* global numOnly*/
/* jshint camelcase:false */
(function($) {
    "use strict";
    //singleton
    $.touchLayer = function(el) {
        //  if($.os.desktop||!$.os.webkit) return;
        $.touchLayer = new touchLayer(el);
        return $.touchLayer;
    };
    //configuration stuff
    var inputElements = ["input", "select", "textarea"];
    var autoBlurInputTypes = ["button", "radio", "checkbox", "range", "date"];
    var requiresJSFocus = $.os.ios; //devices which require .focus() on dynamic click events
    var verySensitiveTouch = $.os.blackberry; //devices which have a very sensitive touch and touchmove is easily fired even on simple taps
    var inputElementRequiresNativeTap = $.os.blackberry||$.os.fennec || ($.os.android && !$.os.chrome); //devices which require the touchstart event to bleed through in order to actually fire the click on select elements
//    var selectElementRequiresNativeTap = $.os.blackberry||$.os.fennec || ($.os.android && !$.os.chrome); //devices which require the touchstart event to bleed through in order to actually fire the click on select elements
//    var focusScrolls = $.os.ios; //devices scrolling on focus instead of resizing
    var requirePanning = $.os.ios&&!$.os.ios7; //devices which require panning feature
    var addressBarError = 0.97; //max 3% error in position
    var maxHideTries = 2; //HideAdressBar does not retry more than 2 times (3 overall)
    var skipTouchEnd = false; //Fix iOS bug with alerts/confirms
    var cancelClick = false;

    function getTime() {
        var d = new Date();
        var n = d.getTime();
        return n;
    }
    var touchLayer = function(el) {
        this.clearTouchVars();
        el.addEventListener("touchstart", this, false);
        el.addEventListener("touchmove", this, false);
        el.addEventListener("touchend", this, false);
        el.addEventListener("click", this, false);
        el.addEventListener("focusin", this, false);
        document.addEventListener("scroll", this, false);
        window.addEventListener("resize", this, false);
        window.addEventListener("orientationchange", this, false);
        this.layer = el;
        //proxies
        this.scrollEndedProxy_ = $.proxy(this.scrollEnded, this);
        this.exitEditProxy_ = $.proxy(this.exitExit, this, []);
        this.launchFixUIProxy_ = $.proxy(this.launchFixUI, this);
        var that = this;
        this.scrollTimeoutExpireProxy_ = function() {
            that.scrollTimeout_ = null;
            that.scrollTimeoutEl_.addEventListener("scroll", that.scrollEndedProxy_, false);
        };
        this.retestAndFixUIProxy_ = function() {
            if ($.os.android && !$.os.chrome) that.layer.style.height = "100%";
            $.asap(that.testAndFixUI, that, arguments);
        };
        //iPhone double clicks workaround
        document.addEventListener("click", function(e) {

            if (cancelClick) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            if (e.clientX !== undefined && that.lastTouchStartX !== null) {
                if (2 > Math.abs(that.lastTouchStartX - e.clientX) && 2 > Math.abs(that.lastTouchStartY - e.clientY)) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        }, true);
        //js scrollers self binding
        $.bind(this, "scrollstart", function(el) {
            that.isScrolling = true;
            that.scrollingEl_ = el;
            if (!$.feat.nativeTouchScroll)
                that.scrollerIsScrolling = true;            
            that.fireEvent("UIEvents", "scrollstart", el, false, false);
        });
        $.bind(this, "scrollend", function(el) {
            that.isScrolling = false;
            if (!$.feat.nativeTouchScroll)
                that.scrollerIsScrolling = false;
            that.fireEvent("UIEvents", "scrollend", el, false, false);
        });
        //fix layer positioning
        this.hideAddressBar(0,1);
        this.launchFixUI(5); //try a lot to set page into place
    };

    touchLayer.prototype = {
        dX: 0,
        dY: 0,
        cX: 0,
        cY: 0,
        touchStartX: null,
        touchStartY: null,
        //elements
        layer: null,
        scrollingEl_: null,
        scrollTimeoutEl_: null,
        //handles / proxies
        scrollTimeout_: null,
        reshapeTimeout_: null,
        scrollEndedProxy_: null,
        exitEditProxy_: null,
        launchFixUIProxy_: null,
        reHideAddressBarTimeout_: null,
        retestAndFixUIProxy_: null,
        //options
        panElementId: "header",
        //public locks
        blockClicks: false,
        //private locks
        allowDocumentScroll_: false,
        ignoreNextResize_: false,
        blockPossibleClick_: false,
        //status vars
        isScrolling: false,
        isScrollingVertical_: false,
        wasPanning_: false,
        isPanning_: false,
        isFocused_: false,
        justBlurred_: false,
        requiresNativeTap: false,
        holdingReshapeType_: null,
        trackingClick: false,
        scrollerIsScrolling: false,

        handleEvent: function(e) {
            switch (e.type) {
            case "touchstart":
                this.onTouchStart(e);
                break;
            case "touchmove":
                this.onTouchMove(e);
                break;
            case "touchend":
                this.onTouchEnd(e);
                break;
            case "click":
                this.onClick(e);
                break;
            case "blur":
                this.onBlur(e);
                break;
            case "scroll":
                this.onScroll(e);
                break;
            case "orientationchange":
                this.onOrientationChange(e);
                break;
            case "resize":
                this.onResize(e);
                break;
            case "focusin":
                this.onFocusIn(e);
                break;
            }
        },
        launchFixUI: function(maxTries) {
            //this.log("launchFixUI");
            if (!maxTries) maxTries = maxHideTries;
            if (this.reHideAddressBarTimeout_ === null) return this.testAndFixUI(0, maxTries);
        },
        resetFixUI: function() {
            //this.log("resetFixUI");
            if (this.reHideAddressBarTimeout_) clearTimeout(this.reHideAddressBarTimeout_);
            this.reHideAddressBarTimeout_ = null;
        },
        testAndFixUI: function(retry, maxTries) {
            //this.log("testAndFixUI");
            //for ios or if the heights are incompatible (and not close)
            var refH = this.getReferenceHeight();
            var curH = this.getCurrentHeight();
            if ((refH !== curH && !(curH * addressBarError < refH && refH * addressBarError < curH))) {
                //panic! page is out of place!
                this.hideAddressBar(retry, maxTries);
                return true;
            }
            if ($.os.android) this.resetFixUI();
            return false;
        },
        hideAddressBar: function(retry, maxTries) {
            if($.ui && $.ui.isIntel) return;
            if (retry >= maxTries) {
                this.resetFixUI();
                return; //avoid a possible loop
            }

            //this.log("hiding address bar");
            if ($.os.desktop || $.os.kindle) {
                this.layer.style.height = "100%";
            } else if ($.os.android) {
                //on some phones its immediate
                window.scrollTo(1, 1);
                this.layer.style.height = this.isFocused_ || window.innerHeight >= window.outerHeight ? (window.innerHeight) + "px" : (window.outerHeight) + "px";
                //sometimes android devices are stubborn
                var that = this;
                //re-test in a bit (some androids (SII, Nexus S, etc) fail to resize on first try)
                var nextTry = retry + 1;
                this.reHideAddressBarTimeout_ = setTimeout(that.retestAndFixUIProxy_, 250 * nextTry, nextTry, maxTries); //each fix is progressibily longer (slower phones fix)
            } else if (!this.isFocused_) {
                document.documentElement.style.height = "5000px";
                window.scrollTo(0, 0);
                document.documentElement.style.height = window.innerHeight + "px";
                this.layer.style.height = window.innerHeight + "px";
            }
        },
        getReferenceHeight: function() {
            //the height the page should be at
            return window.innerHeight;
        },
        getCurrentHeight: function() {
            //the height the page really is at
            if ($.os.android) {
                return window.innerHeight;
            } else
                return numOnly(document.documentElement.style.height); //TODO: works well on iPhone, test BB
        },
        onOrientationChange: function(e) {
            //this.log("orientationchange");
            //if a resize already happened, fire the orientationchange
            var self=this;
            var didBlur=false;
            if(this.focusedElement){
                didBlur=true;
                this.focusedElement.blur();
            }
            if (!this.holdingReshapeType_ && this.reshapeTimeout_) {
                this.fireReshapeEvent("orientationchange");
            } else this.previewReshapeEvent("orientationchange");
            if($.os.android && $.os.chrome) {
                this.layer.style.height = "100%";
                var time = didBlur ? 600 : 0;
                setTimeout(function(){
                    self.hideAddressBar(0,1);
                }, time);
            }
        },
        onResize: function(e) {
            //avoid infinite loop on iPhone
            if (this.ignoreNextResize_) {
                //this.log("ignored resize");
                this.ignoreNextResize_ = false;
                return;
            }
            //this.logInfo("resize");
            if (this.launchFixUI()) {
                this.reshapeAction();
            }
        },
        onClick: function(e) {
            //handle forms
            var tag = e.target && e.target.tagName !== undefined ? e.target.tagName.toLowerCase() : "";

            //this.log("click on "+tag);
            if (inputElements.indexOf(tag) !== -1 && (!this.isFocused_ || e.target !== (this.focusedElement))) {
                var type = e.target && e.target.type !== undefined ? e.target.type.toLowerCase() : "";
                var autoBlur = autoBlurInputTypes.indexOf(type) !== -1;

                //focus
                if (!autoBlur) {
                    //remove previous blur event if this keeps focus
                    if (this.isFocused_) {
                        this.focusedElement.removeEventListener("blur", this, false);
                    }
                    this.focusedElement = e.target;
                    this.focusedElement.addEventListener("blur", this, false);
                    //android bug workaround for UI
                    if (!this.isFocused_ && !this.justBlurred_) {
                        //this.log("enter edit mode");
                        $.trigger(this, "enter-edit", [e.target]);
                        //fire / preview reshape event
                        if ($.os.ios) {
                            var that = this;
                            setTimeout(function() {
                                that.fireReshapeEvent("enter-edit");
                            }, 300); //TODO: get accurate reading from window scrolling motion and get rid of timeout
                        } else this.previewReshapeEvent("enter-edit");
                    }
                    this.isFocused_ = true;
                } else {
                    this.isFocused_ = false;
                }
                this.justBlurred_ = false;
                this.allowDocumentScroll_ = true;

                //fire focus action
                if (requiresJSFocus) {
                    e.target.focus();
                }

                //BB10 needs to be preventDefault on touchstart and thus need manual blur on click
            } else if ($.os.blackberry10 && this.isFocused_) {
                this.focusedElement.blur();
            }
        },
        previewReshapeEvent: function(ev) {
            //a reshape event of this type should fire within the next 750 ms, otherwise fire it yourself
            var that = this;
            this.reshapeTimeout_ = setTimeout(function() {
                that.fireReshapeEvent(ev);
                that.reshapeTimeout_ = null;
                that.holdingReshapeType_ = null;
            }, 750);
            this.holdingReshapeType_ = ev;
        },
        fireReshapeEvent: function(ev) {
            //this.log(ev?ev+"-reshape":"unknown-reshape");
            $.trigger(this, "reshape"); //trigger a general reshape notice
            $.trigger(this, ev ? ev + "-reshape" : "unknown-reshape"); //trigger the specific reshape
        },
        reshapeAction: function() {
            if (this.reshapeTimeout_) {
                //we have a specific reshape event waiting for a reshapeAction, fire it now
                clearTimeout(this.reshapeTimeout_);
                this.fireReshapeEvent(this.holdingReshapeType_);
                this.holdingReshapeType_ = null;
                this.reshapeTimeout_ = null;
            } else this.previewReshapeEvent();
        },
        onFocusIn: function(e) {
            if (!this.isFocused_)
                this.onClick(e);
        },
        onBlur: function(e) {
            if ($.os.android && e.target === window) return; //ignore window blurs

            this.isFocused_ = false;
            //just in case...
            if (this.focusedElement) this.focusedElement.removeEventListener("blur", this, false);
            this.focusedElement = null;
            //make sure this blur is not followed by another focus
            this.justBlurred_ = true;
            $.asap(this.exitEditProxy_, this, [e.target]);
        },
        exitExit: function(el) {
            this.justBlurred_ = false;
            if (!this.isFocused_) {
                //this.log("exit edit mode");
                $.trigger(this, "exit-edit", [el]);
                //do not allow scroll anymore
                this.allowDocumentScroll_ = false;
                //fire / preview reshape event
                if ($.os.ios) {
                    var that = this;
                    setTimeout(function() {
                        that.fireReshapeEvent("exit-edit");
                    }, 300); //TODO: get accurate reading from window scrolling motion and get rid of timeout
                } else this.previewReshapeEvent("exit-edit");
            }
        },
        onScroll: function(e) {
            //this.log("document scroll detected "+document.body.scrollTop);
            if (!this.allowDocumentScroll_ && !this.isPanning_ && e.target === document) {
                this.allowDocumentScroll_ = true;
                if (this.wasPanning_) {
                    this.wasPanning_ = false;
                    //give it a couple of seconds
                    setTimeout(this.launchFixUIProxy_, 2000, [maxHideTries]);
                } else {
                    //this.log("scroll forced page into place");
                    this.launchFixUI();
                }
            }
        },

        onTouchStart: function(e) {
            //setup initial touch position            
            this.dX = e.touches[0].pageX;
            this.dY = e.touches[0].pageY;
            this.lastTimestamp = e.timeStamp;
            this.lastTouchStartX = this.lastTouchStartY = null;

            if ($.os.ios) {

                if (skipTouchEnd === e.touches[0].identifier) {
                    cancelClick = true;
                    e.preventDefault();
                    skipTouchEnd=false;
                    return false;
                }
                skipTouchEnd = e.touches[0].identifier;
                cancelClick = false;
            }
            if (this.scrollerIsScrolling) {
                this.moved = true;
                this.scrollerIsScrolling = false;
                e.preventDefault();

                return false;
            }
            this.trackingClick = true;
            //check dom if necessary
            if (requirePanning || $.feat.nativeTouchScroll) this.checkDOMTree(e.target, this.layer);
            //scrollend check
            if (this.isScrolling) {
                //remove prev timeout
                if (this.scrollTimeout_ !== null) {
                    clearTimeout(this.scrollTimeout_);
                    this.scrollTimeout_ = null;
                    //different element, trigger scrollend anyway
                    if (this.scrollTimeoutEl_ !== this.scrollingEl_) this.scrollEnded(false);
                    else this.blockPossibleClick_ = true;
                    //check if event was already set
                } else if (this.scrollTimeoutEl_) {
                    //trigger
                    this.scrollEnded(true);
                    this.blockPossibleClick_ = true;
                }
            }

            // We allow forcing native tap in android devices (required in special cases)
            var forceNativeTap = ($.os.android && e && e.target && e.target.getAttribute && e.target.getAttribute("data-touchlayer") === "ignore");

            //if on edit mode, allow all native touches
            //(BB10 must still be prevented, always clicks even after move)
            if (forceNativeTap || (this.isFocused_ && !$.os.blackberry10)) {
                this.requiresNativeTap = true;
                this.allowDocumentScroll_ = true;

                //some stupid phones require a native tap in order for the native input elements to work
            } else if (inputElementRequiresNativeTap && e.target && e.target.tagName !== undefined) {
                var tag = e.target.tagName.toLowerCase();
                if (inputElements.indexOf(tag) !== -1) {
                    //notify scrollers (android forms bug), except for selects
                    //if(tag != "select") $.trigger(this, "pre-enter-edit", [e.target]);
                    this.requiresNativeTap = true;
                }
            } else if (e.target && e.target.tagName !== undefined && e.target.tagName.toLowerCase() === "input" && e.target.type === "range") {
                this.requiresNativeTap = true;
            }

            //do not prevent default on chrome.  Chrome >=33 has issues with this
            if($.os.chrome||$.os.fennec) return;
            //prevent default if possible

            if (!this.isPanning_ && !this.requiresNativeTap) {
                if ((this.isScrolling && !$.feat.nativeTouchScroll) || (!this.isScrolling))
                    e.preventDefault();
                //demand vertical scroll (don"t let it pan the page)
            } else if (this.isScrollingVertical_) {
                this.demandVerticalScroll();
            }
        },
        demandVerticalScroll: function() {
            //if at top or bottom adjust scroll
            var atTop = this.scrollingEl_.scrollTop <= 0;
            if (atTop) {
                //this.log("adjusting scrollTop to 1");
                this.scrollingEl_.scrollTop = 1;
            } else {
                var scrollHeight = this.scrollingEl_.scrollTop + this.scrollingEl_.clientHeight;
                var atBottom = scrollHeight >= this.scrollingEl_.scrollHeight;
                if (atBottom) {
                    //this.log("adjusting scrollTop to max-1");
                    this.scrollingEl_.scrollTop = this.scrollingEl_.scrollHeight - this.scrollingEl_.clientHeight - 1;
                }
            }
        },

        //set rules here to ignore scrolling check on these elements
        //consider forcing user to use scroller object to assess these... might be causing bugs
        ignoreScrolling: function(el) {
            if (el.scrollWidth === undefined || el.clientWidth === undefined) return true;
            if (el.scrollHeight === undefined || el.clientHeight === undefined) return true;
            return false;
        },

        allowsVerticalScroll: function(el, styles) {
            var overflowY = styles.overflowY;
            if (overflowY === "scroll") return true;
            if (overflowY === "auto" && el.scrollHeight > el.clientHeight) return true;
            return false;
        },
        allowsHorizontalScroll: function(el, styles) {
            var overflowX = styles.overflowX;
            if (overflowX === "scroll") return true;
            if (overflowX === "auto" && el.scrollWidth > el.clientWidth) return true;
            return false;
        },

        //check if pan or native scroll is possible
        checkDOMTree: function(el, parentTarget) {

            //check panning
            //temporarily disabled for android - click vs panning issues
            if (requirePanning && this.panElementId === el.id) {
                this.isPanning_ = true;
                return;
            }

            //check native scroll
            if ($.feat.nativeTouchScroll) {

                //prevent errors
                if (this.ignoreScrolling(el)) {
                    return;
                }

                //check if vertical or hor scroll are allowed
                var styles = window.getComputedStyle(el);
                if (this.allowsVerticalScroll(el, styles)) {
                    this.isScrollingVertical_ = true;
                    this.scrollingEl_ = el;
                    this.isScrolling = true;
                    return;
                } else if (this.allowsHorizontalScroll(el, styles)) {
                    this.isScrollingVertical_ = false;
                    this.scrollingEl_ = null;
                    this.isScrolling = true;
                }
            }
            //check recursive up to top element
            var isTarget = (el === parentTarget);
            if (!isTarget && el.parentNode) this.checkDOMTree(el.parentNode, parentTarget);
        },
        //scroll finish detectors
        scrollEnded: function(e) {
            //this.log("scrollEnded");
            if (this.scrollTimeoutEl_ === null) { return; }
            if (e) this.scrollTimeoutEl_.removeEventListener("scroll", this.scrollEndedProxy_, false);
            this.fireEvent("UIEvents", "scrollend", this.scrollTimeoutEl_, false, false);
            this.scrollTimeoutEl_ = null;
        },

        onTouchMove: function(e) {
            //set it as moved
            var wasMoving = this.moved;
            this.moved = true;
            //very sensitive devices check
            if (verySensitiveTouch) {
                this.cY = e.touches[0].pageY - this.dY;
                this.cX = e.touches[0].pageX - this.dX;
            }
            //panning check
            if (this.isPanning_) {
                return;
            }
            //native scroll (for scrollend)
            if (this.isScrolling) {

                if (!wasMoving) {
                    //this.log("scrollstart");
                    this.fireEvent("UIEvents", "scrollstart", this.scrollingEl_, false, false);
                }
                //if(this.isScrollingVertical_) {
                this.speedY = (this.lastY - e.touches[0].pageY) / (e.timeStamp - this.lastTimestamp);
                this.lastY = e.touches[0].pageY;
                this.lastX = e.touches[0].pageX;
                this.lastTimestamp = e.timeStamp;
                //}
            }
            //non-native scroll devices

            if ((!$.os.blackberry10)) {
                //legacy stuff for old browsers
                if (!this.isScrolling || !$.feat.nativeTouchScroll)
                    e.preventDefault();
                return;
            }
            //e.stopImmediatPropegation();
            //e.stopPropagation();
        },

        onTouchEnd: function(e) {

            //double check moved for sensitive devices)
            var itMoved = this.moved;
            if (verySensitiveTouch) {
                itMoved = itMoved && !(Math.abs(this.cX) < 10 && Math.abs(this.cY) < 10);
            }

            //don't allow document scroll unless a specific click demands it further ahead
            if (!$.os.ios || !this.requiresNativeTap) this.allowDocumentScroll_ = false;

            //panning action
            if (this.isPanning_ && itMoved) {
                //wait 2 secs and cancel
                this.wasPanning_ = true;

                //a generated click
            } else if (!itMoved && !this.requiresNativeTap) {
                this.scrollerIsScrolling = false;
                if (!this.trackingClick) {
                    return;
                }
                //NOTE: on android if touchstart is not preventDefault(), click will fire even if touchend is prevented
                //this is one of the reasons why scrolling and panning can not be nice and native like on iPhone
                e.preventDefault();

                //fire click
                if (!this.blockClicks && !this.blockPossibleClick_) {
                    var theTarget = e.target;
                    var changedTouches = e.changedTouches ? e.changedTouches[0] : e.touches[0];
                    if (theTarget.nodeType === 3) theTarget = theTarget.parentNode;
                    this.fireEvent("Event", "click", theTarget, true, e.mouseToTouch, changedTouches[0]);
                    this.lastTouchStartX = this.dX;
                    this.lastTouchStartY = this.dY;
                }

            } else if (itMoved) {
                //setup scrollend stuff
                if (this.isScrolling) {
                    this.scrollTimeoutEl_ = this.scrollingEl_;
                    if (Math.abs(this.speedY) < 0.01) {
                        //fire scrollend immediatly
                        //this.log(" scrollend immediately "+this.speedY);
                        this.scrollEnded(false);
                    } else {
                        //wait for scroll event
                        //this.log($.debug.since()+" setting scroll timeout "+this.speedY);
                        this.scrollTimeout_ = setTimeout(this.scrollTimeoutExpireProxy_, 30);
                    }
                }
                //trigger cancel-enter-edit on inputs
                if (this.requiresNativeTap) {
                    if (!this.isFocused_) $.trigger(this, "cancel-enter-edit", [e.target]);
                }
            }
            if($.os.blackberry10) {
                this.lastTouchStartX = this.dX;
                this.lastTouchStartY = this.dY;
            }

            this.clearTouchVars();
        },

        clearTouchVars: function() {
            //this.log("clearing touchVars");
            this.speedY = this.lastY = this.cY = this.cX = this.dX = this.dY = 0;
            this.moved = false;
            this.isPanning_ = false;
            this.isScrolling = false;
            this.isScrollingVertical_ = false;
            this.requiresNativeTap = false;
            this.blockPossibleClick_ = false;
            this.trackingClick = false;
        },

        fireEvent: function(eventType, eventName, target, bubbles, mouseToTouch, data) {
            //this.log("Firing event "+eventName);
            //create the event and set the options
            var theEvent = document.createEvent(eventType);
            theEvent.initEvent(eventName, bubbles, true);
            //theEvent.target = target;
            if (data) {
                $.each(data, function(key, val) {
                    theEvent.key = val;
                });
            }
            //af.DesktopBrowsers flag
            if (mouseToTouch) theEvent.mouseToTouch = true;
            target.dispatchEvent(theEvent);
        }
    };

})(af);/**
 * af.popup - a popup/alert library for html5 mobile apps
 * copyright Indiepath 2011 - Tim Fisher
 * Modifications/enhancements by Intel for App Framework
 *
 */
 
/* EXAMPLE
 $.query("body").popup({
        title:"Alert! Alert!",
        message:"This is a test of the emergency alert system!! Don't PANIC!",
        cancelText:"Cancel me",
        cancelCallback: function(){console.log("cancelled");},
        doneText:"I'm done!",
        doneCallback: function(){console.log("Done for!");},
        cancelOnly:false,
        doneClass:'button',
        cancelClass:'button',
        onShow:function(){console.log("showing popup");}
        autoCloseDone:true, //default is true will close the popup when done is clicked.
        suppressTitle:false //Do not show the title if set to true
  });

  You can programatically trigger a close by dispatching a "close" event to it.

 $.query("body").popup({title:'Alert',id:'myTestPopup'});
 $("#myTestPopup").trigger("close");

 */
/* global af */
(function ($) {
    "use strict";
    $.fn.popup = function (opts) {
        return new popup(this[0], opts);
    };
    var queue = [];
    var popup = (function () {
        var popup = function (containerEl, opts) {

            if (typeof containerEl === "string" || containerEl instanceof String) {
                this.container = document.getElementById(containerEl);
            } else {
                this.container = containerEl;
            }
            if (!this.container) {
                window.alert("Error finding container for popup " + containerEl);
                return;
            }

            try {
                if (typeof (opts) === "string" || typeof (opts) === "number")
                    opts = {
                        message: opts,
                        cancelOnly: "true",
                        cancelText: "OK"
                    };
                this.id = opts.id = opts.id || $.uuid(); //opts is passed by reference
                this.addCssClass = opts.addCssClass ? opts.addCssClass : "";
                this.title = opts.suppressTitle ? "" : (opts.title || "Alert");
                this.message = opts.message || "";
                this.cancelText = opts.cancelText || "Cancel";
                this.cancelCallback = opts.cancelCallback || function () {};
                this.cancelClass = opts.cancelClass || "button";
                this.doneText = opts.doneText || "Done";
                this.doneCallback = opts.doneCallback || function () {
                    // no action by default
                };
                this.doneClass = opts.doneClass || "button";
                this.cancelOnly = opts.cancelOnly || false;
                this.onShow = opts.onShow || function () {};
                this.autoCloseDone = opts.autoCloseDone !== undefined ? opts.autoCloseDone : true;

                queue.push(this);
                if (queue.length === 1)
                    this.show();
            } catch (e) {
                console.log("error adding popup " + e);
            }

        };

        popup.prototype = {
            id: null,
            addCssClass: null,
            title: null,
            message: null,
            cancelText: null,
            cancelCallback: null,
            cancelClass: null,
            doneText: null,
            doneCallback: null,
            doneClass: null,
            cancelOnly: false,
            onShow: null,
            autoCloseDone: true,
            supressTitle: false,
            show: function () {
                var self = this;
                var markup = "<div id='" + this.id + "' class='afPopup hidden "+ this.addCssClass + "'>"+
                            "<header>" + this.title + "</header>"+
                            "<div>" + this.message + "</div>"+
                            "<footer>"+
                                 "<a href='javascript:;' class='" + this.cancelClass + "' id='cancel'>" + this.cancelText + "</a>"+
                                 "<a href='javascript:;' class='" + this.doneClass + "' id='action'>" + this.doneText + "</a>"+
                                 "<div style='clear:both'></div>"+
                            "</footer>"+
                            "</div>";

                $(this.container).append($(markup));
                var $el = $.query("#" + this.id);
                $el.bind("close", function () {
                    self.hide();
                });

                if (this.cancelOnly) {
                    $el.find("A#action").hide();
                    $el.find("A#cancel").addClass("center");
                }
                $el.find("A").each(function () {
                    var button = $(this);
                    button.bind("click", function (e) {
                        if (button.attr("id") === "cancel") {
                            self.cancelCallback.call(self.cancelCallback, self);
                            self.hide();
                        } else {
                            self.doneCallback.call(self.doneCallback, self);
                            if (self.autoCloseDone)
                                self.hide();
                        }
                        e.preventDefault();
                    });
                });
                self.positionPopup();
                $.blockUI(0.5);

                $el.bind("orientationchange", function () {
                    self.positionPopup();
                });

                //force header/footer showing to fix CSS style bugs
                $el.find("header").show();
                $el.find("footer").show();
                setTimeout(function(){
                    $el.removeClass("hidden");
                    self.onShow(self);
                },50);
            },

            hide: function () {
                var self = this;
                $.query("#" + self.id).addClass("hidden");
                $.unblockUI();
                if(!$.os.ie&&!$.os.android){
                    setTimeout(function () {
                        self.remove();
                    }, 250);
                }
                else
                    self.remove();
            },

            remove: function () {
                var self = this;
                var $el = $.query("#" + self.id);
                $el.unbind("close");
                $el.find("BUTTON#action").unbind("click");
                $el.find("BUTTON#cancel").unbind("click");
                $el.unbind("orientationchange").remove();
                queue.splice(0, 1);
                if (queue.length > 0)
                    queue[0].show();
            },

            positionPopup: function () {
                var popup = $.query("#" + this.id);

                popup.css("top", ((window.innerHeight / 2.5) + window.pageYOffset) - (popup[0].clientHeight / 2) + "px");
                popup.css("left", (window.innerWidth / 2) - (popup[0].clientWidth / 2) + "px");
            }
        };

        return popup;
    })();
    var uiBlocked = false;
    $.blockUI = function (opacity) {
        if (uiBlocked)
            return;
        opacity = opacity ? " style='opacity:" + opacity + ";'" : "";
        $.query("BODY").prepend($("<div id='mask'" + opacity + "></div>"));
        $.query("BODY DIV#mask").bind("touchstart", function (e) {
            e.preventDefault();
        });
        $.query("BODY DIV#mask").bind("touchmove", function (e) {
            e.preventDefault();
        });
        uiBlocked = true;
    };

    $.unblockUI = function () {
        uiBlocked = false;
        $.query("BODY DIV#mask").unbind("touchstart");
        $.query("BODY DIV#mask").unbind("touchmove");
        $("BODY DIV#mask").remove();
    };

})(af);
