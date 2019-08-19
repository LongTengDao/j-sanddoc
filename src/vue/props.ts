export default {
	doc: {
		required: true,
		validator: function (value :unknown) { return typeof value==='string'; }
	}
};