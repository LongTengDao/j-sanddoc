/*!
 * 模块名称: j-sanddoc
 * 所属作者: 龙腾道 (www.LongTengDao.com)
 * 模块版本: 2.0.0
 * 使用许可: LGPL
 * 问题反馈: GitHub.com/LongTengDao/j-sanddoc/issues
 * 项目仓库: GitHub.com/LongTengDao/j-sanddoc.git
 */

'use strict';

(function(onReady){

	if( document.addEventListener ){
		document.addEventListener('DOMContentLoaded',onReady);
	}
	else{
		var documentElement = document.documentElement;
		if( documentElement.doScroll && window==top ){
			setTimeout(function callee(){
				try{ documentElement.doScroll(); }catch(e){
					setTimeout(callee,0);
					return;
				}
				onReady();
			},0);
		}
		else{
			document.attachEvent('onreadystatechange',function callee(){
				if( document.readyState==='complete' ){
					document.detachEvent('onreadystatechange',callee);
					onReady();
				}
			});
		}
	}

}(function(){

	var sameOrigin = location.href.match(/^https?:\/\/[^/]+/)[0];
	var safeScheme = /^(?:https?|ftps?|mailto|news|gopher):|^about:blank$/;

	var sandDocs = collectSandDocs();
	var index = sandDocs.length;
	var iFrame;
	var contentDocument;

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
		if( !contentWindow.x ){ return 1; }
	}() ){

		case 3:
			while( index-- ){
				sandDocs[index].addEventListener('load',onLoad);
			}
			break;

		case 2:
			while( index-- ){
				iFrame = sandDocs[index];
				iFrame.addEventListener('load',onLoad);
				contentDocument = iFrame.contentWindow.document;
				contentDocument.open();
				contentDocument.write(iFrame.getAttribute('srcdoc'));
				contentDocument.close();
			}
			break;

		case 1:
			var HTML5_TAGS = 'abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output picture progress section summary template time video'.split(' ');
			var HTML5_TAGS_LENGTH = HTML5_TAGS.length;
			var activateHTML5Tags = function(contentDocument){
				var index = HTML5_TAGS_LENGTH;
				while( index-- ){
					contentDocument.createElement(HTML5_TAGS[index]);
				}
			};
			while( index-- ){
				iFrame = sandDocs[index];
				iFrame.attachEvent('onload',onLoad);
				iFrame.setAttribute('security','restricted');
				contentDocument = iFrame.contentWindow.document;
				contentDocument.open();
				activateHTML5Tags(contentDocument);
				contentDocument.write(iFrame.getAttribute('srcdoc'));
				contentDocument.close();
			}
			break;

	}

	function collectSandDocs(){
		var sandDocs = [];
		var iFrames = document.getElementsByTagName('iFrame');
		var index = iFrames.length;
		while( index-- ){
			var iFrame = iFrames[index];
			if( isSandDoc(iFrame) ){
				iFrame.style.display='none';
				sandDocs.push(iFrame);
			}
		}
		return sandDocs;
	}

	function isSandDoc(iFrame){
		var sandbox;
		return(
			iFrame.attributes.length===7&&
			!iFrame.src&&
			(sandbox=iFrame.getAttribute('sandbox'))&&
			sandbox.split(' ').sort().join(' ')==='allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-top-navigation'&&
			iFrame.getAttribute('frameborder')==='0'&&
			iFrame.getAttribute('marginheight')==='0'&&
			iFrame.getAttribute('marginwidth')==='0'&&
			iFrame.getAttribute('scrolling')==='no'&&
			iFrame.style.width==='100%'&&
			iFrame.getAttribute('srcDoc')
		);
	}

	function onLoad(){
		var contentDocument = this.contentWindow.document;
		setAnchors(contentDocument.getElementsByTagName('a'));
		setAnchors(contentDocument.getElementsByTagName('area'));
		var style = this.style;
		style.display = '';
		style.height = contentDocument.body.offsetHeight+'px';
	}

	function setAnchors(anchors){
		var index = anchors.length;
		while( index-- ){
			var anchor = anchors[index];
			var href = a.href;
			if( anchor.href ){
				if( href.indexOf(sameOrigin)===0 ){
					if( anchor.target!=='_blank' ){
						anchor.target = '_parent';
					}
				}
				else{
					if( safeScheme.test(href) ){
						anchor.target = '_blank';
					}
					else{
						anchor.removeAttribute('href');
					}
				}
			}
		}
	}

}));
