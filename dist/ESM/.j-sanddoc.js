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

import location from '.location';
import document from '.document';
import window from '.window';
import Object from '.Object';
import top from '.top';
import setTimeout from '.setTimeout';
import Default from '.default?=';

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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZlcnNpb24/dGV4dCIsIm5vb3AudHMiLCJzY2hlbWVfc3RhdC50cyIsImZpbHRlckFuY2hvcnMudHMiLCJTVVBQT1JUX1NUQVRVUy50cyIsImFjdGl2YXRlSFRNTDVUYWdzLnRzIiwiZmlsdGVyRm9ybXMudHMiLCJyZW5kZXIudHMiLCJ2dWUubmFtZS50cyIsIlNBTkRCT1gudHMiLCJ2dWUudHMiLCJyZW5kZXJBbGwudHMiLCJvblJlYWR5LnRzIiwiaW5zdGFsbC50cyIsImV4cG9ydC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCAnNi4wLjEnOyIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG5vb3AgKCkge307IiwiaW1wb3J0IGxvY2F0aW9uIGZyb20gJy5sb2NhdGlvbic7XHJcblxyXG5pbXBvcnQgbm9vcCBmcm9tICcuL25vb3AnO1xyXG5cclxudmFyIHNhbWVPcmlnaW4gPSAvKiNfX1BVUkVfXyovIGZ1bmN0aW9uICgpIHtcclxuXHR2YXIgcGFnZU9yaWdpbiA9IC9eaHR0cHM/OlxcL1xcL1teL10rfC8uZXhlYyhsb2NhdGlvbi5ocmVmKSBbMF07XHJcblx0cmV0dXJuIHBhZ2VPcmlnaW5cclxuXHRcdD8gZnVuY3Rpb24gKGhyZWYgICAgICAgICkgeyByZXR1cm4gaHJlZi5pbmRleE9mKHBhZ2VPcmlnaW4pPT09MDsgfVxyXG5cdFx0OiBub29wO1xyXG59KCk7XHJcblxyXG52YXIgd2l0aFNjaGVtZSA9IC9eW2Etel1bYS16MC05XFwtKy5dKjovaTtcclxuXHJcbmZ1bmN0aW9uIHNhZmVTY2hlbWUgKHNjaGVtZSAgICAgICAgKSAgICAgICAgICAgICAge1xyXG5cdHN3aXRjaCAoIHNjaGVtZSApIHtcclxuXHRcdGNhc2UgJ2h0dHBzJzpcclxuXHRcdGNhc2UgJ2h0dHAnOlxyXG5cdFx0Y2FzZSAnZnRwcyc6XHJcblx0XHRjYXNlICdmdHAnOlxyXG5cdFx0Y2FzZSAnbWFpbHRvJzpcclxuXHRcdGNhc2UgJ25ld3MnOlxyXG5cdFx0Y2FzZSAnZ29waGVyJzpcclxuXHRcdGNhc2UgJ2RhdGEnOlxyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHNjaGVtZV9zdGF0IChocmVmICAgICAgICAgKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcblx0XHJcblx0aWYgKCB0eXBlb2YgaHJlZiE9PSdzdHJpbmcnICkge1xyXG5cdFx0cmV0dXJuIDA7XHJcblx0fVxyXG5cdFxyXG5cdGlmICggaHJlZj09PScnICkge1xyXG5cdFx0cmV0dXJuIDM7XHJcblx0fVxyXG5cdHN3aXRjaCAoIGhyZWYuY2hhckF0KDApICkge1xyXG5cdFx0Y2FzZSAnLyc6XHJcblx0XHRjYXNlICcuJzpcclxuXHRcdGNhc2UgJz8nOlxyXG5cdFx0Y2FzZSAnIyc6XHJcblx0XHRcdHJldHVybiAzO1xyXG5cdH1cclxuXHRcclxuXHR2YXIgY29sb24gPSBocmVmLmluZGV4T2YoJzonKTtcclxuXHRpZiAoIGNvbG9uPT09IC0xICkge1xyXG5cdFx0cmV0dXJuIDI7XHJcblx0fVxyXG5cdGlmICggc2FtZU9yaWdpbihocmVmLnNsaWNlKDAsIGNvbG9uKSkgKSB7XHJcblx0XHRyZXR1cm4gNDtcclxuXHR9XHJcblx0aWYgKCBzYWZlU2NoZW1lKGhyZWYpIHx8IGhyZWY9PT0nYWJvdXQ6YmxhbmsnICkge1xyXG5cdFx0cmV0dXJuIDE7XHJcblx0fVxyXG5cdGlmICggd2l0aFNjaGVtZS50ZXN0KGhyZWYpICkge1xyXG5cdFx0cmV0dXJuIDA7XHJcblx0fVxyXG5cdFxyXG59O1xyXG4iLCJpbXBvcnQgc2NoZW1lX3N0YXQgZnJvbSAnLi9zY2hlbWVfc3RhdCc7XHJcblxyXG5mdW5jdGlvbiBmaWx0ZXJBbmNob3IgKGFuY2hvcnMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XHJcblx0dmFyIGluZGV4ID0gYW5jaG9ycy5sZW5ndGg7XHJcblx0d2hpbGUgKCBpbmRleC0tICkge1xyXG5cdFx0dmFyIGFuY2hvciA9IGFuY2hvcnNbaW5kZXhdO1xyXG5cdFx0dmFyIGhyZWYgPSBhbmNob3IuaHJlZjtcclxuXHRcdHZhciBzYW1lT3JpZ2luICAgICAgICAgICAgIDtcclxuXHRcdHN3aXRjaCAoIHNjaGVtZV9zdGF0KGhyZWYpICkge1xyXG5cdFx0XHRjYXNlIDA6XHJcblx0XHRcdFx0YW5jaG9yLnJlbW92ZUF0dHJpYnV0ZSgnaHJlZicpO1xyXG5cdFx0XHRcdC8vYW5jaG9yLnJlbW92ZUF0dHJpYnV0ZSgndGFyZ2V0Jyk7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRjYXNlIDE6XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgMjpcclxuXHRcdFx0XHRhbmNob3Iuc2V0QXR0cmlidXRlKCdocmVmJywgJy4vJytocmVmKTtcclxuXHRcdFx0XHRzYW1lT3JpZ2luID0gdHJ1ZTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSAzOlxyXG5cdFx0XHRjYXNlIDQ6XHJcblx0XHRcdFx0c2FtZU9yaWdpbiA9IHRydWU7XHJcblx0XHR9XHJcblx0XHRpZiAoIHNhbWVPcmlnaW4gKSB7XHJcblx0XHRcdGlmICggYW5jaG9yLnRhcmdldCE9PSdfYmxhbmsnICkge1xyXG5cdFx0XHRcdGFuY2hvci5zZXRBdHRyaWJ1dGUoJ3RhcmdldCcsICdfcGFyZW50Jyk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGVsc2Uge1xyXG5cdFx0XHRhbmNob3Iuc2V0QXR0cmlidXRlKCd0YXJnZXQnLCAnX2JsYW5rJyk7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBmaWx0ZXJBbmNob3JzIChjb250ZW50RG9jdW1lbnQgICAgICAgICAgKSB7XHJcblx0ZmlsdGVyQW5jaG9yKGNvbnRlbnREb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYScpKTtcclxuXHRmaWx0ZXJBbmNob3IoY29udGVudERvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdhcmVhJykpO1xyXG59O1xyXG4iLCJpbXBvcnQgZG9jdW1lbnQgZnJvbSAnLmRvY3VtZW50JztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IC8qI19fUFVSRV9fKi8gKCBmdW5jdGlvbiAoKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcblx0XHJcblx0dmFyIGlGcmFtZSAgICAgICAgICAgICAgICAgICAgICAgICAgID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XHJcblx0XHJcblx0aWYgKCAnc2FuZGJveCcgaW4gaUZyYW1lICAgICAgICAgICAgKSB7XHJcblx0XHRpRnJhbWUgPSBudWxsO1xyXG5cdFx0cmV0dXJuICdzYW5kYm94JztcclxuXHR9XHJcblx0XHJcblx0aUZyYW1lLnNldEF0dHJpYnV0ZSgnc2VjdXJpdHknLCAncmVzdHJpY3RlZCcpO1xyXG5cdFxyXG5cdHZhciBiZWQgICAgICAgICAgICAgICAgICAgICA9IGRvY3VtZW50LmJvZHkgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xyXG5cdGJlZC5hcHBlbmRDaGlsZChpRnJhbWUpO1xyXG5cdHZhciBjb250ZW50V2luZG93ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IGlGcmFtZS5jb250ZW50V2luZG93ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA7XHJcblx0dmFyIGNvbnRlbnREb2N1bWVudCAgICAgICAgICAgICAgICAgID0gY29udGVudFdpbmRvdy5kb2N1bWVudDtcclxuXHRcclxuXHRjb250ZW50RG9jdW1lbnQub3BlbigpO1xyXG5cdHZhciBzZWN1cml0eSA9IGNvbnRlbnRXaW5kb3cuJGRhbmdlcm91cyA9IHt9O1xyXG5cdGNvbnRlbnREb2N1bWVudC53cml0ZSgnPHNjcmlwdD4kZGFuZ2Vyb3VzPXt9PC9zY3JpcHQ+Jyk7XHJcblx0c2VjdXJpdHkgPSBjb250ZW50V2luZG93LiRkYW5nZXJvdXM9PT1zZWN1cml0eTtcclxuXHRjb250ZW50V2luZG93LiRkYW5nZXJvdXMgPSBudWxsO1xyXG5cdGNvbnRlbnREb2N1bWVudC5jbG9zZSgpO1xyXG5cdFxyXG5cdGNvbnRlbnREb2N1bWVudCA9IG51bGw7XHJcblx0Y29udGVudFdpbmRvdyA9IG51bGw7XHJcblx0YmVkLnJlbW92ZUNoaWxkKGlGcmFtZSk7XHJcblx0YmVkID0gbnVsbDtcclxuXHRcclxuXHRpZiAoIHNlY3VyaXR5ICkge1xyXG5cdFx0aUZyYW1lID0gbnVsbDtcclxuXHRcdHJldHVybiAnc2VjdXJpdHknO1xyXG5cdH1cclxuXHRcclxuXHRpZiAoICdzcmNkb2MnIGluIGlGcmFtZSApIHtcclxuXHRcdGlGcmFtZSA9IG51bGw7XHJcblx0XHRyZXR1cm4gJ2luRGFuZ2VyJztcclxuXHR9XHJcblx0ZWxzZSB7XHJcblx0XHRpRnJhbWUgPSBudWxsO1xyXG5cdFx0cmV0dXJuICdkYW5nZXJvdXMnO1xyXG5cdH1cclxuXHRcclxufSApKCk7XHJcbiIsImltcG9ydCBkb2N1bWVudCBmcm9tICcuZG9jdW1lbnQnO1xyXG5cclxuaW1wb3J0IG5vb3AgZnJvbSAnLi9ub29wJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IChcclxuXHQnaGlkZGVuJyBpbiAvKiNfX1BVUkVfXyovIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKVxyXG5cdFx0XHJcblx0XHQ/IG5vb3BcclxuXHRcdFxyXG5cdFx0OiAvKiNfX1BVUkVfXyovIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0Ly8gPGNvbW1hbmQgLz4gPGtleWdlbiAvPiA8c291cmNlIC8+IDx0cmFjayAvPiA8bWVudT48L21lbnU+XHJcblx0XHRcdHZhciBIVE1MNV9UQUdTID0gJ2FiYnIgYXJ0aWNsZSBhc2lkZSBhdWRpbyBiZGkgY2FudmFzIGRhdGEgZGF0YWxpc3QgZGV0YWlscyBkaWFsb2cgZmlnY2FwdGlvbiBmaWd1cmUgZm9vdGVyIGhlYWRlciBoZ3JvdXAgbWFpbiBtYXJrIG1ldGVyIG5hdiBvdXRwdXQgcGljdHVyZSBwcm9ncmVzcyBzZWN0aW9uIHN1bW1hcnkgdGVtcGxhdGUgdGltZSB2aWRlbycuc3BsaXQoJyAnKTtcclxuXHRcdFx0dmFyIEhUTUw1X1RBR1NfTEVOR1RIID0gSFRNTDVfVEFHUy5sZW5ndGg7XHJcblx0XHRcdFxyXG5cdFx0XHRmdW5jdGlvbiBhY3RpdmF0ZUhUTUw1VGFncyAoY29udGVudERvY3VtZW50ICAgICAgICAgICkge1xyXG5cdFx0XHRcdHZhciBpbmRleCA9IEhUTUw1X1RBR1NfTEVOR1RIO1xyXG5cdFx0XHRcdHdoaWxlICggaW5kZXgtLSApIHtcclxuXHRcdFx0XHRcdGNvbnRlbnREb2N1bWVudC5jcmVhdGVFbGVtZW50KEhUTUw1X1RBR1NbaW5kZXhdKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0YWN0aXZhdGVIVE1MNVRhZ3MoZG9jdW1lbnQpO1xyXG5cdFx0XHRcclxuXHRcdFx0cmV0dXJuIGFjdGl2YXRlSFRNTDVUYWdzO1xyXG5cdFx0fSgpXHJcblx0XHJcbik7XHJcbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGZpbHRlckZvcm1zIChjb250ZW50RG9jdW1lbnQgICAgICAgICAgKSB7XHJcblx0XHJcblx0dmFyIGZvcm1zID0gY29udGVudERvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdmcm9tJyk7XHJcblx0dmFyIGluZGV4ID0gZm9ybXMubGVuZ3RoO1xyXG5cdFxyXG5cdHdoaWxlICggaW5kZXgtLSApIHtcclxuXHRcdHZhciBmb3JtID0gZm9ybXNbaW5kZXhdO1xyXG5cdFx0Zm9ybS5wYXJlbnROb2RlIC5yZW1vdmVDaGlsZChmb3JtKTtcclxuXHR9XHJcblx0XHJcbn07IiwiaW1wb3J0IG5vb3AgZnJvbSAnLi9ub29wJztcclxuaW1wb3J0IGZpbHRlckFuY2hvcnMgZnJvbSAnLi9maWx0ZXJBbmNob3JzJztcclxuaW1wb3J0IFNVUFBPUlRfU1RBVFVTIGZyb20gJy4vU1VQUE9SVF9TVEFUVVMnO1xyXG5pbXBvcnQgYWN0aXZhdGVIVE1MNVRhZ3MgZnJvbSAnLi9hY3RpdmF0ZUhUTUw1VGFncyc7XHJcbmltcG9ydCBmaWx0ZXJGb3JtcyBmcm9tICcuL2ZpbHRlckZvcm1zJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0ICggZnVuY3Rpb24gKCkge1xyXG5cdHN3aXRjaCAoIFNVUFBPUlRfU1RBVFVTICkge1xyXG5cdFx0XHJcblx0XHRjYXNlICdzYW5kYm94JzpcclxuXHRcdFx0dmFyIGp1c3RpZnkgPSBmdW5jdGlvbiBqdXN0aWZ5ICggICAgICAgICAgICAgICAgICAgICAgICkge1xyXG5cdFx0XHRcdHZhciBzdHlsZSA9IHRoaXMuc3R5bGU7XHJcblx0XHRcdFx0c3R5bGUuc2V0UHJvcGVydHkoJ2hlaWdodCcsICcwJywgJ2ltcG9ydGFudCcpO1xyXG5cdFx0XHRcdHN0eWxlLnNldFByb3BlcnR5KCdoZWlnaHQnLCB0aGlzLmNvbnRlbnREb2N1bWVudCAuZG9jdW1lbnRFbGVtZW50LnNjcm9sbEhlaWdodCsncHgnLCAnaW1wb3J0YW50Jyk7XHJcblx0XHRcdH07XHJcblx0XHRcdHJldHVybiBmdW5jdGlvbiByZW5kZXIgKGlGcmFtZSAgICAgICAgICAgICAgICAgICApIHtcclxuXHRcdFx0XHR2YXIgc3JjZG9jID0gaUZyYW1lLmdldEF0dHJpYnV0ZSgnc3JjZG9jJykgO1xyXG5cdFx0XHRcdGlGcmFtZS5yZW1vdmVBdHRyaWJ1dGUoJ3NyY2RvYycpO1xyXG5cdFx0XHRcdHZhciBzdHlsZSA9IGlGcmFtZS5zdHlsZTtcclxuXHRcdFx0XHRzdHlsZS5zZXRQcm9wZXJ0eSgnaGVpZ2h0JywgJzAnLCAnaW1wb3J0YW50Jyk7XHJcblx0XHRcdFx0aUZyYW1lLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBqdXN0aWZ5KTtcclxuXHRcdFx0XHR2YXIgY29udGVudERvY3VtZW50ID0gaUZyYW1lLmNvbnRlbnREb2N1bWVudCA7XHJcblx0XHRcdFx0Y29udGVudERvY3VtZW50Lm9wZW4oKTtcclxuXHRcdFx0XHRjb250ZW50RG9jdW1lbnQud3JpdGUoc3JjZG9jKTtcclxuXHRcdFx0XHRjb250ZW50RG9jdW1lbnQuY2xvc2UoKTtcclxuXHRcdFx0XHRmaWx0ZXJBbmNob3JzKGNvbnRlbnREb2N1bWVudCk7XHJcblx0XHRcdFx0c3R5bGUuaGVpZ2h0ID0gY29udGVudERvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxIZWlnaHQrJ3B4JztcclxuXHRcdFx0fTtcclxuXHRcdFx0XHJcblx0XHRjYXNlICdzZWN1cml0eSc6XHJcblx0XHRcdHZhciBjcmVhdGVKdXN0aWZ5ID0gZnVuY3Rpb24gKHN0eWxlICAgICAgICAgICAgICAgICAgICAgLCBjb250ZW50RG9jdW1lbnQgICAgICAgICAgKSB7XHJcblx0XHRcdFx0cmV0dXJuIGZ1bmN0aW9uIGp1c3RpZnkgKCAgICAgICAgICAgICkge1xyXG5cdFx0XHRcdFx0c3R5bGUuaGVpZ2h0ID0gJzAnO1xyXG5cdFx0XHRcdFx0c3R5bGUuaGVpZ2h0ID0gY29udGVudERvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxIZWlnaHQrJ3B4JztcclxuXHRcdFx0XHR9O1xyXG5cdFx0XHR9O1xyXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24gcmVuZGVyIChpRnJhbWUgICAgICAgICAgICAgICAgICAgKSB7XHJcblx0XHRcdFx0dmFyIHNyY2RvYyA9IGlGcmFtZS5nZXRBdHRyaWJ1dGUoJ3NyY2RvYycpIDtcclxuXHRcdFx0XHRpRnJhbWUucmVtb3ZlQXR0cmlidXRlKCdzcmNkb2MnKTtcclxuXHRcdFx0XHR2YXIgc3R5bGUgPSBpRnJhbWUuc3R5bGU7XHJcblx0XHRcdFx0c3R5bGUuaGVpZ2h0ID0gJzAnO1xyXG5cdFx0XHRcdGlGcmFtZS5zZXRBdHRyaWJ1dGUoJ3NlY3VyaXR5JywgJ3Jlc3RyaWN0ZWQnKTtcclxuXHRcdFx0XHR2YXIgY29udGVudERvY3VtZW50ID0gaUZyYW1lLmNvbnRlbnRXaW5kb3cgLmRvY3VtZW50O1xyXG5cdFx0XHRcdGlGcmFtZS5hdHRhY2hFdmVudCgnb25sb2FkJywgY3JlYXRlSnVzdGlmeShzdHlsZSwgY29udGVudERvY3VtZW50KSk7XHJcblx0XHRcdFx0Y29udGVudERvY3VtZW50Lm9wZW4oKTtcclxuXHRcdFx0XHRhY3RpdmF0ZUhUTUw1VGFncyhjb250ZW50RG9jdW1lbnQpO1xyXG5cdFx0XHRcdGNvbnRlbnREb2N1bWVudC53cml0ZShzcmNkb2MpO1xyXG5cdFx0XHRcdGNvbnRlbnREb2N1bWVudC5jbG9zZSgpO1xyXG5cdFx0XHRcdGZpbHRlckZvcm1zKGNvbnRlbnREb2N1bWVudCk7XHJcblx0XHRcdFx0c3R5bGUuaGVpZ2h0ID0gY29udGVudERvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxIZWlnaHQrJ3B4JztcclxuXHRcdFx0fTtcclxuXHRcdFx0XHJcblx0XHRjYXNlICdpbkRhbmdlcic6XHJcblx0XHRcdHJldHVybiBmdW5jdGlvbiByZW5kZXIgKGlGcmFtZSAgICAgICAgICAgICAgICAgICApIHsgaUZyYW1lLnJlbW92ZUF0dHJpYnV0ZSgnc3JjZG9jJyk7IH07XHJcblx0XHRjYXNlICdkYW5nZXJvdXMnOlxyXG5cdFx0XHRyZXR1cm4gbm9vcDtcclxuXHRcdFx0XHJcblx0fVxyXG59ICkoKTtcclxuIiwiZXhwb3J0IGRlZmF1bHQgJ2otc2FuZGRvYyc7IiwiZXhwb3J0IGRlZmF1bHQgJ2FsbG93LXBvcHVwcyBhbGxvdy1wb3B1cHMtdG8tZXNjYXBlLXNhbmRib3ggYWxsb3ctc2FtZS1vcmlnaW4gYWxsb3ctdG9wLW5hdmlnYXRpb24nOyIsImltcG9ydCBPYmplY3QgZnJvbSAnLk9iamVjdCc7XG5cbmltcG9ydCBub29wIGZyb20gJy4vbm9vcCc7XG5cbmltcG9ydCBTQU5EQk9YIGZyb20gJy4vU0FOREJPWCc7XG5pbXBvcnQgU1VQUE9SVF9TVEFUVVMgZnJvbSAnLi9TVVBQT1JUX1NUQVRVUyc7XG5cbmltcG9ydCBuYW1lIGZyb20gJy4vdnVlLm5hbWUnO1xuXG5pbXBvcnQgYWN0aXZhdGVIVE1MNVRhZ3MgZnJvbSAnLi9hY3RpdmF0ZUhUTUw1VGFncyc7XG5pbXBvcnQgZmlsdGVyQW5jaG9ycyBmcm9tICcuL2ZpbHRlckFuY2hvcnMnO1xuaW1wb3J0IGZpbHRlckZvcm1zIGZyb20gJy4vZmlsdGVyRm9ybXMnO1xuXG52YXIgUmVhZG9ubHkgPSBPYmplY3QuZnJlZXplO1xuXG5leHBvcnQgZGVmYXVsdCBSZWFkb25seSAmJiAvKiNfX1BVUkVfXyovIGZ1bmN0aW9uICgpICAgICAgICAgICAgICAgICAgICAgICAgIHtcblx0XG5cdHZhciBjcmVhdGUgPSBPYmplY3QuY3JlYXRlO1xuXHRcblx0ZnVuY3Rpb24gcmVhZG9ubHkgICAgKHZhbHVlICAgKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuXHRcdHZhciBkZXNjcmlwdG9yID0gY3JlYXRlKG51bGwpO1xuXHRcdGRlc2NyaXB0b3IudmFsdWUgPSB2YWx1ZTtcblx0XHRkZXNjcmlwdG9yLmVudW1lcmFibGUgPSB0cnVlO1xuXHRcdHJldHVybiBkZXNjcmlwdG9yO1xuXHR9XG5cdGZ1bmN0aW9uIHdyaXRhYmxlICAgICh2YWx1ZSAgICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcblx0XHR2YXIgZGVzY3JpcHRvciA9IGNyZWF0ZShudWxsKTtcblx0XHRkZXNjcmlwdG9yLmdldCA9IGZ1bmN0aW9uICgpICAgIHsgcmV0dXJuIHZhbHVlOyB9O1xuXHRcdGRlc2NyaXB0b3Iuc2V0ID0gbm9vcDtcblx0XHRkZXNjcmlwdG9yLmVudW1lcmFibGUgPSB0cnVlO1xuXHRcdHJldHVybiBkZXNjcmlwdG9yO1xuXHR9XG5cdFxuXHR2YXIgbmV2ZXIgPSBSZWFkb25seSh7XG5cdFx0dmFsaWRhdG9yOiBmdW5jdGlvbiAodmFsdWUgICAgICkgeyByZXR1cm4gdmFsdWU9PW51bGw7IH1cblx0fSk7XG5cdHZhciBwcm9wcyA9IFJlYWRvbmx5KHtcblx0XHRzcmNkb2M6IFJlYWRvbmx5KHtcblx0XHRcdHJlcXVpcmVkOiB0cnVlICAgICAgICAsXG5cdFx0XHR2YWxpZGF0b3I6IGZ1bmN0aW9uICh2YWx1ZSAgICAgKSAgICAgICAgICAgICAgICAgIHsgcmV0dXJuIHR5cGVvZiB2YWx1ZT09PSdzdHJpbmcnOyB9XG5cdFx0fSksXG5cdFx0c2FuZGJveDogbmV2ZXIsXG5cdFx0c2VjdXJpdHk6IG5ldmVyLFxuXHRcdHNyYzogbmV2ZXIsXG5cdFx0bmFtZTogbmV2ZXIsXG5cdFx0d2lkdGg6IG5ldmVyLFxuXHRcdHNlYW1sZXNzOiBuZXZlcixcblx0XHRzY3JvbGxpbmc6IG5ldmVyLFxuXHRcdGZyYW1lYm9yZGVyOiBuZXZlcixcblx0XHRtYXJnaW53aWR0aDogbmV2ZXIsXG5cdFx0bWFyZ2luaGVpZ2h0OiBuZXZlclxuXHR9KTtcblx0dmFyIHN0YXRpY1N0eWxlID0gUmVhZG9ubHkoeyBoZWlnaHQ6ICcwIWltcG9ydGFudCcgfSk7XG5cdHZhciByZW5kZXI7XG5cdHZhciBwYXJzZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgO1xuXHRcblx0aWYgKCBTVVBQT1JUX1NUQVRVUz09PSdzYW5kYm94JyApIHtcblx0XHQvLyBzYW5kYm94IHNyY2RvYzogQ2hyb21lKyBTYWZhcmkrIEZpcmVmb3grXG5cdFx0Ly8gc2FuZGJveDogRWRnZSsgSUUxMCtcblx0XHRyZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIgKGNyZWF0ZUVsZW1lbnQgICAgICkge1xuXHRcdFx0cmV0dXJuIGNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScsIHtcblx0XHRcdFx0c3RhdGljU3R5bGU6IHN0YXRpY1N0eWxlLFxuXHRcdFx0XHRhdHRyczogUmVhZG9ubHkoeyBzYW5kYm94OiBTQU5EQk9YLCB3aWR0aDogJzEwMCUnLCBmcmFtZWJvcmRlcjogJzAnLCBzY3JvbGxpbmc6ICdubycsIG1hcmdpbndpZHRoOiAnMCcsIG1hcmdpbmhlaWdodDogJzAnIH0pLFxuXHRcdFx0XHRuYXRpdmVPbjogbmF0aXZlT25cblx0XHRcdH0pO1xuXHRcdH07XG5cdFx0cGFyc2UgPSBmdW5jdGlvbiBwYXJzZSAoJGVsICAgICAgICAgICAgICAgICAgICwgY29udGVudERvY3VtZW50ICAgICAgICAgICwgc3JjZG9jICAgICAgICApIHtcblx0XHRcdGNvbnRlbnREb2N1bWVudC5vcGVuKCk7XG5cdFx0XHRjb250ZW50RG9jdW1lbnQud3JpdGUoc3JjZG9jKTtcblx0XHRcdGNvbnRlbnREb2N1bWVudC5jbG9zZSgpO1xuXHRcdFx0ZmlsdGVyQW5jaG9ycyhjb250ZW50RG9jdW1lbnQpO1xuXHRcdFx0JGVsLnN0eWxlLnNldFByb3BlcnR5KCdoZWlnaHQnLCBjb250ZW50RG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbEhlaWdodCsncHgnLCAnaW1wb3J0YW50Jyk7XG5cdFx0fTtcblx0fVxuXHRcblx0ZWxzZSBpZiAoIFNVUFBPUlRfU1RBVFVTPT09J3NlY3VyaXR5JyApIHtcblx0XHQvLyBzZWN1cml0eTogSUU5KC0pXG5cdFx0cmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyIChjcmVhdGVFbGVtZW50ICAgICApIHtcblx0XHRcdHJldHVybiBjcmVhdGVFbGVtZW50KCdpZnJhbWUnLCB7XG5cdFx0XHRcdHN0YXRpY1N0eWxlOiBzdGF0aWNTdHlsZSxcblx0XHRcdFx0YXR0cnM6IFJlYWRvbmx5KHsgc2VjdXJpdHk6ICdyZXN0cmljdGVkJywgd2lkdGg6ICcxMDAlJywgZnJhbWVib3JkZXI6ICcwJywgc2Nyb2xsaW5nOiAnbm8nLCBtYXJnaW53aWR0aDogJzAnLCBtYXJnaW5oZWlnaHQ6ICcwJyB9KSxcblx0XHRcdFx0bmF0aXZlT246IG5hdGl2ZU9uXG5cdFx0XHR9KTtcblx0XHR9O1xuXHRcdHBhcnNlID0gZnVuY3Rpb24gcGFyc2UgKCRlbCAgICAgICAgICAgICAgICAgICAsIGNvbnRlbnREb2N1bWVudCAgICAgICAgICAsIHNyY2RvYyAgICAgICAgKSB7XG5cdFx0XHRjb250ZW50RG9jdW1lbnQub3BlbigpO1xuXHRcdFx0YWN0aXZhdGVIVE1MNVRhZ3MoY29udGVudERvY3VtZW50KTtcblx0XHRcdGNvbnRlbnREb2N1bWVudC53cml0ZShzcmNkb2MpO1xuXHRcdFx0Y29udGVudERvY3VtZW50LmNsb3NlKCk7XG5cdFx0XHRmaWx0ZXJGb3Jtcyhjb250ZW50RG9jdW1lbnQpO1xuXHRcdFx0JGVsLnN0eWxlLnNldFByb3BlcnR5KCdoZWlnaHQnLCBjb250ZW50RG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbEhlaWdodCsncHgnLCAnaW1wb3J0YW50Jyk7XG5cdFx0fTtcblx0fVxuXHRcblx0ZWxzZSB7XG5cdFx0cmV0dXJuIGNyZWF0ZShudWxsLCB7XG5cdFx0XHRuYW1lOiB3cml0YWJsZShuYW1lKSxcblx0XHRcdHByb3BzOiB3cml0YWJsZShwcm9wcyksXG5cdFx0XHRpbmhlcml0QXR0cnM6IHJlYWRvbmx5KGZhbHNlKSxcblx0XHRcdHJlbmRlcjogcmVhZG9ubHkoZnVuY3Rpb24gcmVuZGVyIChjcmVhdGVFbGVtZW50ICAgICApIHtcblx0XHRcdFx0cmV0dXJuIGNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScsIHtcblx0XHRcdFx0XHRzdGF0aWNTdHlsZTogc3RhdGljU3R5bGUsXG5cdFx0XHRcdFx0YXR0cnM6IFJlYWRvbmx5KHsgd2lkdGg6ICcxMDAlJywgZnJhbWVib3JkZXI6ICcwJywgc2Nyb2xsaW5nOiAnbm8nLCBtYXJnaW53aWR0aDogJzAnLCBtYXJnaW5oZWlnaHQ6ICcwJyB9KVxuXHRcdFx0XHR9KTtcblx0XHRcdH0pLFxuXHRcdFx0bWV0aG9kczogcmVhZG9ubHkoUmVhZG9ubHkoe1xuXHRcdFx0XHRyZW5kZXI6IG5vb3Bcblx0XHRcdH0pKVxuXHRcdH0pO1xuXHR9XG5cdFxuXHR2YXIgbmF0aXZlT24gPSBSZWFkb25seSh7XG5cdFx0bG9hZDogZnVuY3Rpb24ganVzdGlmeSAoICAgICAgICAgICAgICAgICAgICAgICApIHtcblx0XHRcdHZhciBzdHlsZSA9IHRoaXMuc3R5bGU7XG5cdFx0XHRzdHlsZS5zZXRQcm9wZXJ0eSgnaGVpZ2h0JywgJzAnLCAnaW1wb3J0YW50Jyk7XG5cdFx0XHRzdHlsZS5zZXRQcm9wZXJ0eSgnaGVpZ2h0JywgdGhpcy5jb250ZW50RG9jdW1lbnQgLmRvY3VtZW50RWxlbWVudC5zY3JvbGxIZWlnaHQrJ3B4JywgJ2ltcG9ydGFudCcpO1xuXHRcdH1cblx0fSk7XG5cdFxuXHR2YXIgbW91bnRlZF9hY3RpdmF0ZWQgPSByZWFkb25seShmdW5jdGlvbiBtb3VudGVkX2FjdGl2YXRlZCAoICAgICAgICAgICkge1xuXHRcdHZhciAkZWwgPSB0aGlzLiRlbCA7XG5cdFx0dmFyIGNvbnRlbnREb2N1bWVudCA9ICRlbC5jb250ZW50RG9jdW1lbnQ7XG5cdFx0Y29udGVudERvY3VtZW50ICYmIHBhcnNlKCRlbCwgY29udGVudERvY3VtZW50LCB0aGlzLnNyY2RvYyk7XG5cdH0pO1xuXHRcblx0cmV0dXJuIGNyZWF0ZShudWxsLCB7XG5cdFx0bmFtZTogd3JpdGFibGUobmFtZSksXG5cdFx0cHJvcHM6IHdyaXRhYmxlKHByb3BzKSxcblx0XHRpbmhlcml0QXR0cnM6IHJlYWRvbmx5KGZhbHNlKSxcblx0XHRyZW5kZXI6IHJlYWRvbmx5KHJlbmRlciksXG5cdFx0bW91bnRlZDogbW91bnRlZF9hY3RpdmF0ZWQsXG5cdFx0YWN0aXZhdGVkOiBtb3VudGVkX2FjdGl2YXRlZCxcblx0XHR3YXRjaDogcmVhZG9ubHkoUmVhZG9ubHkoe1xuXHRcdFx0c3JjZG9jOiBmdW5jdGlvbiAoICAgICAgICAgICAgc3JjZG9jICAgICAgICAsIG9sZCAgICAgICAgKSB7XG5cdFx0XHRcdGlmICggc3JjZG9jIT09b2xkICkge1xuXHRcdFx0XHRcdHZhciAkZWwgPSB0aGlzLiRlbDtcblx0XHRcdFx0XHRpZiAoICRlbCApIHtcblx0XHRcdFx0XHRcdHZhciBjb250ZW50RG9jdW1lbnQgPSAkZWwuY29udGVudERvY3VtZW50O1xuXHRcdFx0XHRcdFx0Y29udGVudERvY3VtZW50ICYmIHBhcnNlKCRlbCwgY29udGVudERvY3VtZW50LCBzcmNkb2MpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pKSxcblx0XHRtZXRob2RzOiByZWFkb25seShSZWFkb25seSh7XG5cdFx0XHRyZW5kZXI6IGZ1bmN0aW9uIHJlbmRlciAoICAgICAgICAgICkge1xuXHRcdFx0XHR2YXIgJGVsID0gdGhpcy4kZWwgO1xuXHRcdFx0XHRwYXJzZSgkZWwsICRlbC5jb250ZW50RG9jdW1lbnQgLCB0aGlzLnNyY2RvYyk7XG5cdFx0XHR9XG5cdFx0fSkpXG5cdH0pO1xuXHRcbn0oKTtcblxuICAgICAgICAgICAgIFxuXHQgICAgICAgICAgICAgICAgICAgICAgICAgXG5cdCAgICAgICAgICAgICAgXG5cdCAgICAgICAgICAgICAgICAgICAgICAgXG4gICIsImltcG9ydCBTQU5EQk9YIGZyb20gJy4vU0FOREJPWCc7XHJcbmltcG9ydCByZW5kZXIgZnJvbSAnLi9yZW5kZXInO1xyXG5cclxudmFyIFNnID0gL1xcUysvZztcclxuXHJcbmZ1bmN0aW9uIGlzU2FuZEJveCAoc2FuZGJveCAgICAgICAgICAgICAgICkge1xyXG5cdGlmICggc2FuZGJveCApIHtcclxuXHRcdGlmICggc2FuZGJveD09PVNBTkRCT1ggKSB7IHJldHVybiB0cnVlOyB9XHJcblx0XHR2YXIgc2FuZGJveGVzID0gc2FuZGJveC5tYXRjaChTZykgO1xyXG5cdFx0cmV0dXJuIHNhbmRib3hlcy5sZW5ndGg9PT00ICYmIHNhbmRib3hlcy5zb3J0KCkuam9pbignICcpPT09U0FOREJPWDtcclxuXHR9XHJcblx0cmV0dXJuIGZhbHNlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc1NhbmREb2MgKGlGcmFtZSAgICAgICAgICAgICAgICAgICApICAgICAgICAgIHtcclxuXHRyZXR1cm4gaUZyYW1lLmdldEF0dHJpYnV0ZSgnc3JjZG9jJykgJiYgaXNTYW5kQm94KGlGcmFtZS5nZXRBdHRyaWJ1dGUoJ3NhbmRib3gnKSkgPyAoXHJcblx0XHQhaUZyYW1lLnNyYyAmJlxyXG5cdFx0IWlGcmFtZS5uYW1lICYmXHJcblx0XHQhaUZyYW1lLnNlYW1sZXNzICYmXHJcblx0XHRpRnJhbWUuZ2V0QXR0cmlidXRlKCd3aWR0aCcgICAgICAgKT09PScxMDAlJyAmJlxyXG5cdFx0aUZyYW1lLmdldEF0dHJpYnV0ZSgnc2Nyb2xsaW5nJyAgICk9PT0nbm8nICAgJiZcclxuXHRcdGlGcmFtZS5nZXRBdHRyaWJ1dGUoJ2ZyYW1lYm9yZGVyJyApPT09JzAnICAgICYmXHJcblx0XHRpRnJhbWUuZ2V0QXR0cmlidXRlKCdtYXJnaW53aWR0aCcgKT09PScwJyAgICAmJlxyXG5cdFx0aUZyYW1lLmdldEF0dHJpYnV0ZSgnbWFyZ2luaGVpZ2h0Jyk9PT0nMCdcclxuXHQpIDogZmFsc2U7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZpbHRlclNhbmREb2NzIChpRnJhbWVzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xyXG5cdHZhciBzYW5kRG9jcyA9IFtdO1xyXG5cdHZhciBpbmRleCA9IGlGcmFtZXMubGVuZ3RoO1xyXG5cdHdoaWxlICggaW5kZXgtLSApIHtcclxuXHRcdHZhciBpRnJhbWUgPSBpRnJhbWVzW2luZGV4XTtcclxuXHRcdGlmICggaXNTYW5kRG9jKGlGcmFtZSkgKSB7IHNhbmREb2NzLnB1c2goaUZyYW1lKTsgfVxyXG5cdH1cclxuXHRyZXR1cm4gc2FuZERvY3M7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJlbmRlckFsbCAod2luICAgICAgICApIHtcclxuXHR2YXIgc2FuZERvY3MgPSBmaWx0ZXJTYW5kRG9jcyh3aW4uZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2lmcmFtZScpKTtcclxuXHR2YXIgaW5kZXggPSBzYW5kRG9jcy5sZW5ndGg7XHJcblx0d2hpbGUgKCBpbmRleC0tICkge1xyXG5cdFx0cmVuZGVyKHNhbmREb2NzW2luZGV4XSk7XHJcblx0fVxyXG59O1xyXG4iLCJpbXBvcnQgdG9wIGZyb20gJy50b3AnO1xyXG5pbXBvcnQgc2V0VGltZW91dCBmcm9tICcuc2V0VGltZW91dCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBvblJlYWR5IChjYWxsYmFjayAgICAgICAgICAgICAgICAgICAgICAsIHdpbiAgICAgICAgKSAgICAgICB7XHJcblx0dmFyIGRvYyA9IHdpbi5kb2N1bWVudDtcclxuXHRpZiAoIGRvYy5yZWFkeVN0YXRlPT09J2NvbXBsZXRlJyApIHtcclxuXHRcdHJldHVybiBjYWxsYmFjaygpO1xyXG5cdH1cclxuXHRpZiAoIGRvYy5hZGRFdmVudExpc3RlbmVyICkge1xyXG5cdFx0cmV0dXJuIGRvYy5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24gbGlzdGVuZXIgKCAgICAgICAgICAgICAgKSB7XHJcblx0XHRcdGRvYy5yZW1vdmVFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgbGlzdGVuZXIpO1xyXG5cdFx0XHRjYWxsYmFjaygpO1xyXG5cdFx0fSwgZmFsc2UpO1xyXG5cdH1cclxuXHRpZiAoIHdpbj09dG9wICkge1xyXG5cdFx0dmFyIGRvY3VtZW50RWxlbWVudCA9IGRvYy5kb2N1bWVudEVsZW1lbnQ7XHJcblx0XHRpZiAoIGRvY3VtZW50RWxlbWVudC5kb1Njcm9sbCApIHtcclxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbiBoYW5kbGVyICgpIHtcclxuXHRcdFx0XHR0cnkgeyBkb2N1bWVudEVsZW1lbnQuZG9TY3JvbGwgKCdsZWZ0Jyk7IH1cclxuXHRcdFx0XHRjYXRjaCAoZXJyb3IpIHtcclxuXHRcdFx0XHRcdHNldFRpbWVvdXQoaGFuZGxlciwgMCk7XHJcblx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGNhbGxiYWNrKCk7XHJcblx0XHRcdH0sIDApO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0fVxyXG5cdGRvYy5hdHRhY2hFdmVudCgnb25yZWFkeXN0YXRlY2hhbmdlJywgZnVuY3Rpb24gbGlzdGVuZXIgKCAgICAgICAgICAgICkge1xyXG5cdFx0aWYgKCBkb2MucmVhZHlTdGF0ZT09PSdjb21wbGV0ZScgKSB7XHJcblx0XHRcdGRvYy5kZXRhY2hFdmVudCgnb25yZWFkeXN0YXRlY2hhbmdlJywgbGlzdGVuZXIpO1xyXG5cdFx0XHRjYWxsYmFjaygpO1xyXG5cdFx0fVxyXG5cdH0pO1xyXG59O1xyXG4iLCJpbXBvcnQgd2luZG93IGZyb20gJy53aW5kb3cnO1xuXG5pbXBvcnQgbmFtZSBmcm9tICcuL3Z1ZS5uYW1lJztcbmltcG9ydCB2dWUgZnJvbSAnLi92dWUnO1xuaW1wb3J0IHJlbmRlckFsbCBmcm9tICcuL3JlbmRlckFsbCc7XG5pbXBvcnQgb25SZWFkeSBmcm9tICcuL29uUmVhZHknO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBpbnN0YWxsICh3aW5WdWUgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuXHRpZiAoIHdpblZ1ZT09bnVsbCApIHtcblx0XHR3aW5WdWUgPSAoIHdpbmRvdyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKS5WdWU7XG5cdFx0aWYgKCB0eXBlb2Ygd2luVnVlPT09J2Z1bmN0aW9uJyApIHtcblx0XHRcdHdpblZ1ZS5jb21wb25lbnQobmFtZSwgdnVlKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRvblJlYWR5KGZ1bmN0aW9uICgpIHsgcmVuZGVyQWxsKHdpbmRvdyk7IH0sIHdpbmRvdyk7XG5cdFx0fVxuXHR9XG5cdGVsc2Uge1xuXHRcdGlmICggdHlwZW9mIHdpblZ1ZT09PSdmdW5jdGlvbicgKSB7XG5cdFx0XHR3aW5WdWUuY29tcG9uZW50KG5hbWUsIHZ1ZSk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0b25SZWFkeShmdW5jdGlvbiAoKSB7IHJlbmRlckFsbCh3aW5WdWUgICAgICAgICAgKTsgfSwgd2luVnVlKTtcblx0XHR9XG5cdH1cbn07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgXG5cdCAgICAgICAgICAgICAgICAgICAgICAgIFxuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBcbiIsImltcG9ydCB2ZXJzaW9uIGZyb20gJy4vdmVyc2lvbj90ZXh0JztcblxuaW1wb3J0IHJlbmRlciBmcm9tICcuL3JlbmRlcic7XG5pbXBvcnQgaW5zdGFsbCBmcm9tICcuL2luc3RhbGwnO1xuaW1wb3J0IHZ1ZSBmcm9tICcuL3Z1ZSc7XG5leHBvcnQge1xuXHR2ZXJzaW9uLFxuXHR2dWUsXG5cdHJlbmRlcixcblx0aW5zdGFsbCxcbn07XG5cbmltcG9ydCBEZWZhdWx0IGZyb20gJy5kZWZhdWx0Pz0nO1xuZXhwb3J0IGRlZmF1bHQgRGVmYXVsdCh7XG5cdHZlcnNpb246IHZlcnNpb24sXG5cdHZ1ZTogdnVlLFxuXHRyZW5kZXI6IHJlbmRlcixcblx0aW5zdGFsbDogaW5zdGFsbCxcblx0XzogdHlwZW9mIG1vZHVsZSE9PSd1bmRlZmluZWQnICYmIHR5cGVvZiBleHBvcnRzPT09J29iamVjdCcgfHwgdHlwZW9mIGRlZmluZT09PSdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCB8fCAvKiNfX1BVUkVfXyovIGluc3RhbGwoKVxufSk7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGNBQWUsT0FBTzs7c0JBQUMsdEJDQVIsU0FBUyxJQUFJLElBQUksRUFBRTs7QUNJbEMsSUFBSSxVQUFVLGlCQUFpQixZQUFZO0NBQzFDLElBQUksVUFBVSxHQUFHLG9CQUFvQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDOUQsT0FBTyxVQUFVO0lBQ2QsVUFBVSxJQUFJLFVBQVUsRUFBRSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7SUFDaEUsSUFBSSxDQUFDO0NBQ1IsRUFBRSxDQUFDOztBQUVKLElBQUks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