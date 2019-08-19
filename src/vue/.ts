import SUPPORT_STATUS from '../SUPPORT_STATUS';
import case_sandbox from './case-sandbox';
import case_security from './case-security';
import default_ from './default';

export default ( function () {
	switch ( SUPPORT_STATUS ) {
		// sandbox srcdoc: Chrome+ Safari+ Firefox+
		// sandbox: Edge+ IE10+
		case 'sandbox':
			return case_sandbox;
		// security: IE9(-)
		case 'security':
			return case_security;
		default:
			return default_;
	}
} )();
