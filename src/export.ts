import version from './version?text';

import render from './render';
import install from './install';
import vue from './vue/';
export {
	version,
	vue,
	render,
	install,
};

import Default from '.default?=';
export default Default({
	version: version,
	vue: vue,
	render: render,
	install: install,
	_: typeof module!=='undefined' && typeof exports==='object' || typeof define==='function' && define.amd || /*#__PURE__*/ install()
});
