'use strict';

require('@ltd/j-dev')(__dirname+'/..')(async ({ build, get, 龙腾道 }) => {
	
	await build({
		name: 'j-sanddoc',
		semver: await get('src/version'),
		Desc: [
			'前端富文本展示方案。从属于“简计划”。',
			'Font-end rich text display plan. Belong to "Plan J".',
		],
		Copy: 'LGPL-3.0',
		Auth: 龙腾道,
		user: 'LongTengDao',
		ES: 3,
		UMD: { main_global: 'SandDoc' },
		ESM: true,
		LICENSE_: true,
	});
	
});
