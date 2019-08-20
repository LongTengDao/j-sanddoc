/*!
 * 模块名称：j-sanddoc
 * 模块功能：前端富文本展示方案。从属于“简计划”。
   　　　　　Font-end rich text display plan. Belong to "Plan J".
 * 模块版本：6.0.0
 * 许可条款：LGPL-3.0
 * 所属作者：龙腾道 <LongTengDao@LongTengDao.com> (www.LongTengDao.com)
 * 问题反馈：https://GitHub.com/LongTengDao/j-sanddoc/issues
 * 项目主页：https://GitHub.com/LongTengDao/j-sanddoc/
 */

var version = '6.0.0';

function noop () {}

var sameOrigin = /*#__PURE__*/ function () {
	var pageOrigin = /^https?:\/\/[^/]+|/.exec(location.href) [0];
	return pageOrigin
		? function (href        ) { return href.indexOf(pageOrigin)===0; }
		: noop;
}();

var withScheme = /^[a-z][a-z0-9\-+.]*:/i;

function safeScheme (scheme        )              {
	switch ( scheme ) {
		case 'https':
		case 'http':
		case 'ftps':
		case 'ftp':
		case 'mailto':
		case 'news':
		case 'gopher':
		case 'data':
			return true;
	}
}

function scheme_stat (href         )                               {
	
	if ( typeof href!=='string' ) {
		return 0;
	}
	
	if ( href==='' ) {
		return 3;
	}
	switch ( href.charAt(0) ) {
		case '/':
		case '.':
		case '?':
		case '#':
			return 3;
	}
	
	var colon = href.indexOf(':');
	if ( colon=== -1 ) {
		return 2;
	}
	if ( sameOrigin(href.slice(0, colon)) ) {
		return 4;
	}
	if ( safeScheme(href) || href==='about:blank' ) {
		return 1;
	}
	if ( withScheme.test(href) ) {
		return 0;
	}
	
}

function filterAnchor (anchors                                                       ) {
	var index = anchors.length;
	while ( index-- ) {
		var anchor = anchors[index];
		var href = anchor.href;
		var sameOrigin             ;
		switch ( scheme_stat(href) ) {
			case 0:
				anchor.removeAttribute('href');
				//anchor.removeAttribute('target');
				return;
			case 1:
				break;
			case 2:
				anchor.setAttribute('href', './'+href);
				sameOrigin = true;
				break;
			case 3:
			case 4:
				sameOrigin = true;
		}
		if ( sameOrigin ) {
			if ( anchor.target!=='_blank' ) {
				anchor.setAttribute('target', '_parent');
			}
		}
		else {
			anchor.setAttribute('target', '_blank');
		}
	}
}

function filterAnchors (contentDocument          ) {
	filterAnchor(contentDocument.getElementsByTagName('a'));
	filterAnchor(contentDocument.getElementsByTagName('area'));
}

var SUPPORT_STATUS = /*#__PURE__*/ ( function ()                                                    {
	
	var iFrame                           = document.createElement('iframe');
	
	if ( 'sandbox' in iFrame            ) {
		iFrame = null;
		return 'sandbox';
	}
	
	iFrame.setAttribute('security', 'restricted');
	
	var bed                     = document.body || document.documentElement;
	bed.appendChild(iFrame);
	var contentWindow                                      = iFrame.contentWindow                                ;
	var contentDocument                  = contentWindow.document;
	
	contentDocument.open();
	var security = contentWindow.$dangerous = {};
	contentDocument.write('<script>$dangerous={}</script>');
	security = contentWindow.$dangerous===security;
	contentWindow.$dangerous = null;
	contentDocument.close();
	
	contentDocument = null;
	contentWindow = null;
	bed.removeChild(iFrame);
	bed = null;
	
	if ( security ) {
		iFrame = null;
		return 'security';
	}
	
	if ( 'srcdoc' in iFrame ) {
		iFrame = null;
		return 'inDanger';
	}
	else {
		iFrame = null;
		return 'dangerous';
	}
	
} )();

var activateHTML5Tags = (
	'hidden' in /*#__PURE__*/ document.createElement('a')
		
		? noop
		
		: /*#__PURE__*/ function () {
			// <command /> <keygen /> <source /> <track /> <menu></menu>
			var HTML5_TAGS = 'abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output picture progress section summary template time video'.split(' ');
			var HTML5_TAGS_LENGTH = HTML5_TAGS.length;
			
			function activateHTML5Tags (contentDocument          ) {
				var index = HTML5_TAGS_LENGTH;
				while ( index-- ) {
					contentDocument.createElement(HTML5_TAGS[index]);
				}
			}
			activateHTML5Tags(document);
			
			return activateHTML5Tags;
		}()
	
);

function filterForms (contentDocument          ) {
	
	var forms = contentDocument.getElementsByTagName('from');
	var index = forms.length;
	
	while ( index-- ) {
		var form = forms[index];
		form.parentNode .removeChild(form);
	}
	
}

var render = ( function () {
	switch ( SUPPORT_STATUS ) {
		
		case 'sandbox':
			var justify = function justify (                       ) {
				var style = this.style;
				style.setProperty('height', '0', 'important');
				style.setProperty('height', this.contentDocument .documentElement.scrollHeight+'px', 'important');
			};
			return function render (iFrame                   ) {
				var srcdoc = iFrame.getAttribute('srcdoc') ;
				iFrame.removeAttribute('srcdoc');
				var style = iFrame.style;
				style.setProperty('height', '0', 'important');
				iFrame.addEventListener('load', justify);
				var contentDocument = iFrame.contentDocument ;
				contentDocument.open();
				contentDocument.write(srcdoc);
				contentDocument.close();
				filterAnchors(contentDocument);
				style.height = contentDocument.documentElement.scrollHeight+'px';
			};
			
		case 'security':
			var createJustify = function (style                     , contentDocument          ) {
				return function justify (            ) {
					style.height = '0';
					style.height = contentDocument.documentElement.scrollHeight+'px';
				};
			};
			return function render (iFrame                   ) {
				var srcdoc = iFrame.getAttribute('srcdoc') ;
				iFrame.removeAttribute('srcdoc');
				var style = iFrame.style;
				style.height = '0';
				iFrame.setAttribute('security', 'restricted');
				var contentDocument = iFrame.contentWindow .document;
				iFrame.attachEvent('onload', createJustify(style, contentDocument));
				contentDocument.open();
				activateHTML5Tags(contentDocument);
				contentDocument.write(srcdoc);
				contentDocument.close();
				filterForms(contentDocument);
				style.height = contentDocument.documentElement.scrollHeight+'px';
			};
			
		case 'inDanger':
			return function render (iFrame                   ) { iFrame.removeAttribute('srcdoc'); };
		case 'dangerous':
			return noop;
			
	}
} )();

var name = 'j-sanddoc';

var SANDBOX = 'allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-top-navigation';

var Readonly = Object.freeze;

var vue = Readonly && /*#__PURE__*/ function ()                         {
	
	var create = Object.create;
	
	function readonly    (value   )                             {
		var descriptor = create(null);
		descriptor.value = value;
		descriptor.enumerable = true;
		return descriptor;
	}
	function writable    (value   )                             {
		var descriptor = create(null);
		descriptor.get = function ()    { return value; };
		descriptor.set = noop;
		descriptor.enumerable = true;
		return descriptor;
	}
	
	var never = Readonly({
		validator: function (value     ) { return value==null; }
	});
	var props = Readonly({
		srcdoc: Readonly({
			required: true        ,
			validator: function (value     )                  { return typeof value==='string'; }
		}),
		src: never,
		sandbox: never,
		security: never
	});
	var staticStyle = Readonly({ height: '0!important' });
	var render;
	var parse                                                                             ;
	
	if ( SUPPORT_STATUS==='sandbox' ) {
		// sandbox srcdoc: Chrome+ Safari+ Firefox+
		// sandbox: Edge+ IE10+
		render = function render (createElement     ) {
			return createElement('iframe', {
				staticStyle: staticStyle,
				attrs: Readonly({ sandbox: SANDBOX, width: '100%', frameborder: '0', scrolling: 'no', marginwidth: '0', marginheight: '0' }),
				nativeOn: nativeOn
			});
		};
		parse = function parse ($el                   , contentDocument          , srcdoc        ) {
			contentDocument.open();
			contentDocument.write(srcdoc);
			contentDocument.close();
			filterAnchors(contentDocument);
			$el.style.setProperty('height', contentDocument.documentElement.scrollHeight+'px', 'important');
		};
	}
	
	else if ( SUPPORT_STATUS==='security' ) {
		// security: IE9(-)
		render = function render (createElement     ) {
			return createElement('iframe', {
				staticStyle: staticStyle,
				attrs: Readonly({ security: 'restricted', width: '100%', frameborder: '0', scrolling: 'no', marginwidth: '0', marginheight: '0' }),
				nativeOn: nativeOn
			});
		};
		parse = function parse ($el                   , contentDocument          , srcdoc        ) {
			contentDocument.open();
			activateHTML5Tags(contentDocument);
			contentDocument.write(srcdoc);
			contentDocument.close();
			filterForms(contentDocument);
			$el.style.setProperty('height', contentDocument.documentElement.scrollHeight+'px', 'important');
		};
	}
	
	else {
		return create(null, {
			name: writable(name),
			props: writable(props),
			inheritAttrs: readonly(false),
			render: readonly(function render (createElement     ) {
				return createElement('iframe', {
					staticStyle: staticStyle,
					attrs: Readonly({ width: '100%', frameborder: '0', scrolling: 'no', marginwidth: '0', marginheight: '0' })
				});
			}),
			methods: readonly(Readonly({
				render: noop
			}))
		});
	}
	
	var nativeOn = Readonly({
		load: function justify (                       ) {
			var style = this.style;
			style.setProperty('height', '0', 'important');
			style.setProperty('height', this.contentDocument .documentElement.scrollHeight+'px', 'important');
		}
	});
	
	var mounted_activated = readonly(function mounted_activated (          ) {
		var $el = this.$el ;
		var contentDocument = $el.contentDocument;
		contentDocument && parse($el, contentDocument, this.srcdoc);
	});
	
	return create(null, {
		name: writable(name),
		props: writable(props),
		inheritAttrs: readonly(false),
		render: readonly(render),
		mounted: mounted_activated,
		activated: mounted_activated,
		watch: readonly(Readonly({
			srcdoc: function (            srcdoc        , old        ) {
				if ( srcdoc!==old ) {
					var $el = this.$el;
					if ( $el ) {
						var contentDocument = $el.contentDocument;
						contentDocument && parse($el, contentDocument, srcdoc);
					}
				}
			}
		})),
		methods: readonly(Readonly({
			render: function render (          ) {
				var $el = this.$el ;
				parse($el, $el.contentDocument , this.srcdoc);
			}
		}))
	});
	
}();

function isSandBox (sandbox               ) {
	if ( sandbox ) {
		if ( sandbox===SANDBOX ) { return true; }
		var sandboxes = sandbox.split(' ');
		return sandboxes.length===4 && sandboxes.sort().join(' ')===SANDBOX;
	}
	return false;
}

function isSandDoc (iFrame                   )          {
	return iFrame.getAttribute('srcdoc') && isSandBox(iFrame.getAttribute('sandbox')) ? (
		!iFrame.src &&
		!iFrame.name &&
		!iFrame.seamless &&
		iFrame.getAttribute('width')==='100%' &&
		iFrame.getAttribute('scrolling')==='no' &&
		iFrame.getAttribute('frameborder')==='0' &&
		iFrame.getAttribute('marginwidth')==='0' &&
		iFrame.getAttribute('marginheight')==='0'
	) : false;
}

function filterSandDocs (iFrames                                     ) {
	var sandDocs = [];
	var index = iFrames.length;
	while ( index-- ) {
		var iFrame = iFrames[index];
		if ( isSandDoc(iFrame) ) { sandDocs.push(iFrame); }
	}
	return sandDocs;
}

function renderAll (win        ) {
	var sandDocs = filterSandDocs(win.document.getElementsByTagName('iframe'));
	var index = sandDocs.length;
	while ( index-- ) {
		render(sandDocs[index]);
	}
}

function onReady (callback                      , win        )       {
	var doc = win.document;
	if ( doc.readyState==='complete' ) {
		return callback();
	}
	if ( doc.addEventListener ) {
		return doc.addEventListener('DOMContentLoaded', function listener (              ) {
			doc.removeEventListener('DOMContentLoaded', listener);
			callback();
		}, false);
	}
	if ( win==top ) {
		var documentElement = doc.documentElement;
		if ( documentElement.doScroll ) {
			setTimeout(function handler () {
				try { documentElement.doScroll ('left'); }
				catch (error) {
					setTimeout(handler, 0);
					return;
				}
				callback();
			}, 0);
			return;
		}
	}
	doc.attachEvent('onreadystatechange', function listener (            ) {
		if ( doc.readyState==='complete' ) {
			doc.detachEvent('onreadystatechange', listener);
			callback();
		}
	});
}

function install (winVue                          ) {
	if ( winVue==null ) {
		winVue = ( window                             ).Vue;
		if ( typeof winVue==='function' ) {
			winVue.component(name, vue);
		}
		else {
			onReady(function () { renderAll(window); }, window);
		}
	}
	else {
		if ( typeof winVue==='function' ) {
			winVue.component(name, vue);
		}
		else {
			onReady(function () { renderAll(winVue          ); }, winVue);
		}
	}
}

var undefined$1 = void 0;

var create = Object.create || (
	/*! j-globals: Object.create (polyfill) */
	/*#__PURE__*/ function () {
		var NULL;
		if ( document.domain ) {
			try { dom = new ActiveXObject('htmlfile'); }
			catch (error) { }
		}
		if ( dom ) {
			dom.write('<script><\/script>');
			dom.close();
			NULL = dom.parentWindow.Object.prototype;
		}
		else {
			dom = document.createElement('iframe');
			dom.setAttribute('style', 'display:none !important;_display:none;');//dom.style.display = 'none';
			var parent = document.body || document.documentElement;
			parent.appendChild(dom);
			dom.src = 'javascript:';
			NULL = dom.contentWindow.Object.prototype;
			parent.removeChild(dom);
		}
		var dom = null;
		delete NULL.constructor;
		delete NULL.hasOwnProperty;
		delete NULL.isPrototypeOf;
		delete NULL.propertyIsEnumerable;
		delete NULL.toLocaleString;
		delete NULL.toString;
		delete NULL.valueOf;
		var Null = function () {};
		Null.prototype = NULL;
		var constructor = function () {};
		function __PURE__ (o, properties) {
			if ( properties!==undefined$1 ) { throw TypeError('CAN NOT defineProperties in ES 3 Object.create polyfill'); }
			if ( o===null ) { return new Null; }
			if ( typeof o!=='object' && typeof o!=='function' ) { throw TypeError('Object prototype may only be an Object or null: '+o); }
			constructor.prototype = o;
			var created = new constructor;
			constructor.prototype = NULL;
			return created;
		}
		return function create (o, properties) {
			return /*#__PURE__*/ __PURE__(o, properties);
		};
	}()
	/*¡ j-globals: Object.create (polyfill) */
);

var hasOwnProperty = Object.prototype.hasOwnProperty;

var toStringTag = typeof Symbol!=='undefined' ? Symbol.toStringTag : undefined;

var assign = Object.assign;
var defineProperty = Object.defineProperty;
var freeze = Object.freeze;
var seal = Object.seal;
var Default = (
	/*! j-globals: default (internal) */
	function Default (exports, addOnOrigin) {
		return /*#__PURE__*/ function Module (exports, addOnOrigin) {
			if ( !addOnOrigin ) { addOnOrigin = exports; exports = create(null); }
			if ( assign ) { assign(exports, addOnOrigin); }
			else {
				for ( var key in addOnOrigin ) { if ( hasOwnProperty.call(addOnOrigin, key) ) { exports[key] = addOnOrigin[key]; } }
				if ( !{ 'toString': null }.propertyIsEnumerable('toString') ) {
					var keys = [ 'constructor', 'propertyIsEnumerable', 'isPrototypeOf', 'hasOwnProperty', 'valueOf', 'toLocaleString', 'toString' ];
					while ( key = keys.pop() ) { if ( hasOwnProperty.call(addOnOrigin, key) ) { exports[key] = addOnOrigin[key]; } }
				}
			}
			exports['default'] = exports;
			if ( seal ) {
				typeof exports==='function' && exports.prototype && seal(exports.prototype);
				if ( toStringTag ) {
					var descriptor = create(null);
					descriptor.value = 'Module';
					defineProperty(exports, toStringTag, descriptor);
				}
				freeze(exports);
			}
			return exports;
		}(exports, addOnOrigin);
	}
	/*¡ j-globals: default (internal) */
);

var _export = Default({
	version: version,
	vue: vue,
	render: render,
	install: install,
	_: typeof module!=='undefined' && typeof exports==='object' || typeof define==='function' && define.amd || /*#__PURE__*/ install()
});

export default _export;
export { install, render, version, vue };

/*¡ j-sanddoc */

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZlcnNpb24/dGV4dCIsIm5vb3AudHMiLCJzY2hlbWVfc3RhdC50cyIsImZpbHRlckFuY2hvcnMudHMiLCJTVVBQT1JUX1NUQVRVUy50cyIsImFjdGl2YXRlSFRNTDVUYWdzLnRzIiwiZmlsdGVyRm9ybXMudHMiLCJyZW5kZXIudHMiLCJ2dWUubmFtZS50cyIsIlNBTkRCT1gudHMiLCJ2dWUudHMiLCJyZW5kZXJBbGwudHMiLCJvblJlYWR5LnRzIiwiaW5zdGFsbC50cyIsImV4cG9ydC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCAnNi4wLjAnOyIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG5vb3AgKCkge307IiwiaW1wb3J0IGxvY2F0aW9uIGZyb20gJy5sb2NhdGlvbic7XHJcblxyXG5pbXBvcnQgbm9vcCBmcm9tICcuL25vb3AnO1xyXG5cclxudmFyIHNhbWVPcmlnaW4gPSAvKiNfX1BVUkVfXyovIGZ1bmN0aW9uICgpIHtcclxuXHR2YXIgcGFnZU9yaWdpbiA9IC9eaHR0cHM/OlxcL1xcL1teL10rfC8uZXhlYyhsb2NhdGlvbi5ocmVmKSBbMF07XHJcblx0cmV0dXJuIHBhZ2VPcmlnaW5cclxuXHRcdD8gZnVuY3Rpb24gKGhyZWYgICAgICAgICkgeyByZXR1cm4gaHJlZi5pbmRleE9mKHBhZ2VPcmlnaW4pPT09MDsgfVxyXG5cdFx0OiBub29wO1xyXG59KCk7XHJcblxyXG52YXIgd2l0aFNjaGVtZSA9IC9eW2Etel1bYS16MC05XFwtKy5dKjovaTtcclxuXHJcbmZ1bmN0aW9uIHNhZmVTY2hlbWUgKHNjaGVtZSAgICAgICAgKSAgICAgICAgICAgICAge1xyXG5cdHN3aXRjaCAoIHNjaGVtZSApIHtcclxuXHRcdGNhc2UgJ2h0dHBzJzpcclxuXHRcdGNhc2UgJ2h0dHAnOlxyXG5cdFx0Y2FzZSAnZnRwcyc6XHJcblx0XHRjYXNlICdmdHAnOlxyXG5cdFx0Y2FzZSAnbWFpbHRvJzpcclxuXHRcdGNhc2UgJ25ld3MnOlxyXG5cdFx0Y2FzZSAnZ29waGVyJzpcclxuXHRcdGNhc2UgJ2RhdGEnOlxyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHNjaGVtZV9zdGF0IChocmVmICAgICAgICAgKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcblx0XHJcblx0aWYgKCB0eXBlb2YgaHJlZiE9PSdzdHJpbmcnICkge1xyXG5cdFx0cmV0dXJuIDA7XHJcblx0fVxyXG5cdFxyXG5cdGlmICggaHJlZj09PScnICkge1xyXG5cdFx0cmV0dXJuIDM7XHJcblx0fVxyXG5cdHN3aXRjaCAoIGhyZWYuY2hhckF0KDApICkge1xyXG5cdFx0Y2FzZSAnLyc6XHJcblx0XHRjYXNlICcuJzpcclxuXHRcdGNhc2UgJz8nOlxyXG5cdFx0Y2FzZSAnIyc6XHJcblx0XHRcdHJldHVybiAzO1xyXG5cdH1cclxuXHRcclxuXHR2YXIgY29sb24gPSBocmVmLmluZGV4T2YoJzonKTtcclxuXHRpZiAoIGNvbG9uPT09IC0xICkge1xyXG5cdFx0cmV0dXJuIDI7XHJcblx0fVxyXG5cdGlmICggc2FtZU9yaWdpbihocmVmLnNsaWNlKDAsIGNvbG9uKSkgKSB7XHJcblx0XHRyZXR1cm4gNDtcclxuXHR9XHJcblx0aWYgKCBzYWZlU2NoZW1lKGhyZWYpIHx8IGhyZWY9PT0nYWJvdXQ6YmxhbmsnICkge1xyXG5cdFx0cmV0dXJuIDE7XHJcblx0fVxyXG5cdGlmICggd2l0aFNjaGVtZS50ZXN0KGhyZWYpICkge1xyXG5cdFx0cmV0dXJuIDA7XHJcblx0fVxyXG5cdFxyXG59O1xyXG4iLCJpbXBvcnQgc2NoZW1lX3N0YXQgZnJvbSAnLi9zY2hlbWVfc3RhdCc7XHJcblxyXG5mdW5jdGlvbiBmaWx0ZXJBbmNob3IgKGFuY2hvcnMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XHJcblx0dmFyIGluZGV4ID0gYW5jaG9ycy5sZW5ndGg7XHJcblx0d2hpbGUgKCBpbmRleC0tICkge1xyXG5cdFx0dmFyIGFuY2hvciA9IGFuY2hvcnNbaW5kZXhdO1xyXG5cdFx0dmFyIGhyZWYgPSBhbmNob3IuaHJlZjtcclxuXHRcdHZhciBzYW1lT3JpZ2luICAgICAgICAgICAgIDtcclxuXHRcdHN3aXRjaCAoIHNjaGVtZV9zdGF0KGhyZWYpICkge1xyXG5cdFx0XHRjYXNlIDA6XHJcblx0XHRcdFx0YW5jaG9yLnJlbW92ZUF0dHJpYnV0ZSgnaHJlZicpO1xyXG5cdFx0XHRcdC8vYW5jaG9yLnJlbW92ZUF0dHJpYnV0ZSgndGFyZ2V0Jyk7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRjYXNlIDE6XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgMjpcclxuXHRcdFx0XHRhbmNob3Iuc2V0QXR0cmlidXRlKCdocmVmJywgJy4vJytocmVmKTtcclxuXHRcdFx0XHRzYW1lT3JpZ2luID0gdHJ1ZTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSAzOlxyXG5cdFx0XHRjYXNlIDQ6XHJcblx0XHRcdFx0c2FtZU9yaWdpbiA9IHRydWU7XHJcblx0XHR9XHJcblx0XHRpZiAoIHNhbWVPcmlnaW4gKSB7XHJcblx0XHRcdGlmICggYW5jaG9yLnRhcmdldCE9PSdfYmxhbmsnICkge1xyXG5cdFx0XHRcdGFuY2hvci5zZXRBdHRyaWJ1dGUoJ3RhcmdldCcsICdfcGFyZW50Jyk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGVsc2Uge1xyXG5cdFx0XHRhbmNob3Iuc2V0QXR0cmlidXRlKCd0YXJnZXQnLCAnX2JsYW5rJyk7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBmaWx0ZXJBbmNob3JzIChjb250ZW50RG9jdW1lbnQgICAgICAgICAgKSB7XHJcblx0ZmlsdGVyQW5jaG9yKGNvbnRlbnREb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYScpKTtcclxuXHRmaWx0ZXJBbmNob3IoY29udGVudERvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdhcmVhJykpO1xyXG59O1xyXG4iLCJpbXBvcnQgZG9jdW1lbnQgZnJvbSAnLmRvY3VtZW50JztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IC8qI19fUFVSRV9fKi8gKCBmdW5jdGlvbiAoKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcblx0XHJcblx0dmFyIGlGcmFtZSAgICAgICAgICAgICAgICAgICAgICAgICAgID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XHJcblx0XHJcblx0aWYgKCAnc2FuZGJveCcgaW4gaUZyYW1lICAgICAgICAgICAgKSB7XHJcblx0XHRpRnJhbWUgPSBudWxsO1xyXG5cdFx0cmV0dXJuICdzYW5kYm94JztcclxuXHR9XHJcblx0XHJcblx0aUZyYW1lLnNldEF0dHJpYnV0ZSgnc2VjdXJpdHknLCAncmVzdHJpY3RlZCcpO1xyXG5cdFxyXG5cdHZhciBiZWQgICAgICAgICAgICAgICAgICAgICA9IGRvY3VtZW50LmJvZHkgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xyXG5cdGJlZC5hcHBlbmRDaGlsZChpRnJhbWUpO1xyXG5cdHZhciBjb250ZW50V2luZG93ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IGlGcmFtZS5jb250ZW50V2luZG93ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA7XHJcblx0dmFyIGNvbnRlbnREb2N1bWVudCAgICAgICAgICAgICAgICAgID0gY29udGVudFdpbmRvdy5kb2N1bWVudDtcclxuXHRcclxuXHRjb250ZW50RG9jdW1lbnQub3BlbigpO1xyXG5cdHZhciBzZWN1cml0eSA9IGNvbnRlbnRXaW5kb3cuJGRhbmdlcm91cyA9IHt9O1xyXG5cdGNvbnRlbnREb2N1bWVudC53cml0ZSgnPHNjcmlwdD4kZGFuZ2Vyb3VzPXt9PC9zY3JpcHQ+Jyk7XHJcblx0c2VjdXJpdHkgPSBjb250ZW50V2luZG93LiRkYW5nZXJvdXM9PT1zZWN1cml0eTtcclxuXHRjb250ZW50V2luZG93LiRkYW5nZXJvdXMgPSBudWxsO1xyXG5cdGNvbnRlbnREb2N1bWVudC5jbG9zZSgpO1xyXG5cdFxyXG5cdGNvbnRlbnREb2N1bWVudCA9IG51bGw7XHJcblx0Y29udGVudFdpbmRvdyA9IG51bGw7XHJcblx0YmVkLnJlbW92ZUNoaWxkKGlGcmFtZSk7XHJcblx0YmVkID0gbnVsbDtcclxuXHRcclxuXHRpZiAoIHNlY3VyaXR5ICkge1xyXG5cdFx0aUZyYW1lID0gbnVsbDtcclxuXHRcdHJldHVybiAnc2VjdXJpdHknO1xyXG5cdH1cclxuXHRcclxuXHRpZiAoICdzcmNkb2MnIGluIGlGcmFtZSApIHtcclxuXHRcdGlGcmFtZSA9IG51bGw7XHJcblx0XHRyZXR1cm4gJ2luRGFuZ2VyJztcclxuXHR9XHJcblx0ZWxzZSB7XHJcblx0XHRpRnJhbWUgPSBudWxsO1xyXG5cdFx0cmV0dXJuICdkYW5nZXJvdXMnO1xyXG5cdH1cclxuXHRcclxufSApKCk7XHJcbiIsImltcG9ydCBkb2N1bWVudCBmcm9tICcuZG9jdW1lbnQnO1xyXG5cclxuaW1wb3J0IG5vb3AgZnJvbSAnLi9ub29wJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IChcclxuXHQnaGlkZGVuJyBpbiAvKiNfX1BVUkVfXyovIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKVxyXG5cdFx0XHJcblx0XHQ/IG5vb3BcclxuXHRcdFxyXG5cdFx0OiAvKiNfX1BVUkVfXyovIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0Ly8gPGNvbW1hbmQgLz4gPGtleWdlbiAvPiA8c291cmNlIC8+IDx0cmFjayAvPiA8bWVudT48L21lbnU+XHJcblx0XHRcdHZhciBIVE1MNV9UQUdTID0gJ2FiYnIgYXJ0aWNsZSBhc2lkZSBhdWRpbyBiZGkgY2FudmFzIGRhdGEgZGF0YWxpc3QgZGV0YWlscyBkaWFsb2cgZmlnY2FwdGlvbiBmaWd1cmUgZm9vdGVyIGhlYWRlciBoZ3JvdXAgbWFpbiBtYXJrIG1ldGVyIG5hdiBvdXRwdXQgcGljdHVyZSBwcm9ncmVzcyBzZWN0aW9uIHN1bW1hcnkgdGVtcGxhdGUgdGltZSB2aWRlbycuc3BsaXQoJyAnKTtcclxuXHRcdFx0dmFyIEhUTUw1X1RBR1NfTEVOR1RIID0gSFRNTDVfVEFHUy5sZW5ndGg7XHJcblx0XHRcdFxyXG5cdFx0XHRmdW5jdGlvbiBhY3RpdmF0ZUhUTUw1VGFncyAoY29udGVudERvY3VtZW50ICAgICAgICAgICkge1xyXG5cdFx0XHRcdHZhciBpbmRleCA9IEhUTUw1X1RBR1NfTEVOR1RIO1xyXG5cdFx0XHRcdHdoaWxlICggaW5kZXgtLSApIHtcclxuXHRcdFx0XHRcdGNvbnRlbnREb2N1bWVudC5jcmVhdGVFbGVtZW50KEhUTUw1X1RBR1NbaW5kZXhdKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0YWN0aXZhdGVIVE1MNVRhZ3MoZG9jdW1lbnQpO1xyXG5cdFx0XHRcclxuXHRcdFx0cmV0dXJuIGFjdGl2YXRlSFRNTDVUYWdzO1xyXG5cdFx0fSgpXHJcblx0XHJcbik7XHJcbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGZpbHRlckZvcm1zIChjb250ZW50RG9jdW1lbnQgICAgICAgICAgKSB7XHJcblx0XHJcblx0dmFyIGZvcm1zID0gY29udGVudERvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdmcm9tJyk7XHJcblx0dmFyIGluZGV4ID0gZm9ybXMubGVuZ3RoO1xyXG5cdFxyXG5cdHdoaWxlICggaW5kZXgtLSApIHtcclxuXHRcdHZhciBmb3JtID0gZm9ybXNbaW5kZXhdO1xyXG5cdFx0Zm9ybS5wYXJlbnROb2RlIC5yZW1vdmVDaGlsZChmb3JtKTtcclxuXHR9XHJcblx0XHJcbn07IiwiaW1wb3J0IG5vb3AgZnJvbSAnLi9ub29wJztcclxuaW1wb3J0IGZpbHRlckFuY2hvcnMgZnJvbSAnLi9maWx0ZXJBbmNob3JzJztcclxuaW1wb3J0IFNVUFBPUlRfU1RBVFVTIGZyb20gJy4vU1VQUE9SVF9TVEFUVVMnO1xyXG5pbXBvcnQgYWN0aXZhdGVIVE1MNVRhZ3MgZnJvbSAnLi9hY3RpdmF0ZUhUTUw1VGFncyc7XHJcbmltcG9ydCBmaWx0ZXJGb3JtcyBmcm9tICcuL2ZpbHRlckZvcm1zJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0ICggZnVuY3Rpb24gKCkge1xyXG5cdHN3aXRjaCAoIFNVUFBPUlRfU1RBVFVTICkge1xyXG5cdFx0XHJcblx0XHRjYXNlICdzYW5kYm94JzpcclxuXHRcdFx0dmFyIGp1c3RpZnkgPSBmdW5jdGlvbiBqdXN0aWZ5ICggICAgICAgICAgICAgICAgICAgICAgICkge1xyXG5cdFx0XHRcdHZhciBzdHlsZSA9IHRoaXMuc3R5bGU7XHJcblx0XHRcdFx0c3R5bGUuc2V0UHJvcGVydHkoJ2hlaWdodCcsICcwJywgJ2ltcG9ydGFudCcpO1xyXG5cdFx0XHRcdHN0eWxlLnNldFByb3BlcnR5KCdoZWlnaHQnLCB0aGlzLmNvbnRlbnREb2N1bWVudCAuZG9jdW1lbnRFbGVtZW50LnNjcm9sbEhlaWdodCsncHgnLCAnaW1wb3J0YW50Jyk7XHJcblx0XHRcdH07XHJcblx0XHRcdHJldHVybiBmdW5jdGlvbiByZW5kZXIgKGlGcmFtZSAgICAgICAgICAgICAgICAgICApIHtcclxuXHRcdFx0XHR2YXIgc3JjZG9jID0gaUZyYW1lLmdldEF0dHJpYnV0ZSgnc3JjZG9jJykgO1xyXG5cdFx0XHRcdGlGcmFtZS5yZW1vdmVBdHRyaWJ1dGUoJ3NyY2RvYycpO1xyXG5cdFx0XHRcdHZhciBzdHlsZSA9IGlGcmFtZS5zdHlsZTtcclxuXHRcdFx0XHRzdHlsZS5zZXRQcm9wZXJ0eSgnaGVpZ2h0JywgJzAnLCAnaW1wb3J0YW50Jyk7XHJcblx0XHRcdFx0aUZyYW1lLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBqdXN0aWZ5KTtcclxuXHRcdFx0XHR2YXIgY29udGVudERvY3VtZW50ID0gaUZyYW1lLmNvbnRlbnREb2N1bWVudCA7XHJcblx0XHRcdFx0Y29udGVudERvY3VtZW50Lm9wZW4oKTtcclxuXHRcdFx0XHRjb250ZW50RG9jdW1lbnQud3JpdGUoc3JjZG9jKTtcclxuXHRcdFx0XHRjb250ZW50RG9jdW1lbnQuY2xvc2UoKTtcclxuXHRcdFx0XHRmaWx0ZXJBbmNob3JzKGNvbnRlbnREb2N1bWVudCk7XHJcblx0XHRcdFx0c3R5bGUuaGVpZ2h0ID0gY29udGVudERvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxIZWlnaHQrJ3B4JztcclxuXHRcdFx0fTtcclxuXHRcdFx0XHJcblx0XHRjYXNlICdzZWN1cml0eSc6XHJcblx0XHRcdHZhciBjcmVhdGVKdXN0aWZ5ID0gZnVuY3Rpb24gKHN0eWxlICAgICAgICAgICAgICAgICAgICAgLCBjb250ZW50RG9jdW1lbnQgICAgICAgICAgKSB7XHJcblx0XHRcdFx0cmV0dXJuIGZ1bmN0aW9uIGp1c3RpZnkgKCAgICAgICAgICAgICkge1xyXG5cdFx0XHRcdFx0c3R5bGUuaGVpZ2h0ID0gJzAnO1xyXG5cdFx0XHRcdFx0c3R5bGUuaGVpZ2h0ID0gY29udGVudERvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxIZWlnaHQrJ3B4JztcclxuXHRcdFx0XHR9O1xyXG5cdFx0XHR9O1xyXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24gcmVuZGVyIChpRnJhbWUgICAgICAgICAgICAgICAgICAgKSB7XHJcblx0XHRcdFx0dmFyIHNyY2RvYyA9IGlGcmFtZS5nZXRBdHRyaWJ1dGUoJ3NyY2RvYycpIDtcclxuXHRcdFx0XHRpRnJhbWUucmVtb3ZlQXR0cmlidXRlKCdzcmNkb2MnKTtcclxuXHRcdFx0XHR2YXIgc3R5bGUgPSBpRnJhbWUuc3R5bGU7XHJcblx0XHRcdFx0c3R5bGUuaGVpZ2h0ID0gJzAnO1xyXG5cdFx0XHRcdGlGcmFtZS5zZXRBdHRyaWJ1dGUoJ3NlY3VyaXR5JywgJ3Jlc3RyaWN0ZWQnKTtcclxuXHRcdFx0XHR2YXIgY29udGVudERvY3VtZW50ID0gaUZyYW1lLmNvbnRlbnRXaW5kb3cgLmRvY3VtZW50O1xyXG5cdFx0XHRcdGlGcmFtZS5hdHRhY2hFdmVudCgnb25sb2FkJywgY3JlYXRlSnVzdGlmeShzdHlsZSwgY29udGVudERvY3VtZW50KSk7XHJcblx0XHRcdFx0Y29udGVudERvY3VtZW50Lm9wZW4oKTtcclxuXHRcdFx0XHRhY3RpdmF0ZUhUTUw1VGFncyhjb250ZW50RG9jdW1lbnQpO1xyXG5cdFx0XHRcdGNvbnRlbnREb2N1bWVudC53cml0ZShzcmNkb2MpO1xyXG5cdFx0XHRcdGNvbnRlbnREb2N1bWVudC5jbG9zZSgpO1xyXG5cdFx0XHRcdGZpbHRlckZvcm1zKGNvbnRlbnREb2N1bWVudCk7XHJcblx0XHRcdFx0c3R5bGUuaGVpZ2h0ID0gY29udGVudERvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxIZWlnaHQrJ3B4JztcclxuXHRcdFx0fTtcclxuXHRcdFx0XHJcblx0XHRjYXNlICdpbkRhbmdlcic6XHJcblx0XHRcdHJldHVybiBmdW5jdGlvbiByZW5kZXIgKGlGcmFtZSAgICAgICAgICAgICAgICAgICApIHsgaUZyYW1lLnJlbW92ZUF0dHJpYnV0ZSgnc3JjZG9jJyk7IH07XHJcblx0XHRjYXNlICdkYW5nZXJvdXMnOlxyXG5cdFx0XHRyZXR1cm4gbm9vcDtcclxuXHRcdFx0XHJcblx0fVxyXG59ICkoKTtcclxuIiwiZXhwb3J0IGRlZmF1bHQgJ2otc2FuZGRvYyc7IiwiZXhwb3J0IGRlZmF1bHQgJ2FsbG93LXBvcHVwcyBhbGxvdy1wb3B1cHMtdG8tZXNjYXBlLXNhbmRib3ggYWxsb3ctc2FtZS1vcmlnaW4gYWxsb3ctdG9wLW5hdmlnYXRpb24nOyIsImltcG9ydCBPYmplY3QgZnJvbSAnLk9iamVjdCc7XG5cbmltcG9ydCBub29wIGZyb20gJy4vbm9vcCc7XG5cbmltcG9ydCBTQU5EQk9YIGZyb20gJy4vU0FOREJPWCc7XG5pbXBvcnQgU1VQUE9SVF9TVEFUVVMgZnJvbSAnLi9TVVBQT1JUX1NUQVRVUyc7XG5cbmltcG9ydCBuYW1lIGZyb20gJy4vdnVlLm5hbWUnO1xuXG5pbXBvcnQgYWN0aXZhdGVIVE1MNVRhZ3MgZnJvbSAnLi9hY3RpdmF0ZUhUTUw1VGFncyc7XG5pbXBvcnQgZmlsdGVyQW5jaG9ycyBmcm9tICcuL2ZpbHRlckFuY2hvcnMnO1xuaW1wb3J0IGZpbHRlckZvcm1zIGZyb20gJy4vZmlsdGVyRm9ybXMnO1xuXG52YXIgUmVhZG9ubHkgPSBPYmplY3QuZnJlZXplO1xuXG5leHBvcnQgZGVmYXVsdCBSZWFkb25seSAmJiAvKiNfX1BVUkVfXyovIGZ1bmN0aW9uICgpICAgICAgICAgICAgICAgICAgICAgICAgIHtcblx0XG5cdHZhciBjcmVhdGUgPSBPYmplY3QuY3JlYXRlO1xuXHRcblx0ZnVuY3Rpb24gcmVhZG9ubHkgICAgKHZhbHVlICAgKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuXHRcdHZhciBkZXNjcmlwdG9yID0gY3JlYXRlKG51bGwpO1xuXHRcdGRlc2NyaXB0b3IudmFsdWUgPSB2YWx1ZTtcblx0XHRkZXNjcmlwdG9yLmVudW1lcmFibGUgPSB0cnVlO1xuXHRcdHJldHVybiBkZXNjcmlwdG9yO1xuXHR9XG5cdGZ1bmN0aW9uIHdyaXRhYmxlICAgICh2YWx1ZSAgICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcblx0XHR2YXIgZGVzY3JpcHRvciA9IGNyZWF0ZShudWxsKTtcblx0XHRkZXNjcmlwdG9yLmdldCA9IGZ1bmN0aW9uICgpICAgIHsgcmV0dXJuIHZhbHVlOyB9O1xuXHRcdGRlc2NyaXB0b3Iuc2V0ID0gbm9vcDtcblx0XHRkZXNjcmlwdG9yLmVudW1lcmFibGUgPSB0cnVlO1xuXHRcdHJldHVybiBkZXNjcmlwdG9yO1xuXHR9XG5cdFxuXHR2YXIgbmV2ZXIgPSBSZWFkb25seSh7XG5cdFx0dmFsaWRhdG9yOiBmdW5jdGlvbiAodmFsdWUgICAgICkgeyByZXR1cm4gdmFsdWU9PW51bGw7IH1cblx0fSk7XG5cdHZhciBwcm9wcyA9IFJlYWRvbmx5KHtcblx0XHRzcmNkb2M6IFJlYWRvbmx5KHtcblx0XHRcdHJlcXVpcmVkOiB0cnVlICAgICAgICAsXG5cdFx0XHR2YWxpZGF0b3I6IGZ1bmN0aW9uICh2YWx1ZSAgICAgKSAgICAgICAgICAgICAgICAgIHsgcmV0dXJuIHR5cGVvZiB2YWx1ZT09PSdzdHJpbmcnOyB9XG5cdFx0fSksXG5cdFx0c3JjOiBuZXZlcixcblx0XHRzYW5kYm94OiBuZXZlcixcblx0XHRzZWN1cml0eTogbmV2ZXJcblx0fSk7XG5cdHZhciBzdGF0aWNTdHlsZSA9IFJlYWRvbmx5KHsgaGVpZ2h0OiAnMCFpbXBvcnRhbnQnIH0pO1xuXHR2YXIgcmVuZGVyO1xuXHR2YXIgcGFyc2UgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDtcblx0XG5cdGlmICggU1VQUE9SVF9TVEFUVVM9PT0nc2FuZGJveCcgKSB7XG5cdFx0Ly8gc2FuZGJveCBzcmNkb2M6IENocm9tZSsgU2FmYXJpKyBGaXJlZm94K1xuXHRcdC8vIHNhbmRib3g6IEVkZ2UrIElFMTArXG5cdFx0cmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyIChjcmVhdGVFbGVtZW50ICAgICApIHtcblx0XHRcdHJldHVybiBjcmVhdGVFbGVtZW50KCdpZnJhbWUnLCB7XG5cdFx0XHRcdHN0YXRpY1N0eWxlOiBzdGF0aWNTdHlsZSxcblx0XHRcdFx0YXR0cnM6IFJlYWRvbmx5KHsgc2FuZGJveDogU0FOREJPWCwgd2lkdGg6ICcxMDAlJywgZnJhbWVib3JkZXI6ICcwJywgc2Nyb2xsaW5nOiAnbm8nLCBtYXJnaW53aWR0aDogJzAnLCBtYXJnaW5oZWlnaHQ6ICcwJyB9KSxcblx0XHRcdFx0bmF0aXZlT246IG5hdGl2ZU9uXG5cdFx0XHR9KTtcblx0XHR9O1xuXHRcdHBhcnNlID0gZnVuY3Rpb24gcGFyc2UgKCRlbCAgICAgICAgICAgICAgICAgICAsIGNvbnRlbnREb2N1bWVudCAgICAgICAgICAsIHNyY2RvYyAgICAgICAgKSB7XG5cdFx0XHRjb250ZW50RG9jdW1lbnQub3BlbigpO1xuXHRcdFx0Y29udGVudERvY3VtZW50LndyaXRlKHNyY2RvYyk7XG5cdFx0XHRjb250ZW50RG9jdW1lbnQuY2xvc2UoKTtcblx0XHRcdGZpbHRlckFuY2hvcnMoY29udGVudERvY3VtZW50KTtcblx0XHRcdCRlbC5zdHlsZS5zZXRQcm9wZXJ0eSgnaGVpZ2h0JywgY29udGVudERvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxIZWlnaHQrJ3B4JywgJ2ltcG9ydGFudCcpO1xuXHRcdH07XG5cdH1cblx0XG5cdGVsc2UgaWYgKCBTVVBQT1JUX1NUQVRVUz09PSdzZWN1cml0eScgKSB7XG5cdFx0Ly8gc2VjdXJpdHk6IElFOSgtKVxuXHRcdHJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlciAoY3JlYXRlRWxlbWVudCAgICAgKSB7XG5cdFx0XHRyZXR1cm4gY3JlYXRlRWxlbWVudCgnaWZyYW1lJywge1xuXHRcdFx0XHRzdGF0aWNTdHlsZTogc3RhdGljU3R5bGUsXG5cdFx0XHRcdGF0dHJzOiBSZWFkb25seSh7IHNlY3VyaXR5OiAncmVzdHJpY3RlZCcsIHdpZHRoOiAnMTAwJScsIGZyYW1lYm9yZGVyOiAnMCcsIHNjcm9sbGluZzogJ25vJywgbWFyZ2lud2lkdGg6ICcwJywgbWFyZ2luaGVpZ2h0OiAnMCcgfSksXG5cdFx0XHRcdG5hdGl2ZU9uOiBuYXRpdmVPblxuXHRcdFx0fSk7XG5cdFx0fTtcblx0XHRwYXJzZSA9IGZ1bmN0aW9uIHBhcnNlICgkZWwgICAgICAgICAgICAgICAgICAgLCBjb250ZW50RG9jdW1lbnQgICAgICAgICAgLCBzcmNkb2MgICAgICAgICkge1xuXHRcdFx0Y29udGVudERvY3VtZW50Lm9wZW4oKTtcblx0XHRcdGFjdGl2YXRlSFRNTDVUYWdzKGNvbnRlbnREb2N1bWVudCk7XG5cdFx0XHRjb250ZW50RG9jdW1lbnQud3JpdGUoc3JjZG9jKTtcblx0XHRcdGNvbnRlbnREb2N1bWVudC5jbG9zZSgpO1xuXHRcdFx0ZmlsdGVyRm9ybXMoY29udGVudERvY3VtZW50KTtcblx0XHRcdCRlbC5zdHlsZS5zZXRQcm9wZXJ0eSgnaGVpZ2h0JywgY29udGVudERvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxIZWlnaHQrJ3B4JywgJ2ltcG9ydGFudCcpO1xuXHRcdH07XG5cdH1cblx0XG5cdGVsc2Uge1xuXHRcdHJldHVybiBjcmVhdGUobnVsbCwge1xuXHRcdFx0bmFtZTogd3JpdGFibGUobmFtZSksXG5cdFx0XHRwcm9wczogd3JpdGFibGUocHJvcHMpLFxuXHRcdFx0aW5oZXJpdEF0dHJzOiByZWFkb25seShmYWxzZSksXG5cdFx0XHRyZW5kZXI6IHJlYWRvbmx5KGZ1bmN0aW9uIHJlbmRlciAoY3JlYXRlRWxlbWVudCAgICAgKSB7XG5cdFx0XHRcdHJldHVybiBjcmVhdGVFbGVtZW50KCdpZnJhbWUnLCB7XG5cdFx0XHRcdFx0c3RhdGljU3R5bGU6IHN0YXRpY1N0eWxlLFxuXHRcdFx0XHRcdGF0dHJzOiBSZWFkb25seSh7IHdpZHRoOiAnMTAwJScsIGZyYW1lYm9yZGVyOiAnMCcsIHNjcm9sbGluZzogJ25vJywgbWFyZ2lud2lkdGg6ICcwJywgbWFyZ2luaGVpZ2h0OiAnMCcgfSlcblx0XHRcdFx0fSk7XG5cdFx0XHR9KSxcblx0XHRcdG1ldGhvZHM6IHJlYWRvbmx5KFJlYWRvbmx5KHtcblx0XHRcdFx0cmVuZGVyOiBub29wXG5cdFx0XHR9KSlcblx0XHR9KTtcblx0fVxuXHRcblx0dmFyIG5hdGl2ZU9uID0gUmVhZG9ubHkoe1xuXHRcdGxvYWQ6IGZ1bmN0aW9uIGp1c3RpZnkgKCAgICAgICAgICAgICAgICAgICAgICAgKSB7XG5cdFx0XHR2YXIgc3R5bGUgPSB0aGlzLnN0eWxlO1xuXHRcdFx0c3R5bGUuc2V0UHJvcGVydHkoJ2hlaWdodCcsICcwJywgJ2ltcG9ydGFudCcpO1xuXHRcdFx0c3R5bGUuc2V0UHJvcGVydHkoJ2hlaWdodCcsIHRoaXMuY29udGVudERvY3VtZW50IC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsSGVpZ2h0KydweCcsICdpbXBvcnRhbnQnKTtcblx0XHR9XG5cdH0pO1xuXHRcblx0dmFyIG1vdW50ZWRfYWN0aXZhdGVkID0gcmVhZG9ubHkoZnVuY3Rpb24gbW91bnRlZF9hY3RpdmF0ZWQgKCAgICAgICAgICApIHtcblx0XHR2YXIgJGVsID0gdGhpcy4kZWwgO1xuXHRcdHZhciBjb250ZW50RG9jdW1lbnQgPSAkZWwuY29udGVudERvY3VtZW50O1xuXHRcdGNvbnRlbnREb2N1bWVudCAmJiBwYXJzZSgkZWwsIGNvbnRlbnREb2N1bWVudCwgdGhpcy5zcmNkb2MpO1xuXHR9KTtcblx0XG5cdHJldHVybiBjcmVhdGUobnVsbCwge1xuXHRcdG5hbWU6IHdyaXRhYmxlKG5hbWUpLFxuXHRcdHByb3BzOiB3cml0YWJsZShwcm9wcyksXG5cdFx0aW5oZXJpdEF0dHJzOiByZWFkb25seShmYWxzZSksXG5cdFx0cmVuZGVyOiByZWFkb25seShyZW5kZXIpLFxuXHRcdG1vdW50ZWQ6IG1vdW50ZWRfYWN0aXZhdGVkLFxuXHRcdGFjdGl2YXRlZDogbW91bnRlZF9hY3RpdmF0ZWQsXG5cdFx0d2F0Y2g6IHJlYWRvbmx5KFJlYWRvbmx5KHtcblx0XHRcdHNyY2RvYzogZnVuY3Rpb24gKCAgICAgICAgICAgIHNyY2RvYyAgICAgICAgLCBvbGQgICAgICAgICkge1xuXHRcdFx0XHRpZiAoIHNyY2RvYyE9PW9sZCApIHtcblx0XHRcdFx0XHR2YXIgJGVsID0gdGhpcy4kZWw7XG5cdFx0XHRcdFx0aWYgKCAkZWwgKSB7XG5cdFx0XHRcdFx0XHR2YXIgY29udGVudERvY3VtZW50ID0gJGVsLmNvbnRlbnREb2N1bWVudDtcblx0XHRcdFx0XHRcdGNvbnRlbnREb2N1bWVudCAmJiBwYXJzZSgkZWwsIGNvbnRlbnREb2N1bWVudCwgc3JjZG9jKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KSksXG5cdFx0bWV0aG9kczogcmVhZG9ubHkoUmVhZG9ubHkoe1xuXHRcdFx0cmVuZGVyOiBmdW5jdGlvbiByZW5kZXIgKCAgICAgICAgICApIHtcblx0XHRcdFx0dmFyICRlbCA9IHRoaXMuJGVsIDtcblx0XHRcdFx0cGFyc2UoJGVsLCAkZWwuY29udGVudERvY3VtZW50ICwgdGhpcy5zcmNkb2MpO1xuXHRcdFx0fVxuXHRcdH0pKVxuXHR9KTtcblx0XG59KCk7XG5cbiAgICAgICAgICAgICBcblx0ICAgICAgICAgICAgICAgICAgICAgICAgIFxuXHQgICAgICAgICAgICAgIFxuXHQgICAgICAgICAgICAgICAgICAgICAgIFxuICAiLCJpbXBvcnQgU0FOREJPWCBmcm9tICcuL1NBTkRCT1gnO1xyXG5pbXBvcnQgcmVuZGVyIGZyb20gJy4vcmVuZGVyJztcclxuXHJcbmZ1bmN0aW9uIGlzU2FuZEJveCAoc2FuZGJveCAgICAgICAgICAgICAgICkge1xyXG5cdGlmICggc2FuZGJveCApIHtcclxuXHRcdGlmICggc2FuZGJveD09PVNBTkRCT1ggKSB7IHJldHVybiB0cnVlOyB9XHJcblx0XHR2YXIgc2FuZGJveGVzID0gc2FuZGJveC5zcGxpdCgnICcpO1xyXG5cdFx0cmV0dXJuIHNhbmRib3hlcy5sZW5ndGg9PT00ICYmIHNhbmRib3hlcy5zb3J0KCkuam9pbignICcpPT09U0FOREJPWDtcclxuXHR9XHJcblx0cmV0dXJuIGZhbHNlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc1NhbmREb2MgKGlGcmFtZSAgICAgICAgICAgICAgICAgICApICAgICAgICAgIHtcclxuXHRyZXR1cm4gaUZyYW1lLmdldEF0dHJpYnV0ZSgnc3JjZG9jJykgJiYgaXNTYW5kQm94KGlGcmFtZS5nZXRBdHRyaWJ1dGUoJ3NhbmRib3gnKSkgPyAoXHJcblx0XHQhaUZyYW1lLnNyYyAmJlxyXG5cdFx0IWlGcmFtZS5uYW1lICYmXHJcblx0XHQhaUZyYW1lLnNlYW1sZXNzICYmXHJcblx0XHRpRnJhbWUuZ2V0QXR0cmlidXRlKCd3aWR0aCcpPT09JzEwMCUnICYmXHJcblx0XHRpRnJhbWUuZ2V0QXR0cmlidXRlKCdzY3JvbGxpbmcnKT09PSdubycgJiZcclxuXHRcdGlGcmFtZS5nZXRBdHRyaWJ1dGUoJ2ZyYW1lYm9yZGVyJyk9PT0nMCcgJiZcclxuXHRcdGlGcmFtZS5nZXRBdHRyaWJ1dGUoJ21hcmdpbndpZHRoJyk9PT0nMCcgJiZcclxuXHRcdGlGcmFtZS5nZXRBdHRyaWJ1dGUoJ21hcmdpbmhlaWdodCcpPT09JzAnXHJcblx0KSA6IGZhbHNlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBmaWx0ZXJTYW5kRG9jcyAoaUZyYW1lcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcclxuXHR2YXIgc2FuZERvY3MgPSBbXTtcclxuXHR2YXIgaW5kZXggPSBpRnJhbWVzLmxlbmd0aDtcclxuXHR3aGlsZSAoIGluZGV4LS0gKSB7XHJcblx0XHR2YXIgaUZyYW1lID0gaUZyYW1lc1tpbmRleF07XHJcblx0XHRpZiAoIGlzU2FuZERvYyhpRnJhbWUpICkgeyBzYW5kRG9jcy5wdXNoKGlGcmFtZSk7IH1cclxuXHR9XHJcblx0cmV0dXJuIHNhbmREb2NzO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByZW5kZXJBbGwgKHdpbiAgICAgICAgKSB7XHJcblx0dmFyIHNhbmREb2NzID0gZmlsdGVyU2FuZERvY3Mod2luLmRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpZnJhbWUnKSk7XHJcblx0dmFyIGluZGV4ID0gc2FuZERvY3MubGVuZ3RoO1xyXG5cdHdoaWxlICggaW5kZXgtLSApIHtcclxuXHRcdHJlbmRlcihzYW5kRG9jc1tpbmRleF0pO1xyXG5cdH1cclxufTtcclxuIiwiaW1wb3J0IHRvcCBmcm9tICcudG9wJztcclxuaW1wb3J0IHNldFRpbWVvdXQgZnJvbSAnLnNldFRpbWVvdXQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gb25SZWFkeSAoY2FsbGJhY2sgICAgICAgICAgICAgICAgICAgICAgLCB3aW4gICAgICAgICkgICAgICAge1xyXG5cdHZhciBkb2MgPSB3aW4uZG9jdW1lbnQ7XHJcblx0aWYgKCBkb2MucmVhZHlTdGF0ZT09PSdjb21wbGV0ZScgKSB7XHJcblx0XHRyZXR1cm4gY2FsbGJhY2soKTtcclxuXHR9XHJcblx0aWYgKCBkb2MuYWRkRXZlbnRMaXN0ZW5lciApIHtcclxuXHRcdHJldHVybiBkb2MuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uIGxpc3RlbmVyICggICAgICAgICAgICAgICkge1xyXG5cdFx0XHRkb2MucmVtb3ZlRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGxpc3RlbmVyKTtcclxuXHRcdFx0Y2FsbGJhY2soKTtcclxuXHRcdH0sIGZhbHNlKTtcclxuXHR9XHJcblx0aWYgKCB3aW49PXRvcCApIHtcclxuXHRcdHZhciBkb2N1bWVudEVsZW1lbnQgPSBkb2MuZG9jdW1lbnRFbGVtZW50O1xyXG5cdFx0aWYgKCBkb2N1bWVudEVsZW1lbnQuZG9TY3JvbGwgKSB7XHJcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gaGFuZGxlciAoKSB7XHJcblx0XHRcdFx0dHJ5IHsgZG9jdW1lbnRFbGVtZW50LmRvU2Nyb2xsICgnbGVmdCcpOyB9XHJcblx0XHRcdFx0Y2F0Y2ggKGVycm9yKSB7XHJcblx0XHRcdFx0XHRzZXRUaW1lb3V0KGhhbmRsZXIsIDApO1xyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRjYWxsYmFjaygpO1xyXG5cdFx0XHR9LCAwKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRkb2MuYXR0YWNoRXZlbnQoJ29ucmVhZHlzdGF0ZWNoYW5nZScsIGZ1bmN0aW9uIGxpc3RlbmVyICggICAgICAgICAgICApIHtcclxuXHRcdGlmICggZG9jLnJlYWR5U3RhdGU9PT0nY29tcGxldGUnICkge1xyXG5cdFx0XHRkb2MuZGV0YWNoRXZlbnQoJ29ucmVhZHlzdGF0ZWNoYW5nZScsIGxpc3RlbmVyKTtcclxuXHRcdFx0Y2FsbGJhY2soKTtcclxuXHRcdH1cclxuXHR9KTtcclxufTtcclxuIiwiaW1wb3J0IHdpbmRvdyBmcm9tICcud2luZG93JztcblxuaW1wb3J0IG5hbWUgZnJvbSAnLi92dWUubmFtZSc7XG5pbXBvcnQgdnVlIGZyb20gJy4vdnVlJztcbmltcG9ydCByZW5kZXJBbGwgZnJvbSAnLi9yZW5kZXJBbGwnO1xuaW1wb3J0IG9uUmVhZHkgZnJvbSAnLi9vblJlYWR5JztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaW5zdGFsbCAod2luVnVlICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcblx0aWYgKCB3aW5WdWU9PW51bGwgKSB7XG5cdFx0d2luVnVlID0gKCB3aW5kb3cgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkuVnVlO1xuXHRcdGlmICggdHlwZW9mIHdpblZ1ZT09PSdmdW5jdGlvbicgKSB7XG5cdFx0XHR3aW5WdWUuY29tcG9uZW50KG5hbWUsIHZ1ZSk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0b25SZWFkeShmdW5jdGlvbiAoKSB7IHJlbmRlckFsbCh3aW5kb3cpOyB9LCB3aW5kb3cpO1xuXHRcdH1cblx0fVxuXHRlbHNlIHtcblx0XHRpZiAoIHR5cGVvZiB3aW5WdWU9PT0nZnVuY3Rpb24nICkge1xuXHRcdFx0d2luVnVlLmNvbXBvbmVudChuYW1lLCB2dWUpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdG9uUmVhZHkoZnVuY3Rpb24gKCkgeyByZW5kZXJBbGwod2luVnVlICAgICAgICAgICk7IH0sIHdpblZ1ZSk7XG5cdFx0fVxuXHR9XG59O1xuXG4gICAgICAgICAgICAgICAgICAgICAgIFxuXHQgICAgICAgICAgICAgICAgICAgICAgICBcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgXG4iLCJpbXBvcnQgdmVyc2lvbiBmcm9tICcuL3ZlcnNpb24/dGV4dCc7XG5cbmltcG9ydCByZW5kZXIgZnJvbSAnLi9yZW5kZXInO1xuaW1wb3J0IGluc3RhbGwgZnJvbSAnLi9pbnN0YWxsJztcbmltcG9ydCB2dWUgZnJvbSAnLi92dWUnO1xuZXhwb3J0IHtcblx0dmVyc2lvbixcblx0dnVlLFxuXHRyZW5kZXIsXG5cdGluc3RhbGwsXG59O1xuXG5pbXBvcnQgRGVmYXVsdCBmcm9tICcuZGVmYXVsdD89JztcbmV4cG9ydCBkZWZhdWx0IERlZmF1bHQoe1xuXHR2ZXJzaW9uOiB2ZXJzaW9uLFxuXHR2dWU6IHZ1ZSxcblx0cmVuZGVyOiByZW5kZXIsXG5cdGluc3RhbGw6IGluc3RhbGwsXG5cdF86IHR5cGVvZiBtb2R1bGUhPT0ndW5kZWZpbmVkJyAmJiB0eXBlb2YgZXhwb3J0cz09PSdvYmplY3QnIHx8IHR5cGVvZiBkZWZpbmU9PT0nZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgfHwgLyojX19QVVJFX18qLyBpbnN0YWxsKClcbn0pO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsY0FBZSxPQUFPOztzQkFBQyx0QkNBUixTQUFTLElBQUksSUFBSSxFQUFFOztBQ0lsQyxJQUFJLFVBQVUsaUJBQWlCLFlBQVk7Q0FDMUMsSUFBSSxVQUFVLEdBQUcsb0JBQW9CLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUM5RCxPQUFPLFVBQVU7SUFDZCxVQUFVLElBQUksVUFBVSxFQUFFLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtJQUNoRSxJQUFJLENBQUM7Q0FDUixFQUFFLENBQUM7O0FBRUosSUFBSSxVQUFVLEdBQUcsdUJBQXVCLENBQUM7O0FBRXpDLFNBQVMsVUFBVSxFQUFFLE1BQU0sdUJBQXVCO0NBQ2pELFNBQVMsTUFBTTtFQUNkLEtBQUssT0FBTyxDQUFDO0VBQ2IsS0FBSyxNQUFNLENBQUM7RUFDWixLQUFLLE1BQU0sQ0FBQztFQUNaLEtBQUssS0FBSyxDQUFDO0VBQ1gsS0FBSyxRQUFRLENBQUM7RUFDZCxLQUFLLE1BQU0sQ0FBQztFQUNaLEtBQUssUUFBUSxDQUFD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