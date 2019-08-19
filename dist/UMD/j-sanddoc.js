/*!
 * 模块名称：j-sanddoc
 * 模块功能：前端富文本展示方案。从属于“简计划”。
   　　　　　Font-end rich text display plan. Belong to "Plan J".
 * 模块版本：4.1.9
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

	var version = '4.1.9';

	var sameOrigin = /*#__PURE__*/ function () {
		var pageOrigin = /^https?:\/\/[^/]+|/.exec(location.href) [0];
		return pageOrigin
			? function (href        ) { return href.indexOf(pageOrigin)===0; }
			: function () {};
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
			? function activateHTML5Tags () {}
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

	function justify (                       ) {
		var style = this.style;
		style.height = '0';
		style.height = this.contentDocument .documentElement.scrollHeight+'px';
	}

	function createJustify (iFrame                   , style                     , contentDocument          ) {
		return function justify () {
			iFrame.detachEvent('onLoad', justify);
			style.height = '0';
			style.height = contentDocument.documentElement.scrollHeight+'px';
		};
	}

	var render = ( function () {
		switch ( SUPPORT_STATUS ) {
			case 'sandbox':
				return function render (iFrame                   ) {
					var doc = iFrame.getAttribute('srcDoc');
					iFrame.removeAttribute('srcDoc');
					var style = iFrame.style;
					style.height = '0';
					if ( doc ) {
						iFrame.addEventListener('load', justify);
						var contentDocument = iFrame.contentDocument ;
						contentDocument.open();
						contentDocument.write(doc);
						contentDocument.close();
						filterAnchors(contentDocument);
						style.height = contentDocument.documentElement.scrollHeight+'px';
					}
				};
			case 'security':
				return function render (iFrame                   ) {
					var doc = iFrame.getAttribute('srcDoc');
					iFrame.removeAttribute('srcDoc');
					var style = iFrame.style;
					style.height = '0';
					if ( doc ) {
						iFrame.setAttribute('security', 'restricted');
						var contentDocument = iFrame.contentWindow .document;
						iFrame.attachEvent('onLoad', createJustify(iFrame, style, contentDocument));
						contentDocument.open();
						activateHTML5Tags(contentDocument);
						contentDocument.write(doc);
						contentDocument.close();
						filterForms(contentDocument);
						style.height = contentDocument.documentElement.scrollHeight+'px';
					}
				};
			case 'inDanger':
				return function render (iFrame                   ) { iFrame.removeAttribute('srcDoc'); };
			case 'dangerous':
				return function render () {};
		}
	} )();

	var SANDBOX = 'allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-top-navigation';

	function isSandDoc (iFrame                   ) {
		var sandbox;
		var sandboxes;
		return (
			!iFrame.src &&
			!iFrame.name &&
			!iFrame.seamless &&
			( sandbox = iFrame.getAttribute('sandbox') ) &&
			( sandbox===SANDBOX ||
				( sandboxes = sandbox.split(' '),
					sandboxes.length===4 &&
					sandboxes.sort().join(' ')===SANDBOX
				)
			) &&
			iFrame.getAttribute('width')==='100%' &&
			iFrame.getAttribute('scrolling')==='no' &&
			iFrame.getAttribute('frameBorder')==='0' &&
			iFrame.getAttribute('marginWidth')==='0' &&
			iFrame.getAttribute('marginHeight')==='0' &&
			iFrame.getAttribute('srcDoc')
		);
	}

	function collectSandDocs (document          ) {
		var sandDocs = [];
		var iFrames = document.getElementsByTagName('iframe');
		var index = iFrames.length;
		while ( index-- ) {
			var iFrame = iFrames[index];
			if ( isSandDoc(iFrame) ) { sandDocs.push(iFrame); }
		}
		return sandDocs;
	}

	function scan (doc           ) {
		var sandDocs = collectSandDocs(doc || document);
		var index = sandDocs.length;
		while ( index-- ) {
			render(sandDocs[index]);
		}
	}

	function scanOnReady (doc           ) {
		
		if ( !doc ) { doc = document; }
		
		if ( doc.readyState==='complete' ) {
			scan(doc);
			return;
		}
		
		var listener = function () { scan(doc); };
		if ( doc.addEventListener ) {
			doc.addEventListener('DOMContentLoaded', listener, false);
			return;
		}
		
		if ( window==top ) {
			var documentElement = doc.documentElement;
			if ( documentElement.doScroll ) {
				setTimeout(function callee () {
					try { documentElement.doScroll ('left'); }
					catch (error) {
						setTimeout(callee, 0);
						return;
					}
					listener();
				}, 0);
				return;
			}
		}
		
		doc.attachEvent('onreadystatechange', function callee () {
			if ( doc .readyState==='complete' ) {
				doc .detachEvent('onreadystatechange', callee);
				listener();
			}
		});
		
	}

	function justify$1 (event        ) {
		var iFrame = ( event || window.event ) .target                     ;
		var style = iFrame.style;
		style.height = '0';
		style.height = iFrame.contentDocument .documentElement.scrollHeight+'px';
	}

	var props = {
		doc: {
			required: true,
			validator: function (value         ) { return typeof value==='string'; }
		}
	};

	var div = /*#__PURE__*/ document.createElement('div');

	function setDoc (                                             ) {
		var el = this.$el;
		div.innerHTML = '<iframe sandbox="'+SANDBOX+'" width="100%" frameBorder="0" scrolling="no" marginWidth="0" marginHeight="0" style="height:0;"></iframe>';
		var iFrame = this.$el = div.lastChild                     ;
		var parentNode = el.parentNode;
		if ( parentNode===null ) {
			div.removeChild(iFrame);
			return;
		}
		parentNode.replaceChild(iFrame, el);
		var doc = this.doc;
		if ( doc==='' ) { return; }
		iFrame.addEventListener('load', justify$1);
		var contentDocument = iFrame.contentDocument ;
		contentDocument.open();
		contentDocument.write(doc);
		contentDocument.close();
		filterAnchors(contentDocument);
		iFrame.style.height = contentDocument.documentElement.scrollHeight+'px';
	}

	var case_sandbox = {
		props: props,
		inheritAttrs: false,
		render: function (createElement     ) { return createElement('iframe'); },
		mounted: setDoc,
		activated: setDoc,
		watch: { doc: setDoc }
	};

	function setDoc$1 (                                             ) {
		var el = this.$el;
		div.innerHTML = '<iframe security="restricted" width="100%" frameBorder="0" scrolling="no" marginWidth="0" marginHeight="0" style="height:0;"></iframe>';
		var iFrame = this.$el = div.lastChild                     ;
		var parentNode = el.parentNode;
		if ( parentNode===null ) {
			div.removeChild(iFrame);
			return;
		}
		parentNode.replaceChild(iFrame, el);
		var doc = this.doc;
		if ( doc==='' ) { return; }
		iFrame.addEventListener('load', justify$1);
		var contentDocument = iFrame.contentDocument ;
		contentDocument.open();
		activateHTML5Tags(contentDocument);
		contentDocument.write(doc);
		contentDocument.close();
		filterForms(contentDocument);
		iFrame.style.height = contentDocument.documentElement.scrollHeight+'px';
	}

	var case_security = {
		props: props,
		inheritAttrs: false,
		render: function (createElement     ) { return createElement('iframe'); },
		mounted: setDoc$1,
		activated: setDoc$1,
		watch: { doc: setDoc$1 }
	};

	var default_ = {
		props: props,
		inheritAttrs: false,
		render: function (createElement     ) {
			return createElement('iframe', {
				staticStyle: {
					height: '0'
				},
				attrs: {
					width: '100%',
					frameBorder: '0',
					scrolling: 'no',
					marginWidth: '0',
					marginHeight: '0'
				}
			});
		}
	};

	var vue = ( function () {
		switch ( SUPPORT_STATUS ) {
			// sandbox srcdoc: Chrome+ Safari+ Firefox+
			// sandbox: Edge+ IE10+
			case 'sandbox':
				return case_sandbox;
			// security: IE9(-)
			case 'security':
				return case_security;
			default:
				return default_;
		}
	} )();

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

	var _export = Default(render, {
		version: version,
		render: render,
		scan: scan,
		scanOnReady: scanOnReady,
		vue: vue,
		_: typeof module!=='undefined' && typeof exports==='object' || typeof define==='function' && define.amd || /*#__PURE__*/ scanOnReady()
	});

	return _export;

}));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZlcnNpb24/dGV4dCIsInNjaGVtZV9zdGF0LnRzIiwiZmlsdGVyQW5jaG9ycy50cyIsIlNVUFBPUlRfU1RBVFVTLnRzIiwiYWN0aXZhdGVIVE1MNVRhZ3MudHMiLCJmaWx0ZXJGb3Jtcy50cyIsInJlbmRlci50cyIsIlNBTkRCT1gudHMiLCJzY2FuLnRzIiwic2Nhbk9uUmVhZHkudHMiLCJ2dWUvanVzdGlmeS50cyIsInZ1ZS9wcm9wcy50cyIsInZ1ZS9kaXYudHMiLCJ2dWUvY2FzZS1zYW5kYm94LnRzIiwidnVlL2Nhc2Utc2VjdXJpdHkudHMiLCJ2dWUvZGVmYXVsdC50cyIsInZ1ZS8udHMiLCJleHBvcnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgJzQuMS45JzsiLCJpbXBvcnQgbG9jYXRpb24gZnJvbSAnLmxvY2F0aW9uJztcclxuXHJcbnZhciBzYW1lT3JpZ2luID0gLyojX19QVVJFX18qLyBmdW5jdGlvbiAoKSB7XHJcblx0dmFyIHBhZ2VPcmlnaW4gPSAvXmh0dHBzPzpcXC9cXC9bXi9dK3wvLmV4ZWMobG9jYXRpb24uaHJlZikgWzBdO1xyXG5cdHJldHVybiBwYWdlT3JpZ2luXHJcblx0XHQ/IGZ1bmN0aW9uIChocmVmICAgICAgICApIHsgcmV0dXJuIGhyZWYuaW5kZXhPZihwYWdlT3JpZ2luKT09PTA7IH1cclxuXHRcdDogZnVuY3Rpb24gKCkge307XHJcbn0oKTtcclxuXHJcbnZhciB3aXRoU2NoZW1lID0gL15bYS16XVthLXowLTlcXC0rLl0qOi9pO1xyXG5cclxuZnVuY3Rpb24gc2FmZVNjaGVtZSAoc2NoZW1lICAgICAgICApICAgICAgICAgICAgICB7XHJcblx0c3dpdGNoICggc2NoZW1lICkge1xyXG5cdFx0Y2FzZSAnaHR0cHMnOlxyXG5cdFx0Y2FzZSAnaHR0cCc6XHJcblx0XHRjYXNlICdmdHBzJzpcclxuXHRcdGNhc2UgJ2Z0cCc6XHJcblx0XHRjYXNlICdtYWlsdG8nOlxyXG5cdFx0Y2FzZSAnbmV3cyc6XHJcblx0XHRjYXNlICdnb3BoZXInOlxyXG5cdFx0Y2FzZSAnZGF0YSc6XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc2NoZW1lX3N0YXQgKGhyZWYgICAgICAgICApICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuXHRcclxuXHRpZiAoIHR5cGVvZiBocmVmIT09J3N0cmluZycgKSB7XHJcblx0XHRyZXR1cm4gMDtcclxuXHR9XHJcblx0XHJcblx0aWYgKCBocmVmPT09JycgKSB7XHJcblx0XHRyZXR1cm4gMztcclxuXHR9XHJcblx0c3dpdGNoICggaHJlZi5jaGFyQXQoMCkgKSB7XHJcblx0XHRjYXNlICcvJzpcclxuXHRcdGNhc2UgJy4nOlxyXG5cdFx0Y2FzZSAnPyc6XHJcblx0XHRjYXNlICcjJzpcclxuXHRcdFx0cmV0dXJuIDM7XHJcblx0fVxyXG5cdFxyXG5cdHZhciBjb2xvbiA9IGhyZWYuaW5kZXhPZignOicpO1xyXG5cdGlmICggY29sb249PT0gLTEgKSB7XHJcblx0XHRyZXR1cm4gMjtcclxuXHR9XHJcblx0aWYgKCBzYW1lT3JpZ2luKGhyZWYuc2xpY2UoMCwgY29sb24pKSApIHtcclxuXHRcdHJldHVybiA0O1xyXG5cdH1cclxuXHRpZiAoIHNhZmVTY2hlbWUoaHJlZikgfHwgaHJlZj09PSdhYm91dDpibGFuaycgKSB7XHJcblx0XHRyZXR1cm4gMTtcclxuXHR9XHJcblx0aWYgKCB3aXRoU2NoZW1lLnRlc3QoaHJlZikgKSB7XHJcblx0XHRyZXR1cm4gMDtcclxuXHR9XHJcblx0XHJcbn07XHJcbiIsImltcG9ydCBzY2hlbWVfc3RhdCBmcm9tICcuL3NjaGVtZV9zdGF0JztcclxuXHJcbmZ1bmN0aW9uIGZpbHRlckFuY2hvciAoYW5jaG9ycyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcclxuXHR2YXIgaW5kZXggPSBhbmNob3JzLmxlbmd0aDtcclxuXHR3aGlsZSAoIGluZGV4LS0gKSB7XHJcblx0XHR2YXIgYW5jaG9yID0gYW5jaG9yc1tpbmRleF07XHJcblx0XHR2YXIgaHJlZiA9IGFuY2hvci5ocmVmO1xyXG5cdFx0dmFyIHNhbWVPcmlnaW4gICAgICAgICAgICAgO1xyXG5cdFx0c3dpdGNoICggc2NoZW1lX3N0YXQoaHJlZikgKSB7XHJcblx0XHRcdGNhc2UgMDpcclxuXHRcdFx0XHRhbmNob3IucmVtb3ZlQXR0cmlidXRlKCdocmVmJyk7XHJcblx0XHRcdFx0Ly9hbmNob3IucmVtb3ZlQXR0cmlidXRlKCd0YXJnZXQnKTtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdGNhc2UgMTpcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSAyOlxyXG5cdFx0XHRcdGFuY2hvci5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCAnLi8nK2hyZWYpO1xyXG5cdFx0XHRjYXNlIDM6XHJcblx0XHRcdGNhc2UgNDpcclxuXHRcdFx0XHRzYW1lT3JpZ2luID0gdHJ1ZTtcclxuXHRcdH1cclxuXHRcdGlmICggc2FtZU9yaWdpbiApIHtcclxuXHRcdFx0aWYgKCBhbmNob3IudGFyZ2V0IT09J19ibGFuaycgKSB7XHJcblx0XHRcdFx0YW5jaG9yLnNldEF0dHJpYnV0ZSgndGFyZ2V0JywgJ19wYXJlbnQnKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdGFuY2hvci5zZXRBdHRyaWJ1dGUoJ3RhcmdldCcsICdfYmxhbmsnKTtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGZpbHRlckFuY2hvcnMgKGNvbnRlbnREb2N1bWVudCAgICAgICAgICApIHtcclxuXHRmaWx0ZXJBbmNob3IoY29udGVudERvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdhJykpO1xyXG5cdGZpbHRlckFuY2hvcihjb250ZW50RG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2FyZWEnKSk7XHJcbn07XHJcbiIsImltcG9ydCBkb2N1bWVudCBmcm9tICcuZG9jdW1lbnQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgLyojX19QVVJFX18qLyAoIGZ1bmN0aW9uICgpICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuXHRcclxuXHR2YXIgaUZyYW1lICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcclxuXHRcclxuXHRpZiAoICdzYW5kYm94JyBpbiBpRnJhbWUgICAgICAgICAgICApIHtcclxuXHRcdGlGcmFtZSA9IG51bGw7XHJcblx0XHRyZXR1cm4gJ3NhbmRib3gnO1xyXG5cdH1cclxuXHRcclxuXHRpRnJhbWUuc2V0QXR0cmlidXRlKCdzZWN1cml0eScsICdyZXN0cmljdGVkJyk7XHJcblx0XHJcblx0dmFyIGJlZCAgICAgICAgICAgICAgICAgICAgID0gZG9jdW1lbnQuYm9keSB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XHJcblx0YmVkLmFwcGVuZENoaWxkKGlGcmFtZSk7XHJcblx0dmFyIGNvbnRlbnRXaW5kb3cgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gaUZyYW1lLmNvbnRlbnRXaW5kb3cgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDtcclxuXHR2YXIgY29udGVudERvY3VtZW50ICAgICAgICAgICAgICAgICAgPSBjb250ZW50V2luZG93LmRvY3VtZW50O1xyXG5cdFxyXG5cdGNvbnRlbnREb2N1bWVudC5vcGVuKCk7XHJcblx0dmFyIHNlY3VyaXR5ID0gY29udGVudFdpbmRvdy4kZGFuZ2Vyb3VzID0ge307XHJcblx0Y29udGVudERvY3VtZW50LndyaXRlKCc8c2NyaXB0PiRkYW5nZXJvdXM9e308L3NjcmlwdD4nKTtcclxuXHRzZWN1cml0eSA9IGNvbnRlbnRXaW5kb3cuJGRhbmdlcm91cz09PXNlY3VyaXR5O1xyXG5cdGNvbnRlbnRXaW5kb3cuJGRhbmdlcm91cyA9IG51bGw7XHJcblx0Y29udGVudERvY3VtZW50LmNsb3NlKCk7XHJcblx0XHJcblx0Y29udGVudERvY3VtZW50ID0gbnVsbDtcclxuXHRjb250ZW50V2luZG93ID0gbnVsbDtcclxuXHRiZWQucmVtb3ZlQ2hpbGQoaUZyYW1lKTtcclxuXHRiZWQgPSBudWxsO1xyXG5cdFxyXG5cdGlmICggc2VjdXJpdHkgKSB7XHJcblx0XHRpRnJhbWUgPSBudWxsO1xyXG5cdFx0cmV0dXJuICdzZWN1cml0eSc7XHJcblx0fVxyXG5cdFxyXG5cdGlmICggJ3NyY2RvYycgaW4gaUZyYW1lICkge1xyXG5cdFx0aUZyYW1lID0gbnVsbDtcclxuXHRcdHJldHVybiAnaW5EYW5nZXInO1xyXG5cdH1cclxuXHRlbHNlIHtcclxuXHRcdGlGcmFtZSA9IG51bGw7XHJcblx0XHRyZXR1cm4gJ2Rhbmdlcm91cyc7XHJcblx0fVxyXG5cdFxyXG59ICkoKTtcclxuIiwiaW1wb3J0IGRvY3VtZW50IGZyb20gJy5kb2N1bWVudCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCAoXHJcblx0J2hpZGRlbicgaW4gLyojX19QVVJFX18qLyBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJylcclxuXHRcdD8gZnVuY3Rpb24gYWN0aXZhdGVIVE1MNVRhZ3MgKCkge31cclxuXHRcdDogLyojX19QVVJFX18qLyBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdC8vIDxjb21tYW5kIC8+IDxrZXlnZW4gLz4gPHNvdXJjZSAvPiA8dHJhY2sgLz4gPG1lbnU+PC9tZW51PlxyXG5cdFx0XHR2YXIgSFRNTDVfVEFHUyA9ICdhYmJyIGFydGljbGUgYXNpZGUgYXVkaW8gYmRpIGNhbnZhcyBkYXRhIGRhdGFsaXN0IGRldGFpbHMgZGlhbG9nIGZpZ2NhcHRpb24gZmlndXJlIGZvb3RlciBoZWFkZXIgaGdyb3VwIG1haW4gbWFyayBtZXRlciBuYXYgb3V0cHV0IHBpY3R1cmUgcHJvZ3Jlc3Mgc2VjdGlvbiBzdW1tYXJ5IHRlbXBsYXRlIHRpbWUgdmlkZW8nLnNwbGl0KCcgJyk7XHJcblx0XHRcdHZhciBIVE1MNV9UQUdTX0xFTkdUSCA9IEhUTUw1X1RBR1MubGVuZ3RoO1xyXG5cdFx0XHRcclxuXHRcdFx0ZnVuY3Rpb24gYWN0aXZhdGVIVE1MNVRhZ3MgKGNvbnRlbnREb2N1bWVudCAgICAgICAgICApIHtcclxuXHRcdFx0XHR2YXIgaW5kZXggPSBIVE1MNV9UQUdTX0xFTkdUSDtcclxuXHRcdFx0XHR3aGlsZSAoIGluZGV4LS0gKSB7XHJcblx0XHRcdFx0XHRjb250ZW50RG9jdW1lbnQuY3JlYXRlRWxlbWVudChIVE1MNV9UQUdTW2luZGV4XSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdGFjdGl2YXRlSFRNTDVUYWdzKGRvY3VtZW50KTtcclxuXHRcdFx0XHJcblx0XHRcdHJldHVybiBhY3RpdmF0ZUhUTUw1VGFncztcclxuXHRcdH0oKVxyXG4pO1xyXG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBmaWx0ZXJGb3JtcyAoY29udGVudERvY3VtZW50ICAgICAgICAgICkge1xyXG5cdFxyXG5cdHZhciBmb3JtcyA9IGNvbnRlbnREb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnZnJvbScpO1xyXG5cdHZhciBpbmRleCA9IGZvcm1zLmxlbmd0aDtcclxuXHRcclxuXHR3aGlsZSAoIGluZGV4LS0gKSB7XHJcblx0XHR2YXIgZm9ybSA9IGZvcm1zW2luZGV4XTtcclxuXHRcdGZvcm0ucGFyZW50Tm9kZSAucmVtb3ZlQ2hpbGQoZm9ybSk7XHJcblx0fVxyXG5cdFxyXG59OyIsImltcG9ydCBmaWx0ZXJBbmNob3JzIGZyb20gJy4vZmlsdGVyQW5jaG9ycyc7XHJcbmltcG9ydCBTVVBQT1JUX1NUQVRVUyBmcm9tICcuL1NVUFBPUlRfU1RBVFVTJztcclxuaW1wb3J0IGFjdGl2YXRlSFRNTDVUYWdzIGZyb20gJy4vYWN0aXZhdGVIVE1MNVRhZ3MnO1xyXG5pbXBvcnQgZmlsdGVyRm9ybXMgZnJvbSAnLi9maWx0ZXJGb3Jtcyc7XHJcblxyXG5mdW5jdGlvbiBqdXN0aWZ5ICggICAgICAgICAgICAgICAgICAgICAgICkge1xyXG5cdHZhciBzdHlsZSA9IHRoaXMuc3R5bGU7XHJcblx0c3R5bGUuaGVpZ2h0ID0gJzAnO1xyXG5cdHN0eWxlLmhlaWdodCA9IHRoaXMuY29udGVudERvY3VtZW50IC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsSGVpZ2h0KydweCc7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUp1c3RpZnkgKGlGcmFtZSAgICAgICAgICAgICAgICAgICAsIHN0eWxlICAgICAgICAgICAgICAgICAgICAgLCBjb250ZW50RG9jdW1lbnQgICAgICAgICAgKSB7XHJcblx0cmV0dXJuIGZ1bmN0aW9uIGp1c3RpZnkgKCkge1xyXG5cdFx0aUZyYW1lLmRldGFjaEV2ZW50KCdvbkxvYWQnLCBqdXN0aWZ5KTtcclxuXHRcdHN0eWxlLmhlaWdodCA9ICcwJztcclxuXHRcdHN0eWxlLmhlaWdodCA9IGNvbnRlbnREb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsSGVpZ2h0KydweCc7XHJcblx0fTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgKCBmdW5jdGlvbiAoKSB7XHJcblx0c3dpdGNoICggU1VQUE9SVF9TVEFUVVMgKSB7XHJcblx0XHRjYXNlICdzYW5kYm94JzpcclxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uIHJlbmRlciAoaUZyYW1lICAgICAgICAgICAgICAgICAgICkge1xyXG5cdFx0XHRcdHZhciBkb2MgPSBpRnJhbWUuZ2V0QXR0cmlidXRlKCdzcmNEb2MnKTtcclxuXHRcdFx0XHRpRnJhbWUucmVtb3ZlQXR0cmlidXRlKCdzcmNEb2MnKTtcclxuXHRcdFx0XHR2YXIgc3R5bGUgPSBpRnJhbWUuc3R5bGU7XHJcblx0XHRcdFx0c3R5bGUuaGVpZ2h0ID0gJzAnO1xyXG5cdFx0XHRcdGlmICggZG9jICkge1xyXG5cdFx0XHRcdFx0aUZyYW1lLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBqdXN0aWZ5KTtcclxuXHRcdFx0XHRcdHZhciBjb250ZW50RG9jdW1lbnQgPSBpRnJhbWUuY29udGVudERvY3VtZW50IDtcclxuXHRcdFx0XHRcdGNvbnRlbnREb2N1bWVudC5vcGVuKCk7XHJcblx0XHRcdFx0XHRjb250ZW50RG9jdW1lbnQud3JpdGUoZG9jKTtcclxuXHRcdFx0XHRcdGNvbnRlbnREb2N1bWVudC5jbG9zZSgpO1xyXG5cdFx0XHRcdFx0ZmlsdGVyQW5jaG9ycyhjb250ZW50RG9jdW1lbnQpO1xyXG5cdFx0XHRcdFx0c3R5bGUuaGVpZ2h0ID0gY29udGVudERvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxIZWlnaHQrJ3B4JztcclxuXHRcdFx0XHR9XHJcblx0XHRcdH07XHJcblx0XHRjYXNlICdzZWN1cml0eSc6XHJcblx0XHRcdHJldHVybiBmdW5jdGlvbiByZW5kZXIgKGlGcmFtZSAgICAgICAgICAgICAgICAgICApIHtcclxuXHRcdFx0XHR2YXIgZG9jID0gaUZyYW1lLmdldEF0dHJpYnV0ZSgnc3JjRG9jJyk7XHJcblx0XHRcdFx0aUZyYW1lLnJlbW92ZUF0dHJpYnV0ZSgnc3JjRG9jJyk7XHJcblx0XHRcdFx0dmFyIHN0eWxlID0gaUZyYW1lLnN0eWxlO1xyXG5cdFx0XHRcdHN0eWxlLmhlaWdodCA9ICcwJztcclxuXHRcdFx0XHRpZiAoIGRvYyApIHtcclxuXHRcdFx0XHRcdGlGcmFtZS5zZXRBdHRyaWJ1dGUoJ3NlY3VyaXR5JywgJ3Jlc3RyaWN0ZWQnKTtcclxuXHRcdFx0XHRcdHZhciBjb250ZW50RG9jdW1lbnQgPSBpRnJhbWUuY29udGVudFdpbmRvdyAuZG9jdW1lbnQ7XHJcblx0XHRcdFx0XHRpRnJhbWUuYXR0YWNoRXZlbnQoJ29uTG9hZCcsIGNyZWF0ZUp1c3RpZnkoaUZyYW1lLCBzdHlsZSwgY29udGVudERvY3VtZW50KSk7XHJcblx0XHRcdFx0XHRjb250ZW50RG9jdW1lbnQub3BlbigpO1xyXG5cdFx0XHRcdFx0YWN0aXZhdGVIVE1MNVRhZ3MoY29udGVudERvY3VtZW50KTtcclxuXHRcdFx0XHRcdGNvbnRlbnREb2N1bWVudC53cml0ZShkb2MpO1xyXG5cdFx0XHRcdFx0Y29udGVudERvY3VtZW50LmNsb3NlKCk7XHJcblx0XHRcdFx0XHRmaWx0ZXJGb3Jtcyhjb250ZW50RG9jdW1lbnQpO1xyXG5cdFx0XHRcdFx0c3R5bGUuaGVpZ2h0ID0gY29udGVudERvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxIZWlnaHQrJ3B4JztcclxuXHRcdFx0XHR9XHJcblx0XHRcdH07XHJcblx0XHRjYXNlICdpbkRhbmdlcic6XHJcblx0XHRcdHJldHVybiBmdW5jdGlvbiByZW5kZXIgKGlGcmFtZSAgICAgICAgICAgICAgICAgICApIHsgaUZyYW1lLnJlbW92ZUF0dHJpYnV0ZSgnc3JjRG9jJyk7IH07XHJcblx0XHRjYXNlICdkYW5nZXJvdXMnOlxyXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24gcmVuZGVyICgpIHt9O1xyXG5cdH1cclxufSApKCk7XHJcbiIsImV4cG9ydCBkZWZhdWx0ICdhbGxvdy1wb3B1cHMgYWxsb3ctcG9wdXBzLXRvLWVzY2FwZS1zYW5kYm94IGFsbG93LXNhbWUtb3JpZ2luIGFsbG93LXRvcC1uYXZpZ2F0aW9uJzsiLCJpbXBvcnQgZG9jdW1lbnQgZnJvbSAnLmRvY3VtZW50JztcclxuXHJcbmltcG9ydCBTQU5EQk9YIGZyb20gJy4vU0FOREJPWCc7XHJcbmltcG9ydCByZW5kZXIgZnJvbSAnLi9yZW5kZXInO1xyXG5cclxuZnVuY3Rpb24gaXNTYW5kRG9jIChpRnJhbWUgICAgICAgICAgICAgICAgICAgKSB7XHJcblx0dmFyIHNhbmRib3g7XHJcblx0dmFyIHNhbmRib3hlcztcclxuXHRyZXR1cm4gKFxyXG5cdFx0IWlGcmFtZS5zcmMgJiZcclxuXHRcdCFpRnJhbWUubmFtZSAmJlxyXG5cdFx0IWlGcmFtZS5zZWFtbGVzcyAmJlxyXG5cdFx0KCBzYW5kYm94ID0gaUZyYW1lLmdldEF0dHJpYnV0ZSgnc2FuZGJveCcpICkgJiZcclxuXHRcdCggc2FuZGJveD09PVNBTkRCT1ggfHxcclxuXHRcdFx0KCBzYW5kYm94ZXMgPSBzYW5kYm94LnNwbGl0KCcgJyksXHJcblx0XHRcdFx0c2FuZGJveGVzLmxlbmd0aD09PTQgJiZcclxuXHRcdFx0XHRzYW5kYm94ZXMuc29ydCgpLmpvaW4oJyAnKT09PVNBTkRCT1hcclxuXHRcdFx0KVxyXG5cdFx0KSAmJlxyXG5cdFx0aUZyYW1lLmdldEF0dHJpYnV0ZSgnd2lkdGgnKT09PScxMDAlJyAmJlxyXG5cdFx0aUZyYW1lLmdldEF0dHJpYnV0ZSgnc2Nyb2xsaW5nJyk9PT0nbm8nICYmXHJcblx0XHRpRnJhbWUuZ2V0QXR0cmlidXRlKCdmcmFtZUJvcmRlcicpPT09JzAnICYmXHJcblx0XHRpRnJhbWUuZ2V0QXR0cmlidXRlKCdtYXJnaW5XaWR0aCcpPT09JzAnICYmXHJcblx0XHRpRnJhbWUuZ2V0QXR0cmlidXRlKCdtYXJnaW5IZWlnaHQnKT09PScwJyAmJlxyXG5cdFx0aUZyYW1lLmdldEF0dHJpYnV0ZSgnc3JjRG9jJylcclxuXHQpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjb2xsZWN0U2FuZERvY3MgKGRvY3VtZW50ICAgICAgICAgICkge1xyXG5cdHZhciBzYW5kRG9jcyA9IFtdO1xyXG5cdHZhciBpRnJhbWVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2lmcmFtZScpO1xyXG5cdHZhciBpbmRleCA9IGlGcmFtZXMubGVuZ3RoO1xyXG5cdHdoaWxlICggaW5kZXgtLSApIHtcclxuXHRcdHZhciBpRnJhbWUgPSBpRnJhbWVzW2luZGV4XTtcclxuXHRcdGlmICggaXNTYW5kRG9jKGlGcmFtZSkgKSB7IHNhbmREb2NzLnB1c2goaUZyYW1lKTsgfVxyXG5cdH1cclxuXHRyZXR1cm4gc2FuZERvY3M7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHNjYW4gKGRvYyAgICAgICAgICAgKSB7XHJcblx0dmFyIHNhbmREb2NzID0gY29sbGVjdFNhbmREb2NzKGRvYyB8fCBkb2N1bWVudCk7XHJcblx0dmFyIGluZGV4ID0gc2FuZERvY3MubGVuZ3RoO1xyXG5cdHdoaWxlICggaW5kZXgtLSApIHtcclxuXHRcdHJlbmRlcihzYW5kRG9jc1tpbmRleF0pO1xyXG5cdH1cclxufTtcclxuIiwiaW1wb3J0IGRvY3VtZW50IGZyb20gJy5kb2N1bWVudCc7XHJcbmltcG9ydCB3aW5kb3cgZnJvbSAnLndpbmRvdyc7XHJcbmltcG9ydCB0b3AgZnJvbSAnLnRvcCc7XHJcbmltcG9ydCBzZXRUaW1lb3V0IGZyb20gJy5zZXRUaW1lb3V0JztcclxuXHJcbmltcG9ydCBzY2FuIGZyb20gJy4vc2Nhbic7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBzY2FuT25SZWFkeSAoZG9jICAgICAgICAgICApIHtcclxuXHRcclxuXHRpZiAoICFkb2MgKSB7IGRvYyA9IGRvY3VtZW50OyB9XHJcblx0XHJcblx0aWYgKCBkb2MucmVhZHlTdGF0ZT09PSdjb21wbGV0ZScgKSB7XHJcblx0XHRzY2FuKGRvYyk7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cdFxyXG5cdHZhciBsaXN0ZW5lciA9IGZ1bmN0aW9uICgpIHsgc2Nhbihkb2MpOyB9O1xyXG5cdGlmICggZG9jLmFkZEV2ZW50TGlzdGVuZXIgKSB7XHJcblx0XHRkb2MuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGxpc3RlbmVyLCBmYWxzZSk7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cdFxyXG5cdGlmICggd2luZG93PT10b3AgKSB7XHJcblx0XHR2YXIgZG9jdW1lbnRFbGVtZW50ID0gZG9jLmRvY3VtZW50RWxlbWVudDtcclxuXHRcdGlmICggZG9jdW1lbnRFbGVtZW50LmRvU2Nyb2xsICkge1xyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uIGNhbGxlZSAoKSB7XHJcblx0XHRcdFx0dHJ5IHsgZG9jdW1lbnRFbGVtZW50LmRvU2Nyb2xsICgnbGVmdCcpOyB9XHJcblx0XHRcdFx0Y2F0Y2ggKGVycm9yKSB7XHJcblx0XHRcdFx0XHRzZXRUaW1lb3V0KGNhbGxlZSwgMCk7XHJcblx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGxpc3RlbmVyKCk7XHJcblx0XHRcdH0sIDApO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGRvYy5hdHRhY2hFdmVudCgnb25yZWFkeXN0YXRlY2hhbmdlJywgZnVuY3Rpb24gY2FsbGVlICgpIHtcclxuXHRcdGlmICggZG9jIC5yZWFkeVN0YXRlPT09J2NvbXBsZXRlJyApIHtcclxuXHRcdFx0ZG9jIC5kZXRhY2hFdmVudCgnb25yZWFkeXN0YXRlY2hhbmdlJywgY2FsbGVlKTtcclxuXHRcdFx0bGlzdGVuZXIoKTtcclxuXHRcdH1cclxuXHR9KTtcclxuXHRcclxufTsiLCJpbXBvcnQgd2luZG93IGZyb20gJy53aW5kb3cnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24ganVzdGlmeSAoZXZlbnQgICAgICAgICkge1xyXG5cdHZhciBpRnJhbWUgPSAoIGV2ZW50IHx8IHdpbmRvdy5ldmVudCApIC50YXJnZXQgICAgICAgICAgICAgICAgICAgICA7XHJcblx0dmFyIHN0eWxlID0gaUZyYW1lLnN0eWxlO1xyXG5cdHN0eWxlLmhlaWdodCA9ICcwJztcclxuXHRzdHlsZS5oZWlnaHQgPSBpRnJhbWUuY29udGVudERvY3VtZW50IC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsSGVpZ2h0KydweCc7XHJcbn07XHJcbiIsImV4cG9ydCBkZWZhdWx0IHtcclxuXHRkb2M6IHtcclxuXHRcdHJlcXVpcmVkOiB0cnVlLFxyXG5cdFx0dmFsaWRhdG9yOiBmdW5jdGlvbiAodmFsdWUgICAgICAgICApIHsgcmV0dXJuIHR5cGVvZiB2YWx1ZT09PSdzdHJpbmcnOyB9XHJcblx0fVxyXG59OyIsImltcG9ydCBkb2N1bWVudCBmcm9tICcuZG9jdW1lbnQnO1xuXG5leHBvcnQgZGVmYXVsdCAvKiNfX1BVUkVfXyovIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuIiwiaW1wb3J0IGZpbHRlckFuY2hvcnMgZnJvbSAnLi4vZmlsdGVyQW5jaG9ycyc7XHJcbmltcG9ydCBTQU5EQk9YIGZyb20gJy4uL1NBTkRCT1gnO1xyXG5pbXBvcnQganVzdGlmeSBmcm9tICcuL2p1c3RpZnknO1xyXG5pbXBvcnQgcHJvcHMgZnJvbSAnLi9wcm9wcyc7XHJcbmltcG9ydCBkaXYgZnJvbSAnLi9kaXYnO1xyXG5cclxuZnVuY3Rpb24gc2V0RG9jICggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcclxuXHR2YXIgZWwgPSB0aGlzLiRlbDtcclxuXHRkaXYuaW5uZXJIVE1MID0gJzxpZnJhbWUgc2FuZGJveD1cIicrU0FOREJPWCsnXCIgd2lkdGg9XCIxMDAlXCIgZnJhbWVCb3JkZXI9XCIwXCIgc2Nyb2xsaW5nPVwibm9cIiBtYXJnaW5XaWR0aD1cIjBcIiBtYXJnaW5IZWlnaHQ9XCIwXCIgc3R5bGU9XCJoZWlnaHQ6MDtcIj48L2lmcmFtZT4nO1xyXG5cdHZhciBpRnJhbWUgPSB0aGlzLiRlbCA9IGRpdi5sYXN0Q2hpbGQgICAgICAgICAgICAgICAgICAgICA7XHJcblx0dmFyIHBhcmVudE5vZGUgPSBlbC5wYXJlbnROb2RlO1xyXG5cdGlmICggcGFyZW50Tm9kZT09PW51bGwgKSB7XHJcblx0XHRkaXYucmVtb3ZlQ2hpbGQoaUZyYW1lKTtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0cGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoaUZyYW1lLCBlbCk7XHJcblx0dmFyIGRvYyA9IHRoaXMuZG9jO1xyXG5cdGlmICggZG9jPT09JycgKSB7IHJldHVybjsgfVxyXG5cdGlGcmFtZS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywganVzdGlmeSk7XHJcblx0dmFyIGNvbnRlbnREb2N1bWVudCA9IGlGcmFtZS5jb250ZW50RG9jdW1lbnQgO1xyXG5cdGNvbnRlbnREb2N1bWVudC5vcGVuKCk7XHJcblx0Y29udGVudERvY3VtZW50LndyaXRlKGRvYyk7XHJcblx0Y29udGVudERvY3VtZW50LmNsb3NlKCk7XHJcblx0ZmlsdGVyQW5jaG9ycyhjb250ZW50RG9jdW1lbnQpO1xyXG5cdGlGcmFtZS5zdHlsZS5oZWlnaHQgPSBjb250ZW50RG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbEhlaWdodCsncHgnO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcblx0cHJvcHM6IHByb3BzLFxyXG5cdGluaGVyaXRBdHRyczogZmFsc2UsXHJcblx0cmVuZGVyOiBmdW5jdGlvbiAoY3JlYXRlRWxlbWVudCAgICAgKSB7IHJldHVybiBjcmVhdGVFbGVtZW50KCdpZnJhbWUnKTsgfSxcclxuXHRtb3VudGVkOiBzZXREb2MsXHJcblx0YWN0aXZhdGVkOiBzZXREb2MsXHJcblx0d2F0Y2g6IHsgZG9jOiBzZXREb2MgfVxyXG59O1xyXG4iLCJpbXBvcnQgcHJvcHMgZnJvbSAnLi9wcm9wcyc7XHJcbmltcG9ydCBmaWx0ZXJGb3JtcyBmcm9tICcuLi9maWx0ZXJGb3Jtcyc7XHJcbmltcG9ydCBqdXN0aWZ5IGZyb20gJy4vanVzdGlmeSc7XHJcbmltcG9ydCBkaXYgZnJvbSAnLi9kaXYnO1xyXG5pbXBvcnQgYWN0aXZhdGVIVE1MNVRhZ3MgZnJvbSAnLi4vYWN0aXZhdGVIVE1MNVRhZ3MnO1xyXG5cclxuZnVuY3Rpb24gc2V0RG9jICggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcclxuXHR2YXIgZWwgPSB0aGlzLiRlbDtcclxuXHRkaXYuaW5uZXJIVE1MID0gJzxpZnJhbWUgc2VjdXJpdHk9XCJyZXN0cmljdGVkXCIgd2lkdGg9XCIxMDAlXCIgZnJhbWVCb3JkZXI9XCIwXCIgc2Nyb2xsaW5nPVwibm9cIiBtYXJnaW5XaWR0aD1cIjBcIiBtYXJnaW5IZWlnaHQ9XCIwXCIgc3R5bGU9XCJoZWlnaHQ6MDtcIj48L2lmcmFtZT4nO1xyXG5cdHZhciBpRnJhbWUgPSB0aGlzLiRlbCA9IGRpdi5sYXN0Q2hpbGQgICAgICAgICAgICAgICAgICAgICA7XHJcblx0dmFyIHBhcmVudE5vZGUgPSBlbC5wYXJlbnROb2RlO1xyXG5cdGlmICggcGFyZW50Tm9kZT09PW51bGwgKSB7XHJcblx0XHRkaXYucmVtb3ZlQ2hpbGQoaUZyYW1lKTtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0cGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoaUZyYW1lLCBlbCk7XHJcblx0dmFyIGRvYyA9IHRoaXMuZG9jO1xyXG5cdGlmICggZG9jPT09JycgKSB7IHJldHVybjsgfVxyXG5cdGlGcmFtZS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywganVzdGlmeSk7XHJcblx0dmFyIGNvbnRlbnREb2N1bWVudCA9IGlGcmFtZS5jb250ZW50RG9jdW1lbnQgO1xyXG5cdGNvbnRlbnREb2N1bWVudC5vcGVuKCk7XHJcblx0YWN0aXZhdGVIVE1MNVRhZ3MoY29udGVudERvY3VtZW50KTtcclxuXHRjb250ZW50RG9jdW1lbnQud3JpdGUoZG9jKTtcclxuXHRjb250ZW50RG9jdW1lbnQuY2xvc2UoKTtcclxuXHRmaWx0ZXJGb3Jtcyhjb250ZW50RG9jdW1lbnQpO1xyXG5cdGlGcmFtZS5zdHlsZS5oZWlnaHQgPSBjb250ZW50RG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbEhlaWdodCsncHgnO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcblx0cHJvcHM6IHByb3BzLFxyXG5cdGluaGVyaXRBdHRyczogZmFsc2UsXHJcblx0cmVuZGVyOiBmdW5jdGlvbiAoY3JlYXRlRWxlbWVudCAgICAgKSB7IHJldHVybiBjcmVhdGVFbGVtZW50KCdpZnJhbWUnKTsgfSxcclxuXHRtb3VudGVkOiBzZXREb2MsXHJcblx0YWN0aXZhdGVkOiBzZXREb2MsXHJcblx0d2F0Y2g6IHsgZG9jOiBzZXREb2MgfVxyXG59O1xyXG4iLCJpbXBvcnQgcHJvcHMgZnJvbSAnLi9wcm9wcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcblx0cHJvcHM6IHByb3BzLFxyXG5cdGluaGVyaXRBdHRyczogZmFsc2UsXHJcblx0cmVuZGVyOiBmdW5jdGlvbiAoY3JlYXRlRWxlbWVudCAgICAgKSB7XHJcblx0XHRyZXR1cm4gY3JlYXRlRWxlbWVudCgnaWZyYW1lJywge1xyXG5cdFx0XHRzdGF0aWNTdHlsZToge1xyXG5cdFx0XHRcdGhlaWdodDogJzAnXHJcblx0XHRcdH0sXHJcblx0XHRcdGF0dHJzOiB7XHJcblx0XHRcdFx0d2lkdGg6ICcxMDAlJyxcclxuXHRcdFx0XHRmcmFtZUJvcmRlcjogJzAnLFxyXG5cdFx0XHRcdHNjcm9sbGluZzogJ25vJyxcclxuXHRcdFx0XHRtYXJnaW5XaWR0aDogJzAnLFxyXG5cdFx0XHRcdG1hcmdpbkhlaWdodDogJzAnXHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxufTtcclxuIiwiaW1wb3J0IFNVUFBPUlRfU1RBVFVTIGZyb20gJy4uL1NVUFBPUlRfU1RBVFVTJztcclxuaW1wb3J0IGNhc2Vfc2FuZGJveCBmcm9tICcuL2Nhc2Utc2FuZGJveCc7XHJcbmltcG9ydCBjYXNlX3NlY3VyaXR5IGZyb20gJy4vY2FzZS1zZWN1cml0eSc7XHJcbmltcG9ydCBkZWZhdWx0XyBmcm9tICcuL2RlZmF1bHQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgKCBmdW5jdGlvbiAoKSB7XHJcblx0c3dpdGNoICggU1VQUE9SVF9TVEFUVVMgKSB7XHJcblx0XHQvLyBzYW5kYm94IHNyY2RvYzogQ2hyb21lKyBTYWZhcmkrIEZpcmVmb3grXHJcblx0XHQvLyBzYW5kYm94OiBFZGdlKyBJRTEwK1xyXG5cdFx0Y2FzZSAnc2FuZGJveCc6XHJcblx0XHRcdHJldHVybiBjYXNlX3NhbmRib3g7XHJcblx0XHQvLyBzZWN1cml0eTogSUU5KC0pXHJcblx0XHRjYXNlICdzZWN1cml0eSc6XHJcblx0XHRcdHJldHVybiBjYXNlX3NlY3VyaXR5O1xyXG5cdFx0ZGVmYXVsdDpcclxuXHRcdFx0cmV0dXJuIGRlZmF1bHRfO1xyXG5cdH1cclxufSApKCk7XHJcbiIsImltcG9ydCB2ZXJzaW9uIGZyb20gJy4vdmVyc2lvbj90ZXh0JztcblxuaW1wb3J0IHJlbmRlciBmcm9tICcuL3JlbmRlcic7XG5pbXBvcnQgc2NhbiBmcm9tICcuL3NjYW4nO1xuaW1wb3J0IHNjYW5PblJlYWR5IGZyb20gJy4vc2Nhbk9uUmVhZHknO1xuaW1wb3J0IHZ1ZSBmcm9tICcuL3Z1ZS8nO1xuZXhwb3J0IHtcblx0dmVyc2lvbixcblx0cmVuZGVyLFxuXHRzY2FuLFxuXHRzY2FuT25SZWFkeSxcblx0dnVlLFxufTtcblxuaW1wb3J0IERlZmF1bHQgZnJvbSAnLmRlZmF1bHQ/PSc7XG5leHBvcnQgZGVmYXVsdCBEZWZhdWx0KHJlbmRlciwge1xuXHR2ZXJzaW9uOiB2ZXJzaW9uLFxuXHRyZW5kZXI6IHJlbmRlcixcblx0c2Nhbjogc2Nhbixcblx0c2Nhbk9uUmVhZHk6IHNjYW5PblJlYWR5LFxuXHR2dWU6IHZ1ZSxcblx0XzogdHlwZW9mIG1vZHVsZSE9PSd1bmRlZmluZWQnICYmIHR5cGVvZiBleHBvcnRzPT09J29iamVjdCcgfHwgdHlwZW9mIGRlZmluZT09PSdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCB8fCAvKiNfX1BVUkVfXyovIHNjYW5PblJlYWR5KClcbn0pO1xuIl0sIm5hbWVzIjpbImp1c3RpZnkiLCJzZXREb2MiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsZUFBZSxPQUFPOzt1QkFBQyx0QkNFdkIsSUFBSSxVQUFVLGlCQUFpQixZQUFZO0NBQzNDLENBQUMsSUFBSSxVQUFVLEdBQUcsb0JBQW9CLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUMvRCxDQUFDLE9BQU8sVUFBVTtDQUNsQixJQUFJLFVBQVUsSUFBSSxVQUFVLEVBQUUsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0NBQ3BFLElBQUksWUFBWSxFQUFFLENBQUM7Q0FDbkIsQ0FBQyxFQUFFLENBQUM7O0NBRUosSUFBSSxVQUFVLEdBQUcsdUJBQXVCLENBQUM7O0NBRXpDLFNBQVMsVUFBVSxFQUFFLE1BQU0sdUJBQXVCO0NBQ2xELENBQUMsU0FBUyxNQUFNO0NBQ2hCLEVBQUUsS0FBSyxPQUFPLENBQUM7Q0FDZixFQUFFLEtBQUssTUFBTSxDQUFDO0NBQ2QsRUFBRSxLQUFLLE1BQU0sQ0FBQztDQUNkLEVBQUUsS0FBSyxLQUFLLENBQUM7Q0FDYixFQUFFLEtBQUssUUFBUSxDQUFDO0NBQ2hCLEVBQUUsS0FBSyxNQUFNLENBQUM7Q0FDZCxFQUFFLEtBQUssUUFBUSxDQUFDO0NBQ2hCLEVBQUUsS0FBSyxNQUFNO0NBQ2IsR0FBRyxPQUFPLElBQUksQ0FBQztDQUNmLEVBQUU7Q0FDRixDQUFDOztBQUVELENBQWUsU0FBUyxXQUFXLEVBQUUsSUFBSSx5Q0FBeUM7Q0FDbEY7Q0FDQSxDQUFDLEtBQUssT0FBTyxJQUFJLEdBQUcsUUFBUSxHQUFHO0NBQy9CLEVBQUUsT0FBTyxDQUFDLENBQUM7Q0FDWCxFQUFFO0NBQ0Y7Q0FDQSxDQUFDLEtBQUssSUFBSSxHQUFHLEVBQUUsR0FBRztDQUNsQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0NBQ1gsRUFBRTtDQUNGLENBQUMsU0FBUyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztDQUN4QixFQUFFLEtBQUssR0FBRyxDQUFDO0NBQ1gsRUFBRSxLQUFLLEdBQUcsQ0FBQztDQUNYLEVBQUUsS0FBSyxHQUFHLENBQUM7Q0FDWCxFQUFFLEtBQUssR0FBRztDQUNWLEdBQUcsT0FBTyxDQUFDLENBQUM7Q0FDWixFQUFFO0NBQ0Y7Q0FDQSxDQUFDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDL0IsQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDLENBQUMsR0FBRztDQUNwQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0NBQ1gsRUFBRTtDQUNGLENBQUMsS0FBSyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsR0FBRztDQUN6QyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0NBQ1gsRUFBRTtDQUNGLENBQUMsS0FBSyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxHQUFHLGFBQWEsR0FBRztDQUNqRCxFQUFFLE9BQU8sQ0FBQyxDQUFDO0NBQ1gsRUFBRTtDQUNGLENBQUMsS0FBSyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHO0NBQzlCLEVBQUUsT0FBTyxDQUFDLENBQUM7Q0FDWCxFQUFFO0NBQ0Y7Q0FDQSxDQUFDOztDQ3RERCxTQUFTLFlBQVksRUFBRSxPQUFPLHlEQUF5RDtDQUN2RixDQUFDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7Q0FDNUIsQ0FBQyxRQUFRLEtBQUssRUFBRSxHQUFHO0NBQ25CLEVBQUUsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0NBQzlCLEVBQUUsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztDQUN6QixFQUFFLElBQUksVUFBVSxjQUFjO0NBQzlCLEVBQUUsU0FBUyxXQUFXLENBQUMsSUFBSSxDQUFDO0NBQzVCLEdBQUcsS0FBSyxDQUFDO0NBQ1QsSUFBSSxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0NBQ25DO0NBQ0EsSUFBSSxPQUFPO0NBQ1gsR0FBRyxLQUFLLENBQUM7Q0FDVCxJQUFJLE1BQU07Q0FDVixHQUFHLEtBQUssQ0FBQztDQUNULElBQUksTUFBTSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQzNDLEdBQUcsS0FBSyxDQUFDLENBQUM7Q0FDVixHQUFHLEtBQUssQ0FBQztDQUNULElBQUksVUFBVSxHQUFHLElBQUksQ0FBQztDQUN0QixHQUFHO0NBQ0gsRUFBRSxLQUFLLFVBQVUsR0FBRztDQUNwQixHQUFHLEtBQUssTUFBTSxDQUFDLE1BQU0sR0FBRyxRQUFRLEdBQUc7Q0FDbkMsSUFBSSxNQUFNLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQztDQUM3QyxJQUFJO0NBQ0osR0FBRztDQUNILE9BQU87Q0FDUCxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0NBQzNDLEdBQUc7Q0FDSCxFQUFFO0NBQ0YsQ0FBQzs7QUFFRCxDQUFlLFNBQVMsYUFBYSxFQUFFLGVBQWUsWUFBWTtDQUNsRSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztDQUN6RCxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztDQUM1RCxDQUFDOztBQ2pDRCxzQkFBZSxjQUFjLEVBQUUsK0RBQStEO0NBQzlGO0NBQ0EsQ0FBQyxJQUFJLE1BQU0sNkJBQTZCLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7Q0FDekU7Q0FDQSxDQUFDLEtBQUssU0FBUyxJQUFJLE1BQU0sY0FBYztDQUN2QyxFQUFFLE1BQU0sR0FBRyxJQUFJLENBQUM7Q0FDaEIsRUFBRSxPQUFPLFNBQVMsQ0FBQztDQUNuQixFQUFFO0NBQ0Y7Q0FDQSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDO0NBQy9DO0NBQ0EsQ0FBQyxJQUFJLEdBQUcsdUJBQXVCLFFBQVEsQ0FBQyxJQUFJLElBQUksUUFBUSxDQUFDLGVBQWUsQ0FBQztDQUN6RSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7Q0FDekIsQ0FBQyxJQUFJLGFBQWEsd0NBQXdDLE1BQU0sQ0FBQyxhQUFhLGlDQUFpQztDQUMvRyxDQUFDLElBQUksZUFBZSxvQkFBb0IsYUFBYSxDQUFDLFFBQVEsQ0FBQztDQUMvRDtDQUNBLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxDQUFDO0NBQ3hCLENBQUMsSUFBSSxRQUFRLEdBQUcsYUFBYSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7Q0FDOUMsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7Q0FDekQsQ0FBQyxRQUFRLEdBQUcsYUFBYSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUM7Q0FDaEQsQ0FBQyxhQUFhLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztDQUNqQyxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztDQUN6QjtDQUNBLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztDQUN4QixDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7Q0FDdEIsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0NBQ3pCLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQztDQUNaO0NBQ0EsQ0FBQyxLQUFLLFFBQVEsR0FBRztDQUNqQixFQUFFLE1BQU0sR0FBRyxJQUFJLENBQUM7Q0FDaEIsRUFBRSxPQUFPLFVBQVUsQ0FBQztDQUNwQixFQUFFO0NBQ0Y7Q0FDQSxDQUFDLEtBQUssUUFBUSxJQUFJLE1BQU0sR0FBRztDQUMzQixFQUFFLE1BQU0sR0FBRyxJQUFJLENBQUM7Q0FDaEIsRUFBRSxPQUFPLFVBQVUsQ0FBQztDQUNwQixFQUFFO0NBQ0YsTUFBTTtDQUNOLEVBQUUsTUFBTSxHQUFHLElBQUksQ0FBQztDQUNoQixFQUFFLE9BQU8sV0FBVyxDQUFDO0NBQ3JCLEVBQUU7Q0FDRjtDQUNBLENBQUMsSUFBSSxDQUFDOztBQzFDTix5QkFBZTtDQUNmLENBQUMsUUFBUSxrQkFBa0IsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUM7Q0FDdEQsSUFBSSxTQUFTLGlCQUFpQixJQUFJLEVBQUU7Q0FDcEMsa0JBQWtCLFlBQVk7Q0FDOUI7Q0FDQSxHQUFHLElBQUksVUFBVSxHQUFHLHlMQUF5TCxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUN6TixHQUFHLElBQUksaUJBQWlCLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQztDQUM3QztDQUNBLEdBQUcsU0FBUyxpQkFBaUIsRUFBRSxlQUFlLFlBQVk7Q0FDMUQsSUFBSSxJQUFJLEtBQUssR0FBRyxpQkFBaUIsQ0FBQztDQUNsQyxJQUFJLFFBQVEsS0FBSyxFQUFFLEdBQUc7Q0FDdEIsS0FBSyxlQUFlLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0NBQ3RELEtBQUs7Q0FDTCxJQUFJO0NBQ0osR0FBRyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztDQUMvQjtDQUNBLEdBQUcsT0FBTyxpQkFBaUIsQ0FBQztDQUM1QixHQUFHLEVBQUU7Q0FDTCxFQUFFOztDQ3BCYSxTQUFTLFdBQVcsRUFBRSxlQUFlLFlBQVk7Q0FDaEU7Q0FDQSxDQUFDLElBQUksS0FBSyxHQUFHLGVBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztDQUMxRCxDQUFDLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7Q0FDMUI7Q0FDQSxDQUFDLFFBQVEsS0FBSyxFQUFFLEdBQUc7Q0FDbkIsRUFBRSxJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7Q0FDMUIsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUNyQyxFQUFFO0NBQ0Y7Q0FDQSxDQUFDOztDQ0xELFNBQVMsT0FBTywyQkFBMkI7Q0FDM0MsQ0FBQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0NBQ3hCLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7Q0FDcEIsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsZUFBZSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7Q0FDeEUsQ0FBQzs7Q0FFRCxTQUFTLGFBQWEsRUFBRSxNQUFNLHFCQUFxQixLQUFLLHVCQUF1QixlQUFlLFlBQVk7Q0FDMUcsQ0FBQyxPQUFPLFNBQVMsT0FBTyxJQUFJO0NBQzVCLEVBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7Q0FDeEMsRUFBRSxLQUFLLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztDQUNyQixFQUFFLEtBQUssQ0FBQyxNQUFNLEdBQUcsZUFBZSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDO0NBQ25FLEVBQUUsQ0FBQztDQUNILENBQUM7O0FBRUQsY0FBZSxFQUFFLFlBQVk7Q0FDN0IsQ0FBQyxTQUFTLGNBQWM7Q0FDeEIsRUFBRSxLQUFLLFNBQVM7Q0FDaEIsR0FBRyxPQUFPLFNBQVMsTUFBTSxFQUFFLE1BQU0scUJBQXFCO0NBQ3RELElBQUksSUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztDQUM1QyxJQUFJLE1BQU0sQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7Q0FDckMsSUFBSSxJQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO0NBQzdCLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7Q0FDdkIsSUFBSSxLQUFLLEdBQUcsR0FBRztDQUNmLEtBQUssTUFBTSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztDQUM5QyxLQUFLLElBQUksZUFBZSxHQUFHLE1BQU0sQ0FBQyxlQUFlLEVBQUU7Q0FDbkQsS0FBSyxlQUFlLENBQUMsSUFBSSxFQUFFLENBQUM7Q0FDNUIsS0FBSyxlQUFlLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ2hDLEtBQUssZUFBZSxDQUFDLEtBQUssRUFBRSxDQUFDO0NBQzdCLEtBQUssYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0NBQ3BDLEtBQUssS0FBSyxDQUFDLE1BQU0sR0FBRyxlQUFlLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7Q0FDdEUsS0FBSztDQUNMLElBQUksQ0FBQztDQUNMLEVBQUUsS0FBSyxVQUFVO0NBQ2pCLEdBQUcsT0FBTyxTQUFTLE1BQU0sRUFBRSxNQUFNLHFCQUFxQjtDQUN0RCxJQUFJLElBQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7Q0FDNUMsSUFBSSxNQUFNLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0NBQ3JDLElBQUksSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztDQUM3QixJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO0NBQ3ZCLElBQUksS0FBSyxHQUFHLEdBQUc7Q0FDZixLQUFLLE1BQU0sQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDO0NBQ25ELEtBQUssSUFBSSxlQUFlLEdBQUcsTUFBTSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUM7Q0FDMUQsS0FBSyxNQUFNLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxhQUFhLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFDO0NBQ2pGLEtBQUssZUFBZSxDQUFDLElBQUksRUFBRSxDQUFDO0NBQzVCLEtBQUssaUJBQWlCLENBQUMsZUFBZSxDQUFDLENBQUM7Q0FDeEMsS0FBSyxlQUFlLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ2hDLEtBQUssZUFBZSxDQUFDLEtBQUssRUFBRSxDQUFDO0NBQzdCLEtBQUssV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0NBQ2xDLEtBQUssS0FBSyxDQUFDLE1BQU0sR0FBRyxlQUFlLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7Q0FDdEUsS0FBSztDQUNMLElBQUksQ0FBQztDQUNMLEVBQUUsS0FBSyxVQUFVO0NBQ2pCLEdBQUcsT0FBTyxTQUFTLE1BQU0sRUFBRSxNQUFNLHFCQUFxQixFQUFFLE1BQU0sQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDO0NBQzVGLEVBQUUsS0FBSyxXQUFXO0NBQ2xCLEdBQUcsT0FBTyxTQUFTLE1BQU0sSUFBSSxFQUFFLENBQUM7Q0FDaEMsRUFBRTtDQUNGLENBQUMsSUFBSSxDQUFDOztBQzVETixlQUFlLG9GQUFvRjs7b0dBQUMsbkdDS3BHLFNBQVMsU0FBUyxFQUFFLE1BQU0scUJBQXFCO0NBQy9DLENBQUMsSUFBSSxPQUFPLENBQUM7Q0FDYixDQUFDLElBQUksU0FBUyxDQUFDO0NBQ2YsQ0FBQztDQUNELEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRztDQUNiLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSTtDQUNkLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUTtDQUNsQixJQUFJLE9BQU8sR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxFQUFFO0NBQzlDLElBQUksT0FBTyxHQUFHLE9BQU87Q0FDckIsS0FBSyxTQUFTLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7Q0FDbkMsSUFBSSxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUM7Q0FDeEIsSUFBSSxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU87Q0FDeEMsSUFBSTtDQUNKLEdBQUc7Q0FDSCxFQUFFLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsTUFBTTtDQUN2QyxFQUFFLE1BQU0sQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLEdBQUcsSUFBSTtDQUN6QyxFQUFFLE1BQU0sQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLEdBQUcsR0FBRztDQUMxQyxFQUFFLE1BQU0sQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLEdBQUcsR0FBRztDQUMxQyxFQUFFLE1BQU0sQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLEdBQUcsR0FBRztDQUMzQyxFQUFFLE1BQU0sQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDO0NBQy9CLEdBQUc7Q0FDSCxDQUFDOztDQUVELFNBQVMsZUFBZSxFQUFFLFFBQVEsWUFBWTtDQUM5QyxDQUFDLElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQztDQUNuQixDQUFDLElBQUksT0FBTyxHQUFHLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztDQUN2RCxDQUFDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7Q0FDNUIsQ0FBQyxRQUFRLEtBQUssRUFBRSxHQUFHO0NBQ25CLEVBQUUsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0NBQzlCLEVBQUUsS0FBSyxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUU7Q0FDckQsRUFBRTtDQUNGLENBQUMsT0FBTyxRQUFRLENBQUM7Q0FDakIsQ0FBQzs7QUFFRCxDQUFlLFNBQVMsSUFBSSxFQUFFLEdBQUcsYUFBYTtDQUM5QyxDQUFDLElBQUksUUFBUSxHQUFHLGVBQWUsQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLENBQUM7Q0FDakQsQ0FBQyxJQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO0NBQzdCLENBQUMsUUFBUSxLQUFLLEVBQUUsR0FBRztDQUNuQixFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztDQUMxQixFQUFFO0NBQ0YsQ0FBQzs7Q0N0Q2MsU0FBUyxXQUFXLEVBQUUsR0FBRyxhQUFhO0NBQ3JEO0NBQ0EsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLFFBQVEsQ0FBQyxFQUFFO0NBQ2hDO0NBQ0EsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxVQUFVLEdBQUcsVUFBVSxHQUFHO0NBQ3BDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ1osRUFBRSxPQUFPO0NBQ1QsRUFBRTtDQUNGO0NBQ0EsQ0FBQyxJQUFJLFFBQVEsR0FBRyxZQUFZLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztDQUMzQyxDQUFDLEtBQUssR0FBRyxDQUFDLGdCQUFnQixHQUFHO0NBQzdCLEVBQUUsR0FBRyxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztDQUM1RCxFQUFFLE9BQU87Q0FDVCxFQUFFO0NBQ0Y7Q0FDQSxDQUFDLEtBQUssTUFBTSxFQUFFLEdBQUcsR0FBRztDQUNwQixFQUFFLElBQUksZUFBZSxHQUFHLEdBQUcsQ0FBQyxlQUFlLENBQUM7Q0FDNUMsRUFBRSxLQUFLLGVBQWUsQ0FBQyxRQUFRLEdBQUc7Q0FDbEMsR0FBRyxVQUFVLENBQUMsU0FBUyxNQUFNLElBQUk7Q0FDakMsSUFBSSxJQUFJLEVBQUUsZUFBZSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFO0NBQzlDLElBQUksT0FBTyxLQUFLLEVBQUU7Q0FDbEIsS0FBSyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQzNCLEtBQUssT0FBTztDQUNaLEtBQUs7Q0FDTCxJQUFJLFFBQVEsRUFBRSxDQUFDO0NBQ2YsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQ1QsR0FBRyxPQUFPO0NBQ1YsR0FBRztDQUNILEVBQUU7Q0FDRjtDQUNBLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsRUFBRSxTQUFTLE1BQU0sSUFBSTtDQUMxRCxFQUFFLEtBQUssR0FBRyxFQUFFLFVBQVUsR0FBRyxVQUFVLEdBQUc7Q0FDdEMsR0FBRyxHQUFHLEVBQUUsV0FBVyxDQUFDLG9CQUFvQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0NBQ2xELEdBQUcsUUFBUSxFQUFFLENBQUM7Q0FDZCxHQUFHO0NBQ0gsRUFBRSxDQUFDLENBQUM7Q0FDSjtDQUNBLENBQUM7O0NDMUNjLFNBQVNBLFNBQU8sRUFBRSxLQUFLLFVBQVU7Q0FDaEQsQ0FBQyxJQUFJLE1BQU0sR0FBRyxFQUFFLEtBQUssSUFBSSxNQUFNLENBQUMsS0FBSyxJQUFJLE1BQU0sc0JBQXNCO0NBQ3JFLENBQUMsSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztDQUMxQixDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO0NBQ3BCLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsZUFBZSxFQUFFLGVBQWUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDO0NBQzFFLENBQUM7O0FDUEQsYUFBZTtDQUNmLENBQUMsR0FBRyxFQUFFO0NBQ04sRUFBRSxRQUFRLEVBQUUsSUFBSTtDQUNoQixFQUFFLFNBQVMsRUFBRSxVQUFVLEtBQUssV0FBVyxFQUFFLE9BQU8sT0FBTyxLQUFLLEdBQUcsUUFBUSxDQUFDLEVBQUU7Q0FDMUUsRUFBRTtDQUNGLENBQUM7O0dBQUMsSENIRixXQUFlLGNBQWMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7Q0NJM0QsU0FBUyxNQUFNLGlEQUFpRDtDQUNoRSxDQUFDLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7Q0FDbkIsQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyw0R0FBNEcsQ0FBQztDQUMxSixDQUFDLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLFNBQVMsc0JBQXNCO0NBQzVELENBQUMsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQztDQUNoQyxDQUFDLEtBQUssVUFBVSxHQUFHLElBQUksR0FBRztDQUMxQixFQUFFLEdBQUcsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7Q0FDMUIsRUFBRSxPQUFPO0NBQ1QsRUFBRTtDQUNGLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7Q0FDckMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO0NBQ3BCLENBQUMsS0FBSyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFO0NBQzVCLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRUEsU0FBTyxDQUFDLENBQUM7Q0FDMUMsQ0FBQyxJQUFJLGVBQWUsR0FBRyxNQUFNLENBQUMsZUFBZSxFQUFFO0NBQy9DLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxDQUFDO0NBQ3hCLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUM1QixDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztDQUN6QixDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQztDQUNoQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLGVBQWUsQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQztDQUN6RSxDQUFDOztBQUVELG9CQUFlO0NBQ2YsQ0FBQyxLQUFLLEVBQUUsS0FBSztDQUNiLENBQUMsWUFBWSxFQUFFLEtBQUs7Q0FDcEIsQ0FBQyxNQUFNLEVBQUUsVUFBVSxhQUFhLE9BQU8sRUFBRSxPQUFPLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFO0NBQzFFLENBQUMsT0FBTyxFQUFFLE1BQU07Q0FDaEIsQ0FBQyxTQUFTLEVBQUUsTUFBTTtDQUNsQixDQUFDLEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUU7Q0FDdkIsQ0FBQyxDQUFDOztDQzVCRixTQUFTQyxRQUFNLGlEQUFpRDtDQUNoRSxDQUFDLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7Q0FDbkIsQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLHdJQUF3SSxDQUFDO0NBQzFKLENBQUMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsU0FBUyxzQkFBc0I7Q0FDNUQsQ0FBQyxJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDO0NBQ2hDLENBQUMsS0FBSyxVQUFVLEdBQUcsSUFBSSxHQUFHO0NBQzFCLEVBQUUsR0FBRyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztDQUMxQixFQUFFLE9BQU87Q0FDVCxFQUFFO0NBQ0YsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztDQUNyQyxDQUFDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7Q0FDcEIsQ0FBQyxLQUFLLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUU7Q0FDNUIsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFRCxTQUFPLENBQUMsQ0FBQztDQUMxQyxDQUFDLElBQUksZUFBZSxHQUFHLE1BQU0sQ0FBQyxlQUFlLEVBQUU7Q0FDL0MsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLENBQUM7Q0FDeEIsQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLENBQUMsQ0FBQztDQUNwQyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDNUIsQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLENBQUM7Q0FDekIsQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7Q0FDOUIsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxlQUFlLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7Q0FDekUsQ0FBQzs7QUFFRCxxQkFBZTtDQUNmLENBQUMsS0FBSyxFQUFFLEtBQUs7Q0FDYixDQUFDLFlBQVksRUFBRSxLQUFLO0NBQ3BCLENBQUMsTUFBTSxFQUFFLFVBQVUsYUFBYSxPQUFPLEVBQUUsT0FBTyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRTtDQUMxRSxDQUFDLE9BQU8sRUFBRUMsUUFBTTtDQUNoQixDQUFDLFNBQVMsRUFBRUEsUUFBTTtDQUNsQixDQUFDLEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRUEsUUFBTSxFQUFFO0NBQ3ZCLENBQUMsQ0FBQzs7QUNqQ0YsZ0JBQWU7Q0FDZixDQUFDLEtBQUssRUFBRSxLQUFLO0NBQ2IsQ0FBQyxZQUFZLEVBQUUsS0FBSztDQUNwQixDQUFDLE1BQU0sRUFBRSxVQUFVLGFBQWEsT0FBTztDQUN2QyxFQUFFLE9BQU8sYUFBYSxDQUFDLFFBQVEsRUFBRTtDQUNqQyxHQUFHLFdBQVcsRUFBRTtDQUNoQixJQUFJLE1BQU0sRUFBRSxHQUFHO0NBQ2YsSUFBSTtDQUNKLEdBQUcsS0FBSyxFQUFFO0NBQ1YsSUFBSSxLQUFLLEVBQUUsTUFBTTtDQUNqQixJQUFJLFdBQVcsRUFBRSxHQUFHO0NBQ3BCLElBQUksU0FBUyxFQUFFLElBQUk7Q0FDbkIsSUFBSSxXQUFXLEVBQUUsR0FBRztDQUNwQixJQUFJLFlBQVksRUFBRSxHQUFHO0NBQ3JCLElBQUk7Q0FDSixHQUFHLENBQUMsQ0FBQztDQUNMLEVBQUU7Q0FDRixDQUFDLENBQUM7O0FDZEYsV0FBZSxFQUFFLFlBQVk7Q0FDN0IsQ0FBQyxTQUFTLGNBQWM7Q0FDeEI7Q0FDQTtDQUNBLEVBQUUsS0FBSyxTQUFTO0NBQ2hCLEdBQUcsT0FBTyxZQUFZLENBQUM7Q0FDdkI7Q0FDQSxFQUFFLEtBQUssVUFBVTtDQUNqQixHQUFHLE9BQU8sYUFBYSxDQUFDO0NBQ3hCLEVBQUU7Q0FDRixHQUFHLE9BQU8sUUFBUSxDQUFDO0NBQ25CLEVBQUU7Q0FDRixDQUFDLElBQUksQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDRk4sZUFBZSxPQUFPLENBQUMsTUFBTSxFQUFFO0NBQy9CLENBQUMsT0FBTyxFQUFFLE9BQU87Q0FDakIsQ0FBQyxNQUFNLEVBQUUsTUFBTTtDQUNmLENBQUMsSUFBSSxFQUFFLElBQUk7Q0FDWCxDQUFDLFdBQVcsRUFBRSxXQUFXO0NBQ3pCLENBQUMsR0FBRyxFQUFFLEdBQUc7Q0FDVCxDQUFDLENBQUMsRUFBRSxPQUFPLE1BQU0sR0FBRyxXQUFXLElBQUksT0FBTyxPQUFPLEdBQUcsUUFBUSxJQUFJLE9BQU8sTUFBTSxHQUFHLFVBQVUsSUFBSSxNQUFNLENBQUMsR0FBRyxrQkFBa0IsV0FBVyxFQUFFO0NBQ3ZJLENBQUMsQ0FBQyxDQUFDOzs7Ozs7OzsiLCJzb3VyY2VSb290IjoiLi4vLi4vc3JjLyJ9