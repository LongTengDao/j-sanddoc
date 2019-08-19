import window from '.window';
import document from '.document';

import vue from './vue/';
import renderAll from './renderAll';
import onReady from './onReady';

export default function install (docVue? :Document | { component (name :string, options :any) :any }) {
	if ( docVue ) {
		if ( 'documentElement' in docVue ) {
			onReady(function () { renderAll(docVue); }, docVue);
		}
		else {
			docVue.component('j-sanddoc', vue);
		}
	}
	else {
		if ( typeof ( window as any ).Vue==='function' && typeof ( window as any ).Vue.component==='function' ) {
			( window as any ).Vue.component('j-sanddoc', vue);
		}
		else {
			onReady(function () { renderAll(document); }, document);
		}
	}
};
