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

/**
 * what is the status of this item compared to today's date
 *
 * @param teamOpenDate when this item opens
 * @param teamCloseDate when this item closes
 * @return int -1 : this item is not yet open, 0 : this item is open, 1 : this item is closed
 */
function poolDateStatus(teamOpenDate, teamCloseDate) {
	var openDate = teamOpenDate == '0000-00-00' ? false : moment(teamOpenDate);
	var closeDate = teamCloseDate == '0000-00-00' ? false : moment(teamCloseDate);
	var today = moment().startOf('day');

	return (!openDate || openDate.isAfter(today)) ? -1 : (today.isBefore(closeDate) ? 0 : 1);
}

/**
 * given a start date and end date, convert to weeks and days between
 * @param a
 * @param b
 * @returns {string|*}
 */
function momentWeeksDaysDifference(startDate, endDate) {
	var days = endDate.diff(startDate, 'days');
	var weeks = Math.floor(days / 7);
	days = days - weeks * 7;

	var parts = [];

	if (weeks) {
		parts.push(weeks);
		parts.push(weeks > 1 ? 'wks' : 'wk');
	}
	if (days) {
		if (parts.length) {
			parts.push(' ');
		}
		parts.push(days);
		parts.push(days > 1 ? 'days' : 'day');
	}
	return parts.join('');
}

function poolDateStringFromPool(pool) {
	var result;

	switch (pool.status) {
		// coming soon, show how soon or leave blank if no date yet
		case -1:
			if (!pool.open_date || pool.open_date == '0000-00-00') {
				result = '';
			} else {
				result = pool.open_date;
			}
			break;

		// live now! show how much time left
		case 0:
			if (!pool.closing_date || pool.closing_date == '0000-00-00') {
				result = '';
			} else {
				result = momentWeeksDaysDifference(moment().startOf('day'), moment(pool.closing_date)) + ' left';
			}
			break;

		// closed and dead. leave blank
		case 1:
			result = '';
			break;
	}

	return result;
}


function poolDateString(teamOpenDate, teamCloseDate) {
	var openDate = (!teamOpenDate || teamOpenDate) == '0000-00-00' ? false : moment(teamOpenDate);
	var closeDate = (!teamOpenDate || teamOpenDate) == '0000-00-00' ? false : moment(teamCloseDate);
	var today = moment().startOf('day');
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