import Object from '.Object';

import noop from './noop';

import SANDBOX from './SANDBOX';
import SUPPORT_STATUS from './SUPPORT_STATUS';

import name from './vue.name';

import activateHTML5Tags from './activateHTML5Tags';
import filterAnchors from './filterAnchors';
import filterForms from './filterForms';

var Readonly = Object.freeze;

export default Readonly && /*#__PURE__*/ function () :import('j-vue:')<This> {
	
	var create = Object.create;
	
	function readonly<T> (value :T) :TypedPropertyDescriptor<T> {
		var descriptor = create(null);
		descriptor.value = value;
		descriptor.enumerable = true;
		return descriptor;
	}
	function writable<T> (value :T) :TypedPropertyDescriptor<T> {
		var descriptor = create(null);
		descriptor.get = function () :T { return value; };
		descriptor.set = noop;
		descriptor.enumerable = true;
		return descriptor;
	}
	
	var never = Readonly({
		validator: function (value :any) { return value==null; }
	});
	var props = Readonly({
		srcdoc: Readonly({
			required: true as true,
			validator: function (value :any) :value is string { return typeof value==='string'; }
		}),
		sandbox: never,
		security: never,
		src: never,
		name: never,
		width: never,
		seamless: never,
		scrolling: never,
		frameborder: never,
		marginwidth: never,
		marginheight: never
	});
	var staticStyle = Readonly({ height: '0!important' });
	var render;
	var parse :($el :HTMLIFrameElement, contentDocument :Document, srcdoc :string) => void;
	
	if ( SUPPORT_STATUS==='sandbox' ) {
		// sandbox srcdoc: Chrome+ Safari+ Firefox+
		// sandbox: Edge+ IE10+
		render = function render (createElement :any) {
			return createElement('iframe', {
				staticStyle: staticStyle,
				attrs: Readonly({ sandbox: SANDBOX, width: '100%', frameborder: '0', scrolling: 'no', marginwidth: '0', marginheight: '0' }),
				nativeOn: nativeOn
			});
		};
		parse = function parse ($el :HTMLIFrameElement, contentDocument :Document, srcdoc :string) {
			contentDocument.open();
			contentDocument.write(srcdoc);
			contentDocument.close();
			filterAnchors(contentDocument);
			$el.style.setProperty('height', contentDocument.documentElement.scrollHeight+'px', 'important');
		};
	}
	
	else if ( SUPPORT_STATUS==='security' ) {
		// security: IE9(-)
		render = function render (createElement :any) {
			return createElement('iframe', {
				staticStyle: staticStyle,
				attrs: Readonly({ security: 'restricted', width: '100%', frameborder: '0', scrolling: 'no', marginwidth: '0', marginheight: '0' }),
				nativeOn: nativeOn
			});
		};
		parse = function parse ($el :HTMLIFrameElement, contentDocument :Document, srcdoc :string) {
			contentDocument.open();
			activateHTML5Tags(contentDocument);
			contentDocument.write(srcdoc);
			contentDocument.close();
			filterForms(contentDocument);
			$el.style.setProperty('height', contentDocument.documentElement.scrollHeight+'px', 'important');
		};
	}
	
	else {
		return create(null, {
			name: writable(name),
			props: writable(props),
			inheritAttrs: readonly(false),
			render: readonly(function render (createElement :any) {
				return createElement('iframe', {
					staticStyle: staticStyle,
					attrs: Readonly({ width: '100%', frameborder: '0', scrolling: 'no', marginwidth: '0', marginheight: '0' })
				});
			}),
			methods: readonly(Readonly({
				render: noop
			}))
		});
	}
	
	var nativeOn = Readonly({
		load: function justify (this :HTMLIFrameElement) {
			var style = this.style;
			style.setProperty('height', '0', 'important');
			style.setProperty('height', this.contentDocument!.documentElement.scrollHeight+'px', 'important');
		}
	});
	
	var mounted_activated = readonly(function mounted_activated (this :This) {
		var $el = this.$el!;
		var contentDocument = $el.contentDocument;
		contentDocument && parse($el, contentDocument, this.srcdoc);
	});
	
	return create(null, {
		name: writable(name),
		props: writable(props),
		inheritAttrs: readonly(false),
		render: readonly(render),
		mounted: mounted_activated,
		activated: mounted_activated,
		watch: readonly(Readonly({
			srcdoc: function (this :This, srcdoc :string, old :string) {
				if ( srcdoc!==old ) {
					var $el = this.$el;
					if ( $el ) {
						var contentDocument = $el.contentDocument;
						contentDocument && parse($el, contentDocument, srcdoc);
					}
				}
			}
		})),
		methods: readonly(Readonly({
			render: function render (this :This) {
				var $el = this.$el!;
				parse($el, $el.contentDocument!, this.srcdoc);
			}
		}))
	});
	
}();

type This = {
	render (this :This) :void
	srcdoc :string
	$el? :HTMLIFrameElement
};