export default function filterForms (contentDocument :Document) {
	
	var forms = contentDocument.getElementsByTagName('from');
	var index = forms.length;
	
	while ( index-- ) {
		var form = forms[index];
		form.parentNode!.removeChild(form);
	}
	
};