/**
 * Keep "a" from firing and call the function
 * @param runFunction The function to run
 * @returns {Function}
 */
function protectA(runFunction) {
	return function(e) {
		e.preventDefault();
		e.stopPropagation();
		// call sets "this" of the called function
		// the called function behaves as if jquery had called it by giving it the triggering element
		runFunction.call(e.target, e);
	};
}

/**
 * add csrf token:value to data for ajax posting
 * @param data the data to send
 * @returns data + csrf token
 */
function csrf(data) {
	var csrf = {};
	csrf[globals.csrfName] = globals.csrf;
	$.extend(csrf, data);
	return csrf;
}

function poolDateString(teamOpenDate, teamCloseDate) {
	var openDate = teamOpenDate == '0000-00-00' ? false : moment(teamOpenDate);
	var closeDate = teamCloseDate == '0000-00-00' ? false : moment(teamCloseDate);
	var today = moment();
	var dateString;
	var dateFormat = 'MMM Do, Y';

	if (!openDate) {
		dateString = 'Not Yet Open';
	} else if (openDate.isAfter(today)) {
		dateString = 'Opens ' + openDate.format(dateFormat);
	} else if (today.isBefore(closeDate)) {
		dateString = 'Closes ' + closeDate.format(dateFormat);
	} else {
		dateString = 'Closed';
	}

	return dateString;
}