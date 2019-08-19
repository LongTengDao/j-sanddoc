import SANDBOX from './SANDBOX';
import render from './render';

function isSandDoc (iFrame :HTMLIFrameElement) {
	var sandbox;
	var sandboxes;
	return (
		!iFrame.src &&
		!iFrame.name &&
		!iFrame.seamless &&
		( sandbox = iFrame.getAttribute('sandbox') ) &&
		( sandbox===SANDBOX ||
			( sandboxes = sandbox.split(' '),
				sandboxes.length===4 &&
				sandboxes.sort().join(' ')===SANDBOX
			)
		) &&
		iFrame.getAttribute('width')==='100%' &&
		iFrame.getAttribute('scrolling')==='no' &&
		iFrame.getAttribute('frameBorder')==='0' &&
		iFrame.getAttribute('marginWidth')==='0' &&
		iFrame.getAttribute('marginHeight')==='0' &&
		iFrame.getAttribute('srcDoc')
	);
}

function collectSandDocs (document :Document) {
	var sandDocs = [];
	var iFrames = document.getElementsByTagName('iframe');
	var index = iFrames.length;
	while ( index-- ) {
		var iFrame = iFrames[index];
		if ( isSandDoc(iFrame) ) { sandDocs.push(iFrame); }
	}
	return sandDocs;
}

export default function renderAll (document :Document) {
	var sandDocs = collectSandDocs(document);
	var index = sandDocs.length;
	while ( index-- ) {
		render(sandDocs[index]);
	}
};
