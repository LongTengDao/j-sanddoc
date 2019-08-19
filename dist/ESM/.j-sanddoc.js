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

import location from '.location';
import document from '.document';
import window from '.window';
import top from '.top';
import setTimeout from '.setTimeout';
import Default from '.default?=';

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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZlcnNpb24/dGV4dCIsInNjaGVtZV9zdGF0LnRzIiwiZmlsdGVyQW5jaG9ycy50cyIsIlNVUFBPUlRfU1RBVFVTLnRzIiwiYWN0aXZhdGVIVE1MNVRhZ3MudHMiLCJmaWx0ZXJGb3Jtcy50cyIsInJlbmRlci50cyIsIlNBTkRCT1gudHMiLCJ2dWUvanVzdGlmeS50cyIsInZ1ZS9wcm9wcy50cyIsInZ1ZS9kaXYudHMiLCJ2dWUvY2FzZS1zYW5kYm94LnRzIiwidnVlL2Nhc2Utc2VjdXJpdHkudHMiLCJ2dWUvZGVmYXVsdC50cyIsInZ1ZS8udHMiLCJyZW5kZXJBbGwudHMiLCJvblJlYWR5LnRzIiwiaW5zdGFsbC50cyIsImV4cG9ydC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCAnNS4wLjAnOyIsImltcG9ydCBsb2NhdGlvbiBmcm9tICcubG9jYXRpb24nO1xyXG5cclxudmFyIHNhbWVPcmlnaW4gPSAvKiNfX1BVUkVfXyovIGZ1bmN0aW9uICgpIHtcclxuXHR2YXIgcGFnZU9yaWdpbiA9IC9eaHR0cHM/OlxcL1xcL1teL10rfC8uZXhlYyhsb2NhdGlvbi5ocmVmKSBbMF07XHJcblx0cmV0dXJuIHBhZ2VPcmlnaW5cclxuXHRcdD8gZnVuY3Rpb24gKGhyZWYgICAgICAgICkgeyByZXR1cm4gaHJlZi5pbmRleE9mKHBhZ2VPcmlnaW4pPT09MDsgfVxyXG5cdFx0OiBmdW5jdGlvbiAoKSB7fTtcclxufSgpO1xyXG5cclxudmFyIHdpdGhTY2hlbWUgPSAvXlthLXpdW2EtejAtOVxcLSsuXSo6L2k7XHJcblxyXG5mdW5jdGlvbiBzYWZlU2NoZW1lIChzY2hlbWUgICAgICAgICkgICAgICAgICAgICAgIHtcclxuXHRzd2l0Y2ggKCBzY2hlbWUgKSB7XHJcblx0XHRjYXNlICdodHRwcyc6XHJcblx0XHRjYXNlICdodHRwJzpcclxuXHRcdGNhc2UgJ2Z0cHMnOlxyXG5cdFx0Y2FzZSAnZnRwJzpcclxuXHRcdGNhc2UgJ21haWx0byc6XHJcblx0XHRjYXNlICduZXdzJzpcclxuXHRcdGNhc2UgJ2dvcGhlcic6XHJcblx0XHRjYXNlICdkYXRhJzpcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBzY2hlbWVfc3RhdCAoaHJlZiAgICAgICAgICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG5cdFxyXG5cdGlmICggdHlwZW9mIGhyZWYhPT0nc3RyaW5nJyApIHtcclxuXHRcdHJldHVybiAwO1xyXG5cdH1cclxuXHRcclxuXHRpZiAoIGhyZWY9PT0nJyApIHtcclxuXHRcdHJldHVybiAzO1xyXG5cdH1cclxuXHRzd2l0Y2ggKCBocmVmLmNoYXJBdCgwKSApIHtcclxuXHRcdGNhc2UgJy8nOlxyXG5cdFx0Y2FzZSAnLic6XHJcblx0XHRjYXNlICc/JzpcclxuXHRcdGNhc2UgJyMnOlxyXG5cdFx0XHRyZXR1cm4gMztcclxuXHR9XHJcblx0XHJcblx0dmFyIGNvbG9uID0gaHJlZi5pbmRleE9mKCc6Jyk7XHJcblx0aWYgKCBjb2xvbj09PSAtMSApIHtcclxuXHRcdHJldHVybiAyO1xyXG5cdH1cclxuXHRpZiAoIHNhbWVPcmlnaW4oaHJlZi5zbGljZSgwLCBjb2xvbikpICkge1xyXG5cdFx0cmV0dXJuIDQ7XHJcblx0fVxyXG5cdGlmICggc2FmZVNjaGVtZShocmVmKSB8fCBocmVmPT09J2Fib3V0OmJsYW5rJyApIHtcclxuXHRcdHJldHVybiAxO1xyXG5cdH1cclxuXHRpZiAoIHdpdGhTY2hlbWUudGVzdChocmVmKSApIHtcclxuXHRcdHJldHVybiAwO1xyXG5cdH1cclxuXHRcclxufTtcclxuIiwiaW1wb3J0IHNjaGVtZV9zdGF0IGZyb20gJy4vc2NoZW1lX3N0YXQnO1xyXG5cclxuZnVuY3Rpb24gZmlsdGVyQW5jaG9yIChhbmNob3JzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xyXG5cdHZhciBpbmRleCA9IGFuY2hvcnMubGVuZ3RoO1xyXG5cdHdoaWxlICggaW5kZXgtLSApIHtcclxuXHRcdHZhciBhbmNob3IgPSBhbmNob3JzW2luZGV4XTtcclxuXHRcdHZhciBocmVmID0gYW5jaG9yLmhyZWY7XHJcblx0XHR2YXIgc2FtZU9yaWdpbiAgICAgICAgICAgICA7XHJcblx0XHRzd2l0Y2ggKCBzY2hlbWVfc3RhdChocmVmKSApIHtcclxuXHRcdFx0Y2FzZSAwOlxyXG5cdFx0XHRcdGFuY2hvci5yZW1vdmVBdHRyaWJ1dGUoJ2hyZWYnKTtcclxuXHRcdFx0XHQvL2FuY2hvci5yZW1vdmVBdHRyaWJ1dGUoJ3RhcmdldCcpO1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0Y2FzZSAxOlxyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIDI6XHJcblx0XHRcdFx0YW5jaG9yLnNldEF0dHJpYnV0ZSgnaHJlZicsICcuLycraHJlZik7XHJcblx0XHRcdGNhc2UgMzpcclxuXHRcdFx0Y2FzZSA0OlxyXG5cdFx0XHRcdHNhbWVPcmlnaW4gPSB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0aWYgKCBzYW1lT3JpZ2luICkge1xyXG5cdFx0XHRpZiAoIGFuY2hvci50YXJnZXQhPT0nX2JsYW5rJyApIHtcclxuXHRcdFx0XHRhbmNob3Iuc2V0QXR0cmlidXRlKCd0YXJnZXQnLCAnX3BhcmVudCcpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0YW5jaG9yLnNldEF0dHJpYnV0ZSgndGFyZ2V0JywgJ19ibGFuaycpO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZmlsdGVyQW5jaG9ycyAoY29udGVudERvY3VtZW50ICAgICAgICAgICkge1xyXG5cdGZpbHRlckFuY2hvcihjb250ZW50RG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2EnKSk7XHJcblx0ZmlsdGVyQW5jaG9yKGNvbnRlbnREb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYXJlYScpKTtcclxufTtcclxuIiwiaW1wb3J0IGRvY3VtZW50IGZyb20gJy5kb2N1bWVudCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCAvKiNfX1BVUkVfXyovICggZnVuY3Rpb24gKCkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG5cdFxyXG5cdHZhciBpRnJhbWUgICAgICAgICAgICAgICAgICAgICAgICAgICA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xyXG5cdFxyXG5cdGlmICggJ3NhbmRib3gnIGluIGlGcmFtZSAgICAgICAgICAgICkge1xyXG5cdFx0aUZyYW1lID0gbnVsbDtcclxuXHRcdHJldHVybiAnc2FuZGJveCc7XHJcblx0fVxyXG5cdFxyXG5cdGlGcmFtZS5zZXRBdHRyaWJ1dGUoJ3NlY3VyaXR5JywgJ3Jlc3RyaWN0ZWQnKTtcclxuXHRcclxuXHR2YXIgYmVkICAgICAgICAgICAgICAgICAgICAgPSBkb2N1bWVudC5ib2R5IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcclxuXHRiZWQuYXBwZW5kQ2hpbGQoaUZyYW1lKTtcclxuXHR2YXIgY29udGVudFdpbmRvdyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBpRnJhbWUuY29udGVudFdpbmRvdyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgO1xyXG5cdHZhciBjb250ZW50RG9jdW1lbnQgICAgICAgICAgICAgICAgICA9IGNvbnRlbnRXaW5kb3cuZG9jdW1lbnQ7XHJcblx0XHJcblx0Y29udGVudERvY3VtZW50Lm9wZW4oKTtcclxuXHR2YXIgc2VjdXJpdHkgPSBjb250ZW50V2luZG93LiRkYW5nZXJvdXMgPSB7fTtcclxuXHRjb250ZW50RG9jdW1lbnQud3JpdGUoJzxzY3JpcHQ+JGRhbmdlcm91cz17fTwvc2NyaXB0PicpO1xyXG5cdHNlY3VyaXR5ID0gY29udGVudFdpbmRvdy4kZGFuZ2Vyb3VzPT09c2VjdXJpdHk7XHJcblx0Y29udGVudFdpbmRvdy4kZGFuZ2Vyb3VzID0gbnVsbDtcclxuXHRjb250ZW50RG9jdW1lbnQuY2xvc2UoKTtcclxuXHRcclxuXHRjb250ZW50RG9jdW1lbnQgPSBudWxsO1xyXG5cdGNvbnRlbnRXaW5kb3cgPSBudWxsO1xyXG5cdGJlZC5yZW1vdmVDaGlsZChpRnJhbWUpO1xyXG5cdGJlZCA9IG51bGw7XHJcblx0XHJcblx0aWYgKCBzZWN1cml0eSApIHtcclxuXHRcdGlGcmFtZSA9IG51bGw7XHJcblx0XHRyZXR1cm4gJ3NlY3VyaXR5JztcclxuXHR9XHJcblx0XHJcblx0aWYgKCAnc3JjZG9jJyBpbiBpRnJhbWUgKSB7XHJcblx0XHRpRnJhbWUgPSBudWxsO1xyXG5cdFx0cmV0dXJuICdpbkRhbmdlcic7XHJcblx0fVxyXG5cdGVsc2Uge1xyXG5cdFx0aUZyYW1lID0gbnVsbDtcclxuXHRcdHJldHVybiAnZGFuZ2Vyb3VzJztcclxuXHR9XHJcblx0XHJcbn0gKSgpO1xyXG4iLCJpbXBvcnQgZG9jdW1lbnQgZnJvbSAnLmRvY3VtZW50JztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IChcclxuXHQnaGlkZGVuJyBpbiAvKiNfX1BVUkVfXyovIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKVxyXG5cdFx0PyBmdW5jdGlvbiBhY3RpdmF0ZUhUTUw1VGFncyAoKSB7fVxyXG5cdFx0OiAvKiNfX1BVUkVfXyovIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0Ly8gPGNvbW1hbmQgLz4gPGtleWdlbiAvPiA8c291cmNlIC8+IDx0cmFjayAvPiA8bWVudT48L21lbnU+XHJcblx0XHRcdHZhciBIVE1MNV9UQUdTID0gJ2FiYnIgYXJ0aWNsZSBhc2lkZSBhdWRpbyBiZGkgY2FudmFzIGRhdGEgZGF0YWxpc3QgZGV0YWlscyBkaWFsb2cgZmlnY2FwdGlvbiBmaWd1cmUgZm9vdGVyIGhlYWRlciBoZ3JvdXAgbWFpbiBtYXJrIG1ldGVyIG5hdiBvdXRwdXQgcGljdHVyZSBwcm9ncmVzcyBzZWN0aW9uIHN1bW1hcnkgdGVtcGxhdGUgdGltZSB2aWRlbycuc3BsaXQoJyAnKTtcclxuXHRcdFx0dmFyIEhUTUw1X1RBR1NfTEVOR1RIID0gSFRNTDVfVEFHUy5sZW5ndGg7XHJcblx0XHRcdFxyXG5cdFx0XHRmdW5jdGlvbiBhY3RpdmF0ZUhUTUw1VGFncyAoY29udGVudERvY3VtZW50ICAgICAgICAgICkge1xyXG5cdFx0XHRcdHZhciBpbmRleCA9IEhUTUw1X1RBR1NfTEVOR1RIO1xyXG5cdFx0XHRcdHdoaWxlICggaW5kZXgtLSApIHtcclxuXHRcdFx0XHRcdGNvbnRlbnREb2N1bWVudC5jcmVhdGVFbGVtZW50KEhUTUw1X1RBR1NbaW5kZXhdKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0YWN0aXZhdGVIVE1MNVRhZ3MoZG9jdW1lbnQpO1xyXG5cdFx0XHRcclxuXHRcdFx0cmV0dXJuIGFjdGl2YXRlSFRNTDVUYWdzO1xyXG5cdFx0fSgpXHJcbik7XHJcbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGZpbHRlckZvcm1zIChjb250ZW50RG9jdW1lbnQgICAgICAgICAgKSB7XHJcblx0XHJcblx0dmFyIGZvcm1zID0gY29udGVudERvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdmcm9tJyk7XHJcblx0dmFyIGluZGV4ID0gZm9ybXMubGVuZ3RoO1xyXG5cdFxyXG5cdHdoaWxlICggaW5kZXgtLSApIHtcclxuXHRcdHZhciBmb3JtID0gZm9ybXNbaW5kZXhdO1xyXG5cdFx0Zm9ybS5wYXJlbnROb2RlIC5yZW1vdmVDaGlsZChmb3JtKTtcclxuXHR9XHJcblx0XHJcbn07IiwiaW1wb3J0IGZpbHRlckFuY2hvcnMgZnJvbSAnLi9maWx0ZXJBbmNob3JzJztcclxuaW1wb3J0IFNVUFBPUlRfU1RBVFVTIGZyb20gJy4vU1VQUE9SVF9TVEFUVVMnO1xyXG5pbXBvcnQgYWN0aXZhdGVIVE1MNVRhZ3MgZnJvbSAnLi9hY3RpdmF0ZUhUTUw1VGFncyc7XHJcbmltcG9ydCBmaWx0ZXJGb3JtcyBmcm9tICcuL2ZpbHRlckZvcm1zJztcclxuXHJcbmZ1bmN0aW9uIGp1c3RpZnkgKCAgICAgICAgICAgICAgICAgICAgICAgKSB7XHJcblx0dmFyIHN0eWxlID0gdGhpcy5zdHlsZTtcclxuXHRzdHlsZS5oZWlnaHQgPSAnMCc7XHJcblx0c3R5bGUuaGVpZ2h0ID0gdGhpcy5jb250ZW50RG9jdW1lbnQgLmRvY3VtZW50RWxlbWVudC5zY3JvbGxIZWlnaHQrJ3B4JztcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlSnVzdGlmeSAoaUZyYW1lICAgICAgICAgICAgICAgICAgICwgc3R5bGUgICAgICAgICAgICAgICAgICAgICAsIGNvbnRlbnREb2N1bWVudCAgICAgICAgICApIHtcclxuXHRyZXR1cm4gZnVuY3Rpb24ganVzdGlmeSAoKSB7XHJcblx0XHRpRnJhbWUuZGV0YWNoRXZlbnQoJ29uTG9hZCcsIGp1c3RpZnkpO1xyXG5cdFx0c3R5bGUuaGVpZ2h0ID0gJzAnO1xyXG5cdFx0c3R5bGUuaGVpZ2h0ID0gY29udGVudERvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxIZWlnaHQrJ3B4JztcclxuXHR9O1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCAoIGZ1bmN0aW9uICgpIHtcclxuXHRzd2l0Y2ggKCBTVVBQT1JUX1NUQVRVUyApIHtcclxuXHRcdGNhc2UgJ3NhbmRib3gnOlxyXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24gcmVuZGVyIChpRnJhbWUgICAgICAgICAgICAgICAgICAgKSB7XHJcblx0XHRcdFx0dmFyIGRvYyA9IGlGcmFtZS5nZXRBdHRyaWJ1dGUoJ3NyY0RvYycpO1xyXG5cdFx0XHRcdGlGcmFtZS5yZW1vdmVBdHRyaWJ1dGUoJ3NyY0RvYycpO1xyXG5cdFx0XHRcdHZhciBzdHlsZSA9IGlGcmFtZS5zdHlsZTtcclxuXHRcdFx0XHRzdHlsZS5oZWlnaHQgPSAnMCc7XHJcblx0XHRcdFx0aWYgKCBkb2MgKSB7XHJcblx0XHRcdFx0XHRpRnJhbWUuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGp1c3RpZnkpO1xyXG5cdFx0XHRcdFx0dmFyIGNvbnRlbnREb2N1bWVudCA9IGlGcmFtZS5jb250ZW50RG9jdW1lbnQgO1xyXG5cdFx0XHRcdFx0Y29udGVudERvY3VtZW50Lm9wZW4oKTtcclxuXHRcdFx0XHRcdGNvbnRlbnREb2N1bWVudC53cml0ZShkb2MpO1xyXG5cdFx0XHRcdFx0Y29udGVudERvY3VtZW50LmNsb3NlKCk7XHJcblx0XHRcdFx0XHRmaWx0ZXJBbmNob3JzKGNvbnRlbnREb2N1bWVudCk7XHJcblx0XHRcdFx0XHRzdHlsZS5oZWlnaHQgPSBjb250ZW50RG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbEhlaWdodCsncHgnO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fTtcclxuXHRcdGNhc2UgJ3NlY3VyaXR5JzpcclxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uIHJlbmRlciAoaUZyYW1lICAgICAgICAgICAgICAgICAgICkge1xyXG5cdFx0XHRcdHZhciBkb2MgPSBpRnJhbWUuZ2V0QXR0cmlidXRlKCdzcmNEb2MnKTtcclxuXHRcdFx0XHRpRnJhbWUucmVtb3ZlQXR0cmlidXRlKCdzcmNEb2MnKTtcclxuXHRcdFx0XHR2YXIgc3R5bGUgPSBpRnJhbWUuc3R5bGU7XHJcblx0XHRcdFx0c3R5bGUuaGVpZ2h0ID0gJzAnO1xyXG5cdFx0XHRcdGlmICggZG9jICkge1xyXG5cdFx0XHRcdFx0aUZyYW1lLnNldEF0dHJpYnV0ZSgnc2VjdXJpdHknLCAncmVzdHJpY3RlZCcpO1xyXG5cdFx0XHRcdFx0dmFyIGNvbnRlbnREb2N1bWVudCA9IGlGcmFtZS5jb250ZW50V2luZG93IC5kb2N1bWVudDtcclxuXHRcdFx0XHRcdGlGcmFtZS5hdHRhY2hFdmVudCgnb25Mb2FkJywgY3JlYXRlSnVzdGlmeShpRnJhbWUsIHN0eWxlLCBjb250ZW50RG9jdW1lbnQpKTtcclxuXHRcdFx0XHRcdGNvbnRlbnREb2N1bWVudC5vcGVuKCk7XHJcblx0XHRcdFx0XHRhY3RpdmF0ZUhUTUw1VGFncyhjb250ZW50RG9jdW1lbnQpO1xyXG5cdFx0XHRcdFx0Y29udGVudERvY3VtZW50LndyaXRlKGRvYyk7XHJcblx0XHRcdFx0XHRjb250ZW50RG9jdW1lbnQuY2xvc2UoKTtcclxuXHRcdFx0XHRcdGZpbHRlckZvcm1zKGNvbnRlbnREb2N1bWVudCk7XHJcblx0XHRcdFx0XHRzdHlsZS5oZWlnaHQgPSBjb250ZW50RG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbEhlaWdodCsncHgnO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fTtcclxuXHRcdGNhc2UgJ2luRGFuZ2VyJzpcclxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uIHJlbmRlciAoaUZyYW1lICAgICAgICAgICAgICAgICAgICkgeyBpRnJhbWUucmVtb3ZlQXR0cmlidXRlKCdzcmNEb2MnKTsgfTtcclxuXHRcdGNhc2UgJ2Rhbmdlcm91cyc6XHJcblx0XHRcdHJldHVybiBmdW5jdGlvbiByZW5kZXIgKCkge307XHJcblx0fVxyXG59ICkoKTtcclxuIiwiZXhwb3J0IGRlZmF1bHQgJ2FsbG93LXBvcHVwcyBhbGxvdy1wb3B1cHMtdG8tZXNjYXBlLXNhbmRib3ggYWxsb3ctc2FtZS1vcmlnaW4gYWxsb3ctdG9wLW5hdmlnYXRpb24nOyIsImltcG9ydCB3aW5kb3cgZnJvbSAnLndpbmRvdyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBqdXN0aWZ5IChldmVudCAgICAgICAgKSB7XHJcblx0dmFyIGlGcmFtZSA9ICggZXZlbnQgfHwgd2luZG93LmV2ZW50ICkgLnRhcmdldCAgICAgICAgICAgICAgICAgICAgIDtcclxuXHR2YXIgc3R5bGUgPSBpRnJhbWUuc3R5bGU7XHJcblx0c3R5bGUuaGVpZ2h0ID0gJzAnO1xyXG5cdHN0eWxlLmhlaWdodCA9IGlGcmFtZS5jb250ZW50RG9jdW1lbnQgLmRvY3VtZW50RWxlbWVudC5zY3JvbGxIZWlnaHQrJ3B4JztcclxufTtcclxuIiwiZXhwb3J0IGRlZmF1bHQge1xyXG5cdGRvYzoge1xyXG5cdFx0cmVxdWlyZWQ6IHRydWUsXHJcblx0XHR2YWxpZGF0b3I6IGZ1bmN0aW9uICh2YWx1ZSAgICAgKSAgICAgICAgICAgICAgICAgIHsgcmV0dXJuIHR5cGVvZiB2YWx1ZT09PSdzdHJpbmcnOyB9XHJcblx0fVxyXG59OyIsImltcG9ydCBkb2N1bWVudCBmcm9tICcuZG9jdW1lbnQnO1xuXG5leHBvcnQgZGVmYXVsdCAvKiNfX1BVUkVfXyovIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuIiwiaW1wb3J0IGZpbHRlckFuY2hvcnMgZnJvbSAnLi4vZmlsdGVyQW5jaG9ycyc7XHJcbmltcG9ydCBTQU5EQk9YIGZyb20gJy4uL1NBTkRCT1gnO1xyXG5pbXBvcnQganVzdGlmeSBmcm9tICcuL2p1c3RpZnknO1xyXG5pbXBvcnQgcHJvcHMgZnJvbSAnLi9wcm9wcyc7XHJcbmltcG9ydCBkaXYgZnJvbSAnLi9kaXYnO1xyXG5cclxuZnVuY3Rpb24gc2V0RG9jICggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcclxuXHR2YXIgZWwgPSB0aGlzLiRlbDtcclxuXHRkaXYuaW5uZXJIVE1MID0gJzxpZnJhbWUgc2FuZGJveD1cIicrU0FOREJPWCsnXCIgd2lkdGg9XCIxMDAlXCIgZnJhbWVCb3JkZXI9XCIwXCIgc2Nyb2xsaW5nPVwibm9cIiBtYXJnaW5XaWR0aD1cIjBcIiBtYXJnaW5IZWlnaHQ9XCIwXCIgc3R5bGU9XCJoZWlnaHQ6MDtcIj48L2lmcmFtZT4nO1xyXG5cdHZhciBpRnJhbWUgPSB0aGlzLiRlbCA9IGRpdi5sYXN0Q2hpbGQgICAgICAgICAgICAgICAgICAgICA7XHJcblx0dmFyIHBhcmVudE5vZGUgPSBlbC5wYXJlbnROb2RlO1xyXG5cdGlmICggcGFyZW50Tm9kZT09PW51bGwgKSB7XHJcblx0XHRkaXYucmVtb3ZlQ2hpbGQoaUZyYW1lKTtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0cGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoaUZyYW1lLCBlbCk7XHJcblx0dmFyIGRvYyA9IHRoaXMuZG9jO1xyXG5cdGlmICggZG9jPT09JycgKSB7IHJldHVybjsgfVxyXG5cdGlGcmFtZS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywganVzdGlmeSk7XHJcblx0dmFyIGNvbnRlbnREb2N1bWVudCA9IGlGcmFtZS5jb250ZW50RG9jdW1lbnQgO1xyXG5cdGNvbnRlbnREb2N1bWVudC5vcGVuKCk7XHJcblx0Y29udGVudERvY3VtZW50LndyaXRlKGRvYyk7XHJcblx0Y29udGVudERvY3VtZW50LmNsb3NlKCk7XHJcblx0ZmlsdGVyQW5jaG9ycyhjb250ZW50RG9jdW1lbnQpO1xyXG5cdGlGcmFtZS5zdHlsZS5oZWlnaHQgPSBjb250ZW50RG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbEhlaWdodCsncHgnO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcblx0bmFtZTogJ2otc2FuZGRvYycsXHJcblx0cHJvcHM6IHByb3BzLFxyXG5cdGluaGVyaXRBdHRyczogZmFsc2UsXHJcblx0cmVuZGVyOiBmdW5jdGlvbiAoY3JlYXRlRWxlbWVudCAgICAgKSB7IHJldHVybiBjcmVhdGVFbGVtZW50KCdpZnJhbWUnKTsgfSxcclxuXHRtb3VudGVkOiBzZXREb2MsXHJcblx0YWN0aXZhdGVkOiBzZXREb2MsXHJcblx0d2F0Y2g6IHsgZG9jOiBzZXREb2MgfVxyXG59O1xyXG4iLCJpbXBvcnQgcHJvcHMgZnJvbSAnLi9wcm9wcyc7XHJcbmltcG9ydCBmaWx0ZXJGb3JtcyBmcm9tICcuLi9maWx0ZXJGb3Jtcyc7XHJcbmltcG9ydCBqdXN0aWZ5IGZyb20gJy4vanVzdGlmeSc7XHJcbmltcG9ydCBkaXYgZnJvbSAnLi9kaXYnO1xyXG5pbXBvcnQgYWN0aXZhdGVIVE1MNVRhZ3MgZnJvbSAnLi4vYWN0aXZhdGVIVE1MNVRhZ3MnO1xyXG5cclxuZnVuY3Rpb24gc2V0RG9jICggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcclxuXHR2YXIgZWwgPSB0aGlzLiRlbDtcclxuXHRkaXYuaW5uZXJIVE1MID0gJzxpZnJhbWUgc2VjdXJpdHk9XCJyZXN0cmljdGVkXCIgd2lkdGg9XCIxMDAlXCIgZnJhbWVCb3JkZXI9XCIwXCIgc2Nyb2xsaW5nPVwibm9cIiBtYXJnaW5XaWR0aD1cIjBcIiBtYXJnaW5IZWlnaHQ9XCIwXCIgc3R5bGU9XCJoZWlnaHQ6MDtcIj48L2lmcmFtZT4nO1xyXG5cdHZhciBpRnJhbWUgPSB0aGlzLiRlbCA9IGRpdi5sYXN0Q2hpbGQgICAgICAgICAgICAgICAgICAgICA7XHJcblx0dmFyIHBhcmVudE5vZGUgPSBlbC5wYXJlbnROb2RlO1xyXG5cdGlmICggcGFyZW50Tm9kZT09PW51bGwgKSB7XHJcblx0XHRkaXYucmVtb3ZlQ2hpbGQoaUZyYW1lKTtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0cGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoaUZyYW1lLCBlbCk7XHJcblx0dmFyIGRvYyA9IHRoaXMuZG9jO1xyXG5cdGlmICggZG9jPT09JycgKSB7IHJldHVybjsgfVxyXG5cdGlGcmFtZS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywganVzdGlmeSk7XHJcblx0dmFyIGNvbnRlbnREb2N1bWVudCA9IGlGcmFtZS5jb250ZW50RG9jdW1lbnQgO1xyXG5cdGNvbnRlbnREb2N1bWVudC5vcGVuKCk7XHJcblx0YWN0aXZhdGVIVE1MNVRhZ3MoY29udGVudERvY3VtZW50KTtcclxuXHRjb250ZW50RG9jdW1lbnQud3JpdGUoZG9jKTtcclxuXHRjb250ZW50RG9jdW1lbnQuY2xvc2UoKTtcclxuXHRmaWx0ZXJGb3Jtcyhjb250ZW50RG9jdW1lbnQpO1xyXG5cdGlGcmFtZS5zdHlsZS5oZWlnaHQgPSBjb250ZW50RG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbEhlaWdodCsncHgnO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcblx0bmFtZTogJ2otc2FuZGRvYycsXHJcblx0cHJvcHM6IHByb3BzLFxyXG5cdGluaGVyaXRBdHRyczogZmFsc2UsXHJcblx0cmVuZGVyOiBmdW5jdGlvbiAoY3JlYXRlRWxlbWVudCAgICAgKSB7IHJldHVybiBjcmVhdGVFbGVtZW50KCdpZnJhbWUnKTsgfSxcclxuXHRtb3VudGVkOiBzZXREb2MsXHJcblx0YWN0aXZhdGVkOiBzZXREb2MsXHJcblx0d2F0Y2g6IHsgZG9jOiBzZXREb2MgfVxyXG59O1xyXG4iLCJpbXBvcnQgcHJvcHMgZnJvbSAnLi9wcm9wcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcblx0bmFtZTogJ2otc2FuZGRvYycsXHJcblx0cHJvcHM6IHByb3BzLFxyXG5cdGluaGVyaXRBdHRyczogZmFsc2UsXHJcblx0cmVuZGVyOiBmdW5jdGlvbiAoY3JlYXRlRWxlbWVudCAgICAgKSB7XHJcblx0XHRyZXR1cm4gY3JlYXRlRWxlbWVudCgnaWZyYW1lJywge1xyXG5cdFx0XHRzdGF0aWNTdHlsZToge1xyXG5cdFx0XHRcdGhlaWdodDogJzAnXHJcblx0XHRcdH0sXHJcblx0XHRcdGF0dHJzOiB7XHJcblx0XHRcdFx0d2lkdGg6ICcxMDAlJyxcclxuXHRcdFx0XHRmcmFtZUJvcmRlcjogJzAnLFxyXG5cdFx0XHRcdHNjcm9sbGluZzogJ25vJyxcclxuXHRcdFx0XHRtYXJnaW5XaWR0aDogJzAnLFxyXG5cdFx0XHRcdG1hcmdpbkhlaWdodDogJzAnXHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxufTtcclxuIiwiaW1wb3J0IFNVUFBPUlRfU1RBVFVTIGZyb20gJy4uL1NVUFBPUlRfU1RBVFVTJztcclxuaW1wb3J0IGNhc2Vfc2FuZGJveCBmcm9tICcuL2Nhc2Utc2FuZGJveCc7XHJcbmltcG9ydCBjYXNlX3NlY3VyaXR5IGZyb20gJy4vY2FzZS1zZWN1cml0eSc7XHJcbmltcG9ydCBkZWZhdWx0XyBmcm9tICcuL2RlZmF1bHQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgKCBmdW5jdGlvbiAoKSB7XHJcblx0c3dpdGNoICggU1VQUE9SVF9TVEFUVVMgKSB7XHJcblx0XHQvLyBzYW5kYm94IHNyY2RvYzogQ2hyb21lKyBTYWZhcmkrIEZpcmVmb3grXHJcblx0XHQvLyBzYW5kYm94OiBFZGdlKyBJRTEwK1xyXG5cdFx0Y2FzZSAnc2FuZGJveCc6XHJcblx0XHRcdHJldHVybiBjYXNlX3NhbmRib3g7XHJcblx0XHQvLyBzZWN1cml0eTogSUU5KC0pXHJcblx0XHRjYXNlICdzZWN1cml0eSc6XHJcblx0XHRcdHJldHVybiBjYXNlX3NlY3VyaXR5O1xyXG5cdFx0ZGVmYXVsdDpcclxuXHRcdFx0cmV0dXJuIGRlZmF1bHRfO1xyXG5cdH1cclxufSApKCk7XHJcbiIsImltcG9ydCBTQU5EQk9YIGZyb20gJy4vU0FOREJPWCc7XHJcbmltcG9ydCByZW5kZXIgZnJvbSAnLi9yZW5kZXInO1xyXG5cclxuZnVuY3Rpb24gaXNTYW5kRG9jIChpRnJhbWUgICAgICAgICAgICAgICAgICAgKSB7XHJcblx0dmFyIHNhbmRib3g7XHJcblx0dmFyIHNhbmRib3hlcztcclxuXHRyZXR1cm4gKFxyXG5cdFx0IWlGcmFtZS5zcmMgJiZcclxuXHRcdCFpRnJhbWUubmFtZSAmJlxyXG5cdFx0IWlGcmFtZS5zZWFtbGVzcyAmJlxyXG5cdFx0KCBzYW5kYm94ID0gaUZyYW1lLmdldEF0dHJpYnV0ZSgnc2FuZGJveCcpICkgJiZcclxuXHRcdCggc2FuZGJveD09PVNBTkRCT1ggfHxcclxuXHRcdFx0KCBzYW5kYm94ZXMgPSBzYW5kYm94LnNwbGl0KCcgJyksXHJcblx0XHRcdFx0c2FuZGJveGVzLmxlbmd0aD09PTQgJiZcclxuXHRcdFx0XHRzYW5kYm94ZXMuc29ydCgpLmpvaW4oJyAnKT09PVNBTkRCT1hcclxuXHRcdFx0KVxyXG5cdFx0KSAmJlxyXG5cdFx0aUZyYW1lLmdldEF0dHJpYnV0ZSgnd2lkdGgnKT09PScxMDAlJyAmJlxyXG5cdFx0aUZyYW1lLmdldEF0dHJpYnV0ZSgnc2Nyb2xsaW5nJyk9PT0nbm8nICYmXHJcblx0XHRpRnJhbWUuZ2V0QXR0cmlidXRlKCdmcmFtZUJvcmRlcicpPT09JzAnICYmXHJcblx0XHRpRnJhbWUuZ2V0QXR0cmlidXRlKCdtYXJnaW5XaWR0aCcpPT09JzAnICYmXHJcblx0XHRpRnJhbWUuZ2V0QXR0cmlidXRlKCdtYXJnaW5IZWlnaHQnKT09PScwJyAmJlxyXG5cdFx0aUZyYW1lLmdldEF0dHJpYnV0ZSgnc3JjRG9jJylcclxuXHQpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjb2xsZWN0U2FuZERvY3MgKGRvY3VtZW50ICAgICAgICAgICkge1xyXG5cdHZhciBzYW5kRG9jcyA9IFtdO1xyXG5cdHZhciBpRnJhbWVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2lmcmFtZScpO1xyXG5cdHZhciBpbmRleCA9IGlGcmFtZXMubGVuZ3RoO1xyXG5cdHdoaWxlICggaW5kZXgtLSApIHtcclxuXHRcdHZhciBpRnJhbWUgPSBpRnJhbWVzW2luZGV4XTtcclxuXHRcdGlmICggaXNTYW5kRG9jKGlGcmFtZSkgKSB7IHNhbmREb2NzLnB1c2goaUZyYW1lKTsgfVxyXG5cdH1cclxuXHRyZXR1cm4gc2FuZERvY3M7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJlbmRlckFsbCAoZG9jdW1lbnQgICAgICAgICAgKSB7XHJcblx0dmFyIHNhbmREb2NzID0gY29sbGVjdFNhbmREb2NzKGRvY3VtZW50KTtcclxuXHR2YXIgaW5kZXggPSBzYW5kRG9jcy5sZW5ndGg7XHJcblx0d2hpbGUgKCBpbmRleC0tICkge1xyXG5cdFx0cmVuZGVyKHNhbmREb2NzW2luZGV4XSk7XHJcblx0fVxyXG59O1xyXG4iLCJpbXBvcnQgd2luZG93IGZyb20gJy53aW5kb3cnO1xyXG5pbXBvcnQgdG9wIGZyb20gJy50b3AnO1xyXG5pbXBvcnQgc2V0VGltZW91dCBmcm9tICcuc2V0VGltZW91dCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBvblJlYWR5IChjYWxsYmFjayAgICAgICAgICAgICwgZG9jdW1lbnQgICAgICAgICAgKSB7XHJcblx0aWYgKCBkb2N1bWVudC5yZWFkeVN0YXRlPT09J2NvbXBsZXRlJyApIHtcclxuXHRcdHJldHVybiBjYWxsYmFjaygpO1xyXG5cdH1cclxuXHRpZiAoIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIgKSB7XHJcblx0XHRyZXR1cm4gZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uIGxpc3RlbmVyICgpIHtcclxuXHRcdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGxpc3RlbmVyKTtcclxuXHRcdFx0Y2FsbGJhY2soKTtcclxuXHRcdH0sIGZhbHNlKTtcclxuXHR9XHJcblx0aWYgKCB3aW5kb3c9PXRvcCApIHtcclxuXHRcdHZhciBkb2N1bWVudEVsZW1lbnQgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XHJcblx0XHRpZiAoIGRvY3VtZW50RWxlbWVudC5kb1Njcm9sbCApIHtcclxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbiBoYW5kbGVyICgpIHtcclxuXHRcdFx0XHR0cnkgeyBkb2N1bWVudEVsZW1lbnQuZG9TY3JvbGwgKCdsZWZ0Jyk7IH1cclxuXHRcdFx0XHRjYXRjaCAoZXJyb3IpIHtcclxuXHRcdFx0XHRcdHNldFRpbWVvdXQoaGFuZGxlciwgMCk7XHJcblx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGNhbGxiYWNrKCk7XHJcblx0XHRcdH0sIDApO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0fVxyXG5cdGRvY3VtZW50LmF0dGFjaEV2ZW50KCdvbnJlYWR5c3RhdGVjaGFuZ2UnLCBmdW5jdGlvbiBsaXN0ZW5lciAoKSB7XHJcblx0XHRpZiAoIGRvY3VtZW50LnJlYWR5U3RhdGU9PT0nY29tcGxldGUnICkge1xyXG5cdFx0XHRkb2N1bWVudC5kZXRhY2hFdmVudCgnb25yZWFkeXN0YXRlY2hhbmdlJywgbGlzdGVuZXIpO1xyXG5cdFx0XHRjYWxsYmFjaygpO1xyXG5cdFx0fVxyXG5cdH0pO1xyXG59O1xyXG4iLCJpbXBvcnQgd2luZG93IGZyb20gJy53aW5kb3cnO1xuaW1wb3J0IGRvY3VtZW50IGZyb20gJy5kb2N1bWVudCc7XG5cbmltcG9ydCB2dWUgZnJvbSAnLi92dWUvJztcbmltcG9ydCByZW5kZXJBbGwgZnJvbSAnLi9yZW5kZXJBbGwnO1xuaW1wb3J0IG9uUmVhZHkgZnJvbSAnLi9vblJlYWR5JztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaW5zdGFsbCAoZG9jVnVlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuXHRpZiAoIGRvY1Z1ZSApIHtcblx0XHRpZiAoICdkb2N1bWVudEVsZW1lbnQnIGluIGRvY1Z1ZSApIHtcblx0XHRcdG9uUmVhZHkoZnVuY3Rpb24gKCkgeyByZW5kZXJBbGwoZG9jVnVlKTsgfSwgZG9jVnVlKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRkb2NWdWUuY29tcG9uZW50KCdqLXNhbmRkb2MnLCB2dWUpO1xuXHRcdH1cblx0fVxuXHRlbHNlIHtcblx0XHRpZiAoIHR5cGVvZiAoIHdpbmRvdyAgICAgICAgKS5WdWU9PT0nZnVuY3Rpb24nICYmIHR5cGVvZiAoIHdpbmRvdyAgICAgICAgKS5WdWUuY29tcG9uZW50PT09J2Z1bmN0aW9uJyApIHtcblx0XHRcdCggd2luZG93ICAgICAgICApLlZ1ZS5jb21wb25lbnQoJ2otc2FuZGRvYycsIHZ1ZSk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0b25SZWFkeShmdW5jdGlvbiAoKSB7IHJlbmRlckFsbChkb2N1bWVudCk7IH0sIGRvY3VtZW50KTtcblx0XHR9XG5cdH1cbn07XG4iLCJpbXBvcnQgdmVyc2lvbiBmcm9tICcuL3ZlcnNpb24/dGV4dCc7XG5cbmltcG9ydCByZW5kZXIgZnJvbSAnLi9yZW5kZXInO1xuaW1wb3J0IGluc3RhbGwgZnJvbSAnLi9pbnN0YWxsJztcbmltcG9ydCB2dWUgZnJvbSAnLi92dWUvJztcbmV4cG9ydCB7XG5cdHZlcnNpb24sXG5cdHZ1ZSxcblx0cmVuZGVyLFxuXHRpbnN0YWxsLFxufTtcblxuaW1wb3J0IERlZmF1bHQgZnJvbSAnLmRlZmF1bHQ/PSc7XG5leHBvcnQgZGVmYXVsdCBEZWZhdWx0KHtcblx0dmVyc2lvbjogdmVyc2lvbixcblx0dnVlOiB2dWUsXG5cdHJlbmRlcjogcmVuZGVyLFxuXHRpbnN0YWxsOiBpbnN0YWxsLFxuXHRfOiB0eXBlb2YgbW9kdWxlIT09J3VuZGVmaW5lZCcgJiYgdHlwZW9mIGV4cG9ydHM9PT0nb2JqZWN0JyB8fCB0eXBlb2YgZGVmaW5lPT09J2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kIHx8IC8qI19fUFVSRV9fKi8gaW5zdGFsbCgpXG59KTtcbiJdLCJuYW1lcyI6WyJqdXN0aWZ5Iiwic2V0RG9jIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxjQUFlLE9BQU87O3NCQUFDLHRCQ0V2QixJQUFJLFVBQVUsaUJBQWlCLFlBQVk7Q0FDMUMsSUFBSSxVQUFVLEdBQUcsb0JBQW9CLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUM5RCxPQUFPLFVBQVU7SUFDZCxVQUFVLElBQUksVUFBVSxFQUFFLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtJQUNoRSxZQUFZLEVBQUUsQ0FBQztDQUNsQixFQUFFLENBQUM7O0FBRUosSUFBSSxVQUFVLEdBQUcsdUJBQXVCLENBQUM7O0FBRXpDLFNBQVMsVUFBVSxFQUFFLE1BQU0sdUJBQXVCO0NBQ2pELFNBQVMsTUFBTTtFQUNkLEtBQUssT0FBTyxDQUFDO0VBQ2IsS0FBSyxNQUFNLENBQUM7RUFDWixLQUFLLE1BQU0sQ0FBQztFQUNaLEtBQUssS0FBSyxDQUFDO0VBQ1gsS0FBSyxRQUFRLENBQUM7RUFDZCxLQUFLLE1B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QztLQUN2QixPQUFPO0tBQ1A7SUFDRCxRQUFRLEVBQUUsQ0FBQztJQUNYLEVBQUUsQ0FBQyxDQUFDLENBQUM7R0FDTixPQUFPO0dBQ1A7RUFDRDtDQUNELFFBQVEsQ0FBQyxXQUFXLENBQUMsb0JBQW9CLEVBQUUsU0FBUyxRQUFRLElBQUk7RUFDL0QsS0FBSyxRQUFRLENBQUMsVUFBVSxHQUFHLFVBQVUsR0FBRztHQUN2QyxRQUFRLENBQUMsV0FBVyxDQUFDLG9CQUFvQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0dBQ3JELFFBQVEsRUFBRSxDQUFDO0dBQ1g7RUFDRCxDQUFDLENBQUM7Q0FDSDs7QUMzQmMsU0FBUyxPQUFPLEVBQUUsTUFBTSwrREFBK0Q7Q0FDckcsS0FBSyxNQUFNLEdBQUc7RUFDYixLQUFLLGlCQUFpQixJQUFJLE1BQU0sR0FBRztHQUNsQyxPQUFPLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7R0FDcEQ7T0FDSTtHQUNKLE1BQU0sQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0dBQ25DO0VBQ0Q7TUFDSTtFQUNKLEtBQUssT0FBTyxFQUFFLE1BQU0sVUFBVSxHQUFHLEdBQUcsVUFBVSxJQUFJLE9BQU8sRUFBRSxNQUFNLFVBQVUsR0FBRyxDQUFDLFNBQVMsR0FBRyxVQUFVLEdBQUc7R0FDdkcsRUFBRSxNQUFNLFVBQVUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUM7R0FDbEQ7T0FDSTtHQUNKLE9BQU8sQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQztHQUN4RDtFQUNEO0NBQ0Q7O0FDWEQsY0FBZSxPQUFPLENBQUM7Q0FDdEIsT0FBTyxFQUFFLE9BQU87Q0FDaEIsR0FBRyxFQUFFLEdBQUc7Q0FDUixNQUFNLEVBQUUsTUFBTTtDQUNkLE9BQU8sRUFBRSxPQUFPO0NBQ2hCLENBQUMsRUFBRSxPQUFPLE1BQU0sR0FBRyxXQUFXLElBQUksT0FBTyxPQUFPLEdBQUcsUUFBUSxJQUFJLE9BQU8sTUFBTSxHQUFHLFVBQVUsSUFBSSxNQUFNLENBQUMsR0FBRyxrQkFBa0IsT0FBTyxFQUFFO0NBQ2xJLENBQUMsQ0FBQzs7Ozs7Ozs7OyIsInNvdXJjZVJvb3QiOiIuLi8uLi9zcmMvIn0=