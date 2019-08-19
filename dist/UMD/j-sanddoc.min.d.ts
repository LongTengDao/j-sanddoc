export as namespace SandDoc;
export = exports;
declare const exports :Readonly<{
	version :'5.0.0',
	vue :{
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
	},
	render :(iFrame :HTMLIFrameElement) => void,
	install :{
		(Vue :{ component (id :string, options :any) :any }) :void
		(document :Document) :void
		() :void
	},
	default :typeof exports,
}>;
type JSanddoc = {
	$el :HTMLIFrameElement
	doc :string
};