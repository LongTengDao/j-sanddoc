import top from '.top';
import setTimeout from '.setTimeout';

export default function onReady (callback :(this :void) => void, win :Window) :void {
	var doc = win.document;
	if ( doc.readyState==='complete' ) {
		return callback();
	}
	if ( doc.addEventListener ) {
		return doc.addEventListener('DOMContentLoaded', function listener (this :Document) {
			doc.removeEventListener('DOMContentLoaded', listener);
			callback();
		}, false);
	}
	if ( win==top ) {
		var documentElement = doc.documentElement;
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
	doc.attachEvent('onreadystatechange', function listener (this :Window) {
		if ( doc.readyState==='complete' ) {
			doc.detachEvent('onreadystatechange', listener);
			callback();
		}
	});
};
