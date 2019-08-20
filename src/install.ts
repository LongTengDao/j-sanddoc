import window from '.window';

import name from './vue.name';
import vue from './vue';
import renderAll from './renderAll';
import onReady from './onReady';

export default function install (winVue? :Window | VueConstructor) {
	if ( winVue==null ) {
		winVue = ( window as { Vue? :VueConstructor } ).Vue;
		if ( typeof winVue==='function' ) {
			winVue.component(name, vue);
		}
		else {
			onReady(function () { renderAll(window); }, window);
		}
	}
	else {
		if ( typeof winVue==='function' ) {
			winVue.component(name, vue);
		}
		else {
			onReady(function () { renderAll(winVue as Window); }, winVue);
		}
	}
};

type VueConstructor = {
	new (options? :any) :any
	component (name :string, options? :any) :any
};
