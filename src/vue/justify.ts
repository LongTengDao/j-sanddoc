import window from '.window';

export default function justify (event? :Event) {
	var iFrame = ( event || window.event )!.target as HTMLIFrameElement;
	var style = iFrame.style;
	style.height = '0';
	style.height = iFrame.contentDocument!.documentElement.scrollHeight+'px';
};
