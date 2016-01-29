;(function(){

  var XrkAd = window.XrkAd || {};

  XrkAd.initSettings = function(params){
    XrkAd.jsTicketCookieKey = "_xrk_ad_js_ticket";
    XrkAd.clientCookieKey = "_xrk_ad_client";
    XrkAd.debug = params["debug"] || false;
    XrkAd.apiVersion = params["apiVersion"] || "v1";
  };    

  XrkAd.getAppIdFromUrl = function(){
    var scripts = document.getElementsByTagName("script"), slen = scripts.length;
    for(var i = 0; i < slen; i ++ ){
      var _script = scripts[i], src = _script.src;
      if( src && /sdk\.js/.test(src) ){
        var qeuryStr = src.replace(/[\w|:|\/|\.]*\?/, ""), queryPairs = qeuryStr.split("&");
        if(!queryPairs || queryPairs.length == 0){ return null; };
        var qlen = queryPairs.length;
        for(var j = 0; j < qlen; j ++){
          var _query =  queryPairs[j];
          if(/appId/.test(_query)){ return _query.split("=")[1]; }
        } // end for
      } // if 
    } // end for
    return null;
  };

  XrkAd.getJsTicket = function(){
    var encodeValue = XrkAd.readCookie(XrkAd.jsTicketCookieKey)
    if(!window.decodeURIComponent){ return null; };

    var value = window.decodeURIComponent(encodeValue), formatValue = JSON.parse(value);
    // if(formatValue && formatValue.value){ return formatValue.value };
    if(formatValue && formatValue.value){ return encodeValue };
    return null;
  };

  XrkAd.init = function(params){
    XrkAd.initSettings(params);
    XrkAd.generateAdCookies();
    var jsTicket = XrkAd.getJsTicket();

    var aids = XrkAd.getAdids();
    if(aids.length <= 0) return;
    var url = "http://ad.xrk.com/api/"+ XrkAd.apiVersion +"/ads/sdk_secrete";
    delete params.debug;
    delete params.apiVersion;
    params["ad_ids"] = aids;

    if(jsTicket){
      params = "access_token=" + jsTicket;
      // params["request_sign"] = true;
      // params["app_key"] = jsTicket.app_key;
      // params["timestamp"] = jsTicket.timestamp;
      // params["sign"] = jsTicket.sign;
    }else{
      var appId = XrkAd.getAppIdFromUrl();
      params = "app_id" + appId;
      // params["request_sign"] = false;
      // params["app_id"] = appId;
    }

    XrkAd.api(url, params, function(response){
      XrkAd.render(response);
    });
  };

  XrkAd.getAdids = function(){
    var len, aids = [] ,adAreas = document.querySelectorAll("[data-ad-id]")
    len = adAreas.length;
    for(var i = 0; i < len; i++){
      var area = adAreas[i], aid = area.dataset.adId;
      if(aid && aids.indexOf(aid) == -1 ){ aids.push(aid); }
    }
    return aids;
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
      xhr.send(params);
    }
  };

  XrkAd.serverRequest = function(url){
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr){
      xhr.open("POST", url , true);
      xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");      
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
    // for(var key in data){
    //   var htmlTemplate, cssFiles, jsFiles;
    //   var value = data[key];
    //   htmlTemplate = value.html.trim(), cssFiles = value.css, jsFiles = value.js;
    //   XrkAd._adRender(key, htmlTemplate, cssFiles, jsFiles);      
    // }
    var htmlTemplates = data.html_files , cssFiles = data.css_files, jsFiles = data.js_files;
    XrkAd._adRender(htmlTemplates, cssFiles, jsFiles);  
  };

  XrkAd._adRender = function(htmls, cssFiles, jsFiles){
    var renderCb = function(){
      for(var element in htmls){
        var html = htmls[element];
        XrkAd.renderTemplate(element, html)        
      }
    };

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
    var key = XrkAd.clientCookieKey;
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
    var cookies = XrkAd.getCookiePairs(), clen = cookies.length;
    for(var i =0; i < clen; i++){
      if (cookies[i].indexOf(key) !== -1){
        var pair = cookies[i].split("=")
        return pair[1];        
      }
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
  }else{
    XrkAd.init({});    
  }

})(document);
