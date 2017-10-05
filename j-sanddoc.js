/*!
 * 模块名称: j-sanddoc
 * 所属作者: 龙腾道 (www.LongTengDao.com)
 * 模块版本: 1.0.0
 * 使用许可: LGPL
 * 问题反馈: GitHub.com/LongTengDao/j-sanddoc/issues
 * 项目仓库: GitHub.com/LongTengDao/j-sanddoc.git
 */

(function(factory){

	if( typeof define==='function' && define.amd ){
		define(factory);
	}
	else if( typeof module!=='undefined' && module && typeof exports==='object' && exports && module.exports===exports ){
		module.exports = factory();
	}
	else{
		typeof attachEvent==='undefined'? addEventListener('load',factory()): attachEvent('onload',factory());
	}

}(function(){ 'use strict';

	var sameOrigin = location.href.match(/^https?:\/\/[^/]+/)[0];
	var safeScheme = /^(?:https?|ftps?|mailto|news|gopher):|^about:blank$/;
	var iFrames = document.getElementsByTagName('iFrame');

	switch( function(){
		var iFrame = document.createElement('iFrame');
		if( 'srcdoc' in iFrame ){ return 3; }
		if( 'sandbox' in iFrame ){ return 2; }
		iFrame.setAttribute('security','restricted');
		var documentElement = document.documentElement;
		documentElement.appendChild(iFrame);
		var contentWindow = iFrame.contentWindow;
		documentElement.removeChild(iFrame);
		var contentDocument = contentWindow.document;
		contentDocument.open();
		contentDocument.write('<script>x=true</script>');
		contentDocument.close();
		if( contentWindow.x ){ return 0; }
		return 1;
	}() ){

		case 3:
			return function(){
				var index = iFrames.length;
				while( index-- ){
					var iFrame = iFrames[index];
					var doc = getDoc(iFrame);
					if( doc ){
						var contentDocument = iFrame.contentWindow.document;
						setAnchor(contentDocument.getElementsByTagName('a'));
						setAnchor(contentDocument.getElementsByTagName('area'));
						iFrame.style.display = '';
						iFrame.style.height = contentDocument.body.offsetHeight+'px';
					}
				}
			};

		case 2:
			return function(){
				var index = iFrames.length;
				while( index-- ){
					var iFrame = iFrames[index];
					var doc = getDoc(iFrame);
					if( doc ){
						var contentDocument = iFrame.contentWindow.document;
						iFrame.addEventListener('load',setHeight);
						contentDocument.open();
						contentDocument.write(doc);
						contentDocument.close();
						setAnchor(contentDocument.getElementsByTagName('a'));
						setAnchor(contentDocument.getElementsByTagName('area'));
					}
				}
			};

		case 1:
			var HTML5_TAGS = 'abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output picture progress section summary template time video'.split(' ');
			var HTML5_TAGS_LENGTH = HTML5_TAGS.length;
			var activateTags = function(contentDocument){
				var index = HTML5_TAGS_LENGTH;
				while( index-- ){
					contentDocument.createElement(HTML5_TAGS[index]);
				}
			};
			return function(){
				var index = iFrames.length;
				while( index-- ){
					var iFrame = iFrames[index];
					var doc = getDoc(iFrame);
					if( doc ){
						iFrame.setAttribute('security','restricted');
						iFrame.attachEvent('onload',setHeight);
						var contentDocument = iFrame.contentWindow.document;
						contentDocument.open();
						activateTags(contentDocument);
						contentDocument.write(doc);
						contentDocument.close();
					}
				}
			};

		case 0:
			return function(){
				var index = iFrames.length;
				while( index-- ){
					if( getDoc(iFrames[index]) ){
						return alert('! j-sanddoc');
					}
				}
			};

	}

	function setHeight(){
		var style = this.style;
		style.display = '';
		style.height = this.contentWindow.document.body.offsetHeight+'px';
	}

	function getDoc(iFrame){
		return(
			iFrame.attributes.length===7&&
			!iFrame.src&&
			iFrame.getAttribute('sandbox')==='allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation'&&
			iFrame.getAttribute('frameborder')==='0'&&
			iFrame.getAttribute('marginheight')==='0'&&
			iFrame.getAttribute('marginwidth')==='0'&&
			iFrame.getAttribute('scrolling')==='no'&&
			iFrame.style.width==='100%'&&
			iFrame.style.display==='none'&&
			iFrame.getAttribute('srcDoc')
		);
	}

	function setAnchor(s){
		var index = s.length;
		while( index-- ){
			var a = s[index];
			var href = a.href;
			if( a.href ){
				if( href.indexOf(sameOrigin)===0 ){
					if( a.target!=='_blank' ){
						a.target = '_parent';
					}
				}
				else{
					if( safeScheme.test(href) ){
						a.target = '_blank';
					}
					else{
						a.removeAttribute('href');
					}
				}
			}
		}
	}

}));
