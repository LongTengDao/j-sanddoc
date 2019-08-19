import document from '.document';
import window from '.window';
import top from '.top';
import setTimeout from '.setTimeout';

import scan from './scan';

export default function scanOnReady (doc? :Document) {
	
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
				try { documentElement.doScroll!('left'); }
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
		if ( doc!.readyState==='complete' ) {
			doc!.detachEvent('onreadystatechange', callee);
			listener();
		}
	});
	
};