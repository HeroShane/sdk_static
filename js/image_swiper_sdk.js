(function(){
  var XrkAd = {
    token: null,
    element: null
  };

  XrkAd.isStringType = function(data){
    Object.prototype.toString.call(data) == "[object String]";
  };

  XrkAd.isArrayType = function(data){
    Object.prototype.toString.call(data) == "[object Array]";
  };

  XrkAd.init = function(settings) {
    var token, element;
    XrkAd.token = settings.token, XrkAd.element = settings.element;

    if(!XrkAd.token || !XrkAd.element) return;
    XrkAd.api("http://ad.xrk.com/api/v1/ads/image_swiper", "GET");
  };

  XrkAd.dataRequest = function(url, method){
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr){
      xhr.open(method, url, true);
      xhr.setRequestHeader("XrkAd-Request-Token", XrkAd.token);
    }else{
      xhr = null;
    }
    return xhr;
  };

  XrkAd.api = function(url, method){
    var xhr = XrkAd.dataRequest(url, method);
    if(xhr){
      xhr.onreadystatechange = function(event) {
        if(xhr.readyState !== 4) return;
        if(xhr.status !== 200) {
          console.info("=======> fail ")
          console.info(xhr.responseText);
        }else{
          console.info("=======> success ")
          XrkAd.render(xhr.response)
        }
      };
      xhr.send();
    }
  };

  XrkAd.render = function(_data){
    if (!_data) return;
    var data = JSON.parse(_data);
    var htmlTemplate, cssFiles, jsFiles;
    htmlTemplate = data.html.trim(), cssFiles = data.css, jsFiles = data.js;
  
    if( cssFiles && XrkAd.isStringType(cssFiles) ){
      cssFiles = Array(cssFiles)
    }

    if( jsFiles && XrkAd.isStringType(jsFiles) ){
      jsFiles = Array(jsFiles)
    }

    if ( cssFiles && cssFiles.length > 0 ){
      console.info("has css files ...")
      XrkAd.loadCss(cssFiles,  function() { XrkAd.renderTemplate(htmlTemplate) } );
    }else{
      console.info("without css files ... ")
      XrkAd.renderTemplate(htmlTemplate);
    }

    if( jsFiles && cssFiles.length > 0 ) {
      console.info("has js files ...")
      XrkAd.loadJs(jsFiles, function() { console.info("finish load js ....") });
    }
  };

  XrkAd.loadCss = function(urls, callback){
    var len = urls.length;
    for(var i = 0; i < len; i++){
      console.info("load css  ======== >", urls[i]);
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.type = "text/css";
      link.href = urls[i];
      var entry = document.getElementsByTagName("head")[0];
      entry.appendChild(link)
      //entry.parentNode.insertBefore(link, entry);
    }
    callback();
  };

  XrkAd.loadJs = function(urls, callback){
    var len = urls.length, flag = false;
    var loadScript = function(){
      var url = urls.shift();
      if(!url) return; 
      console.info("load js script ======== >", url);
      var script = document.createElement('script'); 
      script.type  = 'text/javascript';
      script.async = true;
      script.src   = url
      var entry = document.getElementsByTagName('script')[0];
      entry.parentNode.insertBefore(script, entry);

      if (script.addEventListener)
        script.addEventListener('load', loadScript, false);
      else {
        script.attachEvent('onreadystatechange', function() {
          if (/complete|loaded/.test(script.readyState)) loadScript();
        });
      }
    };
    do {
      loadScript();
    } while( urls.length > 0 )
  };

  XrkAd.renderTemplate = function(_html){
    console.info("render template  ======== >");
    var node = document.querySelector(XrkAd.element);
    // var node = document.getElementsByTagName("body")[0]
    // node.innerHTML = _html;
    var template = document.createElement('template');
    template.innerHTML = _html;
    var fragment = template.content;
    node.parentNode.insertBefore(fragment, node);
  };

  window.XrkAd = XrkAd;

})()



