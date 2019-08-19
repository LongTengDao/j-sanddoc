interface Node {
	attachEvent (event :string, callback :(event :Event) => any) :void
	detachEvent (event :string, callback :(event :Event) => any) :void
	doScroll? (_ :'left') :void
}
interface HTMLIFrameElement {
	seamless? :boolean
}
declare const define :undefined | {
	(factory :(...args :any) => any) :void
	amd? :true
};