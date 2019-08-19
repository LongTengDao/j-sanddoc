import window from '.window';
import top from '.top';
import setTimeout from '.setTimeout';

export default function onReady (callback :() => void, document :Document) {
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
				try { documentElement.doScroll!('left'); }
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
};
