﻿/*!
 * 模块名称: j-sanddoc
 * 所属作者: 龙腾道 (www.LongTengDao.com)
 * 模块版本: 3.1.0
 * 使用许可: LGPL
 * 问题反馈: GitHub.com/LongTengDao/j-sanddoc/issues
 * 项目仓库: GitHub.com/LongTengDao/j-sanddoc.git
 */

'use strict';

(function(onReady){

	if( document.readyState==='complete' ){
		onReady();
	}
	else if( document.addEventListener ){
		document.addEventListener('DOMContentLoaded',onReady,false);
	}
	else{
		var once = true;
		document.attachEvent('onreadystatechange',function callee(){
			if( document.readyState==='complete' ){
				document.detachEvent('onreadystatechange',callee);
				if( once ){
					once = false;
					onReady();
				}
			}
		});
		var documentElement = document.documentElement;
		if( documentElement.doScroll && window==top ){
			setTimeout(function callee(){
				try{ documentElement.doScroll('left'); }catch(e){
					setTimeout(callee,0);
					return;
				}
				if( once ){
					once = false;
					onReady();
				}
			},0);
		}
	}

}(function(){

	var sameOrigin = location.href.match(/^https?:\/\/[^/]+/)[0];
	var safeScheme = /^(?:https?|ftps?|mailto|news|gopher):|^about:blank$/;
	var SANDBOX = 'allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-top-navigation';

	var sandDocs = collectSandDocs();
	var index = sandDocs.length;
	var iFrame;
	var contentDocument;
	var style;

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
				iFrame = sandDocs[index];
				style = iFrame.style;
				style.height = '0';
				style.display = 'none';
				style.opacity = '0';
				iFrame.addEventListener('load',initialize);
			}
			break;

		case 2:
			while( index-- ){
				iFrame = sandDocs[index];
				iFrame.style.height = '0';
				iFrame.addEventListener('load',justify);
				contentDocument = iFrame.contentDocument;
				contentDocument.open();
				contentDocument.write(iFrame.getAttribute('srcdoc'));
				contentDocument.close();
				setAnchors(contentDocument);
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
				style = iFrame.style;
				style.height = '0';
				iFrame.setAttribute('security','restricted');
				contentDocument = iFrame.contentWindow.document;
				iFrame.attachEvent('onload',Justify(iFrame,contentDocument));
				contentDocument.open();
				activateHTML5Tags(contentDocument);
				contentDocument.write(iFrame.getAttribute('srcdoc'));
				contentDocument.close();
				style.height = contentDocument.body.offsetHeight+'px';
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
				sandDocs.push(iFrame);
			}
		}
		return sandDocs;
	}

	function isSandDoc(iFrame){
		var sandbox;
		var sandboxes;
		return(
			!iFrame.src&&
			!iFrame.name&&
			!iFrame.seamless&&
			(sandbox = iFrame.getAttribute('sandbox'))&&
			(sandbox===SANDBOX||
				(sandboxes = sandbox.split(' '),
					sandboxes.length===4&&
					sandboxes.sort().join(' ')===SANDBOX
				)
			)&&
			iFrame.getAttribute('width')==='100%'&&
			iFrame.getAttribute('scrolling')==='no'&&
			iFrame.getAttribute('frameborder')==='0'&&
			iFrame.getAttribute('marginwidth')==='0'&&
			iFrame.getAttribute('marginheight')==='0'&&
			iFrame.getAttribute('srcDoc')
		);
	}

	function initialize(){
		var contentDocument = this.contentDocument;
		setAnchors(contentDocument);
		var style = this.style;
		style.display = '';
		style.height = contentDocument.body.offsetHeight+'px';
		setTimeout(function(){
			style.opacity = '';
		},0);
	}

	function Justify(iFrame,contentDocument){
		var justify = function(){
			iFrame.detachEvent('onload',justify);
			iFrame.style.height = contentDocument.body.offsetHeight+'px';
			iFrame = null;
			justify = null;
		};
		return justify;
	}

	function justify(){
		this.style.height = this.contentDocument.body.offsetHeight+'px';
	}

	function setAnchors(contentDocument){
		setAnchor(contentDocument.getElementsByTagName('a'));
		setAnchor(contentDocument.getElementsByTagName('area'));
	}

	function setAnchor(anchors){
		var index = anchors.length;
		while( index-- ){
			var anchor = anchors[index];
			var href = anchor.href;
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
