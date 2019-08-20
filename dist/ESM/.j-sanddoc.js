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

import location from '.location';
import document from '.document';
import window from '.window';
import Object from '.Object';
import top from '.top';
import setTimeout from '.setTimeout';
import Default from '.default?=';

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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZlcnNpb24/dGV4dCIsIm5vb3AudHMiLCJzY2hlbWVfc3RhdC50cyIsImZpbHRlckFuY2hvcnMudHMiLCJTVVBQT1JUX1NUQVRVUy50cyIsImFjdGl2YXRlSFRNTDVUYWdzLnRzIiwiZmlsdGVyRm9ybXMudHMiLCJyZW5kZXIudHMiLCJ2dWUubmFtZS50cyIsIlNBTkRCT1gudHMiLCJ2dWUudHMiLCJyZW5kZXJBbGwudHMiLCJvblJlYWR5LnRzIiwiaW5zdGFsbC50cyIsImV4cG9ydC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCAnNi4wLjAnOyIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG5vb3AgKCkge307IiwiaW1wb3J0IGxvY2F0aW9uIGZyb20gJy5sb2NhdGlvbic7XHJcblxyXG5pbXBvcnQgbm9vcCBmcm9tICcuL25vb3AnO1xyXG5cclxudmFyIHNhbWVPcmlnaW4gPSAvKiNfX1BVUkVfXyovIGZ1bmN0aW9uICgpIHtcclxuXHR2YXIgcGFnZU9yaWdpbiA9IC9eaHR0cHM/OlxcL1xcL1teL10rfC8uZXhlYyhsb2NhdGlvbi5ocmVmKSBbMF07XHJcblx0cmV0dXJuIHBhZ2VPcmlnaW5cclxuXHRcdD8gZnVuY3Rpb24gKGhyZWYgICAgICAgICkgeyByZXR1cm4gaHJlZi5pbmRleE9mKHBhZ2VPcmlnaW4pPT09MDsgfVxyXG5cdFx0OiBub29wO1xyXG59KCk7XHJcblxyXG52YXIgd2l0aFNjaGVtZSA9IC9eW2Etel1bYS16MC05XFwtKy5dKjovaTtcclxuXHJcbmZ1bmN0aW9uIHNhZmVTY2hlbWUgKHNjaGVtZSAgICAgICAgKSAgICAgICAgICAgICAge1xyXG5cdHN3aXRjaCAoIHNjaGVtZSApIHtcclxuXHRcdGNhc2UgJ2h0dHBzJzpcclxuXHRcdGNhc2UgJ2h0dHAnOlxyXG5cdFx0Y2FzZSAnZnRwcyc6XHJcblx0XHRjYXNlICdmdHAnOlxyXG5cdFx0Y2FzZSAnbWFpbHRvJzpcclxuXHRcdGNhc2UgJ25ld3MnOlxyXG5cdFx0Y2FzZSAnZ29waGVyJzpcclxuXHRcdGNhc2UgJ2RhdGEnOlxyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHNjaGVtZV9zdGF0IChocmVmICAgICAgICAgKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcblx0XHJcblx0aWYgKCB0eXBlb2YgaHJlZiE9PSdzdHJpbmcnICkge1xyXG5cdFx0cmV0dXJuIDA7XHJcblx0fVxyXG5cdFxyXG5cdGlmICggaHJlZj09PScnICkge1xyXG5cdFx0cmV0dXJuIDM7XHJcblx0fVxyXG5cdHN3aXRjaCAoIGhyZWYuY2hhckF0KDApICkge1xyXG5cdFx0Y2FzZSAnLyc6XHJcblx0XHRjYXNlICcuJzpcclxuXHRcdGNhc2UgJz8nOlxyXG5cdFx0Y2FzZSAnIyc6XHJcblx0XHRcdHJldHVybiAzO1xyXG5cdH1cclxuXHRcclxuXHR2YXIgY29sb24gPSBocmVmLmluZGV4T2YoJzonKTtcclxuXHRpZiAoIGNvbG9uPT09IC0xICkge1xyXG5cdFx0cmV0dXJuIDI7XHJcblx0fVxyXG5cdGlmICggc2FtZU9yaWdpbihocmVmLnNsaWNlKDAsIGNvbG9uKSkgKSB7XHJcblx0XHRyZXR1cm4gNDtcclxuXHR9XHJcblx0aWYgKCBzYWZlU2NoZW1lKGhyZWYpIHx8IGhyZWY9PT0nYWJvdXQ6YmxhbmsnICkge1xyXG5cdFx0cmV0dXJuIDE7XHJcblx0fVxyXG5cdGlmICggd2l0aFNjaGVtZS50ZXN0KGhyZWYpICkge1xyXG5cdFx0cmV0dXJuIDA7XHJcblx0fVxyXG5cdFxyXG59O1xyXG4iLCJpbXBvcnQgc2NoZW1lX3N0YXQgZnJvbSAnLi9zY2hlbWVfc3RhdCc7XHJcblxyXG5mdW5jdGlvbiBmaWx0ZXJBbmNob3IgKGFuY2hvcnMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XHJcblx0dmFyIGluZGV4ID0gYW5jaG9ycy5sZW5ndGg7XHJcblx0d2hpbGUgKCBpbmRleC0tICkge1xyXG5cdFx0dmFyIGFuY2hvciA9IGFuY2hvcnNbaW5kZXhdO1xyXG5cdFx0dmFyIGhyZWYgPSBhbmNob3IuaHJlZjtcclxuXHRcdHZhciBzYW1lT3JpZ2luICAgICAgICAgICAgIDtcclxuXHRcdHN3aXRjaCAoIHNjaGVtZV9zdGF0KGhyZWYpICkge1xyXG5cdFx0XHRjYXNlIDA6XHJcblx0XHRcdFx0YW5jaG9yLnJlbW92ZUF0dHJpYnV0ZSgnaHJlZicpO1xyXG5cdFx0XHRcdC8vYW5jaG9yLnJlbW92ZUF0dHJpYnV0ZSgndGFyZ2V0Jyk7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRjYXNlIDE6XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgMjpcclxuXHRcdFx0XHRhbmNob3Iuc2V0QXR0cmlidXRlKCdocmVmJywgJy4vJytocmVmKTtcclxuXHRcdFx0XHRzYW1lT3JpZ2luID0gdHJ1ZTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSAzOlxyXG5cdFx0XHRjYXNlIDQ6XHJcblx0XHRcdFx0c2FtZU9yaWdpbiA9IHRydWU7XHJcblx0XHR9XHJcblx0XHRpZiAoIHNhbWVPcmlnaW4gKSB7XHJcblx0XHRcdGlmICggYW5jaG9yLnRhcmdldCE9PSdfYmxhbmsnICkge1xyXG5cdFx0XHRcdGFuY2hvci5zZXRBdHRyaWJ1dGUoJ3RhcmdldCcsICdfcGFyZW50Jyk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGVsc2Uge1xyXG5cdFx0XHRhbmNob3Iuc2V0QXR0cmlidXRlKCd0YXJnZXQnLCAnX2JsYW5rJyk7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBmaWx0ZXJBbmNob3JzIChjb250ZW50RG9jdW1lbnQgICAgICAgICAgKSB7XHJcblx0ZmlsdGVyQW5jaG9yKGNvbnRlbnREb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYScpKTtcclxuXHRmaWx0ZXJBbmNob3IoY29udGVudERvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdhcmVhJykpO1xyXG59O1xyXG4iLCJpbXBvcnQgZG9jdW1lbnQgZnJvbSAnLmRvY3VtZW50JztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IC8qI19fUFVSRV9fKi8gKCBmdW5jdGlvbiAoKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcblx0XHJcblx0dmFyIGlGcmFtZSAgICAgICAgICAgICAgICAgICAgICAgICAgID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XHJcblx0XHJcblx0aWYgKCAnc2FuZGJveCcgaW4gaUZyYW1lICAgICAgICAgICAgKSB7XHJcblx0XHRpRnJhbWUgPSBudWxsO1xyXG5cdFx0cmV0dXJuICdzYW5kYm94JztcclxuXHR9XHJcblx0XHJcblx0aUZyYW1lLnNldEF0dHJpYnV0ZSgnc2VjdXJpdHknLCAncmVzdHJpY3RlZCcpO1xyXG5cdFxyXG5cdHZhciBiZWQgICAgICAgICAgICAgICAgICAgICA9IGRvY3VtZW50LmJvZHkgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xyXG5cdGJlZC5hcHBlbmRDaGlsZChpRnJhbWUpO1xyXG5cdHZhciBjb250ZW50V2luZG93ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IGlGcmFtZS5jb250ZW50V2luZG93ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA7XHJcblx0dmFyIGNvbnRlbnREb2N1bWVudCAgICAgICAgICAgICAgICAgID0gY29udGVudFdpbmRvdy5kb2N1bWVudDtcclxuXHRcclxuXHRjb250ZW50RG9jdW1lbnQub3BlbigpO1xyXG5cdHZhciBzZWN1cml0eSA9IGNvbnRlbnRXaW5kb3cuJGRhbmdlcm91cyA9IHt9O1xyXG5cdGNvbnRlbnREb2N1bWVudC53cml0ZSgnPHNjcmlwdD4kZGFuZ2Vyb3VzPXt9PC9zY3JpcHQ+Jyk7XHJcblx0c2VjdXJpdHkgPSBjb250ZW50V2luZG93LiRkYW5nZXJvdXM9PT1zZWN1cml0eTtcclxuXHRjb250ZW50V2luZG93LiRkYW5nZXJvdXMgPSBudWxsO1xyXG5cdGNvbnRlbnREb2N1bWVudC5jbG9zZSgpO1xyXG5cdFxyXG5cdGNvbnRlbnREb2N1bWVudCA9IG51bGw7XHJcblx0Y29udGVudFdpbmRvdyA9IG51bGw7XHJcblx0YmVkLnJlbW92ZUNoaWxkKGlGcmFtZSk7XHJcblx0YmVkID0gbnVsbDtcclxuXHRcclxuXHRpZiAoIHNlY3VyaXR5ICkge1xyXG5cdFx0aUZyYW1lID0gbnVsbDtcclxuXHRcdHJldHVybiAnc2VjdXJpdHknO1xyXG5cdH1cclxuXHRcclxuXHRpZiAoICdzcmNkb2MnIGluIGlGcmFtZSApIHtcclxuXHRcdGlGcmFtZSA9IG51bGw7XHJcblx0XHRyZXR1cm4gJ2luRGFuZ2VyJztcclxuXHR9XHJcblx0ZWxzZSB7XHJcblx0XHRpRnJhbWUgPSBudWxsO1xyXG5cdFx0cmV0dXJuICdkYW5nZXJvdXMnO1xyXG5cdH1cclxuXHRcclxufSApKCk7XHJcbiIsImltcG9ydCBkb2N1bWVudCBmcm9tICcuZG9jdW1lbnQnO1xyXG5cclxuaW1wb3J0IG5vb3AgZnJvbSAnLi9ub29wJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IChcclxuXHQnaGlkZGVuJyBpbiAvKiNfX1BVUkVfXyovIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKVxyXG5cdFx0XHJcblx0XHQ/IG5vb3BcclxuXHRcdFxyXG5cdFx0OiAvKiNfX1BVUkVfXyovIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0Ly8gPGNvbW1hbmQgLz4gPGtleWdlbiAvPiA8c291cmNlIC8+IDx0cmFjayAvPiA8bWVudT48L21lbnU+XHJcblx0XHRcdHZhciBIVE1MNV9UQUdTID0gJ2FiYnIgYXJ0aWNsZSBhc2lkZSBhdWRpbyBiZGkgY2FudmFzIGRhdGEgZGF0YWxpc3QgZGV0YWlscyBkaWFsb2cgZmlnY2FwdGlvbiBmaWd1cmUgZm9vdGVyIGhlYWRlciBoZ3JvdXAgbWFpbiBtYXJrIG1ldGVyIG5hdiBvdXRwdXQgcGljdHVyZSBwcm9ncmVzcyBzZWN0aW9uIHN1bW1hcnkgdGVtcGxhdGUgdGltZSB2aWRlbycuc3BsaXQoJyAnKTtcclxuXHRcdFx0dmFyIEhUTUw1X1RBR1NfTEVOR1RIID0gSFRNTDVfVEFHUy5sZW5ndGg7XHJcblx0XHRcdFxyXG5cdFx0XHRmdW5jdGlvbiBhY3RpdmF0ZUhUTUw1VGFncyAoY29udGVudERvY3VtZW50ICAgICAgICAgICkge1xyXG5cdFx0XHRcdHZhciBpbmRleCA9IEhUTUw1X1RBR1NfTEVOR1RIO1xyXG5cdFx0XHRcdHdoaWxlICggaW5kZXgtLSApIHtcclxuXHRcdFx0XHRcdGNvbnRlbnREb2N1bWVudC5jcmVhdGVFbGVtZW50KEhUTUw1X1RBR1NbaW5kZXhdKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0YWN0aXZhdGVIVE1MNVRhZ3MoZG9jdW1lbnQpO1xyXG5cdFx0XHRcclxuXHRcdFx0cmV0dXJuIGFjdGl2YXRlSFRNTDVUYWdzO1xyXG5cdFx0fSgpXHJcblx0XHJcbik7XHJcbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGZpbHRlckZvcm1zIChjb250ZW50RG9jdW1lbnQgICAgICAgICAgKSB7XHJcblx0XHJcblx0dmFyIGZvcm1zID0gY29udGVudERvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdmcm9tJyk7XHJcblx0dmFyIGluZGV4ID0gZm9ybXMubGVuZ3RoO1xyXG5cdFxyXG5cdHdoaWxlICggaW5kZXgtLSApIHtcclxuXHRcdHZhciBmb3JtID0gZm9ybXNbaW5kZXhdO1xyXG5cdFx0Zm9ybS5wYXJlbnROb2RlIC5yZW1vdmVDaGlsZChmb3JtKTtcclxuXHR9XHJcblx0XHJcbn07IiwiaW1wb3J0IG5vb3AgZnJvbSAnLi9ub29wJztcclxuaW1wb3J0IGZpbHRlckFuY2hvcnMgZnJvbSAnLi9maWx0ZXJBbmNob3JzJztcclxuaW1wb3J0IFNVUFBPUlRfU1RBVFVTIGZyb20gJy4vU1VQUE9SVF9TVEFUVVMnO1xyXG5pbXBvcnQgYWN0aXZhdGVIVE1MNVRhZ3MgZnJvbSAnLi9hY3RpdmF0ZUhUTUw1VGFncyc7XHJcbmltcG9ydCBmaWx0ZXJGb3JtcyBmcm9tICcuL2ZpbHRlckZvcm1zJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0ICggZnVuY3Rpb24gKCkge1xyXG5cdHN3aXRjaCAoIFNVUFBPUlRfU1RBVFVTICkge1xyXG5cdFx0XHJcblx0XHRjYXNlICdzYW5kYm94JzpcclxuXHRcdFx0dmFyIGp1c3RpZnkgPSBmdW5jdGlvbiBqdXN0aWZ5ICggICAgICAgICAgICAgICAgICAgICAgICkge1xyXG5cdFx0XHRcdHZhciBzdHlsZSA9IHRoaXMuc3R5bGU7XHJcblx0XHRcdFx0c3R5bGUuc2V0UHJvcGVydHkoJ2hlaWdodCcsICcwJywgJ2ltcG9ydGFudCcpO1xyXG5cdFx0XHRcdHN0eWxlLnNldFByb3BlcnR5KCdoZWlnaHQnLCB0aGlzLmNvbnRlbnREb2N1bWVudCAuZG9jdW1lbnRFbGVtZW50LnNjcm9sbEhlaWdodCsncHgnLCAnaW1wb3J0YW50Jyk7XHJcblx0XHRcdH07XHJcblx0XHRcdHJldHVybiBmdW5jdGlvbiByZW5kZXIgKGlGcmFtZSAgICAgICAgICAgICAgICAgICApIHtcclxuXHRcdFx0XHR2YXIgc3JjZG9jID0gaUZyYW1lLmdldEF0dHJpYnV0ZSgnc3JjZG9jJykgO1xyXG5cdFx0XHRcdGlGcmFtZS5yZW1vdmVBdHRyaWJ1dGUoJ3NyY2RvYycpO1xyXG5cdFx0XHRcdHZhciBzdHlsZSA9IGlGcmFtZS5zdHlsZTtcclxuXHRcdFx0XHRzdHlsZS5zZXRQcm9wZXJ0eSgnaGVpZ2h0JywgJzAnLCAnaW1wb3J0YW50Jyk7XHJcblx0XHRcdFx0aUZyYW1lLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBqdXN0aWZ5KTtcclxuXHRcdFx0XHR2YXIgY29udGVudERvY3VtZW50ID0gaUZyYW1lLmNvbnRlbnREb2N1bWVudCA7XHJcblx0XHRcdFx0Y29udGVudERvY3VtZW50Lm9wZW4oKTtcclxuXHRcdFx0XHRjb250ZW50RG9jdW1lbnQud3JpdGUoc3JjZG9jKTtcclxuXHRcdFx0XHRjb250ZW50RG9jdW1lbnQuY2xvc2UoKTtcclxuXHRcdFx0XHRmaWx0ZXJBbmNob3JzKGNvbnRlbnREb2N1bWVudCk7XHJcblx0XHRcdFx0c3R5bGUuaGVpZ2h0ID0gY29udGVudERvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxIZWlnaHQrJ3B4JztcclxuXHRcdFx0fTtcclxuXHRcdFx0XHJcblx0XHRjYXNlICdzZWN1cml0eSc6XHJcblx0XHRcdHZhciBjcmVhdGVKdXN0aWZ5ID0gZnVuY3Rpb24gKHN0eWxlICAgICAgICAgICAgICAgICAgICAgLCBjb250ZW50RG9jdW1lbnQgICAgICAgICAgKSB7XHJcblx0XHRcdFx0cmV0dXJuIGZ1bmN0aW9uIGp1c3RpZnkgKCAgICAgICAgICAgICkge1xyXG5cdFx0XHRcdFx0c3R5bGUuaGVpZ2h0ID0gJzAnO1xyXG5cdFx0XHRcdFx0c3R5bGUuaGVpZ2h0ID0gY29udGVudERvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxIZWlnaHQrJ3B4JztcclxuXHRcdFx0XHR9O1xyXG5cdFx0XHR9O1xyXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24gcmVuZGVyIChpRnJhbWUgICAgICAgICAgICAgICAgICAgKSB7XHJcblx0XHRcdFx0dmFyIHNyY2RvYyA9IGlGcmFtZS5nZXRBdHRyaWJ1dGUoJ3NyY2RvYycpIDtcclxuXHRcdFx0XHRpRnJhbWUucmVtb3ZlQXR0cmlidXRlKCdzcmNkb2MnKTtcclxuXHRcdFx0XHR2YXIgc3R5bGUgPSBpRnJhbWUuc3R5bGU7XHJcblx0XHRcdFx0c3R5bGUuaGVpZ2h0ID0gJzAnO1xyXG5cdFx0XHRcdGlGcmFtZS5zZXRBdHRyaWJ1dGUoJ3NlY3VyaXR5JywgJ3Jlc3RyaWN0ZWQnKTtcclxuXHRcdFx0XHR2YXIgY29udGVudERvY3VtZW50ID0gaUZyYW1lLmNvbnRlbnRXaW5kb3cgLmRvY3VtZW50O1xyXG5cdFx0XHRcdGlGcmFtZS5hdHRhY2hFdmVudCgnb25sb2FkJywgY3JlYXRlSnVzdGlmeShzdHlsZSwgY29udGVudERvY3VtZW50KSk7XHJcblx0XHRcdFx0Y29udGVudERvY3VtZW50Lm9wZW4oKTtcclxuXHRcdFx0XHRhY3RpdmF0ZUhUTUw1VGFncyhjb250ZW50RG9jdW1lbnQpO1xyXG5cdFx0XHRcdGNvbnRlbnREb2N1bWVudC53cml0ZShzcmNkb2MpO1xyXG5cdFx0XHRcdGNvbnRlbnREb2N1bWVudC5jbG9zZSgpO1xyXG5cdFx0XHRcdGZpbHRlckZvcm1zKGNvbnRlbnREb2N1bWVudCk7XHJcblx0XHRcdFx0c3R5bGUuaGVpZ2h0ID0gY29udGVudERvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxIZWlnaHQrJ3B4JztcclxuXHRcdFx0fTtcclxuXHRcdFx0XHJcblx0XHRjYXNlICdpbkRhbmdlcic6XHJcblx0XHRcdHJldHVybiBmdW5jdGlvbiByZW5kZXIgKGlGcmFtZSAgICAgICAgICAgICAgICAgICApIHsgaUZyYW1lLnJlbW92ZUF0dHJpYnV0ZSgnc3JjZG9jJyk7IH07XHJcblx0XHRjYXNlICdkYW5nZXJvdXMnOlxyXG5cdFx0XHRyZXR1cm4gbm9vcDtcclxuXHRcdFx0XHJcblx0fVxyXG59ICkoKTtcclxuIiwiZXhwb3J0IGRlZmF1bHQgJ2otc2FuZGRvYyc7IiwiZXhwb3J0IGRlZmF1bHQgJ2FsbG93LXBvcHVwcyBhbGxvdy1wb3B1cHMtdG8tZXNjYXBlLXNhbmRib3ggYWxsb3ctc2FtZS1vcmlnaW4gYWxsb3ctdG9wLW5hdmlnYXRpb24nOyIsImltcG9ydCBPYmplY3QgZnJvbSAnLk9iamVjdCc7XG5cbmltcG9ydCBub29wIGZyb20gJy4vbm9vcCc7XG5cbmltcG9ydCBTQU5EQk9YIGZyb20gJy4vU0FOREJPWCc7XG5pbXBvcnQgU1VQUE9SVF9TVEFUVVMgZnJvbSAnLi9TVVBQT1JUX1NUQVRVUyc7XG5cbmltcG9ydCBuYW1lIGZyb20gJy4vdnVlLm5hbWUnO1xuXG5pbXBvcnQgYWN0aXZhdGVIVE1MNVRhZ3MgZnJvbSAnLi9hY3RpdmF0ZUhUTUw1VGFncyc7XG5pbXBvcnQgZmlsdGVyQW5jaG9ycyBmcm9tICcuL2ZpbHRlckFuY2hvcnMnO1xuaW1wb3J0IGZpbHRlckZvcm1zIGZyb20gJy4vZmlsdGVyRm9ybXMnO1xuXG52YXIgUmVhZG9ubHkgPSBPYmplY3QuZnJlZXplO1xuXG5leHBvcnQgZGVmYXVsdCBSZWFkb25seSAmJiAvKiNfX1BVUkVfXyovIGZ1bmN0aW9uICgpICAgICAgICAgICAgICAgICAgICAgICAgIHtcblx0XG5cdHZhciBjcmVhdGUgPSBPYmplY3QuY3JlYXRlO1xuXHRcblx0ZnVuY3Rpb24gcmVhZG9ubHkgICAgKHZhbHVlICAgKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuXHRcdHZhciBkZXNjcmlwdG9yID0gY3JlYXRlKG51bGwpO1xuXHRcdGRlc2NyaXB0b3IudmFsdWUgPSB2YWx1ZTtcblx0XHRkZXNjcmlwdG9yLmVudW1lcmFibGUgPSB0cnVlO1xuXHRcdHJldHVybiBkZXNjcmlwdG9yO1xuXHR9XG5cdGZ1bmN0aW9uIHdyaXRhYmxlICAgICh2YWx1ZSAgICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcblx0XHR2YXIgZGVzY3JpcHRvciA9IGNyZWF0ZShudWxsKTtcblx0XHRkZXNjcmlwdG9yLmdldCA9IGZ1bmN0aW9uICgpICAgIHsgcmV0dXJuIHZhbHVlOyB9O1xuXHRcdGRlc2NyaXB0b3Iuc2V0ID0gbm9vcDtcblx0XHRkZXNjcmlwdG9yLmVudW1lcmFibGUgPSB0cnVlO1xuXHRcdHJldHVybiBkZXNjcmlwdG9yO1xuXHR9XG5cdFxuXHR2YXIgbmV2ZXIgPSBSZWFkb25seSh7XG5cdFx0dmFsaWRhdG9yOiBmdW5jdGlvbiAodmFsdWUgICAgICkgeyByZXR1cm4gdmFsdWU9PW51bGw7IH1cblx0fSk7XG5cdHZhciBwcm9wcyA9IFJlYWRvbmx5KHtcblx0XHRzcmNkb2M6IFJlYWRvbmx5KHtcblx0XHRcdHJlcXVpcmVkOiB0cnVlICAgICAgICAsXG5cdFx0XHR2YWxpZGF0b3I6IGZ1bmN0aW9uICh2YWx1ZSAgICAgKSAgICAgICAgICAgICAgICAgIHsgcmV0dXJuIHR5cGVvZiB2YWx1ZT09PSdzdHJpbmcnOyB9XG5cdFx0fSksXG5cdFx0c3JjOiBuZXZlcixcblx0XHRzYW5kYm94OiBuZXZlcixcblx0XHRzZWN1cml0eTogbmV2ZXJcblx0fSk7XG5cdHZhciBzdGF0aWNTdHlsZSA9IFJlYWRvbmx5KHsgaGVpZ2h0OiAnMCFpbXBvcnRhbnQnIH0pO1xuXHR2YXIgcmVuZGVyO1xuXHR2YXIgcGFyc2UgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDtcblx0XG5cdGlmICggU1VQUE9SVF9TVEFUVVM9PT0nc2FuZGJveCcgKSB7XG5cdFx0Ly8gc2FuZGJveCBzcmNkb2M6IENocm9tZSsgU2FmYXJpKyBGaXJlZm94K1xuXHRcdC8vIHNhbmRib3g6IEVkZ2UrIElFMTArXG5cdFx0cmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyIChjcmVhdGVFbGVtZW50ICAgICApIHtcblx0XHRcdHJldHVybiBjcmVhdGVFbGVtZW50KCdpZnJhbWUnLCB7XG5cdFx0XHRcdHN0YXRpY1N0eWxlOiBzdGF0aWNTdHlsZSxcblx0XHRcdFx0YXR0cnM6IFJlYWRvbmx5KHsgc2FuZGJveDogU0FOREJPWCwgd2lkdGg6ICcxMDAlJywgZnJhbWVib3JkZXI6ICcwJywgc2Nyb2xsaW5nOiAnbm8nLCBtYXJnaW53aWR0aDogJzAnLCBtYXJnaW5oZWlnaHQ6ICcwJyB9KSxcblx0XHRcdFx0bmF0aXZlT246IG5hdGl2ZU9uXG5cdFx0XHR9KTtcblx0XHR9O1xuXHRcdHBhcnNlID0gZnVuY3Rpb24gcGFyc2UgKCRlbCAgICAgICAgICAgICAgICAgICAsIGNvbnRlbnREb2N1bWVudCAgICAgICAgICAsIHNyY2RvYyAgICAgICAgKSB7XG5cdFx0XHRjb250ZW50RG9jdW1lbnQub3BlbigpO1xuXHRcdFx0Y29udGVudERvY3VtZW50LndyaXRlKHNyY2RvYyk7XG5cdFx0XHRjb250ZW50RG9jdW1lbnQuY2xvc2UoKTtcblx0XHRcdGZpbHRlckFuY2hvcnMoY29udGVudERvY3VtZW50KTtcblx0XHRcdCRlbC5zdHlsZS5zZXRQcm9wZXJ0eSgnaGVpZ2h0JywgY29udGVudERvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxIZWlnaHQrJ3B4JywgJ2ltcG9ydGFudCcpO1xuXHRcdH07XG5cdH1cblx0XG5cdGVsc2UgaWYgKCBTVVBQT1JUX1NUQVRVUz09PSdzZWN1cml0eScgKSB7XG5cdFx0Ly8gc2VjdXJpdHk6IElFOSgtKVxuXHRcdHJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlciAoY3JlYXRlRWxlbWVudCAgICAgKSB7XG5cdFx0XHRyZXR1cm4gY3JlYXRlRWxlbWVudCgnaWZyYW1lJywge1xuXHRcdFx0XHRzdGF0aWNTdHlsZTogc3RhdGljU3R5bGUsXG5cdFx0XHRcdGF0dHJzOiBSZWFkb25seSh7IHNlY3VyaXR5OiAncmVzdHJpY3RlZCcsIHdpZHRoOiAnMTAwJScsIGZyYW1lYm9yZGVyOiAnMCcsIHNjcm9sbGluZzogJ25vJywgbWFyZ2lud2lkdGg6ICcwJywgbWFyZ2luaGVpZ2h0OiAnMCcgfSksXG5cdFx0XHRcdG5hdGl2ZU9uOiBuYXRpdmVPblxuXHRcdFx0fSk7XG5cdFx0fTtcblx0XHRwYXJzZSA9IGZ1bmN0aW9uIHBhcnNlICgkZWwgICAgICAgICAgICAgICAgICAgLCBjb250ZW50RG9jdW1lbnQgICAgICAgICAgLCBzcmNkb2MgICAgICAgICkge1xuXHRcdFx0Y29udGVudERvY3VtZW50Lm9wZW4oKTtcblx0XHRcdGFjdGl2YXRlSFRNTDVUYWdzKGNvbnRlbnREb2N1bWVudCk7XG5cdFx0XHRjb250ZW50RG9jdW1lbnQud3JpdGUoc3JjZG9jKTtcblx0XHRcdGNvbnRlbnREb2N1bWVudC5jbG9zZSgpO1xuXHRcdFx0ZmlsdGVyRm9ybXMoY29udGVudERvY3VtZW50KTtcblx0XHRcdCRlbC5zdHlsZS5zZXRQcm9wZXJ0eSgnaGVpZ2h0JywgY29udGVudERvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxIZWlnaHQrJ3B4JywgJ2ltcG9ydGFudCcpO1xuXHRcdH07XG5cdH1cblx0XG5cdGVsc2Uge1xuXHRcdHJldHVybiBjcmVhdGUobnVsbCwge1xuXHRcdFx0bmFtZTogd3JpdGFibGUobmFtZSksXG5cdFx0XHRwcm9wczogd3JpdGFibGUocHJvcHMpLFxuXHRcdFx0aW5oZXJpdEF0dHJzOiByZWFkb25seShmYWxzZSksXG5cdFx0XHRyZW5kZXI6IHJlYWRvbmx5KGZ1bmN0aW9uIHJlbmRlciAoY3JlYXRlRWxlbWVudCAgICAgKSB7XG5cdFx0XHRcdHJldHVybiBjcmVhdGVFbGVtZW50KCdpZnJhbWUnLCB7XG5cdFx0XHRcdFx0c3RhdGljU3R5bGU6IHN0YXRpY1N0eWxlLFxuXHRcdFx0XHRcdGF0dHJzOiBSZWFkb25seSh7IHdpZHRoOiAnMTAwJScsIGZyYW1lYm9yZGVyOiAnMCcsIHNjcm9sbGluZzogJ25vJywgbWFyZ2lud2lkdGg6ICcwJywgbWFyZ2luaGVpZ2h0OiAnMCcgfSlcblx0XHRcdFx0fSk7XG5cdFx0XHR9KSxcblx0XHRcdG1ldGhvZHM6IHJlYWRvbmx5KFJlYWRvbmx5KHtcblx0XHRcdFx0cmVuZGVyOiBub29wXG5cdFx0XHR9KSlcblx0XHR9KTtcblx0fVxuXHRcblx0dmFyIG5hdGl2ZU9uID0gUmVhZG9ubHkoe1xuXHRcdGxvYWQ6IGZ1bmN0aW9uIGp1c3RpZnkgKCAgICAgICAgICAgICAgICAgICAgICAgKSB7XG5cdFx0XHR2YXIgc3R5bGUgPSB0aGlzLnN0eWxlO1xuXHRcdFx0c3R5bGUuc2V0UHJvcGVydHkoJ2hlaWdodCcsICcwJywgJ2ltcG9ydGFudCcpO1xuXHRcdFx0c3R5bGUuc2V0UHJvcGVydHkoJ2hlaWdodCcsIHRoaXMuY29udGVudERvY3VtZW50IC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsSGVpZ2h0KydweCcsICdpbXBvcnRhbnQnKTtcblx0XHR9XG5cdH0pO1xuXHRcblx0dmFyIG1vdW50ZWRfYWN0aXZhdGVkID0gcmVhZG9ubHkoZnVuY3Rpb24gbW91bnRlZF9hY3RpdmF0ZWQgKCAgICAgICAgICApIHtcblx0XHR2YXIgJGVsID0gdGhpcy4kZWwgO1xuXHRcdHZhciBjb250ZW50RG9jdW1lbnQgPSAkZWwuY29udGVudERvY3VtZW50O1xuXHRcdGNvbnRlbnREb2N1bWVudCAmJiBwYXJzZSgkZWwsIGNvbnRlbnREb2N1bWVudCwgdGhpcy5zcmNkb2MpO1xuXHR9KTtcblx0XG5cdHJldHVybiBjcmVhdGUobnVsbCwge1xuXHRcdG5hbWU6IHdyaXRhYmxlKG5hbWUpLFxuXHRcdHByb3BzOiB3cml0YWJsZShwcm9wcyksXG5cdFx0aW5oZXJpdEF0dHJzOiByZWFkb25seShmYWxzZSksXG5cdFx0cmVuZGVyOiByZWFkb25seShyZW5kZXIpLFxuXHRcdG1vdW50ZWQ6IG1vdW50ZWRfYWN0aXZhdGVkLFxuXHRcdGFjdGl2YXRlZDogbW91bnRlZF9hY3RpdmF0ZWQsXG5cdFx0d2F0Y2g6IHJlYWRvbmx5KFJlYWRvbmx5KHtcblx0XHRcdHNyY2RvYzogZnVuY3Rpb24gKCAgICAgICAgICAgIHNyY2RvYyAgICAgICAgLCBvbGQgICAgICAgICkge1xuXHRcdFx0XHRpZiAoIHNyY2RvYyE9PW9sZCApIHtcblx0XHRcdFx0XHR2YXIgJGVsID0gdGhpcy4kZWw7XG5cdFx0XHRcdFx0aWYgKCAkZWwgKSB7XG5cdFx0XHRcdFx0XHR2YXIgY29udGVudERvY3VtZW50ID0gJGVsLmNvbnRlbnREb2N1bWVudDtcblx0XHRcdFx0XHRcdGNvbnRlbnREb2N1bWVudCAmJiBwYXJzZSgkZWwsIGNvbnRlbnREb2N1bWVudCwgc3JjZG9jKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KSksXG5cdFx0bWV0aG9kczogcmVhZG9ubHkoUmVhZG9ubHkoe1xuXHRcdFx0cmVuZGVyOiBmdW5jdGlvbiByZW5kZXIgKCAgICAgICAgICApIHtcblx0XHRcdFx0dmFyICRlbCA9IHRoaXMuJGVsIDtcblx0XHRcdFx0cGFyc2UoJGVsLCAkZWwuY29udGVudERvY3VtZW50ICwgdGhpcy5zcmNkb2MpO1xuXHRcdFx0fVxuXHRcdH0pKVxuXHR9KTtcblx0XG59KCk7XG5cbiAgICAgICAgICAgICBcblx0ICAgICAgICAgICAgICAgICAgICAgICAgIFxuXHQgICAgICAgICAgICAgIFxuXHQgICAgICAgICAgICAgICAgICAgICAgIFxuICAiLCJpbXBvcnQgU0FOREJPWCBmcm9tICcuL1NBTkRCT1gnO1xyXG5pbXBvcnQgcmVuZGVyIGZyb20gJy4vcmVuZGVyJztcclxuXHJcbmZ1bmN0aW9uIGlzU2FuZEJveCAoc2FuZGJveCAgICAgICAgICAgICAgICkge1xyXG5cdGlmICggc2FuZGJveCApIHtcclxuXHRcdGlmICggc2FuZGJveD09PVNBTkRCT1ggKSB7IHJldHVybiB0cnVlOyB9XHJcblx0XHR2YXIgc2FuZGJveGVzID0gc2FuZGJveC5zcGxpdCgnICcpO1xyXG5cdFx0cmV0dXJuIHNhbmRib3hlcy5sZW5ndGg9PT00ICYmIHNhbmRib3hlcy5zb3J0KCkuam9pbignICcpPT09U0FOREJPWDtcclxuXHR9XHJcblx0cmV0dXJuIGZhbHNlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc1NhbmREb2MgKGlGcmFtZSAgICAgICAgICAgICAgICAgICApICAgICAgICAgIHtcclxuXHRyZXR1cm4gaUZyYW1lLmdldEF0dHJpYnV0ZSgnc3JjZG9jJykgJiYgaXNTYW5kQm94KGlGcmFtZS5nZXRBdHRyaWJ1dGUoJ3NhbmRib3gnKSkgPyAoXHJcblx0XHQhaUZyYW1lLnNyYyAmJlxyXG5cdFx0IWlGcmFtZS5uYW1lICYmXHJcblx0XHQhaUZyYW1lLnNlYW1sZXNzICYmXHJcblx0XHRpRnJhbWUuZ2V0QXR0cmlidXRlKCd3aWR0aCcpPT09JzEwMCUnICYmXHJcblx0XHRpRnJhbWUuZ2V0QXR0cmlidXRlKCdzY3JvbGxpbmcnKT09PSdubycgJiZcclxuXHRcdGlGcmFtZS5nZXRBdHRyaWJ1dGUoJ2ZyYW1lYm9yZGVyJyk9PT0nMCcgJiZcclxuXHRcdGlGcmFtZS5nZXRBdHRyaWJ1dGUoJ21hcmdpbndpZHRoJyk9PT0nMCcgJiZcclxuXHRcdGlGcmFtZS5nZXRBdHRyaWJ1dGUoJ21hcmdpbmhlaWdodCcpPT09JzAnXHJcblx0KSA6IGZhbHNlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBmaWx0ZXJTYW5kRG9jcyAoaUZyYW1lcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcclxuXHR2YXIgc2FuZERvY3MgPSBbXTtcclxuXHR2YXIgaW5kZXggPSBpRnJhbWVzLmxlbmd0aDtcclxuXHR3aGlsZSAoIGluZGV4LS0gKSB7XHJcblx0XHR2YXIgaUZyYW1lID0gaUZyYW1lc1tpbmRleF07XHJcblx0XHRpZiAoIGlzU2FuZERvYyhpRnJhbWUpICkgeyBzYW5kRG9jcy5wdXNoKGlGcmFtZSk7IH1cclxuXHR9XHJcblx0cmV0dXJuIHNhbmREb2NzO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByZW5kZXJBbGwgKHdpbiAgICAgICAgKSB7XHJcblx0dmFyIHNhbmREb2NzID0gZmlsdGVyU2FuZERvY3Mod2luLmRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpZnJhbWUnKSk7XHJcblx0dmFyIGluZGV4ID0gc2FuZERvY3MubGVuZ3RoO1xyXG5cdHdoaWxlICggaW5kZXgtLSApIHtcclxuXHRcdHJlbmRlcihzYW5kRG9jc1tpbmRleF0pO1xyXG5cdH1cclxufTtcclxuIiwiaW1wb3J0IHRvcCBmcm9tICcudG9wJztcclxuaW1wb3J0IHNldFRpbWVvdXQgZnJvbSAnLnNldFRpbWVvdXQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gb25SZWFkeSAoY2FsbGJhY2sgICAgICAgICAgICAgICAgICAgICAgLCB3aW4gICAgICAgICkgICAgICAge1xyXG5cdHZhciBkb2MgPSB3aW4uZG9jdW1lbnQ7XHJcblx0aWYgKCBkb2MucmVhZHlTdGF0ZT09PSdjb21wbGV0ZScgKSB7XHJcblx0XHRyZXR1cm4gY2FsbGJhY2soKTtcclxuXHR9XHJcblx0aWYgKCBkb2MuYWRkRXZlbnRMaXN0ZW5lciApIHtcclxuXHRcdHJldHVybiBkb2MuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uIGxpc3RlbmVyICggICAgICAgICAgICAgICkge1xyXG5cdFx0XHRkb2MucmVtb3ZlRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGxpc3RlbmVyKTtcclxuXHRcdFx0Y2FsbGJhY2soKTtcclxuXHRcdH0sIGZhbHNlKTtcclxuXHR9XHJcblx0aWYgKCB3aW49PXRvcCApIHtcclxuXHRcdHZhciBkb2N1bWVudEVsZW1lbnQgPSBkb2MuZG9jdW1lbnRFbGVtZW50O1xyXG5cdFx0aWYgKCBkb2N1bWVudEVsZW1lbnQuZG9TY3JvbGwgKSB7XHJcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gaGFuZGxlciAoKSB7XHJcblx0XHRcdFx0dHJ5IHsgZG9jdW1lbnRFbGVtZW50LmRvU2Nyb2xsICgnbGVmdCcpOyB9XHJcblx0XHRcdFx0Y2F0Y2ggKGVycm9yKSB7XHJcblx0XHRcdFx0XHRzZXRUaW1lb3V0KGhhbmRsZXIsIDApO1xyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRjYWxsYmFjaygpO1xyXG5cdFx0XHR9LCAwKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRkb2MuYXR0YWNoRXZlbnQoJ29ucmVhZHlzdGF0ZWNoYW5nZScsIGZ1bmN0aW9uIGxpc3RlbmVyICggICAgICAgICAgICApIHtcclxuXHRcdGlmICggZG9jLnJlYWR5U3RhdGU9PT0nY29tcGxldGUnICkge1xyXG5cdFx0XHRkb2MuZGV0YWNoRXZlbnQoJ29ucmVhZHlzdGF0ZWNoYW5nZScsIGxpc3RlbmVyKTtcclxuXHRcdFx0Y2FsbGJhY2soKTtcclxuXHRcdH1cclxuXHR9KTtcclxufTtcclxuIiwiaW1wb3J0IHdpbmRvdyBmcm9tICcud2luZG93JztcblxuaW1wb3J0IG5hbWUgZnJvbSAnLi92dWUubmFtZSc7XG5pbXBvcnQgdnVlIGZyb20gJy4vdnVlJztcbmltcG9ydCByZW5kZXJBbGwgZnJvbSAnLi9yZW5kZXJBbGwnO1xuaW1wb3J0IG9uUmVhZHkgZnJvbSAnLi9vblJlYWR5JztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaW5zdGFsbCAod2luVnVlICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcblx0aWYgKCB3aW5WdWU9PW51bGwgKSB7XG5cdFx0d2luVnVlID0gKCB3aW5kb3cgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkuVnVlO1xuXHRcdGlmICggdHlwZW9mIHdpblZ1ZT09PSdmdW5jdGlvbicgKSB7XG5cdFx0XHR3aW5WdWUuY29tcG9uZW50KG5hbWUsIHZ1ZSk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0b25SZWFkeShmdW5jdGlvbiAoKSB7IHJlbmRlckFsbCh3aW5kb3cpOyB9LCB3aW5kb3cpO1xuXHRcdH1cblx0fVxuXHRlbHNlIHtcblx0XHRpZiAoIHR5cGVvZiB3aW5WdWU9PT0nZnVuY3Rpb24nICkge1xuXHRcdFx0d2luVnVlLmNvbXBvbmVudChuYW1lLCB2dWUpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdG9uUmVhZHkoZnVuY3Rpb24gKCkgeyByZW5kZXJBbGwod2luVnVlICAgICAgICAgICk7IH0sIHdpblZ1ZSk7XG5cdFx0fVxuXHR9XG59O1xuXG4gICAgICAgICAgICAgICAgICAgICAgIFxuXHQgICAgICAgICAgICAgICAgICAgICAgICBcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgXG4iLCJpbXBvcnQgdmVyc2lvbiBmcm9tICcuL3ZlcnNpb24/dGV4dCc7XG5cbmltcG9ydCByZW5kZXIgZnJvbSAnLi9yZW5kZXInO1xuaW1wb3J0IGluc3RhbGwgZnJvbSAnLi9pbnN0YWxsJztcbmltcG9ydCB2dWUgZnJvbSAnLi92dWUnO1xuZXhwb3J0IHtcblx0dmVyc2lvbixcblx0dnVlLFxuXHRyZW5kZXIsXG5cdGluc3RhbGwsXG59O1xuXG5pbXBvcnQgRGVmYXVsdCBmcm9tICcuZGVmYXVsdD89JztcbmV4cG9ydCBkZWZhdWx0IERlZmF1bHQoe1xuXHR2ZXJzaW9uOiB2ZXJzaW9uLFxuXHR2dWU6IHZ1ZSxcblx0cmVuZGVyOiByZW5kZXIsXG5cdGluc3RhbGw6IGluc3RhbGwsXG5cdF86IHR5cGVvZiBtb2R1bGUhPT0ndW5kZWZpbmVkJyAmJiB0eXBlb2YgZXhwb3J0cz09PSdvYmplY3QnIHx8IHR5cGVvZiBkZWZpbmU9PT0nZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgfHwgLyojX19QVVJFX18qLyBpbnN0YWxsKClcbn0pO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxjQUFlLE9BQU87O3NCQUFDLHRCQ0FSLFNBQVMsSUFBSSxJQUFJLEVBQUU7O0FDSWxDLElBQUksVUFBVSxpQkFBaUIsWUFBWTtDQUMxQyxJQUFJLFVBQVUsR0FBRyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQzlELE9BQU8sVUFBVTtJQUNkLFVBQVUsSUFBSSxVQUFVLEVBQUUsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0lBQ2hFLElBQUksQ0FBQztDQUNSLEVBQUUsQ0FBQzs7QUFFSixJQUFJLFVBQVUsR0FBRyx1QkFBdUIsQ0FBQzs7QUFFekMsU0FBUyxVQUFVLEVBQUUsTUFBTSx1QkFBdUI7Q0FDakQsU0FBUyxNQUFNO0VBQ2QsS0FBSyxPQUFPLENBQUM7RUFDYixLQUFLLE1BQU0sQ0FBQztFQUNaLEtBQUssTUFBTSxDQUFDO0VBQ1osS0FBSyxLQUFLLENBQUM7RUFDWCxLQUFLLFFBQVEsQ0FBQztFQUNkLEtBQUssTUFBTSxDQUFDO0VBQ1osS0FBSyxR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