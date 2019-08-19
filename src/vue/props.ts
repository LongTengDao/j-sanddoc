export default {
	doc: {
		required: true,
		validator: function (value :any) :value is string { return typeof value==='string'; }
	}
};