import props from './props';

export default {
	name: 'j-sanddoc',
	props: props,
	inheritAttrs: false,
	render: function (createElement :any) {
		return createElement('iframe', {
			staticStyle: {
				height: '0'
			},
			attrs: {
				width: '100%',
				frameBorder: '0',
				scrolling: 'no',
				marginWidth: '0',
				marginHeight: '0'
			}
		});
	}
};
