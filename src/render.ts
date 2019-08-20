import noop from './noop';
import filterAnchors from './filterAnchors';
import SUPPORT_STATUS from './SUPPORT_STATUS';
import activateHTML5Tags from './activateHTML5Tags';
import filterForms from './filterForms';

export default ( function () {
	switch ( SUPPORT_STATUS ) {
		
		case 'sandbox':
			var justify = function justify (this :HTMLIFrameElement) {
				var style = this.style;
				style.setProperty('height', '0', 'important');
				style.setProperty('height', this.contentDocument!.documentElement.scrollHeight+'px', 'important');
			};
			return function render (iFrame :HTMLIFrameElement) {
				var srcdoc = iFrame.getAttribute('srcdoc')!;
				iFrame.removeAttribute('srcdoc');
				var style = iFrame.style;
				style.setProperty('height', '0', 'important');
				iFrame.addEventListener('load', justify);
				var contentDocument = iFrame.contentDocument!;
				contentDocument.open();
				contentDocument.write(srcdoc);
				contentDocument.close();
				filterAnchors(contentDocument);
				style.height = contentDocument.documentElement.scrollHeight+'px';
			};
			
		case 'security':
			var createJustify = function (style :CSSStyleDeclaration, contentDocument :Document) {
				return function justify (this :Window) {
					style.height = '0';
					style.height = contentDocument.documentElement.scrollHeight+'px';
				};
			};
			return function render (iFrame :HTMLIFrameElement) {
				var srcdoc = iFrame.getAttribute('srcdoc')!;
				iFrame.removeAttribute('srcdoc');
				var style = iFrame.style;
				style.height = '0';
				iFrame.setAttribute('security', 'restricted');
				var contentDocument = iFrame.contentWindow!.document;
				iFrame.attachEvent('onload', createJustify(style, contentDocument));
				contentDocument.open();
				activateHTML5Tags(contentDocument);
				contentDocument.write(srcdoc);
				contentDocument.close();
				filterForms(contentDocument);
				style.height = contentDocument.documentElement.scrollHeight+'px';
			};
			
		case 'inDanger':
			return function render (iFrame :HTMLIFrameElement) { iFrame.removeAttribute('srcdoc'); };
		case 'dangerous':
			return noop;
			
	}
} )();
