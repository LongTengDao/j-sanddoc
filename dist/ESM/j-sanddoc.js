/*!
 * 模块名称：j-sanddoc
 * 模块功能：前端富文本展示方案。从属于“简计划”。
   　　　　　Font-end rich text display plan. Belong to "Plan J".
 * 模块版本：5.0.0
 * 许可条款：LGPL-3.0
 * 所属作者：龙腾道 <LongTengDao@LongTengDao.com> (www.LongTengDao.com)
 * 问题反馈：https://GitHub.com/LongTengDao/j-sanddoc/issues
 * 项目主页：https://GitHub.com/LongTengDao/j-sanddoc/
 */

var version = '5.0.0';

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

function justify$1 (event        ) {
	var iFrame = ( event || window.event ) .target                     ;
	var style = iFrame.style;
	style.height = '0';
	style.height = iFrame.contentDocument .documentElement.scrollHeight+'px';
}

var props = {
	doc: {
		required: true,
		validator: function (value     )                  { return typeof value==='string'; }
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
	name: 'j-sanddoc',
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
	name: 'j-sanddoc',
	props: props,
	inheritAttrs: false,
	render: function (createElement     ) { return createElement('iframe'); },
	mounted: setDoc$1,
	activated: setDoc$1,
	watch: { doc: setDoc$1 }
};

var default_ = {
	name: 'j-sanddoc',
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

function renderAll (document          ) {
	var sandDocs = collectSandDocs(document);
	var index = sandDocs.length;
	while ( index-- ) {
		render(sandDocs[index]);
	}
}

function onReady (callback            , document          ) {
	if ( document.readyState==='complete' ) {
		return callback();
	}
	if ( document.addEventListener ) {
		return document.addEventListener('DOMContentLoaded', function listener () {
			document.removeEventListener('DOMContentLoaded', listener);
			callback();
		}, false);
	}
	if ( window==top ) {
		var documentElement = document.documentElement;
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
	document.attachEvent('onreadystatechange', function listener () {
		if ( document.readyState==='complete' ) {
			document.detachEvent('onreadystatechange', listener);
			callback();
		}
	});
}

function install (docVue                                                             ) {
	if ( docVue ) {
		if ( 'documentElement' in docVue ) {
			onReady(function () { renderAll(docVue); }, docVue);
		}
		else {
			docVue.component('j-sanddoc', vue);
		}
	}
	else {
		if ( typeof ( window        ).Vue==='function' && typeof ( window        ).Vue.component==='function' ) {
			( window        ).Vue.component('j-sanddoc', vue);
		}
		else {
			onReady(function () { renderAll(document); }, document);
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZlcnNpb24/dGV4dCIsInNjaGVtZV9zdGF0LnRzIiwiZmlsdGVyQW5jaG9ycy50cyIsIlNVUFBPUlRfU1RBVFVTLnRzIiwiYWN0aXZhdGVIVE1MNVRhZ3MudHMiLCJmaWx0ZXJGb3Jtcy50cyIsInJlbmRlci50cyIsIlNBTkRCT1gudHMiLCJ2dWUvanVzdGlmeS50cyIsInZ1ZS9wcm9wcy50cyIsInZ1ZS9kaXYudHMiLCJ2dWUvY2FzZS1zYW5kYm94LnRzIiwidnVlL2Nhc2Utc2VjdXJpdHkudHMiLCJ2dWUvZGVmYXVsdC50cyIsInZ1ZS8udHMiLCJyZW5kZXJBbGwudHMiLCJvblJlYWR5LnRzIiwiaW5zdGFsbC50cyIsImV4cG9ydC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCAnNS4wLjAnOyIsImltcG9ydCBsb2NhdGlvbiBmcm9tICcubG9jYXRpb24nO1xyXG5cclxudmFyIHNhbWVPcmlnaW4gPSAvKiNfX1BVUkVfXyovIGZ1bmN0aW9uICgpIHtcclxuXHR2YXIgcGFnZU9yaWdpbiA9IC9eaHR0cHM/OlxcL1xcL1teL10rfC8uZXhlYyhsb2NhdGlvbi5ocmVmKSBbMF07XHJcblx0cmV0dXJuIHBhZ2VPcmlnaW5cclxuXHRcdD8gZnVuY3Rpb24gKGhyZWYgICAgICAgICkgeyByZXR1cm4gaHJlZi5pbmRleE9mKHBhZ2VPcmlnaW4pPT09MDsgfVxyXG5cdFx0OiBmdW5jdGlvbiAoKSB7fTtcclxufSgpO1xyXG5cclxudmFyIHdpdGhTY2hlbWUgPSAvXlthLXpdW2EtejAtOVxcLSsuXSo6L2k7XHJcblxyXG5mdW5jdGlvbiBzYWZlU2NoZW1lIChzY2hlbWUgICAgICAgICkgICAgICAgICAgICAgIHtcclxuXHRzd2l0Y2ggKCBzY2hlbWUgKSB7XHJcblx0XHRjYXNlICdodHRwcyc6XHJcblx0XHRjYXNlICdodHRwJzpcclxuXHRcdGNhc2UgJ2Z0cHMnOlxyXG5cdFx0Y2FzZSAnZnRwJzpcclxuXHRcdGNhc2UgJ21haWx0byc6XHJcblx0XHRjYXNlICduZXdzJzpcclxuXHRcdGNhc2UgJ2dvcGhlcic6XHJcblx0XHRjYXNlICdkYXRhJzpcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBzY2hlbWVfc3RhdCAoaHJlZiAgICAgICAgICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG5cdFxyXG5cdGlmICggdHlwZW9mIGhyZWYhPT0nc3RyaW5nJyApIHtcclxuXHRcdHJldHVybiAwO1xyXG5cdH1cclxuXHRcclxuXHRpZiAoIGhyZWY9PT0nJyApIHtcclxuXHRcdHJldHVybiAzO1xyXG5cdH1cclxuXHRzd2l0Y2ggKCBocmVmLmNoYXJBdCgwKSApIHtcclxuXHRcdGNhc2UgJy8nOlxyXG5cdFx0Y2FzZSAnLic6XHJcblx0XHRjYXNlICc/JzpcclxuXHRcdGNhc2UgJyMnOlxyXG5cdFx0XHRyZXR1cm4gMztcclxuXHR9XHJcblx0XHJcblx0dmFyIGNvbG9uID0gaHJlZi5pbmRleE9mKCc6Jyk7XHJcblx0aWYgKCBjb2xvbj09PSAtMSApIHtcclxuXHRcdHJldHVybiAyO1xyXG5cdH1cclxuXHRpZiAoIHNhbWVPcmlnaW4oaHJlZi5zbGljZSgwLCBjb2xvbikpICkge1xyXG5cdFx0cmV0dXJuIDQ7XHJcblx0fVxyXG5cdGlmICggc2FmZVNjaGVtZShocmVmKSB8fCBocmVmPT09J2Fib3V0OmJsYW5rJyApIHtcclxuXHRcdHJldHVybiAxO1xyXG5cdH1cclxuXHRpZiAoIHdpdGhTY2hlbWUudGVzdChocmVmKSApIHtcclxuXHRcdHJldHVybiAwO1xyXG5cdH1cclxuXHRcclxufTtcclxuIiwiaW1wb3J0IHNjaGVtZV9zdGF0IGZyb20gJy4vc2NoZW1lX3N0YXQnO1xyXG5cclxuZnVuY3Rpb24gZmlsdGVyQW5jaG9yIChhbmNob3JzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xyXG5cdHZhciBpbmRleCA9IGFuY2hvcnMubGVuZ3RoO1xyXG5cdHdoaWxlICggaW5kZXgtLSApIHtcclxuXHRcdHZhciBhbmNob3IgPSBhbmNob3JzW2luZGV4XTtcclxuXHRcdHZhciBocmVmID0gYW5jaG9yLmhyZWY7XHJcblx0XHR2YXIgc2FtZU9yaWdpbiAgICAgICAgICAgICA7XHJcblx0XHRzd2l0Y2ggKCBzY2hlbWVfc3RhdChocmVmKSApIHtcclxuXHRcdFx0Y2FzZSAwOlxyXG5cdFx0XHRcdGFuY2hvci5yZW1vdmVBdHRyaWJ1dGUoJ2hyZWYnKTtcclxuXHRcdFx0XHQvL2FuY2hvci5yZW1vdmVBdHRyaWJ1dGUoJ3RhcmdldCcpO1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0Y2FzZSAxOlxyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIDI6XHJcblx0XHRcdFx0YW5jaG9yLnNldEF0dHJpYnV0ZSgnaHJlZicsICcuLycraHJlZik7XHJcblx0XHRcdGNhc2UgMzpcclxuXHRcdFx0Y2FzZSA0OlxyXG5cdFx0XHRcdHNhbWVPcmlnaW4gPSB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0aWYgKCBzYW1lT3JpZ2luICkge1xyXG5cdFx0XHRpZiAoIGFuY2hvci50YXJnZXQhPT0nX2JsYW5rJyApIHtcclxuXHRcdFx0XHRhbmNob3Iuc2V0QXR0cmlidXRlKCd0YXJnZXQnLCAnX3BhcmVudCcpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0YW5jaG9yLnNldEF0dHJpYnV0ZSgndGFyZ2V0JywgJ19ibGFuaycpO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZmlsdGVyQW5jaG9ycyAoY29udGVudERvY3VtZW50ICAgICAgICAgICkge1xyXG5cdGZpbHRlckFuY2hvcihjb250ZW50RG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2EnKSk7XHJcblx0ZmlsdGVyQW5jaG9yKGNvbnRlbnREb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYXJlYScpKTtcclxufTtcclxuIiwiaW1wb3J0IGRvY3VtZW50IGZyb20gJy5kb2N1bWVudCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCAvKiNfX1BVUkVfXyovICggZnVuY3Rpb24gKCkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG5cdFxyXG5cdHZhciBpRnJhbWUgICAgICAgICAgICAgICAgICAgICAgICAgICA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xyXG5cdFxyXG5cdGlmICggJ3NhbmRib3gnIGluIGlGcmFtZSAgICAgICAgICAgICkge1xyXG5cdFx0aUZyYW1lID0gbnVsbDtcclxuXHRcdHJldHVybiAnc2FuZGJveCc7XHJcblx0fVxyXG5cdFxyXG5cdGlGcmFtZS5zZXRBdHRyaWJ1dGUoJ3NlY3VyaXR5JywgJ3Jlc3RyaWN0ZWQnKTtcclxuXHRcclxuXHR2YXIgYmVkICAgICAgICAgICAgICAgICAgICAgPSBkb2N1bWVudC5ib2R5IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcclxuXHRiZWQuYXBwZW5kQ2hpbGQoaUZyYW1lKTtcclxuXHR2YXIgY29udGVudFdpbmRvdyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBpRnJhbWUuY29udGVudFdpbmRvdyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgO1xyXG5cdHZhciBjb250ZW50RG9jdW1lbnQgICAgICAgICAgICAgICAgICA9IGNvbnRlbnRXaW5kb3cuZG9jdW1lbnQ7XHJcblx0XHJcblx0Y29udGVudERvY3VtZW50Lm9wZW4oKTtcclxuXHR2YXIgc2VjdXJpdHkgPSBjb250ZW50V2luZG93LiRkYW5nZXJvdXMgPSB7fTtcclxuXHRjb250ZW50RG9jdW1lbnQud3JpdGUoJzxzY3JpcHQ+JGRhbmdlcm91cz17fTwvc2NyaXB0PicpO1xyXG5cdHNlY3VyaXR5ID0gY29udGVudFdpbmRvdy4kZGFuZ2Vyb3VzPT09c2VjdXJpdHk7XHJcblx0Y29udGVudFdpbmRvdy4kZGFuZ2Vyb3VzID0gbnVsbDtcclxuXHRjb250ZW50RG9jdW1lbnQuY2xvc2UoKTtcclxuXHRcclxuXHRjb250ZW50RG9jdW1lbnQgPSBudWxsO1xyXG5cdGNvbnRlbnRXaW5kb3cgPSBudWxsO1xyXG5cdGJlZC5yZW1vdmVDaGlsZChpRnJhbWUpO1xyXG5cdGJlZCA9IG51bGw7XHJcblx0XHJcblx0aWYgKCBzZWN1cml0eSApIHtcclxuXHRcdGlGcmFtZSA9IG51bGw7XHJcblx0XHRyZXR1cm4gJ3NlY3VyaXR5JztcclxuXHR9XHJcblx0XHJcblx0aWYgKCAnc3JjZG9jJyBpbiBpRnJhbWUgKSB7XHJcblx0XHRpRnJhbWUgPSBudWxsO1xyXG5cdFx0cmV0dXJuICdpbkRhbmdlcic7XHJcblx0fVxyXG5cdGVsc2Uge1xyXG5cdFx0aUZyYW1lID0gbnVsbDtcclxuXHRcdHJldHVybiAnZGFuZ2Vyb3VzJztcclxuXHR9XHJcblx0XHJcbn0gKSgpO1xyXG4iLCJpbXBvcnQgZG9jdW1lbnQgZnJvbSAnLmRvY3VtZW50JztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IChcclxuXHQnaGlkZGVuJyBpbiAvKiNfX1BVUkVfXyovIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKVxyXG5cdFx0PyBmdW5jdGlvbiBhY3RpdmF0ZUhUTUw1VGFncyAoKSB7fVxyXG5cdFx0OiAvKiNfX1BVUkVfXyovIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0Ly8gPGNvbW1hbmQgLz4gPGtleWdlbiAvPiA8c291cmNlIC8+IDx0cmFjayAvPiA8bWVudT48L21lbnU+XHJcblx0XHRcdHZhciBIVE1MNV9UQUdTID0gJ2FiYnIgYXJ0aWNsZSBhc2lkZSBhdWRpbyBiZGkgY2FudmFzIGRhdGEgZGF0YWxpc3QgZGV0YWlscyBkaWFsb2cgZmlnY2FwdGlvbiBmaWd1cmUgZm9vdGVyIGhlYWRlciBoZ3JvdXAgbWFpbiBtYXJrIG1ldGVyIG5hdiBvdXRwdXQgcGljdHVyZSBwcm9ncmVzcyBzZWN0aW9uIHN1bW1hcnkgdGVtcGxhdGUgdGltZSB2aWRlbycuc3BsaXQoJyAnKTtcclxuXHRcdFx0dmFyIEhUTUw1X1RBR1NfTEVOR1RIID0gSFRNTDVfVEFHUy5sZW5ndGg7XHJcblx0XHRcdFxyXG5cdFx0XHRmdW5jdGlvbiBhY3RpdmF0ZUhUTUw1VGFncyAoY29udGVudERvY3VtZW50ICAgICAgICAgICkge1xyXG5cdFx0XHRcdHZhciBpbmRleCA9IEhUTUw1X1RBR1NfTEVOR1RIO1xyXG5cdFx0XHRcdHdoaWxlICggaW5kZXgtLSApIHtcclxuXHRcdFx0XHRcdGNvbnRlbnREb2N1bWVudC5jcmVhdGVFbGVtZW50KEhUTUw1X1RBR1NbaW5kZXhdKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0YWN0aXZhdGVIVE1MNVRhZ3MoZG9jdW1lbnQpO1xyXG5cdFx0XHRcclxuXHRcdFx0cmV0dXJuIGFjdGl2YXRlSFRNTDVUYWdzO1xyXG5cdFx0fSgpXHJcbik7XHJcbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGZpbHRlckZvcm1zIChjb250ZW50RG9jdW1lbnQgICAgICAgICAgKSB7XHJcblx0XHJcblx0dmFyIGZvcm1zID0gY29udGVudERvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdmcm9tJyk7XHJcblx0dmFyIGluZGV4ID0gZm9ybXMubGVuZ3RoO1xyXG5cdFxyXG5cdHdoaWxlICggaW5kZXgtLSApIHtcclxuXHRcdHZhciBmb3JtID0gZm9ybXNbaW5kZXhdO1xyXG5cdFx0Zm9ybS5wYXJlbnROb2RlIC5yZW1vdmVDaGlsZChmb3JtKTtcclxuXHR9XHJcblx0XHJcbn07IiwiaW1wb3J0IGZpbHRlckFuY2hvcnMgZnJvbSAnLi9maWx0ZXJBbmNob3JzJztcclxuaW1wb3J0IFNVUFBPUlRfU1RBVFVTIGZyb20gJy4vU1VQUE9SVF9TVEFUVVMnO1xyXG5pbXBvcnQgYWN0aXZhdGVIVE1MNVRhZ3MgZnJvbSAnLi9hY3RpdmF0ZUhUTUw1VGFncyc7XHJcbmltcG9ydCBmaWx0ZXJGb3JtcyBmcm9tICcuL2ZpbHRlckZvcm1zJztcclxuXHJcbmZ1bmN0aW9uIGp1c3RpZnkgKCAgICAgICAgICAgICAgICAgICAgICAgKSB7XHJcblx0dmFyIHN0eWxlID0gdGhpcy5zdHlsZTtcclxuXHRzdHlsZS5oZWlnaHQgPSAnMCc7XHJcblx0c3R5bGUuaGVpZ2h0ID0gdGhpcy5jb250ZW50RG9jdW1lbnQgLmRvY3VtZW50RWxlbWVudC5zY3JvbGxIZWlnaHQrJ3B4JztcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlSnVzdGlmeSAoaUZyYW1lICAgICAgICAgICAgICAgICAgICwgc3R5bGUgICAgICAgICAgICAgICAgICAgICAsIGNvbnRlbnREb2N1bWVudCAgICAgICAgICApIHtcclxuXHRyZXR1cm4gZnVuY3Rpb24ganVzdGlmeSAoKSB7XHJcblx0XHRpRnJhbWUuZGV0YWNoRXZlbnQoJ29uTG9hZCcsIGp1c3RpZnkpO1xyXG5cdFx0c3R5bGUuaGVpZ2h0ID0gJzAnO1xyXG5cdFx0c3R5bGUuaGVpZ2h0ID0gY29udGVudERvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxIZWlnaHQrJ3B4JztcclxuXHR9O1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCAoIGZ1bmN0aW9uICgpIHtcclxuXHRzd2l0Y2ggKCBTVVBQT1JUX1NUQVRVUyApIHtcclxuXHRcdGNhc2UgJ3NhbmRib3gnOlxyXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24gcmVuZGVyIChpRnJhbWUgICAgICAgICAgICAgICAgICAgKSB7XHJcblx0XHRcdFx0dmFyIGRvYyA9IGlGcmFtZS5nZXRBdHRyaWJ1dGUoJ3NyY0RvYycpO1xyXG5cdFx0XHRcdGlGcmFtZS5yZW1vdmVBdHRyaWJ1dGUoJ3NyY0RvYycpO1xyXG5cdFx0XHRcdHZhciBzdHlsZSA9IGlGcmFtZS5zdHlsZTtcclxuXHRcdFx0XHRzdHlsZS5oZWlnaHQgPSAnMCc7XHJcblx0XHRcdFx0aWYgKCBkb2MgKSB7XHJcblx0XHRcdFx0XHRpRnJhbWUuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGp1c3RpZnkpO1xyXG5cdFx0XHRcdFx0dmFyIGNvbnRlbnREb2N1bWVudCA9IGlGcmFtZS5jb250ZW50RG9jdW1lbnQgO1xyXG5cdFx0XHRcdFx0Y29udGVudERvY3VtZW50Lm9wZW4oKTtcclxuXHRcdFx0XHRcdGNvbnRlbnREb2N1bWVudC53cml0ZShkb2MpO1xyXG5cdFx0XHRcdFx0Y29udGVudERvY3VtZW50LmNsb3NlKCk7XHJcblx0XHRcdFx0XHRmaWx0ZXJBbmNob3JzKGNvbnRlbnREb2N1bWVudCk7XHJcblx0XHRcdFx0XHRzdHlsZS5oZWlnaHQgPSBjb250ZW50RG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbEhlaWdodCsncHgnO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fTtcclxuXHRcdGNhc2UgJ3NlY3VyaXR5JzpcclxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uIHJlbmRlciAoaUZyYW1lICAgICAgICAgICAgICAgICAgICkge1xyXG5cdFx0XHRcdHZhciBkb2MgPSBpRnJhbWUuZ2V0QXR0cmlidXRlKCdzcmNEb2MnKTtcclxuXHRcdFx0XHRpRnJhbWUucmVtb3ZlQXR0cmlidXRlKCdzcmNEb2MnKTtcclxuXHRcdFx0XHR2YXIgc3R5bGUgPSBpRnJhbWUuc3R5bGU7XHJcblx0XHRcdFx0c3R5bGUuaGVpZ2h0ID0gJzAnO1xyXG5cdFx0XHRcdGlmICggZG9jICkge1xyXG5cdFx0XHRcdFx0aUZyYW1lLnNldEF0dHJpYnV0ZSgnc2VjdXJpdHknLCAncmVzdHJpY3RlZCcpO1xyXG5cdFx0XHRcdFx0dmFyIGNvbnRlbnREb2N1bWVudCA9IGlGcmFtZS5jb250ZW50V2luZG93IC5kb2N1bWVudDtcclxuXHRcdFx0XHRcdGlGcmFtZS5hdHRhY2hFdmVudCgnb25Mb2FkJywgY3JlYXRlSnVzdGlmeShpRnJhbWUsIHN0eWxlLCBjb250ZW50RG9jdW1lbnQpKTtcclxuXHRcdFx0XHRcdGNvbnRlbnREb2N1bWVudC5vcGVuKCk7XHJcblx0XHRcdFx0XHRhY3RpdmF0ZUhUTUw1VGFncyhjb250ZW50RG9jdW1lbnQpO1xyXG5cdFx0XHRcdFx0Y29udGVudERvY3VtZW50LndyaXRlKGRvYyk7XHJcblx0XHRcdFx0XHRjb250ZW50RG9jdW1lbnQuY2xvc2UoKTtcclxuXHRcdFx0XHRcdGZpbHRlckZvcm1zKGNvbnRlbnREb2N1bWVudCk7XHJcblx0XHRcdFx0XHRzdHlsZS5oZWlnaHQgPSBjb250ZW50RG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbEhlaWdodCsncHgnO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fTtcclxuXHRcdGNhc2UgJ2luRGFuZ2VyJzpcclxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uIHJlbmRlciAoaUZyYW1lICAgICAgICAgICAgICAgICAgICkgeyBpRnJhbWUucmVtb3ZlQXR0cmlidXRlKCdzcmNEb2MnKTsgfTtcclxuXHRcdGNhc2UgJ2Rhbmdlcm91cyc6XHJcblx0XHRcdHJldHVybiBmdW5jdGlvbiByZW5kZXIgKCkge307XHJcblx0fVxyXG59ICkoKTtcclxuIiwiZXhwb3J0IGRlZmF1bHQgJ2FsbG93LXBvcHVwcyBhbGxvdy1wb3B1cHMtdG8tZXNjYXBlLXNhbmRib3ggYWxsb3ctc2FtZS1vcmlnaW4gYWxsb3ctdG9wLW5hdmlnYXRpb24nOyIsImltcG9ydCB3aW5kb3cgZnJvbSAnLndpbmRvdyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBqdXN0aWZ5IChldmVudCAgICAgICAgKSB7XHJcblx0dmFyIGlGcmFtZSA9ICggZXZlbnQgfHwgd2luZG93LmV2ZW50ICkgLnRhcmdldCAgICAgICAgICAgICAgICAgICAgIDtcclxuXHR2YXIgc3R5bGUgPSBpRnJhbWUuc3R5bGU7XHJcblx0c3R5bGUuaGVpZ2h0ID0gJzAnO1xyXG5cdHN0eWxlLmhlaWdodCA9IGlGcmFtZS5jb250ZW50RG9jdW1lbnQgLmRvY3VtZW50RWxlbWVudC5zY3JvbGxIZWlnaHQrJ3B4JztcclxufTtcclxuIiwiZXhwb3J0IGRlZmF1bHQge1xyXG5cdGRvYzoge1xyXG5cdFx0cmVxdWlyZWQ6IHRydWUsXHJcblx0XHR2YWxpZGF0b3I6IGZ1bmN0aW9uICh2YWx1ZSAgICAgKSAgICAgICAgICAgICAgICAgIHsgcmV0dXJuIHR5cGVvZiB2YWx1ZT09PSdzdHJpbmcnOyB9XHJcblx0fVxyXG59OyIsImltcG9ydCBkb2N1bWVudCBmcm9tICcuZG9jdW1lbnQnO1xuXG5leHBvcnQgZGVmYXVsdCAvKiNfX1BVUkVfXyovIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuIiwiaW1wb3J0IGZpbHRlckFuY2hvcnMgZnJvbSAnLi4vZmlsdGVyQW5jaG9ycyc7XHJcbmltcG9ydCBTQU5EQk9YIGZyb20gJy4uL1NBTkRCT1gnO1xyXG5pbXBvcnQganVzdGlmeSBmcm9tICcuL2p1c3RpZnknO1xyXG5pbXBvcnQgcHJvcHMgZnJvbSAnLi9wcm9wcyc7XHJcbmltcG9ydCBkaXYgZnJvbSAnLi9kaXYnO1xyXG5cclxuZnVuY3Rpb24gc2V0RG9jICggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcclxuXHR2YXIgZWwgPSB0aGlzLiRlbDtcclxuXHRkaXYuaW5uZXJIVE1MID0gJzxpZnJhbWUgc2FuZGJveD1cIicrU0FOREJPWCsnXCIgd2lkdGg9XCIxMDAlXCIgZnJhbWVCb3JkZXI9XCIwXCIgc2Nyb2xsaW5nPVwibm9cIiBtYXJnaW5XaWR0aD1cIjBcIiBtYXJnaW5IZWlnaHQ9XCIwXCIgc3R5bGU9XCJoZWlnaHQ6MDtcIj48L2lmcmFtZT4nO1xyXG5cdHZhciBpRnJhbWUgPSB0aGlzLiRlbCA9IGRpdi5sYXN0Q2hpbGQgICAgICAgICAgICAgICAgICAgICA7XHJcblx0dmFyIHBhcmVudE5vZGUgPSBlbC5wYXJlbnROb2RlO1xyXG5cdGlmICggcGFyZW50Tm9kZT09PW51bGwgKSB7XHJcblx0XHRkaXYucmVtb3ZlQ2hpbGQoaUZyYW1lKTtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0cGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoaUZyYW1lLCBlbCk7XHJcblx0dmFyIGRvYyA9IHRoaXMuZG9jO1xyXG5cdGlmICggZG9jPT09JycgKSB7IHJldHVybjsgfVxyXG5cdGlGcmFtZS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywganVzdGlmeSk7XHJcblx0dmFyIGNvbnRlbnREb2N1bWVudCA9IGlGcmFtZS5jb250ZW50RG9jdW1lbnQgO1xyXG5cdGNvbnRlbnREb2N1bWVudC5vcGVuKCk7XHJcblx0Y29udGVudERvY3VtZW50LndyaXRlKGRvYyk7XHJcblx0Y29udGVudERvY3VtZW50LmNsb3NlKCk7XHJcblx0ZmlsdGVyQW5jaG9ycyhjb250ZW50RG9jdW1lbnQpO1xyXG5cdGlGcmFtZS5zdHlsZS5oZWlnaHQgPSBjb250ZW50RG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbEhlaWdodCsncHgnO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcblx0bmFtZTogJ2otc2FuZGRvYycsXHJcblx0cHJvcHM6IHByb3BzLFxyXG5cdGluaGVyaXRBdHRyczogZmFsc2UsXHJcblx0cmVuZGVyOiBmdW5jdGlvbiAoY3JlYXRlRWxlbWVudCAgICAgKSB7IHJldHVybiBjcmVhdGVFbGVtZW50KCdpZnJhbWUnKTsgfSxcclxuXHRtb3VudGVkOiBzZXREb2MsXHJcblx0YWN0aXZhdGVkOiBzZXREb2MsXHJcblx0d2F0Y2g6IHsgZG9jOiBzZXREb2MgfVxyXG59O1xyXG4iLCJpbXBvcnQgcHJvcHMgZnJvbSAnLi9wcm9wcyc7XHJcbmltcG9ydCBmaWx0ZXJGb3JtcyBmcm9tICcuLi9maWx0ZXJGb3Jtcyc7XHJcbmltcG9ydCBqdXN0aWZ5IGZyb20gJy4vanVzdGlmeSc7XHJcbmltcG9ydCBkaXYgZnJvbSAnLi9kaXYnO1xyXG5pbXBvcnQgYWN0aXZhdGVIVE1MNVRhZ3MgZnJvbSAnLi4vYWN0aXZhdGVIVE1MNVRhZ3MnO1xyXG5cclxuZnVuY3Rpb24gc2V0RG9jICggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcclxuXHR2YXIgZWwgPSB0aGlzLiRlbDtcclxuXHRkaXYuaW5uZXJIVE1MID0gJzxpZnJhbWUgc2VjdXJpdHk9XCJyZXN0cmljdGVkXCIgd2lkdGg9XCIxMDAlXCIgZnJhbWVCb3JkZXI9XCIwXCIgc2Nyb2xsaW5nPVwibm9cIiBtYXJnaW5XaWR0aD1cIjBcIiBtYXJnaW5IZWlnaHQ9XCIwXCIgc3R5bGU9XCJoZWlnaHQ6MDtcIj48L2lmcmFtZT4nO1xyXG5cdHZhciBpRnJhbWUgPSB0aGlzLiRlbCA9IGRpdi5sYXN0Q2hpbGQgICAgICAgICAgICAgICAgICAgICA7XHJcblx0dmFyIHBhcmVudE5vZGUgPSBlbC5wYXJlbnROb2RlO1xyXG5cdGlmICggcGFyZW50Tm9kZT09PW51bGwgKSB7XHJcblx0XHRkaXYucmVtb3ZlQ2hpbGQoaUZyYW1lKTtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0cGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoaUZyYW1lLCBlbCk7XHJcblx0dmFyIGRvYyA9IHRoaXMuZG9jO1xyXG5cdGlmICggZG9jPT09JycgKSB7IHJldHVybjsgfVxyXG5cdGlGcmFtZS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywganVzdGlmeSk7XHJcblx0dmFyIGNvbnRlbnREb2N1bWVudCA9IGlGcmFtZS5jb250ZW50RG9jdW1lbnQgO1xyXG5cdGNvbnRlbnREb2N1bWVudC5vcGVuKCk7XHJcblx0YWN0aXZhdGVIVE1MNVRhZ3MoY29udGVudERvY3VtZW50KTtcclxuXHRjb250ZW50RG9jdW1lbnQud3JpdGUoZG9jKTtcclxuXHRjb250ZW50RG9jdW1lbnQuY2xvc2UoKTtcclxuXHRmaWx0ZXJGb3Jtcyhjb250ZW50RG9jdW1lbnQpO1xyXG5cdGlGcmFtZS5zdHlsZS5oZWlnaHQgPSBjb250ZW50RG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbEhlaWdodCsncHgnO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcblx0bmFtZTogJ2otc2FuZGRvYycsXHJcblx0cHJvcHM6IHByb3BzLFxyXG5cdGluaGVyaXRBdHRyczogZmFsc2UsXHJcblx0cmVuZGVyOiBmdW5jdGlvbiAoY3JlYXRlRWxlbWVudCAgICAgKSB7IHJldHVybiBjcmVhdGVFbGVtZW50KCdpZnJhbWUnKTsgfSxcclxuXHRtb3VudGVkOiBzZXREb2MsXHJcblx0YWN0aXZhdGVkOiBzZXREb2MsXHJcblx0d2F0Y2g6IHsgZG9jOiBzZXREb2MgfVxyXG59O1xyXG4iLCJpbXBvcnQgcHJvcHMgZnJvbSAnLi9wcm9wcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcblx0bmFtZTogJ2otc2FuZGRvYycsXHJcblx0cHJvcHM6IHByb3BzLFxyXG5cdGluaGVyaXRBdHRyczogZmFsc2UsXHJcblx0cmVuZGVyOiBmdW5jdGlvbiAoY3JlYXRlRWxlbWVudCAgICAgKSB7XHJcblx0XHRyZXR1cm4gY3JlYXRlRWxlbWVudCgnaWZyYW1lJywge1xyXG5cdFx0XHRzdGF0aWNTdHlsZToge1xyXG5cdFx0XHRcdGhlaWdodDogJzAnXHJcblx0XHRcdH0sXHJcblx0XHRcdGF0dHJzOiB7XHJcblx0XHRcdFx0d2lkdGg6ICcxMDAlJyxcclxuXHRcdFx0XHRmcmFtZUJvcmRlcjogJzAnLFxyXG5cdFx0XHRcdHNjcm9sbGluZzogJ25vJyxcclxuXHRcdFx0XHRtYXJnaW5XaWR0aDogJzAnLFxyXG5cdFx0XHRcdG1hcmdpbkhlaWdodDogJzAnXHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxufTtcclxuIiwiaW1wb3J0IFNVUFBPUlRfU1RBVFVTIGZyb20gJy4uL1NVUFBPUlRfU1RBVFVTJztcclxuaW1wb3J0IGNhc2Vfc2FuZGJveCBmcm9tICcuL2Nhc2Utc2FuZGJveCc7XHJcbmltcG9ydCBjYXNlX3NlY3VyaXR5IGZyb20gJy4vY2FzZS1zZWN1cml0eSc7XHJcbmltcG9ydCBkZWZhdWx0XyBmcm9tICcuL2RlZmF1bHQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgKCBmdW5jdGlvbiAoKSB7XHJcblx0c3dpdGNoICggU1VQUE9SVF9TVEFUVVMgKSB7XHJcblx0XHQvLyBzYW5kYm94IHNyY2RvYzogQ2hyb21lKyBTYWZhcmkrIEZpcmVmb3grXHJcblx0XHQvLyBzYW5kYm94OiBFZGdlKyBJRTEwK1xyXG5cdFx0Y2FzZSAnc2FuZGJveCc6XHJcblx0XHRcdHJldHVybiBjYXNlX3NhbmRib3g7XHJcblx0XHQvLyBzZWN1cml0eTogSUU5KC0pXHJcblx0XHRjYXNlICdzZWN1cml0eSc6XHJcblx0XHRcdHJldHVybiBjYXNlX3NlY3VyaXR5O1xyXG5cdFx0ZGVmYXVsdDpcclxuXHRcdFx0cmV0dXJuIGRlZmF1bHRfO1xyXG5cdH1cclxufSApKCk7XHJcbiIsImltcG9ydCBTQU5EQk9YIGZyb20gJy4vU0FOREJPWCc7XHJcbmltcG9ydCByZW5kZXIgZnJvbSAnLi9yZW5kZXInO1xyXG5cclxuZnVuY3Rpb24gaXNTYW5kRG9jIChpRnJhbWUgICAgICAgICAgICAgICAgICAgKSB7XHJcblx0dmFyIHNhbmRib3g7XHJcblx0dmFyIHNhbmRib3hlcztcclxuXHRyZXR1cm4gKFxyXG5cdFx0IWlGcmFtZS5zcmMgJiZcclxuXHRcdCFpRnJhbWUubmFtZSAmJlxyXG5cdFx0IWlGcmFtZS5zZWFtbGVzcyAmJlxyXG5cdFx0KCBzYW5kYm94ID0gaUZyYW1lLmdldEF0dHJpYnV0ZSgnc2FuZGJveCcpICkgJiZcclxuXHRcdCggc2FuZGJveD09PVNBTkRCT1ggfHxcclxuXHRcdFx0KCBzYW5kYm94ZXMgPSBzYW5kYm94LnNwbGl0KCcgJyksXHJcblx0XHRcdFx0c2FuZGJveGVzLmxlbmd0aD09PTQgJiZcclxuXHRcdFx0XHRzYW5kYm94ZXMuc29ydCgpLmpvaW4oJyAnKT09PVNBTkRCT1hcclxuXHRcdFx0KVxyXG5cdFx0KSAmJlxyXG5cdFx0aUZyYW1lLmdldEF0dHJpYnV0ZSgnd2lkdGgnKT09PScxMDAlJyAmJlxyXG5cdFx0aUZyYW1lLmdldEF0dHJpYnV0ZSgnc2Nyb2xsaW5nJyk9PT0nbm8nICYmXHJcblx0XHRpRnJhbWUuZ2V0QXR0cmlidXRlKCdmcmFtZUJvcmRlcicpPT09JzAnICYmXHJcblx0XHRpRnJhbWUuZ2V0QXR0cmlidXRlKCdtYXJnaW5XaWR0aCcpPT09JzAnICYmXHJcblx0XHRpRnJhbWUuZ2V0QXR0cmlidXRlKCdtYXJnaW5IZWlnaHQnKT09PScwJyAmJlxyXG5cdFx0aUZyYW1lLmdldEF0dHJpYnV0ZSgnc3JjRG9jJylcclxuXHQpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjb2xsZWN0U2FuZERvY3MgKGRvY3VtZW50ICAgICAgICAgICkge1xyXG5cdHZhciBzYW5kRG9jcyA9IFtdO1xyXG5cdHZhciBpRnJhbWVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2lmcmFtZScpO1xyXG5cdHZhciBpbmRleCA9IGlGcmFtZXMubGVuZ3RoO1xyXG5cdHdoaWxlICggaW5kZXgtLSApIHtcclxuXHRcdHZhciBpRnJhbWUgPSBpRnJhbWVzW2luZGV4XTtcclxuXHRcdGlmICggaXNTYW5kRG9jKGlGcmFtZSkgKSB7IHNhbmREb2NzLnB1c2goaUZyYW1lKTsgfVxyXG5cdH1cclxuXHRyZXR1cm4gc2FuZERvY3M7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJlbmRlckFsbCAoZG9jdW1lbnQgICAgICAgICAgKSB7XHJcblx0dmFyIHNhbmREb2NzID0gY29sbGVjdFNhbmREb2NzKGRvY3VtZW50KTtcclxuXHR2YXIgaW5kZXggPSBzYW5kRG9jcy5sZW5ndGg7XHJcblx0d2hpbGUgKCBpbmRleC0tICkge1xyXG5cdFx0cmVuZGVyKHNhbmREb2NzW2luZGV4XSk7XHJcblx0fVxyXG59O1xyXG4iLCJpbXBvcnQgd2luZG93IGZyb20gJy53aW5kb3cnO1xyXG5pbXBvcnQgdG9wIGZyb20gJy50b3AnO1xyXG5pbXBvcnQgc2V0VGltZW91dCBmcm9tICcuc2V0VGltZW91dCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBvblJlYWR5IChjYWxsYmFjayAgICAgICAgICAgICwgZG9jdW1lbnQgICAgICAgICAgKSB7XHJcblx0aWYgKCBkb2N1bWVudC5yZWFkeVN0YXRlPT09J2NvbXBsZXRlJyApIHtcclxuXHRcdHJldHVybiBjYWxsYmFjaygpO1xyXG5cdH1cclxuXHRpZiAoIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIgKSB7XHJcblx0XHRyZXR1cm4gZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uIGxpc3RlbmVyICgpIHtcclxuXHRcdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGxpc3RlbmVyKTtcclxuXHRcdFx0Y2FsbGJhY2soKTtcclxuXHRcdH0sIGZhbHNlKTtcclxuXHR9XHJcblx0aWYgKCB3aW5kb3c9PXRvcCApIHtcclxuXHRcdHZhciBkb2N1bWVudEVsZW1lbnQgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XHJcblx0XHRpZiAoIGRvY3VtZW50RWxlbWVudC5kb1Njcm9sbCApIHtcclxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbiBoYW5kbGVyICgpIHtcclxuXHRcdFx0XHR0cnkgeyBkb2N1bWVudEVsZW1lbnQuZG9TY3JvbGwgKCdsZWZ0Jyk7IH1cclxuXHRcdFx0XHRjYXRjaCAoZXJyb3IpIHtcclxuXHRcdFx0XHRcdHNldFRpbWVvdXQoaGFuZGxlciwgMCk7XHJcblx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGNhbGxiYWNrKCk7XHJcblx0XHRcdH0sIDApO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0fVxyXG5cdGRvY3VtZW50LmF0dGFjaEV2ZW50KCdvbnJlYWR5c3RhdGVjaGFuZ2UnLCBmdW5jdGlvbiBsaXN0ZW5lciAoKSB7XHJcblx0XHRpZiAoIGRvY3VtZW50LnJlYWR5U3RhdGU9PT0nY29tcGxldGUnICkge1xyXG5cdFx0XHRkb2N1bWVudC5kZXRhY2hFdmVudCgnb25yZWFkeXN0YXRlY2hhbmdlJywgbGlzdGVuZXIpO1xyXG5cdFx0XHRjYWxsYmFjaygpO1xyXG5cdFx0fVxyXG5cdH0pO1xyXG59O1xyXG4iLCJpbXBvcnQgd2luZG93IGZyb20gJy53aW5kb3cnO1xuaW1wb3J0IGRvY3VtZW50IGZyb20gJy5kb2N1bWVudCc7XG5cbmltcG9ydCB2dWUgZnJvbSAnLi92dWUvJztcbmltcG9ydCByZW5kZXJBbGwgZnJvbSAnLi9yZW5kZXJBbGwnO1xuaW1wb3J0IG9uUmVhZHkgZnJvbSAnLi9vblJlYWR5JztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaW5zdGFsbCAoZG9jVnVlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuXHRpZiAoIGRvY1Z1ZSApIHtcblx0XHRpZiAoICdkb2N1bWVudEVsZW1lbnQnIGluIGRvY1Z1ZSApIHtcblx0XHRcdG9uUmVhZHkoZnVuY3Rpb24gKCkgeyByZW5kZXJBbGwoZG9jVnVlKTsgfSwgZG9jVnVlKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRkb2NWdWUuY29tcG9uZW50KCdqLXNhbmRkb2MnLCB2dWUpO1xuXHRcdH1cblx0fVxuXHRlbHNlIHtcblx0XHRpZiAoIHR5cGVvZiAoIHdpbmRvdyAgICAgICAgKS5WdWU9PT0nZnVuY3Rpb24nICYmIHR5cGVvZiAoIHdpbmRvdyAgICAgICAgKS5WdWUuY29tcG9uZW50PT09J2Z1bmN0aW9uJyApIHtcblx0XHRcdCggd2luZG93ICAgICAgICApLlZ1ZS5jb21wb25lbnQoJ2otc2FuZGRvYycsIHZ1ZSk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0b25SZWFkeShmdW5jdGlvbiAoKSB7IHJlbmRlckFsbChkb2N1bWVudCk7IH0sIGRvY3VtZW50KTtcblx0XHR9XG5cdH1cbn07XG4iLCJpbXBvcnQgdmVyc2lvbiBmcm9tICcuL3ZlcnNpb24/dGV4dCc7XG5cbmltcG9ydCByZW5kZXIgZnJvbSAnLi9yZW5kZXInO1xuaW1wb3J0IGluc3RhbGwgZnJvbSAnLi9pbnN0YWxsJztcbmltcG9ydCB2dWUgZnJvbSAnLi92dWUvJztcbmV4cG9ydCB7XG5cdHZlcnNpb24sXG5cdHZ1ZSxcblx0cmVuZGVyLFxuXHRpbnN0YWxsLFxufTtcblxuaW1wb3J0IERlZmF1bHQgZnJvbSAnLmRlZmF1bHQ/PSc7XG5leHBvcnQgZGVmYXVsdCBEZWZhdWx0KHtcblx0dmVyc2lvbjogdmVyc2lvbixcblx0dnVlOiB2dWUsXG5cdHJlbmRlcjogcmVuZGVyLFxuXHRpbnN0YWxsOiBpbnN0YWxsLFxuXHRfOiB0eXBlb2YgbW9kdWxlIT09J3VuZGVmaW5lZCcgJiYgdHlwZW9mIGV4cG9ydHM9PT0nb2JqZWN0JyB8fCB0eXBlb2YgZGVmaW5lPT09J2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kIHx8IC8qI19fUFVSRV9fKi8gaW5zdGFsbCgpXG59KTtcbiJdLCJuYW1lcyI6WyJqdXN0aWZ5Iiwic2V0RG9jIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLGNBQWUsT0FBTzs7c0JBQUMsdEJDRXZCLElBQUksVUFBVSxpQkFBaUIsWUFBWTtDQUMxQyxJQUFJLFVBQVUsR0FBRyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQzlELE9BQU8sVUFBVTtJQUNkLFVBQVUsSUFBSSxVQUFVLEVBQUUsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0lBQ2hFLFlBQVksRUFBRSxDQUFDO0NBQ2xCLEVBQUUsQ0FBQzs7QUFFSixJQUFJLFVBQVUsR0FBRyx1QkFBdUIsQ0FBQzs7QUFFekMsU0FBUyxVQUFVLEVBQUUsTUFBTSx1QkFBdUI7Q0FDakQsU0FBUyxNQUFNO0VBQ2QsS0FBSyxPQUFPLENBQUM7RUFDYixLQUFLLE1BQU0sQ0FBQztFQUNaLEtBQUssTUFBTSxDQUFDO0VBQ1osS0FBSyxLQUFLLENBQUM7RUFDWCxLQUFLLFFBQVEsQ0FBQztFQUNkLEtBQUssTUFBTSxDQUFD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LE9BQU87S0FDUDtJQUNELFFBQVEsRUFBRSxDQUFDO0lBQ1gsRUFBRSxDQUFDLENBQUMsQ0FBQztHQUNOLE9BQU87R0FDUDtFQUNEO0NBQ0QsUUFBUSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsRUFBRSxTQUFTLFFBQVEsSUFBSTtFQUMvRCxLQUFLLFFBQVEsQ0FBQyxVQUFVLEdBQUcsVUFBVSxHQUFHO0dBQ3ZDLFFBQVEsQ0FBQyxXQUFXLENBQUMsb0JBQW9CLEVBQUUsUUFBUSxDQUFDLENBQUM7R0FDckQsUUFBUSxFQUFFLENBQUM7R0FDWDtFQUNELENBQUMsQ0FBQztDQUNIOztBQzNCYyxTQUFTLE9BQU8sRUFBRSxNQUFNLCtEQUErRDtDQUNyRyxLQUFLLE1BQU0sR0FBRztFQUNiLEtBQUssaUJBQWlCLElBQUksTUFBTSxHQUFHO0dBQ2xDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztHQUNwRDtPQUNJO0dBQ0osTUFBTSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUM7R0FDbkM7RUFDRDtNQUNJO0VBQ0osS0FBSyxPQUFPLEVBQUUsTUFBTSxVQUFVLEdBQUcsR0FBRyxVQUFVLElBQUksT0FBTyxFQUFFLE1BQU0sVUFBVSxHQUFHLENBQUMsU0FBUyxHQUFHLFVBQVUsR0FBRztHQUN2RyxFQUFFLE1BQU0sVUFBVSxHQUFHLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQztHQUNsRDtPQUNJO0dBQ0osT0FBTyxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0dBQ3hEO0VBQ0Q7Q0FDRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDWEQsY0FBZSxPQUFPLENBQUM7Q0FDdEIsT0FBTyxFQUFFLE9BQU87Q0FDaEIsR0FBRyxFQUFFLEdBQUc7Q0FDUixNQUFNLEVBQUUsTUFBTTtDQUNkLE9BQU8sRUFBRSxPQUFPO0NBQ2hCLENBQUMsRUFBRSxPQUFPLE1BQU0sR0FBRyxXQUFXLElBQUksT0FBTyxPQUFPLEdBQUcsUUFBUSxJQUFJLE9BQU8sTUFBTSxHQUFHLFVBQVUsSUFBSSxNQUFNLENBQUMsR0FBRyxrQkFBa0IsT0FBTyxFQUFFO0NBQ2xJLENBQUMsQ0FBQzs7Ozs7Ozs7OyIsInNvdXJjZVJvb3QiOiIuLi8uLi9zcmMvIn0=