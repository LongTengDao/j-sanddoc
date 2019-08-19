import filterAnchors from '../filterAnchors';
import SANDBOX from '../SANDBOX';
import justify from './justify';
import props from './props';
import div from './div';

function setDoc (this :{ $el :HTMLIFrameElement, doc :string }) {
	var el = this.$el;
	div.innerHTML = '<iframe sandbox="'+SANDBOX+'" width="100%" frameBorder="0" scrolling="no" marginWidth="0" marginHeight="0" style="height:0;"></iframe>';
	var iFrame = this.$el = div.lastChild as HTMLIFrameElement;
	var parentNode = el.parentNode;
	if ( parentNode===null ) {
		div.removeChild(iFrame);
		return;
	}
	parentNode.replaceChild(iFrame, el);
	var doc = this.doc;
	if ( doc==='' ) { return; }
	iFrame.addEventListener('load', justify);
	var contentDocument = iFrame.contentDocument!;
	contentDocument.open();
	contentDocument.write(doc);
	contentDocument.close();
	filterAnchors(contentDocument);
	iFrame.style.height = contentDocument.documentElement.scrollHeight+'px';
}

export default {
	props: props,
	inheritAttrs: false,
	render: function (createElement :any) { return createElement('iframe'); },
	mounted: setDoc,
	activated: setDoc,
	watch: { doc: setDoc }
};
