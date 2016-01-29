(function (jQuery) {

  var XrkAd = {
    token: null,
    element: null
  };

  XrkAd.$ = jQuery.noConflict('XrkAd');

  XrkAd.init = function(settings) {
    var token, element;
    XrkAd.token = settings.token, XrkAd.element = settings.element;

    if(!XrkAd.token || !XrkAd.element) return;
    XrkAd.api("http://ad.xrk.com/api/v1/ads/jsonp/image_simple", settings);
  };

  XrkAd.api = function(url, settings){
    XrkAd.$.ajax({
      type: "GET",
      url: url,
      data: settings,
      dataType: "jsonp",
      jsonpCallback: "serverApiCallBack"
    })
  }

  XrkAd.render = function(data){
    if (!data) return;
    var htmlTemplate, cssFiles, jsFiles;
    htmlTemplate = data.html.trim(), cssFiles = data.css, jsFiles = data.js;

    if ( cssFiles ){
      console.info("has css files ...")
      XrkAd.loadCss(cssFiles,  function() { XrkAd.renderTemplate(htmlTemplate) } );
    }else{
      console.info("without css files ... ")
      XrkAd.renderTemplate(htmlTemplate);
    }

    if( jsFiles ) {
      console.info("has js files ...")
      XrkAd.loadJs(jsFiles, function() { console.info("finish load js ....") });
    }
  };

  XrkAd.loadCss = function(url, callback){
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = url;

    var entry = document.getElementsByTagName("script")[0];
    entry.parentNode.insertBefore(link, entry);

    var _testEle = document.createElement("span");
    _testEle.id = "css-ready";
    entry.parentNode.insertBefore(_testEle, entry);

    (function() {
      var _testEle = document.getElementById("css-ready");

      if (window.getComputedStyle) {
        console.info("chrome check stylesheet ready .... ")
          value = document.defaultView
              .getComputedStyle(_testEle, null)
              .getPropertyValue('color');
      }
      else if (testElem.currentStyle) {
          value = _testEle.currentStyle['color'];
      }
    
      if (value && value === 'rgb(121, 121, 121)' || value === '#797979') {
          console.info("stylesheet load finish .... ")
          callback();
      } else {
          console.info("stylesheet loading  .... ")
          setTimeout(arguments.callee, 100);
      }
    })();
  };

  XrkAd.renderTemplate = function(_html){
    var node = document.querySelector(XrkAd.element);
    node.innerHTML = _html;
  };

  XrkAd.loadJs = function(url, callback){
    var script = document.createElement('script'); 
    script.type  = 'text/javascript';
    script.async = true;
    script.src   = url
    var entry = document.getElementsByTagName('script')[0];
    entry.parentNode.insertBefore(script, entry);

    if (script.addEventListener)
      script.addEventListener('load', callback, false);
    else {
      script.attachEvent('onreadystatechange', function() {
        if (/complete|loaded/.test(script.readyState)) callback();
      });
    }
  };


  window.XrkAd = XrkAd;
})(jQuery)


