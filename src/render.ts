import filterAnchors from './filterAnchors';
import SUPPORT_STATUS from './SUPPORT_STATUS';
import activateHTML5Tags from './activateHTML5Tags';
import filterForms from './filterForms';

function justify (this :HTMLIFrameElement) {
	var style = this.style;
	style.height = '0';
	style.height = this.contentDocument!.documentElement.scrollHeight+'px';
}

function createJustify (iFrame :HTMLIFrameElement, style :CSSStyleDeclaration, contentDocument :Document) {
	return function justify () {
		iFrame.detachEvent('onLoad', justify);
		style.height = '0';
		style.height = contentDocument.documentElement.scrollHeight+'px';
	};
}

export default ( function () {
	switch ( SUPPORT_STATUS ) {
		case 'sandbox':
			return function render (iFrame :HTMLIFrameElement) {
				var doc = iFrame.getAttribute('srcDoc');
				iFrame.removeAttribute('srcDoc');
				var style = iFrame.style;
				style.height = '0';
				if ( doc ) {
					iFrame.addEventListener('load', justify);
					var contentDocument = iFrame.contentDocument!;
					contentDocument.open();
					contentDocument.write(doc);
					contentDocument.close();
					filterAnchors(contentDocument);
					style.height = contentDocument.documentElement.scrollHeight+'px';
				}
			};
		case 'security':
			return function render (iFrame :HTMLIFrameElement) {
				var doc = iFrame.getAttribute('srcDoc');
				iFrame.removeAttribute('srcDoc');
				var style = iFrame.style;
				style.height = '0';
				if ( doc ) {
					iFrame.setAttribute('security', 'restricted');
					var contentDocument = iFrame.contentWindow!.document;
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
			return function render (iFrame :HTMLIFrameElement) { iFrame.removeAttribute('srcDoc'); };
		case 'dangerous':
			return function render () {};
	}
} )();
