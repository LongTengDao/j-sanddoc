/*!
 * 模块名称：j-sanddoc
 * 模块功能：前端富文本展示方案。从属于“简计划”。
   　　　　　Font-end rich text display plan. Belong to "Plan J".
 * 模块版本：6.0.1
 * 许可条款：LGPL-3.0
 * 所属作者：龙腾道 <LongTengDao@LongTengDao.com> (www.LongTengDao.com)
 * 问题反馈：https://GitHub.com/LongTengDao/j-sanddoc/issues
 * 项目主页：https://GitHub.com/LongTengDao/j-sanddoc/
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = global || self, global.SandDoc = factory());
}(this, function () { 'use strict';

	var version = '6.0.1';

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
			sandbox: never,
			security: never,
			src: never,
			name: never,
			width: never,
			seamless: never,
			scrolling: never,
			frameborder: never,
			marginwidth: never,
			marginheight: never
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

	var Sg = /\S+/g;

	function isSandBox (sandbox               ) {
		if ( sandbox ) {
			if ( sandbox===SANDBOX ) { return true; }
			var sandboxes = sandbox.match(Sg) ;
			return sandboxes.length===4 && sandboxes.sort().join(' ')===SANDBOX;
		}
		return false;
	}

	function isSandDoc (iFrame                   )          {
		return iFrame.getAttribute('srcdoc') && isSandBox(iFrame.getAttribute('sandbox')) ? (
			!iFrame.src &&
			!iFrame.name &&
			!iFrame.seamless &&
			iFrame.getAttribute('width'       )==='100%' &&
			iFrame.getAttribute('scrolling'   )==='no'   &&
			iFrame.getAttribute('frameborder' )==='0'    &&
			iFrame.getAttribute('marginwidth' )==='0'    &&
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

	return _export;

}));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZlcnNpb24/dGV4dCIsIm5vb3AudHMiLCJzY2hlbWVfc3RhdC50cyIsImZpbHRlckFuY2hvcnMudHMiLCJTVVBQT1JUX1NUQVRVUy50cyIsImFjdGl2YXRlSFRNTDVUYWdzLnRzIiwiZmlsdGVyRm9ybXMudHMiLCJyZW5kZXIudHMiLCJ2dWUubmFtZS50cyIsIlNBTkRCT1gudHMiLCJ2dWUudHMiLCJyZW5kZXJBbGwudHMiLCJvblJlYWR5LnRzIiwiaW5zdGFsbC50cyIsImV4cG9ydC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCAnNi4wLjEnOyIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG5vb3AgKCkge307IiwiaW1wb3J0IGxvY2F0aW9uIGZyb20gJy5sb2NhdGlvbic7XHJcblxyXG5pbXBvcnQgbm9vcCBmcm9tICcuL25vb3AnO1xyXG5cclxudmFyIHNhbWVPcmlnaW4gPSAvKiNfX1BVUkVfXyovIGZ1bmN0aW9uICgpIHtcclxuXHR2YXIgcGFnZU9yaWdpbiA9IC9eaHR0cHM/OlxcL1xcL1teL10rfC8uZXhlYyhsb2NhdGlvbi5ocmVmKSBbMF07XHJcblx0cmV0dXJuIHBhZ2VPcmlnaW5cclxuXHRcdD8gZnVuY3Rpb24gKGhyZWYgICAgICAgICkgeyByZXR1cm4gaHJlZi5pbmRleE9mKHBhZ2VPcmlnaW4pPT09MDsgfVxyXG5cdFx0OiBub29wO1xyXG59KCk7XHJcblxyXG52YXIgd2l0aFNjaGVtZSA9IC9eW2Etel1bYS16MC05XFwtKy5dKjovaTtcclxuXHJcbmZ1bmN0aW9uIHNhZmVTY2hlbWUgKHNjaGVtZSAgICAgICAgKSAgICAgICAgICAgICAge1xyXG5cdHN3aXRjaCAoIHNjaGVtZSApIHtcclxuXHRcdGNhc2UgJ2h0dHBzJzpcclxuXHRcdGNhc2UgJ2h0dHAnOlxyXG5cdFx0Y2FzZSAnZnRwcyc6XHJcblx0XHRjYXNlICdmdHAnOlxyXG5cdFx0Y2FzZSAnbWFpbHRvJzpcclxuXHRcdGNhc2UgJ25ld3MnOlxyXG5cdFx0Y2FzZSAnZ29waGVyJzpcclxuXHRcdGNhc2UgJ2RhdGEnOlxyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHNjaGVtZV9zdGF0IChocmVmICAgICAgICAgKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcblx0XHJcblx0aWYgKCB0eXBlb2YgaHJlZiE9PSdzdHJpbmcnICkge1xyXG5cdFx0cmV0dXJuIDA7XHJcblx0fVxyXG5cdFxyXG5cdGlmICggaHJlZj09PScnICkge1xyXG5cdFx0cmV0dXJuIDM7XHJcblx0fVxyXG5cdHN3aXRjaCAoIGhyZWYuY2hhckF0KDApICkge1xyXG5cdFx0Y2FzZSAnLyc6XHJcblx0XHRjYXNlICcuJzpcclxuXHRcdGNhc2UgJz8nOlxyXG5cdFx0Y2FzZSAnIyc6XHJcblx0XHRcdHJldHVybiAzO1xyXG5cdH1cclxuXHRcclxuXHR2YXIgY29sb24gPSBocmVmLmluZGV4T2YoJzonKTtcclxuXHRpZiAoIGNvbG9uPT09IC0xICkge1xyXG5cdFx0cmV0dXJuIDI7XHJcblx0fVxyXG5cdGlmICggc2FtZU9yaWdpbihocmVmLnNsaWNlKDAsIGNvbG9uKSkgKSB7XHJcblx0XHRyZXR1cm4gNDtcclxuXHR9XHJcblx0aWYgKCBzYWZlU2NoZW1lKGhyZWYpIHx8IGhyZWY9PT0nYWJvdXQ6YmxhbmsnICkge1xyXG5cdFx0cmV0dXJuIDE7XHJcblx0fVxyXG5cdGlmICggd2l0aFNjaGVtZS50ZXN0KGhyZWYpICkge1xyXG5cdFx0cmV0dXJuIDA7XHJcblx0fVxyXG5cdFxyXG59O1xyXG4iLCJpbXBvcnQgc2NoZW1lX3N0YXQgZnJvbSAnLi9zY2hlbWVfc3RhdCc7XHJcblxyXG5mdW5jdGlvbiBmaWx0ZXJBbmNob3IgKGFuY2hvcnMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XHJcblx0dmFyIGluZGV4ID0gYW5jaG9ycy5sZW5ndGg7XHJcblx0d2hpbGUgKCBpbmRleC0tICkge1xyXG5cdFx0dmFyIGFuY2hvciA9IGFuY2hvcnNbaW5kZXhdO1xyXG5cdFx0dmFyIGhyZWYgPSBhbmNob3IuaHJlZjtcclxuXHRcdHZhciBzYW1lT3JpZ2luICAgICAgICAgICAgIDtcclxuXHRcdHN3aXRjaCAoIHNjaGVtZV9zdGF0KGhyZWYpICkge1xyXG5cdFx0XHRjYXNlIDA6XHJcblx0XHRcdFx0YW5jaG9yLnJlbW92ZUF0dHJpYnV0ZSgnaHJlZicpO1xyXG5cdFx0XHRcdC8vYW5jaG9yLnJlbW92ZUF0dHJpYnV0ZSgndGFyZ2V0Jyk7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRjYXNlIDE6XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgMjpcclxuXHRcdFx0XHRhbmNob3Iuc2V0QXR0cmlidXRlKCdocmVmJywgJy4vJytocmVmKTtcclxuXHRcdFx0XHRzYW1lT3JpZ2luID0gdHJ1ZTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSAzOlxyXG5cdFx0XHRjYXNlIDQ6XHJcblx0XHRcdFx0c2FtZU9yaWdpbiA9IHRydWU7XHJcblx0XHR9XHJcblx0XHRpZiAoIHNhbWVPcmlnaW4gKSB7XHJcblx0XHRcdGlmICggYW5jaG9yLnRhcmdldCE9PSdfYmxhbmsnICkge1xyXG5cdFx0XHRcdGFuY2hvci5zZXRBdHRyaWJ1dGUoJ3RhcmdldCcsICdfcGFyZW50Jyk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGVsc2Uge1xyXG5cdFx0XHRhbmNob3Iuc2V0QXR0cmlidXRlKCd0YXJnZXQnLCAnX2JsYW5rJyk7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBmaWx0ZXJBbmNob3JzIChjb250ZW50RG9jdW1lbnQgICAgICAgICAgKSB7XHJcblx0ZmlsdGVyQW5jaG9yKGNvbnRlbnREb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYScpKTtcclxuXHRmaWx0ZXJBbmNob3IoY29udGVudERvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdhcmVhJykpO1xyXG59O1xyXG4iLCJpbXBvcnQgZG9jdW1lbnQgZnJvbSAnLmRvY3VtZW50JztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IC8qI19fUFVSRV9fKi8gKCBmdW5jdGlvbiAoKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcblx0XHJcblx0dmFyIGlGcmFtZSAgICAgICAgICAgICAgICAgICAgICAgICAgID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XHJcblx0XHJcblx0aWYgKCAnc2FuZGJveCcgaW4gaUZyYW1lICAgICAgICAgICAgKSB7XHJcblx0XHRpRnJhbWUgPSBudWxsO1xyXG5cdFx0cmV0dXJuICdzYW5kYm94JztcclxuXHR9XHJcblx0XHJcblx0aUZyYW1lLnNldEF0dHJpYnV0ZSgnc2VjdXJpdHknLCAncmVzdHJpY3RlZCcpO1xyXG5cdFxyXG5cdHZhciBiZWQgICAgICAgICAgICAgICAgICAgICA9IGRvY3VtZW50LmJvZHkgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xyXG5cdGJlZC5hcHBlbmRDaGlsZChpRnJhbWUpO1xyXG5cdHZhciBjb250ZW50V2luZG93ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IGlGcmFtZS5jb250ZW50V2luZG93ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA7XHJcblx0dmFyIGNvbnRlbnREb2N1bWVudCAgICAgICAgICAgICAgICAgID0gY29udGVudFdpbmRvdy5kb2N1bWVudDtcclxuXHRcclxuXHRjb250ZW50RG9jdW1lbnQub3BlbigpO1xyXG5cdHZhciBzZWN1cml0eSA9IGNvbnRlbnRXaW5kb3cuJGRhbmdlcm91cyA9IHt9O1xyXG5cdGNvbnRlbnREb2N1bWVudC53cml0ZSgnPHNjcmlwdD4kZGFuZ2Vyb3VzPXt9PC9zY3JpcHQ+Jyk7XHJcblx0c2VjdXJpdHkgPSBjb250ZW50V2luZG93LiRkYW5nZXJvdXM9PT1zZWN1cml0eTtcclxuXHRjb250ZW50V2luZG93LiRkYW5nZXJvdXMgPSBudWxsO1xyXG5cdGNvbnRlbnREb2N1bWVudC5jbG9zZSgpO1xyXG5cdFxyXG5cdGNvbnRlbnREb2N1bWVudCA9IG51bGw7XHJcblx0Y29udGVudFdpbmRvdyA9IG51bGw7XHJcblx0YmVkLnJlbW92ZUNoaWxkKGlGcmFtZSk7XHJcblx0YmVkID0gbnVsbDtcclxuXHRcclxuXHRpZiAoIHNlY3VyaXR5ICkge1xyXG5cdFx0aUZyYW1lID0gbnVsbDtcclxuXHRcdHJldHVybiAnc2VjdXJpdHknO1xyXG5cdH1cclxuXHRcclxuXHRpZiAoICdzcmNkb2MnIGluIGlGcmFtZSApIHtcclxuXHRcdGlGcmFtZSA9IG51bGw7XHJcblx0XHRyZXR1cm4gJ2luRGFuZ2VyJztcclxuXHR9XHJcblx0ZWxzZSB7XHJcblx0XHRpRnJhbWUgPSBudWxsO1xyXG5cdFx0cmV0dXJuICdkYW5nZXJvdXMnO1xyXG5cdH1cclxuXHRcclxufSApKCk7XHJcbiIsImltcG9ydCBkb2N1bWVudCBmcm9tICcuZG9jdW1lbnQnO1xyXG5cclxuaW1wb3J0IG5vb3AgZnJvbSAnLi9ub29wJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IChcclxuXHQnaGlkZGVuJyBpbiAvKiNfX1BVUkVfXyovIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKVxyXG5cdFx0XHJcblx0XHQ/IG5vb3BcclxuXHRcdFxyXG5cdFx0OiAvKiNfX1BVUkVfXyovIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0Ly8gPGNvbW1hbmQgLz4gPGtleWdlbiAvPiA8c291cmNlIC8+IDx0cmFjayAvPiA8bWVudT48L21lbnU+XHJcblx0XHRcdHZhciBIVE1MNV9UQUdTID0gJ2FiYnIgYXJ0aWNsZSBhc2lkZSBhdWRpbyBiZGkgY2FudmFzIGRhdGEgZGF0YWxpc3QgZGV0YWlscyBkaWFsb2cgZmlnY2FwdGlvbiBmaWd1cmUgZm9vdGVyIGhlYWRlciBoZ3JvdXAgbWFpbiBtYXJrIG1ldGVyIG5hdiBvdXRwdXQgcGljdHVyZSBwcm9ncmVzcyBzZWN0aW9uIHN1bW1hcnkgdGVtcGxhdGUgdGltZSB2aWRlbycuc3BsaXQoJyAnKTtcclxuXHRcdFx0dmFyIEhUTUw1X1RBR1NfTEVOR1RIID0gSFRNTDVfVEFHUy5sZW5ndGg7XHJcblx0XHRcdFxyXG5cdFx0XHRmdW5jdGlvbiBhY3RpdmF0ZUhUTUw1VGFncyAoY29udGVudERvY3VtZW50ICAgICAgICAgICkge1xyXG5cdFx0XHRcdHZhciBpbmRleCA9IEhUTUw1X1RBR1NfTEVOR1RIO1xyXG5cdFx0XHRcdHdoaWxlICggaW5kZXgtLSApIHtcclxuXHRcdFx0XHRcdGNvbnRlbnREb2N1bWVudC5jcmVhdGVFbGVtZW50KEhUTUw1X1RBR1NbaW5kZXhdKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0YWN0aXZhdGVIVE1MNVRhZ3MoZG9jdW1lbnQpO1xyXG5cdFx0XHRcclxuXHRcdFx0cmV0dXJuIGFjdGl2YXRlSFRNTDVUYWdzO1xyXG5cdFx0fSgpXHJcblx0XHJcbik7XHJcbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGZpbHRlckZvcm1zIChjb250ZW50RG9jdW1lbnQgICAgICAgICAgKSB7XHJcblx0XHJcblx0dmFyIGZvcm1zID0gY29udGVudERvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdmcm9tJyk7XHJcblx0dmFyIGluZGV4ID0gZm9ybXMubGVuZ3RoO1xyXG5cdFxyXG5cdHdoaWxlICggaW5kZXgtLSApIHtcclxuXHRcdHZhciBmb3JtID0gZm9ybXNbaW5kZXhdO1xyXG5cdFx0Zm9ybS5wYXJlbnROb2RlIC5yZW1vdmVDaGlsZChmb3JtKTtcclxuXHR9XHJcblx0XHJcbn07IiwiaW1wb3J0IG5vb3AgZnJvbSAnLi9ub29wJztcclxuaW1wb3J0IGZpbHRlckFuY2hvcnMgZnJvbSAnLi9maWx0ZXJBbmNob3JzJztcclxuaW1wb3J0IFNVUFBPUlRfU1RBVFVTIGZyb20gJy4vU1VQUE9SVF9TVEFUVVMnO1xyXG5pbXBvcnQgYWN0aXZhdGVIVE1MNVRhZ3MgZnJvbSAnLi9hY3RpdmF0ZUhUTUw1VGFncyc7XHJcbmltcG9ydCBmaWx0ZXJGb3JtcyBmcm9tICcuL2ZpbHRlckZvcm1zJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0ICggZnVuY3Rpb24gKCkge1xyXG5cdHN3aXRjaCAoIFNVUFBPUlRfU1RBVFVTICkge1xyXG5cdFx0XHJcblx0XHRjYXNlICdzYW5kYm94JzpcclxuXHRcdFx0dmFyIGp1c3RpZnkgPSBmdW5jdGlvbiBqdXN0aWZ5ICggICAgICAgICAgICAgICAgICAgICAgICkge1xyXG5cdFx0XHRcdHZhciBzdHlsZSA9IHRoaXMuc3R5bGU7XHJcblx0XHRcdFx0c3R5bGUuc2V0UHJvcGVydHkoJ2hlaWdodCcsICcwJywgJ2ltcG9ydGFudCcpO1xyXG5cdFx0XHRcdHN0eWxlLnNldFByb3BlcnR5KCdoZWlnaHQnLCB0aGlzLmNvbnRlbnREb2N1bWVudCAuZG9jdW1lbnRFbGVtZW50LnNjcm9sbEhlaWdodCsncHgnLCAnaW1wb3J0YW50Jyk7XHJcblx0XHRcdH07XHJcblx0XHRcdHJldHVybiBmdW5jdGlvbiByZW5kZXIgKGlGcmFtZSAgICAgICAgICAgICAgICAgICApIHtcclxuXHRcdFx0XHR2YXIgc3JjZG9jID0gaUZyYW1lLmdldEF0dHJpYnV0ZSgnc3JjZG9jJykgO1xyXG5cdFx0XHRcdGlGcmFtZS5yZW1vdmVBdHRyaWJ1dGUoJ3NyY2RvYycpO1xyXG5cdFx0XHRcdHZhciBzdHlsZSA9IGlGcmFtZS5zdHlsZTtcclxuXHRcdFx0XHRzdHlsZS5zZXRQcm9wZXJ0eSgnaGVpZ2h0JywgJzAnLCAnaW1wb3J0YW50Jyk7XHJcblx0XHRcdFx0aUZyYW1lLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBqdXN0aWZ5KTtcclxuXHRcdFx0XHR2YXIgY29udGVudERvY3VtZW50ID0gaUZyYW1lLmNvbnRlbnREb2N1bWVudCA7XHJcblx0XHRcdFx0Y29udGVudERvY3VtZW50Lm9wZW4oKTtcclxuXHRcdFx0XHRjb250ZW50RG9jdW1lbnQud3JpdGUoc3JjZG9jKTtcclxuXHRcdFx0XHRjb250ZW50RG9jdW1lbnQuY2xvc2UoKTtcclxuXHRcdFx0XHRmaWx0ZXJBbmNob3JzKGNvbnRlbnREb2N1bWVudCk7XHJcblx0XHRcdFx0c3R5bGUuaGVpZ2h0ID0gY29udGVudERvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxIZWlnaHQrJ3B4JztcclxuXHRcdFx0fTtcclxuXHRcdFx0XHJcblx0XHRjYXNlICdzZWN1cml0eSc6XHJcblx0XHRcdHZhciBjcmVhdGVKdXN0aWZ5ID0gZnVuY3Rpb24gKHN0eWxlICAgICAgICAgICAgICAgICAgICAgLCBjb250ZW50RG9jdW1lbnQgICAgICAgICAgKSB7XHJcblx0XHRcdFx0cmV0dXJuIGZ1bmN0aW9uIGp1c3RpZnkgKCAgICAgICAgICAgICkge1xyXG5cdFx0XHRcdFx0c3R5bGUuaGVpZ2h0ID0gJzAnO1xyXG5cdFx0XHRcdFx0c3R5bGUuaGVpZ2h0ID0gY29udGVudERvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxIZWlnaHQrJ3B4JztcclxuXHRcdFx0XHR9O1xyXG5cdFx0XHR9O1xyXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24gcmVuZGVyIChpRnJhbWUgICAgICAgICAgICAgICAgICAgKSB7XHJcblx0XHRcdFx0dmFyIHNyY2RvYyA9IGlGcmFtZS5nZXRBdHRyaWJ1dGUoJ3NyY2RvYycpIDtcclxuXHRcdFx0XHRpRnJhbWUucmVtb3ZlQXR0cmlidXRlKCdzcmNkb2MnKTtcclxuXHRcdFx0XHR2YXIgc3R5bGUgPSBpRnJhbWUuc3R5bGU7XHJcblx0XHRcdFx0c3R5bGUuaGVpZ2h0ID0gJzAnO1xyXG5cdFx0XHRcdGlGcmFtZS5zZXRBdHRyaWJ1dGUoJ3NlY3VyaXR5JywgJ3Jlc3RyaWN0ZWQnKTtcclxuXHRcdFx0XHR2YXIgY29udGVudERvY3VtZW50ID0gaUZyYW1lLmNvbnRlbnRXaW5kb3cgLmRvY3VtZW50O1xyXG5cdFx0XHRcdGlGcmFtZS5hdHRhY2hFdmVudCgnb25sb2FkJywgY3JlYXRlSnVzdGlmeShzdHlsZSwgY29udGVudERvY3VtZW50KSk7XHJcblx0XHRcdFx0Y29udGVudERvY3VtZW50Lm9wZW4oKTtcclxuXHRcdFx0XHRhY3RpdmF0ZUhUTUw1VGFncyhjb250ZW50RG9jdW1lbnQpO1xyXG5cdFx0XHRcdGNvbnRlbnREb2N1bWVudC53cml0ZShzcmNkb2MpO1xyXG5cdFx0XHRcdGNvbnRlbnREb2N1bWVudC5jbG9zZSgpO1xyXG5cdFx0XHRcdGZpbHRlckZvcm1zKGNvbnRlbnREb2N1bWVudCk7XHJcblx0XHRcdFx0c3R5bGUuaGVpZ2h0ID0gY29udGVudERvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxIZWlnaHQrJ3B4JztcclxuXHRcdFx0fTtcclxuXHRcdFx0XHJcblx0XHRjYXNlICdpbkRhbmdlcic6XHJcblx0XHRcdHJldHVybiBmdW5jdGlvbiByZW5kZXIgKGlGcmFtZSAgICAgICAgICAgICAgICAgICApIHsgaUZyYW1lLnJlbW92ZUF0dHJpYnV0ZSgnc3JjZG9jJyk7IH07XHJcblx0XHRjYXNlICdkYW5nZXJvdXMnOlxyXG5cdFx0XHRyZXR1cm4gbm9vcDtcclxuXHRcdFx0XHJcblx0fVxyXG59ICkoKTtcclxuIiwiZXhwb3J0IGRlZmF1bHQgJ2otc2FuZGRvYyc7IiwiZXhwb3J0IGRlZmF1bHQgJ2FsbG93LXBvcHVwcyBhbGxvdy1wb3B1cHMtdG8tZXNjYXBlLXNhbmRib3ggYWxsb3ctc2FtZS1vcmlnaW4gYWxsb3ctdG9wLW5hdmlnYXRpb24nOyIsImltcG9ydCBPYmplY3QgZnJvbSAnLk9iamVjdCc7XG5cbmltcG9ydCBub29wIGZyb20gJy4vbm9vcCc7XG5cbmltcG9ydCBTQU5EQk9YIGZyb20gJy4vU0FOREJPWCc7XG5pbXBvcnQgU1VQUE9SVF9TVEFUVVMgZnJvbSAnLi9TVVBQT1JUX1NUQVRVUyc7XG5cbmltcG9ydCBuYW1lIGZyb20gJy4vdnVlLm5hbWUnO1xuXG5pbXBvcnQgYWN0aXZhdGVIVE1MNVRhZ3MgZnJvbSAnLi9hY3RpdmF0ZUhUTUw1VGFncyc7XG5pbXBvcnQgZmlsdGVyQW5jaG9ycyBmcm9tICcuL2ZpbHRlckFuY2hvcnMnO1xuaW1wb3J0IGZpbHRlckZvcm1zIGZyb20gJy4vZmlsdGVyRm9ybXMnO1xuXG52YXIgUmVhZG9ubHkgPSBPYmplY3QuZnJlZXplO1xuXG5leHBvcnQgZGVmYXVsdCBSZWFkb25seSAmJiAvKiNfX1BVUkVfXyovIGZ1bmN0aW9uICgpICAgICAgICAgICAgICAgICAgICAgICAgIHtcblx0XG5cdHZhciBjcmVhdGUgPSBPYmplY3QuY3JlYXRlO1xuXHRcblx0ZnVuY3Rpb24gcmVhZG9ubHkgICAgKHZhbHVlICAgKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuXHRcdHZhciBkZXNjcmlwdG9yID0gY3JlYXRlKG51bGwpO1xuXHRcdGRlc2NyaXB0b3IudmFsdWUgPSB2YWx1ZTtcblx0XHRkZXNjcmlwdG9yLmVudW1lcmFibGUgPSB0cnVlO1xuXHRcdHJldHVybiBkZXNjcmlwdG9yO1xuXHR9XG5cdGZ1bmN0aW9uIHdyaXRhYmxlICAgICh2YWx1ZSAgICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcblx0XHR2YXIgZGVzY3JpcHRvciA9IGNyZWF0ZShudWxsKTtcblx0XHRkZXNjcmlwdG9yLmdldCA9IGZ1bmN0aW9uICgpICAgIHsgcmV0dXJuIHZhbHVlOyB9O1xuXHRcdGRlc2NyaXB0b3Iuc2V0ID0gbm9vcDtcblx0XHRkZXNjcmlwdG9yLmVudW1lcmFibGUgPSB0cnVlO1xuXHRcdHJldHVybiBkZXNjcmlwdG9yO1xuXHR9XG5cdFxuXHR2YXIgbmV2ZXIgPSBSZWFkb25seSh7XG5cdFx0dmFsaWRhdG9yOiBmdW5jdGlvbiAodmFsdWUgICAgICkgeyByZXR1cm4gdmFsdWU9PW51bGw7IH1cblx0fSk7XG5cdHZhciBwcm9wcyA9IFJlYWRvbmx5KHtcblx0XHRzcmNkb2M6IFJlYWRvbmx5KHtcblx0XHRcdHJlcXVpcmVkOiB0cnVlICAgICAgICAsXG5cdFx0XHR2YWxpZGF0b3I6IGZ1bmN0aW9uICh2YWx1ZSAgICAgKSAgICAgICAgICAgICAgICAgIHsgcmV0dXJuIHR5cGVvZiB2YWx1ZT09PSdzdHJpbmcnOyB9XG5cdFx0fSksXG5cdFx0c2FuZGJveDogbmV2ZXIsXG5cdFx0c2VjdXJpdHk6IG5ldmVyLFxuXHRcdHNyYzogbmV2ZXIsXG5cdFx0bmFtZTogbmV2ZXIsXG5cdFx0d2lkdGg6IG5ldmVyLFxuXHRcdHNlYW1sZXNzOiBuZXZlcixcblx0XHRzY3JvbGxpbmc6IG5ldmVyLFxuXHRcdGZyYW1lYm9yZGVyOiBuZXZlcixcblx0XHRtYXJnaW53aWR0aDogbmV2ZXIsXG5cdFx0bWFyZ2luaGVpZ2h0OiBuZXZlclxuXHR9KTtcblx0dmFyIHN0YXRpY1N0eWxlID0gUmVhZG9ubHkoeyBoZWlnaHQ6ICcwIWltcG9ydGFudCcgfSk7XG5cdHZhciByZW5kZXI7XG5cdHZhciBwYXJzZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgO1xuXHRcblx0aWYgKCBTVVBQT1JUX1NUQVRVUz09PSdzYW5kYm94JyApIHtcblx0XHQvLyBzYW5kYm94IHNyY2RvYzogQ2hyb21lKyBTYWZhcmkrIEZpcmVmb3grXG5cdFx0Ly8gc2FuZGJveDogRWRnZSsgSUUxMCtcblx0XHRyZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIgKGNyZWF0ZUVsZW1lbnQgICAgICkge1xuXHRcdFx0cmV0dXJuIGNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScsIHtcblx0XHRcdFx0c3RhdGljU3R5bGU6IHN0YXRpY1N0eWxlLFxuXHRcdFx0XHRhdHRyczogUmVhZG9ubHkoeyBzYW5kYm94OiBTQU5EQk9YLCB3aWR0aDogJzEwMCUnLCBmcmFtZWJvcmRlcjogJzAnLCBzY3JvbGxpbmc6ICdubycsIG1hcmdpbndpZHRoOiAnMCcsIG1hcmdpbmhlaWdodDogJzAnIH0pLFxuXHRcdFx0XHRuYXRpdmVPbjogbmF0aXZlT25cblx0XHRcdH0pO1xuXHRcdH07XG5cdFx0cGFyc2UgPSBmdW5jdGlvbiBwYXJzZSAoJGVsICAgICAgICAgICAgICAgICAgICwgY29udGVudERvY3VtZW50ICAgICAgICAgICwgc3JjZG9jICAgICAgICApIHtcblx0XHRcdGNvbnRlbnREb2N1bWVudC5vcGVuKCk7XG5cdFx0XHRjb250ZW50RG9jdW1lbnQud3JpdGUoc3JjZG9jKTtcblx0XHRcdGNvbnRlbnREb2N1bWVudC5jbG9zZSgpO1xuXHRcdFx0ZmlsdGVyQW5jaG9ycyhjb250ZW50RG9jdW1lbnQpO1xuXHRcdFx0JGVsLnN0eWxlLnNldFByb3BlcnR5KCdoZWlnaHQnLCBjb250ZW50RG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbEhlaWdodCsncHgnLCAnaW1wb3J0YW50Jyk7XG5cdFx0fTtcblx0fVxuXHRcblx0ZWxzZSBpZiAoIFNVUFBPUlRfU1RBVFVTPT09J3NlY3VyaXR5JyApIHtcblx0XHQvLyBzZWN1cml0eTogSUU5KC0pXG5cdFx0cmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyIChjcmVhdGVFbGVtZW50ICAgICApIHtcblx0XHRcdHJldHVybiBjcmVhdGVFbGVtZW50KCdpZnJhbWUnLCB7XG5cdFx0XHRcdHN0YXRpY1N0eWxlOiBzdGF0aWNTdHlsZSxcblx0XHRcdFx0YXR0cnM6IFJlYWRvbmx5KHsgc2VjdXJpdHk6ICdyZXN0cmljdGVkJywgd2lkdGg6ICcxMDAlJywgZnJhbWVib3JkZXI6ICcwJywgc2Nyb2xsaW5nOiAnbm8nLCBtYXJnaW53aWR0aDogJzAnLCBtYXJnaW5oZWlnaHQ6ICcwJyB9KSxcblx0XHRcdFx0bmF0aXZlT246IG5hdGl2ZU9uXG5cdFx0XHR9KTtcblx0XHR9O1xuXHRcdHBhcnNlID0gZnVuY3Rpb24gcGFyc2UgKCRlbCAgICAgICAgICAgICAgICAgICAsIGNvbnRlbnREb2N1bWVudCAgICAgICAgICAsIHNyY2RvYyAgICAgICAgKSB7XG5cdFx0XHRjb250ZW50RG9jdW1lbnQub3BlbigpO1xuXHRcdFx0YWN0aXZhdGVIVE1MNVRhZ3MoY29udGVudERvY3VtZW50KTtcblx0XHRcdGNvbnRlbnREb2N1bWVudC53cml0ZShzcmNkb2MpO1xuXHRcdFx0Y29udGVudERvY3VtZW50LmNsb3NlKCk7XG5cdFx0XHRmaWx0ZXJGb3Jtcyhjb250ZW50RG9jdW1lbnQpO1xuXHRcdFx0JGVsLnN0eWxlLnNldFByb3BlcnR5KCdoZWlnaHQnLCBjb250ZW50RG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbEhlaWdodCsncHgnLCAnaW1wb3J0YW50Jyk7XG5cdFx0fTtcblx0fVxuXHRcblx0ZWxzZSB7XG5cdFx0cmV0dXJuIGNyZWF0ZShudWxsLCB7XG5cdFx0XHRuYW1lOiB3cml0YWJsZShuYW1lKSxcblx0XHRcdHByb3BzOiB3cml0YWJsZShwcm9wcyksXG5cdFx0XHRpbmhlcml0QXR0cnM6IHJlYWRvbmx5KGZhbHNlKSxcblx0XHRcdHJlbmRlcjogcmVhZG9ubHkoZnVuY3Rpb24gcmVuZGVyIChjcmVhdGVFbGVtZW50ICAgICApIHtcblx0XHRcdFx0cmV0dXJuIGNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScsIHtcblx0XHRcdFx0XHRzdGF0aWNTdHlsZTogc3RhdGljU3R5bGUsXG5cdFx0XHRcdFx0YXR0cnM6IFJlYWRvbmx5KHsgd2lkdGg6ICcxMDAlJywgZnJhbWVib3JkZXI6ICcwJywgc2Nyb2xsaW5nOiAnbm8nLCBtYXJnaW53aWR0aDogJzAnLCBtYXJnaW5oZWlnaHQ6ICcwJyB9KVxuXHRcdFx0XHR9KTtcblx0XHRcdH0pLFxuXHRcdFx0bWV0aG9kczogcmVhZG9ubHkoUmVhZG9ubHkoe1xuXHRcdFx0XHRyZW5kZXI6IG5vb3Bcblx0XHRcdH0pKVxuXHRcdH0pO1xuXHR9XG5cdFxuXHR2YXIgbmF0aXZlT24gPSBSZWFkb25seSh7XG5cdFx0bG9hZDogZnVuY3Rpb24ganVzdGlmeSAoICAgICAgICAgICAgICAgICAgICAgICApIHtcblx0XHRcdHZhciBzdHlsZSA9IHRoaXMuc3R5bGU7XG5cdFx0XHRzdHlsZS5zZXRQcm9wZXJ0eSgnaGVpZ2h0JywgJzAnLCAnaW1wb3J0YW50Jyk7XG5cdFx0XHRzdHlsZS5zZXRQcm9wZXJ0eSgnaGVpZ2h0JywgdGhpcy5jb250ZW50RG9jdW1lbnQgLmRvY3VtZW50RWxlbWVudC5zY3JvbGxIZWlnaHQrJ3B4JywgJ2ltcG9ydGFudCcpO1xuXHRcdH1cblx0fSk7XG5cdFxuXHR2YXIgbW91bnRlZF9hY3RpdmF0ZWQgPSByZWFkb25seShmdW5jdGlvbiBtb3VudGVkX2FjdGl2YXRlZCAoICAgICAgICAgICkge1xuXHRcdHZhciAkZWwgPSB0aGlzLiRlbCA7XG5cdFx0dmFyIGNvbnRlbnREb2N1bWVudCA9ICRlbC5jb250ZW50RG9jdW1lbnQ7XG5cdFx0Y29udGVudERvY3VtZW50ICYmIHBhcnNlKCRlbCwgY29udGVudERvY3VtZW50LCB0aGlzLnNyY2RvYyk7XG5cdH0pO1xuXHRcblx0cmV0dXJuIGNyZWF0ZShudWxsLCB7XG5cdFx0bmFtZTogd3JpdGFibGUobmFtZSksXG5cdFx0cHJvcHM6IHdyaXRhYmxlKHByb3BzKSxcblx0XHRpbmhlcml0QXR0cnM6IHJlYWRvbmx5KGZhbHNlKSxcblx0XHRyZW5kZXI6IHJlYWRvbmx5KHJlbmRlciksXG5cdFx0bW91bnRlZDogbW91bnRlZF9hY3RpdmF0ZWQsXG5cdFx0YWN0aXZhdGVkOiBtb3VudGVkX2FjdGl2YXRlZCxcblx0XHR3YXRjaDogcmVhZG9ubHkoUmVhZG9ubHkoe1xuXHRcdFx0c3JjZG9jOiBmdW5jdGlvbiAoICAgICAgICAgICAgc3JjZG9jICAgICAgICAsIG9sZCAgICAgICAgKSB7XG5cdFx0XHRcdGlmICggc3JjZG9jIT09b2xkICkge1xuXHRcdFx0XHRcdHZhciAkZWwgPSB0aGlzLiRlbDtcblx0XHRcdFx0XHRpZiAoICRlbCApIHtcblx0XHRcdFx0XHRcdHZhciBjb250ZW50RG9jdW1lbnQgPSAkZWwuY29udGVudERvY3VtZW50O1xuXHRcdFx0XHRcdFx0Y29udGVudERvY3VtZW50ICYmIHBhcnNlKCRlbCwgY29udGVudERvY3VtZW50LCBzcmNkb2MpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pKSxcblx0XHRtZXRob2RzOiByZWFkb25seShSZWFkb25seSh7XG5cdFx0XHRyZW5kZXI6IGZ1bmN0aW9uIHJlbmRlciAoICAgICAgICAgICkge1xuXHRcdFx0XHR2YXIgJGVsID0gdGhpcy4kZWwgO1xuXHRcdFx0XHRwYXJzZSgkZWwsICRlbC5jb250ZW50RG9jdW1lbnQgLCB0aGlzLnNyY2RvYyk7XG5cdFx0XHR9XG5cdFx0fSkpXG5cdH0pO1xuXHRcbn0oKTtcblxuICAgICAgICAgICAgIFxuXHQgICAgICAgICAgICAgICAgICAgICAgICAgXG5cdCAgICAgICAgICAgICAgXG5cdCAgICAgICAgICAgICAgICAgICAgICAgXG4gICIsImltcG9ydCBTQU5EQk9YIGZyb20gJy4vU0FOREJPWCc7XHJcbmltcG9ydCByZW5kZXIgZnJvbSAnLi9yZW5kZXInO1xyXG5cclxudmFyIFNnID0gL1xcUysvZztcclxuXHJcbmZ1bmN0aW9uIGlzU2FuZEJveCAoc2FuZGJveCAgICAgICAgICAgICAgICkge1xyXG5cdGlmICggc2FuZGJveCApIHtcclxuXHRcdGlmICggc2FuZGJveD09PVNBTkRCT1ggKSB7IHJldHVybiB0cnVlOyB9XHJcblx0XHR2YXIgc2FuZGJveGVzID0gc2FuZGJveC5tYXRjaChTZykgO1xyXG5cdFx0cmV0dXJuIHNhbmRib3hlcy5sZW5ndGg9PT00ICYmIHNhbmRib3hlcy5zb3J0KCkuam9pbignICcpPT09U0FOREJPWDtcclxuXHR9XHJcblx0cmV0dXJuIGZhbHNlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc1NhbmREb2MgKGlGcmFtZSAgICAgICAgICAgICAgICAgICApICAgICAgICAgIHtcclxuXHRyZXR1cm4gaUZyYW1lLmdldEF0dHJpYnV0ZSgnc3JjZG9jJykgJiYgaXNTYW5kQm94KGlGcmFtZS5nZXRBdHRyaWJ1dGUoJ3NhbmRib3gnKSkgPyAoXHJcblx0XHQhaUZyYW1lLnNyYyAmJlxyXG5cdFx0IWlGcmFtZS5uYW1lICYmXHJcblx0XHQhaUZyYW1lLnNlYW1sZXNzICYmXHJcblx0XHRpRnJhbWUuZ2V0QXR0cmlidXRlKCd3aWR0aCcgICAgICAgKT09PScxMDAlJyAmJlxyXG5cdFx0aUZyYW1lLmdldEF0dHJpYnV0ZSgnc2Nyb2xsaW5nJyAgICk9PT0nbm8nICAgJiZcclxuXHRcdGlGcmFtZS5nZXRBdHRyaWJ1dGUoJ2ZyYW1lYm9yZGVyJyApPT09JzAnICAgICYmXHJcblx0XHRpRnJhbWUuZ2V0QXR0cmlidXRlKCdtYXJnaW53aWR0aCcgKT09PScwJyAgICAmJlxyXG5cdFx0aUZyYW1lLmdldEF0dHJpYnV0ZSgnbWFyZ2luaGVpZ2h0Jyk9PT0nMCdcclxuXHQpIDogZmFsc2U7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZpbHRlclNhbmREb2NzIChpRnJhbWVzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xyXG5cdHZhciBzYW5kRG9jcyA9IFtdO1xyXG5cdHZhciBpbmRleCA9IGlGcmFtZXMubGVuZ3RoO1xyXG5cdHdoaWxlICggaW5kZXgtLSApIHtcclxuXHRcdHZhciBpRnJhbWUgPSBpRnJhbWVzW2luZGV4XTtcclxuXHRcdGlmICggaXNTYW5kRG9jKGlGcmFtZSkgKSB7IHNhbmREb2NzLnB1c2goaUZyYW1lKTsgfVxyXG5cdH1cclxuXHRyZXR1cm4gc2FuZERvY3M7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJlbmRlckFsbCAod2luICAgICAgICApIHtcclxuXHR2YXIgc2FuZERvY3MgPSBmaWx0ZXJTYW5kRG9jcyh3aW4uZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2lmcmFtZScpKTtcclxuXHR2YXIgaW5kZXggPSBzYW5kRG9jcy5sZW5ndGg7XHJcblx0d2hpbGUgKCBpbmRleC0tICkge1xyXG5cdFx0cmVuZGVyKHNhbmREb2NzW2luZGV4XSk7XHJcblx0fVxyXG59O1xyXG4iLCJpbXBvcnQgdG9wIGZyb20gJy50b3AnO1xyXG5pbXBvcnQgc2V0VGltZW91dCBmcm9tICcuc2V0VGltZW91dCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBvblJlYWR5IChjYWxsYmFjayAgICAgICAgICAgICAgICAgICAgICAsIHdpbiAgICAgICAgKSAgICAgICB7XHJcblx0dmFyIGRvYyA9IHdpbi5kb2N1bWVudDtcclxuXHRpZiAoIGRvYy5yZWFkeVN0YXRlPT09J2NvbXBsZXRlJyApIHtcclxuXHRcdHJldHVybiBjYWxsYmFjaygpO1xyXG5cdH1cclxuXHRpZiAoIGRvYy5hZGRFdmVudExpc3RlbmVyICkge1xyXG5cdFx0cmV0dXJuIGRvYy5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24gbGlzdGVuZXIgKCAgICAgICAgICAgICAgKSB7XHJcblx0XHRcdGRvYy5yZW1vdmVFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgbGlzdGVuZXIpO1xyXG5cdFx0XHRjYWxsYmFjaygpO1xyXG5cdFx0fSwgZmFsc2UpO1xyXG5cdH1cclxuXHRpZiAoIHdpbj09dG9wICkge1xyXG5cdFx0dmFyIGRvY3VtZW50RWxlbWVudCA9IGRvYy5kb2N1bWVudEVsZW1lbnQ7XHJcblx0XHRpZiAoIGRvY3VtZW50RWxlbWVudC5kb1Njcm9sbCApIHtcclxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbiBoYW5kbGVyICgpIHtcclxuXHRcdFx0XHR0cnkgeyBkb2N1bWVudEVsZW1lbnQuZG9TY3JvbGwgKCdsZWZ0Jyk7IH1cclxuXHRcdFx0XHRjYXRjaCAoZXJyb3IpIHtcclxuXHRcdFx0XHRcdHNldFRpbWVvdXQoaGFuZGxlciwgMCk7XHJcblx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGNhbGxiYWNrKCk7XHJcblx0XHRcdH0sIDApO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0fVxyXG5cdGRvYy5hdHRhY2hFdmVudCgnb25yZWFkeXN0YXRlY2hhbmdlJywgZnVuY3Rpb24gbGlzdGVuZXIgKCAgICAgICAgICAgICkge1xyXG5cdFx0aWYgKCBkb2MucmVhZHlTdGF0ZT09PSdjb21wbGV0ZScgKSB7XHJcblx0XHRcdGRvYy5kZXRhY2hFdmVudCgnb25yZWFkeXN0YXRlY2hhbmdlJywgbGlzdGVuZXIpO1xyXG5cdFx0XHRjYWxsYmFjaygpO1xyXG5cdFx0fVxyXG5cdH0pO1xyXG59O1xyXG4iLCJpbXBvcnQgd2luZG93IGZyb20gJy53aW5kb3cnO1xuXG5pbXBvcnQgbmFtZSBmcm9tICcuL3Z1ZS5uYW1lJztcbmltcG9ydCB2dWUgZnJvbSAnLi92dWUnO1xuaW1wb3J0IHJlbmRlckFsbCBmcm9tICcuL3JlbmRlckFsbCc7XG5pbXBvcnQgb25SZWFkeSBmcm9tICcuL29uUmVhZHknO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBpbnN0YWxsICh3aW5WdWUgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuXHRpZiAoIHdpblZ1ZT09bnVsbCApIHtcblx0XHR3aW5WdWUgPSAoIHdpbmRvdyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKS5WdWU7XG5cdFx0aWYgKCB0eXBlb2Ygd2luVnVlPT09J2Z1bmN0aW9uJyApIHtcblx0XHRcdHdpblZ1ZS5jb21wb25lbnQobmFtZSwgdnVlKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRvblJlYWR5KGZ1bmN0aW9uICgpIHsgcmVuZGVyQWxsKHdpbmRvdyk7IH0sIHdpbmRvdyk7XG5cdFx0fVxuXHR9XG5cdGVsc2Uge1xuXHRcdGlmICggdHlwZW9mIHdpblZ1ZT09PSdmdW5jdGlvbicgKSB7XG5cdFx0XHR3aW5WdWUuY29tcG9uZW50KG5hbWUsIHZ1ZSk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0b25SZWFkeShmdW5jdGlvbiAoKSB7IHJlbmRlckFsbCh3aW5WdWUgICAgICAgICAgKTsgfSwgd2luVnVlKTtcblx0XHR9XG5cdH1cbn07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgXG5cdCAgICAgICAgICAgICAgICAgICAgICAgIFxuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBcbiIsImltcG9ydCB2ZXJzaW9uIGZyb20gJy4vdmVyc2lvbj90ZXh0JztcblxuaW1wb3J0IHJlbmRlciBmcm9tICcuL3JlbmRlcic7XG5pbXBvcnQgaW5zdGFsbCBmcm9tICcuL2luc3RhbGwnO1xuaW1wb3J0IHZ1ZSBmcm9tICcuL3Z1ZSc7XG5leHBvcnQge1xuXHR2ZXJzaW9uLFxuXHR2dWUsXG5cdHJlbmRlcixcblx0aW5zdGFsbCxcbn07XG5cbmltcG9ydCBEZWZhdWx0IGZyb20gJy5kZWZhdWx0Pz0nO1xuZXhwb3J0IGRlZmF1bHQgRGVmYXVsdCh7XG5cdHZlcnNpb246IHZlcnNpb24sXG5cdHZ1ZTogdnVlLFxuXHRyZW5kZXI6IHJlbmRlcixcblx0aW5zdGFsbDogaW5zdGFsbCxcblx0XzogdHlwZW9mIG1vZHVsZSE9PSd1bmRlZmluZWQnICYmIHR5cGVvZiBleHBvcnRzPT09J29iamVjdCcgfHwgdHlwZW9mIGRlZmluZT09PSdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCB8fCAvKiNfX1BVUkVfXyovIGluc3RhbGwoKVxufSk7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxlQUFlLE9BQU87O3VCQUFDLHRCQ0FSLFNBQVMsSUFBSSxJQUFJLEVBQUU7O0NDSWxDLElBQUksVUFBVSxpQkFBaUIsWUFBWTtDQUMzQyxDQUFDLElBQUksVUFBVSxHQUFHLG9CQUFvQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDL0QsQ0FBQyxPQUFPLFVBQVU7Q0FDbEIsSUFBSSxVQUFVLElBQUksVUFBVSxFQUFFLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtDQUNwRSxJQUFJLElBQUksQ0FBQztDQUNULENB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Q2YsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQ1QsR0FBRyxPQUFPO0NBQ1YsR0FBRztDQUNILEVBQUU7Q0FDRixDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsb0JBQW9CLEVBQUUsU0FBUyxRQUFRLGdCQUFnQjtDQUN4RSxFQUFFLEtBQUssR0FBRyxDQUFDLFVBQVUsR0FBRyxVQUFVLEdBQUc7Q0FDckMsR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLG9CQUFvQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0NBQ25ELEdBQUcsUUFBUSxFQUFFLENBQUM7Q0FDZCxHQUFHO0NBQ0gsRUFBRSxDQUFDLENBQUM7Q0FDSixDQUFDOztDQzNCYyxTQUFTLE9BQU8sRUFBRSxNQUFNLDRCQUE0QjtDQUNuRSxDQUFDLEtBQUssTUFBTSxFQUFFLElBQUksR0FBRztDQUNyQixFQUFFLE1BQU0sR0FBRyxFQUFFLE1BQU0sK0JBQStCLEdBQUcsQ0FBQztDQUN0RCxFQUFFLEtBQUssT0FBTyxNQUFNLEdBQUcsVUFBVSxHQUFHO0NBQ3BDLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7Q0FDL0IsR0FBRztDQUNILE9BQU87Q0FDUCxHQUFHLE9BQU8sQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztDQUN2RCxHQUFHO0NBQ0gsRUFBRTtDQUNGLE1BQU07Q0FDTixFQUFFLEtBQUssT0FBTyxNQUFNLEdBQUcsVUFBVSxHQUFHO0NBQ3BDLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7Q0FDL0IsR0FBRztDQUNILE9BQU87Q0FDUCxHQUFHLE9BQU8sQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLE1BQU0sV0FBVyxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztDQUNqRSxHQUFHO0NBQ0gsRUFBRTtDQUNGLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ1pELGVBQWUsT0FBTyxDQUFDO0NBQ3ZCLENBQUMsT0FBTyxFQUFFLE9BQU87Q0FDakIsQ0FBQyxHQUFHLEVBQUUsR0FBRztDQUNULENBQUMsTUFBTSxFQUFFLE1BQU07Q0FDZixDQUFDLE9BQU8sRUFBRSxPQUFPO0NBQ2pCLENBQUMsQ0FBQyxFQUFFLE9BQU8sTUFBTSxHQUFHLFdBQVcsSUFBSSxPQUFPLE9BQU8sR0FBRyxRQUFRLElBQUksT0FBTyxNQUFNLEdBQUcsVUFBVSxJQUFJLE1BQU0sQ0FBQyxHQUFHLGtCQUFrQixPQUFPLEVBQUU7Q0FDbkksQ0FBQyxDQUFDLENBQUM7Ozs7Ozs7OyIsInNvdXJjZVJvb3QiOiIuLi8uLi9zcmMvIn0=