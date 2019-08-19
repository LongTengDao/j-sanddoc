import document from '.document';

export default /*#__PURE__*/ ( function () :'sandbox' | 'security' | 'inDanger' | 'dangerous' {
	
	var iFrame :HTMLIFrameElement | null = document.createElement('iframe');
	
	if ( 'sandbox' in iFrame as unknown ) {
		iFrame = null;
		return 'sandbox';
	}
	
	iFrame.setAttribute('security', 'restricted');
	
	var bed :HTMLElement | null = document.body || document.documentElement;
	bed.appendChild(iFrame);
	var contentWindow :Window & { $dangerous :any } | null = iFrame.contentWindow as Window & { $dangerous :any };
	var contentDocument :Document | null = contentWindow.document;
	
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
