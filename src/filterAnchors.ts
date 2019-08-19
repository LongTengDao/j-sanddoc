import scheme_stat from './scheme_stat';

function filterAnchor (anchors :HTMLCollectionOf<HTMLAnchorElement | HTMLAreaElement>) {
	var index = anchors.length;
	while ( index-- ) {
		var anchor = anchors[index];
		var href = anchor.href;
		var sameOrigin :true | void;
		switch ( scheme_stat(href) ) {
			case 0:
				anchor.removeAttribute('href');
				//anchor.removeAttribute('target');
				return;
			case 1:
				break;
			case 2:
				anchor.setAttribute('href', './'+href);
			case 3:
			case 4:
				sameOrigin = true;
		}
		if ( sameOrigin ) {
			if ( anchor.target!=='_blank' ) {
				anchor.setAttribute('target', '_parent');
			}
		}
		else {
			anchor.setAttribute('target', '_blank');
		}
	}
}

export default function filterAnchors (contentDocument :Document) {
	filterAnchor(contentDocument.getElementsByTagName('a'));
	filterAnchor(contentDocument.getElementsByTagName('area'));
};
