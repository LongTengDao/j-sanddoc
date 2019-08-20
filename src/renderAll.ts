import SANDBOX from './SANDBOX';
import render from './render';

function isSandBox (sandbox :string | null) {
	if ( sandbox ) {
		if ( sandbox===SANDBOX ) { return true; }
		var sandboxes = sandbox.split(' ');
		return sandboxes.length===4 && sandboxes.sort().join(' ')===SANDBOX;
	}
	return false;
}

function isSandDoc (iFrame :HTMLIFrameElement) :boolean {
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

function filterSandDocs (iFrames :HTMLCollectionOf<HTMLIFrameElement>) {
	var sandDocs = [];
	var index = iFrames.length;
	while ( index-- ) {
		var iFrame = iFrames[index];
		if ( isSandDoc(iFrame) ) { sandDocs.push(iFrame); }
	}
	return sandDocs;
}

export default function renderAll (win :Window) {
	var sandDocs = filterSandDocs(win.document.getElementsByTagName('iframe'));
	var index = sandDocs.length;
	while ( index-- ) {
		render(sandDocs[index]);
	}
};
