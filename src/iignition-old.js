/* 
 * iIgnition, Copyright 2017 Lucid Ocean
 * License: MIT see http://www.iignition.com/#!license.html
 * Version 01
 */
var $i = iignition = (function () {
    
        var onReadyCallbacks = [];
        var onViewChangedCallbacks = [];
        var fireReady = false;
        var options = { preventDoublePosting: true };
        fireOnReady = function () {
            for (var item in onReadyCallbacks) {
                if (onReadyCallbacks[item]) {
                    onReadyCallbacks[item].callback();
                }
            }
            fireReady = true;
        };
        fireOnViewChanged = function (view) {
            for (var item in onViewChangedCallbacks) {
                if (onViewChangedCallbacks[item]) {
                    onViewChangedCallbacks[item].callback(view);
                }
            }
        };
        
        if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
            readycb();
        } else {
            document.addEventListener('DOMContentLoaded', readycb);
        }
          
        function readycb()
        {
            _preventDoublePosting();
            _hashbang();
            fireOnReady();
            document.addEventListener('hashchange', function () {
                _hashbang();
                fireOnViewChanged($i.options.view);
            });
        };
    
    
        function _init() {
            if ($i.Cache) {
                //$.ajaxSetup({ cache: $i.options.enablecache, preventDoublePosting: true });
            }
        }
    
        function _preventDoublePosting() {
            if ($i.options.preventDoublePosting === true) {
                
                var elements = document.querySelectorAll('form');
                elements.forEach(function(el, i){
                    el.addEventListener('submit',  function (e) {
                        var form = e.target;
                        if (form.getAttribute('data-submitted') === true) {
                            form.preventDefault();
                        } else {
                            form.setAttribute('data-submitted', true);
                            //document.title = "submitting";
                        }
                    });
                });
            }
        }
        function _hashbang() {
            if (document.location.hash) {
                if (document.location.hash.startsWith("#!")) {
                    var v = document.location.hash.replace("#!", "");
    
                    if ($i.options.view === v) {
                        $i.options.view = undefined;
                    }
                    else {
                        $i.options.view = v;
                    }
                    return;
                }
            }
            $i.options.view = undefined;
    
        }
    
        /** needed for IE **///
        if (typeof String.prototype.endsWith !== 'function') {
            String.prototype.endsWith = function (suffix) {
                return this.indexOf(suffix, this.length - suffix.length) !== -1;
            };
        }
        var extend = function ( defaults, options ) {
            var extended = {};
            var prop;
            for (prop in defaults) {
                if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
                    extended[prop] = defaults[prop];
                }
            }
            for (prop in options) {
                if (Object.prototype.hasOwnProperty.call(options, prop)) {
                    extended[prop] = options[prop];
                }
            }
            return extended;
        };
      
    
        if (typeof String.prototype.startsWith !== 'function') {
            String.prototype.startsWith = function (suffix) {
                return this.indexOf(suffix, 0) === 0;
            };
        }

        if (typeof NodeList.prototype.forEach !== 'function') {
             NodeList.prototype.forEach = function (cb) {
                Array.prototype.forEach.call(this, function(el, i){
                    cb(el,i);
                });
            }
        }
    
        function _load(container, view, callback) {
            
            var request = new XMLHttpRequest();
            request.open('GET', view, true);
            
            request.onload = function() {
              if (request.status >= 200 && request.status < 400) {
                var e =document.createElement('div');
                e.innerHTML =request.responseText;
                 container.appendChild(e.childNodes[0]);
                if (callback)
                    callback(request.responseText);

              } else {
                // We reached our target server, but it returned an error
            
              }
            };
            
            request.onerror = function() {
              // There was a connection error of some sort
            };
            
            request.send();
          

            // $(container).load(view, function (responseText, textStatus, XMLHttpRequest) {
            //     if (textStatus === "success") {
            //         if (callback)
            //             callback(responseText);
    
            //     }
            // });
        }
    
        function _show(container, view, data, rowbindcallback, callback) {
           
            //$container.appendChild($view);
     
            _bind(container, data, rowbindcallback, function () {
                _constructor(view, callback);
            });
        }
    
        function _bind(container, data, rowbindcallback, callback) {
    
            if (data != undefined && data != null) {
                $i.Splash.map($container, data, rowbindcallback, function () {
                    if (callback) callback();
                });
            }
            else {
                if (callback) callback();
            }
        };;
    
        function _constructor(view, callback) {
            view = view.substr(view.lastIndexOf("/") + 1);
            view = view.replace(".html", "");
            view = view.replace(".xml", "");
    
            if (window[view]) {
                if (typeof window[view] === 'function') {
                    window[view]();
                }
            };
            if (callback) {
                callback();
            }
        };
    
        /***end of IE *****/
        return {
            options: { debug: false, enablecache: false, preventDoublePosting: true },
            ready: function (options, callback) {
                /// <summary>
                /// When the page is ready and $i is ready to be used.
                /// </summary>
                /// <arg name="options">pass in options { debug: true/false, enablecache: true/false }</arg>
                /// <arg name="callback">when the page is ready, the callback is fired.</arg>
    
                var o = { debug: false, enablecache: false, preventDoublePosting: true };
                if (typeof options === 'function') {
                    $i.options = o;
                    callback = options;
                }
                else {
                    $i.options = extend(o,options);
                }
                _init();
                if (callback != undefined) {
                    if (fireReady == false) {
                        onReadyCallbacks.push({ callback: callback });
                    } else {
                        callback();
                    }
                }
    
                var elements = document.querySelectorAll('a');
                elements.forEach(function(e){
                    e.style.pointerEvents = "auto";
                })
            },
    
            show: function (container, view, data, rowbindcallback, callback) {
                /// <summary>
                /// Show a view in a container, optionally splashing data
                /// </summary>
                /// <arg name="container">the selector to the element that will be the container for the view</arg>
                /// <arg name="view">the selector to the view, or the html file to load as a view</arg>
                /// <arg name="data">the JSON data, array or single object to splash onto the view</arg>
                /// <arg name="rowbindcallback">a callback that will be called when each row binds to the template</arg>
                /// <arg name="callback">the callback to execute once the view is loaded</arg>
    
                if (view == undefined) { console.log("No View Specified"); return; };
                
                var $container;
                if (typeof container == 'string' ){
                    $container = document.querySelector(container);
                }
                
                if (view.endsWith(".html") || view.endsWith(".xml")) {
                    _load($container, view, function (viewhtml) {
                        _bind($container, data, rowbindcallback, function () {
                            _constructor(view, callback);
                        });
                    });
                }
                else {
                    _show($container, view, data, rowbindcallback, function () {
                        _constructor(view, callback);
                    });
                }
    
                if (window["_gaq"]) {
                    _gaq.push(['_trackPageview', "#!" + view]);
                }
                $i.options.view = view;
                document.location.hash = "#!" + view;
    
            },
            lock: function () {
                var elements = document.querySelectorAll('a,input,button');
                elements.forEach(function(e){
                    e.setAttribute('disabled','disabled');
                })
                
            },
            unlock: function () {
                var elements = document.querySelectorAll('a,input,button');
                elements.forEach(function(e){
                    e.removeAttribute('disabled','disabled');
                })
  
            },
            viewChanged: function (callback) {
                /// <summary>
                /// When the #! url changes in the URL, the viewChanged event fires
                /// </summary>
                /// <arg name="callback"></arg>
                onViewChangedCallbacks.push({ callback: callback });
            },
            length: function (data) {
                if (data.length) {
                    return data.length;
                }
                else {
                    var size = 0, key;
                    for (key in data) {
                        if (data.hasOwnProperty(key)) size++;
                    }
                    return size;
                }
            },
            isMsg: function (obj) {
                if (typeof obj === "object") {
                    if (obj !== undefined) {
                        if (obj.Message !== undefined) {
                            if (obj.MessageId) {
                                return true;
                            }
                        }
                    }
                }
                return false;
            }
    
        }
    
    })();
    
    $i.Cache = (function () {
        var o = {};
    
        o.clear = function (key) {
            /// <summary>
            /// Clears localstorage of all cache inserted with iignition. Other localStorage will be unaffected.
            /// </summary>
            /// <arg name="key">The key to clear. If not supplied, all keys will be removed</arg>
            if (key) {
                localStorage.removeItem(["iCache_" + key]);
            }
            else {
                if ('localStorage' in window && window['localStorage'] !== null) {
                    localStorage.clear();
                }
            }
        };
    
        o.Data = function (key, data) {
            /// <summary>
            /// Sets/Gets data from the localStorage based on a key.
            /// </summary>
            /// <arg name="key">The key</arg>
            /// <arg name="data">opyional. If not provided, the data is returned for the given key. if the key is provided, the data is inserted into localStorage with the key.</arg>
            /// <returns type=""></returns>
            if ('localStorage' in window && window['localStorage'] !== null) {
                if (data) {
                    localStorage["iCache_" + key] = JSON.stringify(data);
                }
                else {
                    if (localStorage["iCache_" + key]) {
                        return JSON.parse(localStorage["iCache_" + key]);
                    } else {
                        return undefined;
                    }
                }
    
                return true;
            }
    
            return false;
        };
    
        return o;
    })();
    
    
    
    $i.Data = (function () {
        var o = {};
       
        o.getData = function (url, data, successCallback, errorCallback, options) {
            /// <summary>
            /// Uses jQuery.ajax to make data calls. Expects JSON
            /// </summary>
            /// <arg name="url">The URL to JSON. prefixing the URL with cache: will attempt to load the JSON from cache if it is available.</arg>
            /// <arg name="data">Post Variables. If not defined, a HTTP GET is issued </arg>
            /// <arg name="successCallback">callback once data is successfully returned</arg>
            /// <arg name="errorCallback">callback if error on attempt to retrieve data</arg>
            /// <returns type="">the JSON</returns>
            if (options!==undefined){
                $i.extend(o.options, options);
            }
            //load from cache -this needs to be tightened up, but getData should read cache:DATAKEY and get the data as below
            if (url.indexOf("cache:") >= 0) {
    
                var s = url.split("cache:");
    
                if ($i.Cache && $i.options.enablecache) {
    
                    var d = $i.Cache.Data(s[1]);
                    console.log("loading cache: " + s[1]);
    
                    if (d) {
                        if (successCallback)
                            successCallback(d);
    
                        return;
                    }
                    else {
                        url = s[1];
                    }
                }
                else {
                    url = s[1];
                }
            }

            var request = new XMLHttpRequest();

            //var httptype = 'GET';
            //var contentType = 'text/javascript';
            //var jsonp = true;
            //var dataType = 'jsonp';
            if (url.endsWith('.json')) {
                o.options.dataType = 'json';
                o.options.contentType = 'application/json';
            }
            if (data) {
                o.options.httptype = "post";
                o.options.contentType = "application/json";
            }
           var hasFiles=false;
            if (hasFiles === true) {
                o.options.contentType = "application/x-www-form-urlencoded";
                var formData = new FormData();
                processData = false;
                

                for (var k in data){
                    if (target.hasOwnProperty(k)) {
                        formData.append(k,  target[k]);  
                    }
                }
                
                for (var k in files){
                    if (target.hasOwnProperty(k)) {
                        formData.append(k,  target[k]);  
                    }
                }
               
            } else {
                formData = JSON.stringify(data);
            }

            request.setRequestHeader('Content-Type', o.options.contentType);
            request.open(httptype, url, true);
            
            request.onload = function() {
              if (request.status >= 200 && request.status < 400) {
                var d = request.responseText;
                if (o.options.contentType == 'application/json'){
                    d = JSON.parse(request.responseText);
                }

                if (successCallback)
                    successCallback(d);

              } else {
              
            
              }
            };
            
            request.onerror =  function onError(xhr, status, error) {
    
                if (status === "timeout") {
                    var ret = confirm("Timeout out occurred when trying to retrieve data. Would you like to retry?");
                    if (ret === true) {
                        o.getData(url, data, successCallback, errorCallback, fullmsg);
                        return;
                    }
                }
    
                if (errorCallback)
                    errorCallback(xhr.responseText, error);
            }
    
          
            request.send(data); 
            
    
    
        };
    
        o.options = {
            httptype: 'GET',
            contentType : 'text/javascript',

        }
        return o;
    })();
    
    $i.Splash = (function () {
        var o = {};
    
        o.element = null;
    
        o.map = function (element, data, rowbindcallback, callback, options) {
            /// <summary>
            /// Maps data onto HTML (templating)
            /// </summary>
            /// <arg name="element">the parent element to splash</arg>
            /// <arg name="data">the JSON data to splash</arg>
            /// <arg name="rowbindcallback">a callback for each row bind as it happens. Useful for altering data or rows as they bind</arg>
            /// <arg name="callback">Once splashed, fires this callback</arg>
            /// <arg name="options">Reserved for future use</arg>
            if (data === undefined) {
                console.log('data is undefined. Splash aborted');
                return;
            }
    
            var datac = data;
            
            if (typeof element == 'string'){
                element = document.querySelector(element);
            }
            
            o.element = element;
            expandTemplate(element, datac);
            applyTemplate(element, datac, rowbindcallback, options);
    
            if (callback) {
                callback();
            }
        };
    
        o.setSelected = function (select, value) {
            select.value = value;
        };
    
        o.setRadio = function (radio, value) {
            document.querySelector('input:radio#' + value).checked = value;
        };
    
        o.setCheck = function (checkbox, value) {
    
            if (value) {
                if (value === 1 || value === "1" || value.toLowerCase() === "true") {
                    document.querySelector('input:checkbox#' + checkbox).checked = true;
                    //document.querySelector('input:checkbox#' + checkbox).val('on');
                } else {
                    document.querySelector('input:checkbox#' + checkbox).checked = false;
                   // $('input:checkbox#' + checkbox).val('off');
                }
            }
    
            $('input:checkbox#' + checkbox).unbind("click");
            $('input:checkbox#' + checkbox).click(function () {
                if ($('input:checkbox#' + checkbox).is(':checked')) {
                    $('input:checkbox#' + checkbox).val('on');
                }
                else {
                    $('input:checkbox#' + checkbox).val('off');
                }
            });
        };
    
        function applyTemplate(element, data, rowbindcallback, options) {
    
            if (options && (options.append === true)) {
            }
            else {
                $(element).find("[data-templateclone]").not("[data-splashx]").remove();
               
               var elements = element.querySelectorAll('[data-templateclone]:not([data-splashx])');
               elements.forEach(function(e){ e.parentNode.removeChild(e)});
            }
    
            $template = element;
            if (element.getAttribute('data-splashtemplate')==null){

                $template = element.querySelector('[data-splashtemplate]');
   
                 if ($template==null) {
                    return;
                 }
            
            }
    
    
            if ($template.tagName == 'OPTION')
            {
                $cloneparent = $template.parentNode;
            }
            else if ($template.tagName === 'TR') {
                $cloneparent = $template.closest('tbody');
            } else if ($template.tagName === 'FORM') {
                $cloneparent = $template;//.closest("[data-form]");
            }
            else if ($template.tagName === 'DIV') {
                $cloneparent = $template.parentNode.closest("div");
            }
    
            if (!$i.isMsg(data)) {
    
                var shouldRun = $i.length(data) > 0;
                shouldRun = options === undefined ? shouldRun : options.append === true;
    
                shouldRun = options === undefined ? shouldRun : options.action !== "edit";
                if (shouldRun) {
                    var splashTemplate = $template;
    
                    for (var d in data) {
                        //needs careful redesign
                         if (splashTemplate.closest('[id]').getAttribute('id') !== o.element.getAttribute('id')) {
                            if (splashTemplate.tagName === "OPTION") {
                                continue;
                            }
                        } // end redesign
                        var elementClone = splashTemplate.cloneNode(true);
    
                        $cloneparent.appendChild(elementClone);
    
                        elementClone.setAttribute('data-templateclone','true');
    
                        if (rowbindcallback) {
                            var returneddata = undefined;
                            if (data[d]) {
                                returneddata = rowbindcallback(elementClone, data[d]);
                            }
    
                            if (returneddata !== undefined) {
                                data[d] = returneddata;
                            }
                        }
    
                        applyobject(elementClone, data[d]);
                        elementClone.style.display = '';
                    }
                    //splashTemplate.style.display = 'none';
                    
    
                    if (options) {
                        if (options.action == 'edit') {
                            if ($template.closest("[data-form]")) {
                                $template.parentNode.removeChild($template);
                            }
                        }
                    }
                }
                else {
                    $template.each(function () {
                        elementClone = $(this);
    
                        if (rowbindcallback) {
                            var returneddata = undefined;
                            if (data[0]) {
                                returneddata = rowbindcallback(elementClone, data[0]);
                            }
                            if (returneddata !== undefined) {
                                data[0] = returneddata;
                            }
                        }
                        if (data[0]) {
                            applyobject(elementClone, data[0]);
                        }
                    });
                }
    
            } else {
                if (options) {
                    if (options.action == 'edit') {
    
                    } else {
                        $template.style.display = 'none';
                    }
                }
            }
        }
    
        function applySplashx(element, data) {
            var $splashx = $(element).find("[data-splashx]");
            if ($splashx.length > 0) {
                $splashx.each(function () {
                    var atts = $(this).attr("data-splashx");
                    atts = atts.split("=");
                    var name = "";
                    if (atts.length === 2) {
                        name = atts[1];
    
                    }
    
                    _selectedValue = $(this).attr("value");
                    if (_selectedValue === data[name]) {
                        $(this).attr("selected", "selected");
                    }
    
                });
    
                $splashx.removeAttr("data-splashx");
                $splashx.removeAttr("data-splash");
            }
        }
    
        function expandTemplate(element, data) {
            // var scaffold = element.querySelector('[data-splashscaffold]');
            // var template = element.querySelector('[data-splashtemplate]');
            // //nodes.forEach(function(el, i){ 
    
            //     var elements = new Array();
            //     var $elementClone = '';
            //    // el.querySelectorAll("*[data-splash^='\\[']").forEach(function (e) {
                    
                   
            //         //var splashvalue = e.getAttribute('data-splash').replace('[]', '');
            //          for (var d in data) {
            //              if (data.length > 0) {
            //                 for (var col in data) {
            //                     for (var obj in data[col]) {
            //                          var $newtag = document.createElement('span');
    
            //                          $newtag.setAttribute('data-splash', obj );
            //                          elements.push($newtag);
            //                     }
            //                     break;//just do it once
            //                 }
            //              }
            //              break;//just do it once
            //         }
            //     //});
            //     //carefully change this
            //     //el.find("*[data-splash^='\\[']").first().remove();
            //     template.removeAttribute('splashtemplate');
            //     elements.forEach(function(item)
            //     {
            //         item.removeAttribute('splashtemplate');
            //         template.appendChild(item);
            //     });

            //     if (scaffold)
            //         scaffold.appendChild(template);
                
            //});
        };
        
    
        function applyobject(element, data) {
            
            if (element.getAttribute === undefined) return;
            
            var atts = element.getAttribute("data-splash");
         
            var _selectedValue = -1;
            if (atts) {
                atts = atts.split(",");
    
                for (var att in atts) {
                    var name = atts[att].replace(/^\s+|\s+$/g, '');
                    var attribute = "data-";
                    var namepair = [];
                    if (name.indexOf("=") > -1) {
                        namepair = name.split("=");
                        name = namepair[1];
                        attribute = namepair[0];
    
                    }
                    else {
                        attribute += name;
                    }
                    var val = undefined;
    
                    var namespaces = name.split(".");
                    var context = data;
    
                    for (var i = 0; i < namespaces.length - 1; i++) {
                        context = context[namespaces[i]];
                    }
    
                    if (namespaces.length > 0) {
                        val = context[namespaces[namespaces.length - 1]];
                    }
                    else {
                        if (data[name]) {
                            val = data[name];
                        }
    
                    }
    
                    if (namepair.length > 0) {
                        if (attribute === "value") {
                            if (val) {
                                _selectedValue = data[name];
                            }
                        }
                        if (attribute === "checked") {
                            if (element.getAttribute("id")!=null) {
                                o.setCheck(element.getAttribute("id"), val);
                            }
                        } else {
                            element.setAttribute(attribute, val);
                        }
    
                    }
                    else {
                        if (val !== undefined) {
                            //element.setAttribute(attribute, val);
    
                            if (element.tagName !== "TR") {
    
                                if (element.getAttribute("type") === "checkbox") {
                                    if (element.getAttribute("id")) {
                                        o.setCheck(element.getAttribute("id"), val);
                                    }
                                } else {
                                    //var t = element.textContent;

                                    if (element.tagName == 'INPUT'){
                                        element.value = val;
                                    }
                                    else{
                                        element.innerText = val;
                                    }
                                    
                                }
                            }
                        }
                    }
                };
            }   
            
            element.childNodes.forEach(function (e) {
            
                if (e.getAttribute){
                    if (e.getAttribute('id') !== o.element.getAttribute('id')) {
                        if (e.tagName === "SELECT") {
                            return;
                        }
                    }
                }
                applyobject(e, data);
            });
            element.style.display = '';
        }
        return o;
    })();