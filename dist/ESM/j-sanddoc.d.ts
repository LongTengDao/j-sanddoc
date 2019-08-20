export const version :'6.0.0';

export const vue :{
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
		srcdoc (this :VueInstance) :void,
	}>,
	readonly methods :Readonly<{
		render (this :VueInstance) :void,
	}>,
};
type VueInstance = {
	render (this :VueInstance) :void
	srcdoc :string
	$el :HTMLIFrameElement
};

export function render (iFrame :HTMLIFrameElement) :void;

export function install () :void;
export function install (window :Window) :void;
export function install (Vue :VueConstructor) :void;
type VueConstructor = {
	new (options? :any) :any
	component (id :string, options? :any) :any
};

export default exports;
declare const exports :Readonly<{
	version :typeof version,
	vue :typeof vue,
	render :typeof render,
	install :typeof install,
	default :typeof exports,
}>;
