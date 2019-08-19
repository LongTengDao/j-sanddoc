import location from '.location';

var sameOrigin = /*#__PURE__*/ function () {
	var pageOrigin = /^https?:\/\/[^/]+|/.exec(location.href)![0];
	return pageOrigin
		? function (href :string) { return href.indexOf(pageOrigin)===0; }
		: function () {};
}();

var withScheme = /^[a-z][a-z0-9\-+.]*:/i;

function safeScheme (scheme :string) :true | void {
	switch ( scheme ) {
		case 'https':
		case 'http':
		case 'ftps':
		case 'ftp':
		case 'mailto':
		case 'news':
		case 'gopher':
		case 'data':
			return true;
	}
}

export default function scheme_stat (href? :string) :0 | 3 | 2 | 4 | 1 | 0 | void {
	
	if ( typeof href!=='string' ) {
		return 0;
	}
	
	if ( href==='' ) {
		return 3;
	}
	switch ( href.charAt(0) ) {
		case '/':
		case '.':
		case '?':
		case '#':
			return 3;
	}
	
	var colon = href.indexOf(':');
	if ( colon=== -1 ) {
		return 2;
	}
	if ( sameOrigin(href.slice(0, colon)) ) {
		return 4;
	}
	if ( safeScheme(href) || href==='about:blank' ) {
		return 1;
	}
	if ( withScheme.test(href) ) {
		return 0;
	}
	
};
