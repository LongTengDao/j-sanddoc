export as namespace SandDoc;
export = exports;
declare const exports :Readonly<{
	version :'6.0.1',
	
	vue :{
		name :'j-sanddoc',
		props :Readonly<{
			srcdoc :Readonly<{
				required :true,
				validator (value :any) :value is string,
			}>,
		}>,
		readonly inheritAttrs :false,
		readonly render :(this :VueInstance, createElement :any) => any,
		readonly mounted :(this :VueInstance) => void,
		readonly activated :(this :VueInstance) => void,
		readonly watch :Readonly<{
			srcdoc :(this :VueInstance) => void,
		}>,
		readonly methods :Readonly<{
			render (this :VueInstance) :void,
		}>,
	},
	
	render :(iFrame :HTMLIFrameElement) => void,
	
	install :{
		() :void
		(window :Window) :void
		(Vue :VueConstructor) :void
	},
	
	default :typeof exports,
}>;

type VueInstance = {
	render (this :VueInstance) :void
	srcdoc :string
	$el :HTMLIFrameElement
};
type VueConstructor = {
	new (options? :any) :any
	component (id :string, options? :any) :any
};