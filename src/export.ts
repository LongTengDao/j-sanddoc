import version from './version?text';

import render from './render';
import scan from './scan';
import scanOnReady from './scanOnReady';
import vue from './vue/';
export {
	version,
	render,
	scan,
	scanOnReady,
	vue,
};

import Default from '.default?=';
export default Default(render, {
	version: version,
	render: render,
	scan: scan,
	scanOnReady: scanOnReady,
	vue: vue,
	_: typeof module!=='undefined' && typeof exports==='object' || typeof define==='function' && define.amd || /*#__PURE__*/ scanOnReady()
});
