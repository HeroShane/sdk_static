;(function(){

  var XrkAd = window.XrkAd || {};

  XrkAd.aids = [], XrkAd._client_cookie_key = "_xrk_ad_client";

  XrkAd.init = function(params){
    XrkAd.generateAdCookies();
    XrkAd.preApi();
    if(XrkAd.aids.length <= 0) return;

    var url, version = params.version || "v2";
    url = "http://ad.xrk.com/api/"+ version +"/ads/imgae_multi";
    delete params.version;

    params["adIds"] = XrkAd.aids;
    XrkAd.api(url, params, function(response){
      XrkAd.render(response);
    });
  };

  XrkAd.preApi = function(){
    var len, adAreas = document.querySelectorAll("[data-ad-id]")
    len = adAreas.length;
    for(var i = 0; i < len; i++){
      var area = adAreas[i], aid = area.dataset.adId;
      if(aid && XrkAd.aids.indexOf(aid) == -1 ){
        XrkAd.aids.push(aid);
      }
    }
  };

  XrkAd.api= function(url, params, callback){
    var xhr = XrkAd.serverRequest(url);
    if(xhr){
      xhr.onreadystatechange = function(event) {
        if(xhr.readyState !== 4) return;
        if([200, 201].indexOf(xhr.status) == -1) {
          console.info(xhr.responseText);
        }else{
          XrkAd.render(JSON.parse(xhr.response))
        }
      };
      xhr.send();
    }
  };

  XrkAd.serverRequest = function(url){
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr){
      xhr.open("POST", url , true);
    } else if (typeof XDomainRequest != "undefined"){
      xhr = new XDomainRequest();
      xhr.open("POST", url);      
    } else{
      xhr = null;
    }
    return xhr;
  };

  XrkAd.render = function(data){
    if (!data) return;
    for(var key in data){
      var htmlTemplate, cssFiles, jsFiles;
      var value = data[key];
      htmlTemplate = value.html.trim(), cssFiles = value.css, jsFiles = value.js;
      XrkAd._adRender(key, htmlTemplate, cssFiles, jsFiles);      
    }
  };

  XrkAd._adRender = function(element, html, cssFiles, jsFiles){
    var renderCb = function(){ XrkAd.renderTemplate(element, html) };

    if( cssFiles && XrkAd.isStringType(cssFiles) ){
      cssFiles = Array(cssFiles)
    }

    if( jsFiles && XrkAd.isStringType(jsFiles) ){
      jsFiles = Array(jsFiles)
    }

    if ( cssFiles && cssFiles.length > 0 ){
      XrkAd.loadCss(cssFiles,  renderCb );
    }else{
      renderCb();
    }

    if( jsFiles && cssFiles.length > 0 ) {
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
    }
    callback();
  };

  XrkAd.renderTemplate = function(element, html){
    console.info("render template  ======== >");
    var node = document.querySelector("div[data-ad-id="+element+"]")
    node.innerHTML = html;
    // var node = document.querySelector(element);
    // var template = document.createElement('template');
    // template.innerHTML = _html;
    // var fragment = template.content;
    // node.parentNode.insertBefore(fragment, node);
  };

  XrkAd.loadJs = function(urls, callback){
    var len = urls.length;
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

      script.onreadystatechange = script.onload = function() {
        if (urls.length > 0) {
          loadScript();
        }else{
          if(callback) { callback() };
        }
      };
      // if (script.addEventListener){
      //   script.addEventListener('load', loadScript, false);        
      // } else {
      //   script.attachEvent('onreadystatechange', function() {
      //     if (/complete|loaded/.test(script.readyState)) loadScript();
      //   });
      // }
    };

    loadScript();
  };

   /////////////////////////////////////////////////////////////////////////////////////////////////////////////
   ///////// Basic Methods
   /////////////////////////////////////////////////////////////////////////////////////////////////////////////
    XrkAd.generateUUID = function(){
      var d = new Date().getTime();
      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = (d + Math.random()*16)%16 | 0;
          d = Math.floor(d/16);
          return (c=='x' ? r : (r&0x7|0x8)).toString(16);
      });
      return uuid;
  };

  XrkAd.isStringType = function(data){
    return Object.prototype.toString.call(data) == "[object String]";
  };

  XrkAd.isArrayType = function(data){
    return Object.prototype.toString.call(data) == "[object Array]";
  };

  XrkAd.generateAdCookies = function(){
    var key = XrkAd._client_cookie_key;
    if(XrkAd.detectCanWriteCookies()){
      if(!XrkAd.existCookies(key) ){
        XrkAd.writeCookie(key, XrkAd.generateUUID());
      }
    }else{
      console.info(" current endpoint no supprot  write cookie")
    }    
  };

  XrkAd.getCookiePairs = function(){
    return document.cookie.replace(/\s+/g, '').split(";")
  };

  XrkAd.detectCanWriteCookies = function(){
    XrkAd.writeCookie("test", "1");
    var allCookies = XrkAd.getCookiePairs();
    return XrkAd.existCookies("test")
  };

  // path / domain / secure
  XrkAd.writeCookie = function(key, value, expires){

    var _expires = expires || 1000*36000; // 1 year
    var path = document.location.pathname;
    var now = new Date();
    var time = now.getTime();
    var expireTime = time + _expires;
    now.setTime(expireTime);
    document.cookie = key + '=' + value +'; expires=' + now.toGMTString();
  };

  XrkAd.readCookie = function(key){
    var cookies = XrkAd.getCookiePairs();
    for(var i =0; i < cookies.length; i++){
      if (cookies[i].indexOf(key) !== -1)
        var pair = cookies[i].split("=")
        return pair[1];
    }
    return null;    
  };

  XrkAd.delCookie = function(key){
    var exp = new Date();
    exp.setTime(exp.getTime()  -  1);
    var value = XrkAd.readCookie(key);
    XrkAd.writeCookie(key, value, exp.toGMTString())
  };

  XrkAd.existCookies = function(key){
    var cookies = XrkAd.getCookiePairs();
    for(var i =0; i < cookies.length; i++){
      if (cookies[i].indexOf(key) !== -1)
        return true;
    }
    return false
  };

  window.XrkAd = XrkAd;

  if(window.xrkAdAsyncInit){
    window.xrkAdAsyncInit();
  }

})(document);