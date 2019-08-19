export const version :'5.0.0';

export const vue :{
	readonly name :'j-sanddoc',
	readonly render :(this :JSanddoc, createElement :any) => any,
	readonly mounted? :(this :JSanddoc) => void
	readonly activated? :(this :JSanddoc) => void
	readonly inheritAttrs :false,
	readonly props :Readonly<{
		doc :Readonly<{
			required :true,
			validator :(value :any) => value is string,
		}>
	}>,
	readonly watch? :Readonly<{
		doc :(this :JSanddoc) => void
	}>
};

export function render (iFrame :HTMLIFrameElement) :void;

export function install (Vue :{ component (id :string, options :any) :any }) :void;
export function install (document :Document) :void;
export function install () :void;

export default exports;
declare const exports :Readonly<{
	version :typeof version,
	vue :typeof vue,
	render :typeof render,
	install :typeof install,
	default :typeof exports,
}>;

type JSanddoc = {
	$el :HTMLIFrameElement
	doc :string
};