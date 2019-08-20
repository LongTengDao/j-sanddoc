declare const define :undefined | {
	(factory :(...args :any) => any) :void
	amd? :true
};

interface HTMLIFrameElement {
	seamless? :boolean
	addEventListener   <T extends HTMLIFrameElement/* extends Node | Window*/> (this :T, type :'load', listener :(this :T, event :Event) => any, useCapture? :boolean) :void
	removeEventListener<T extends HTMLIFrameElement/* extends Node | Window*/> (this :T, type :'load', listener :(this :T, event :Event) => any, useCapture? :boolean) :void
	attachEvent (this :HTMLIFrameElement/*:Node*/, type :'onload', listener :(this :Window, event :Event) => any) :true | false
	detachEvent (this :HTMLIFrameElement/*:Node*/, type :'onload', listener :(this :Window, event :Event) => any) :void
}

interface Document {
	addEventListener   <T extends Document/* extends Node | Window*/> (this :T, type :'DOMContentLoaded', listener :(this :T, event :Event) => any, useCapture? :boolean) :void
	removeEventListener<T extends Document/* extends Node | Window*/> (this :T, type :'DOMContentLoaded', listener :(this :T, event :Event) => any, useCapture? :boolean) :void
	attachEvent (this :Document/*:Node*/, type :'onreadystatechange', listener :(this :Window, event :Event) => any) :true | false
	detachEvent (this :Document/*:Node*/, type :'onreadystatechange', listener :(this :Window, event :Event) => any) :void
}

interface Element {
	//on :null | {
	//	(this :Node | Window, event :Event) :any
	//	(this :Node) :any
	//}
	doScroll? (this :Element, _ :'left') :void
}
