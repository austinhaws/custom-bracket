const SaveButtonStates = {
	// data is clean and pure
	noChanges: 0,

	// there have been changes ready to save/cancel
	save: 1,

	// ajax saving the data (shows spinner)
	saving: 2,

	// done saving successfully, show "√saved!"
	saved: 3
};
var SaveButton = React.createClass({
	propTypes: {
		// use SaveButtonStates for possible values - determines how button looks/behaves
		saveState: React.PropTypes.number.isRequired,

		// can have a data-button=THISVALUE added to element for events to know what button was pressed
		dataButton: React.PropTypes.string,

		// the callback for when this button is clicked
		buttonPressedCallback: React.PropTypes.func.isRequired
	},
	render: function () {
		var stateInfo = {
			0: {title: 'No Changes', className: 'saveButton-noChanges', bootstrapButtonType: 'default'},
			1: {title: 'Save', className: 'saveButton-save', bootstrapButtonType: 'primary'},
			2: {title: 'Saving', className: 'saveButton-saving', bootstrapButtonType: 'warning'},
			3: {title: '√ Saved!', className: 'saveButton-saved', bootstrapButtonType: 'success'}
		}[this.props.saveState];
		return (
			<button className={'btn-' + stateInfo.bootstrapButtonType + ' btn ' + stateInfo.className} data-button={defaultString(this.props.dataButton, '')} disabled={this.props.saveState != SaveButtonStates.save} onClick={this.props.buttonPressedCallback}>{stateInfo.title}{this.props.saveState == 2 ? (<div className="spinner"></div>) : ''}</button>
		);
	}
});

var SaveCancelButtons = React.createClass({
	propTypes: {
		// use SaveButtonStates for possible values - determines how button looks/behaves
		saveState: React.PropTypes.number.isRequired,

		// can have a data-button=THISVALUE added to element for events to know what button was pressed
		// save and cancel are already added, the suffix can add more detail to the end of them
		dataButtonSuffix: React.PropTypes.string,

		// the callback for when this button is clicked
		buttonPressedCallback: React.PropTypes.func.isRequired
	},
	render: function () {
		var stateInfo = {
			0: {title: 'No Changes', className: 'saveButton-noChanges', bootstrapButtonType: 'default'},
			1: {title: 'Save', className: 'saveButton-save', bootstrapButtonType: 'primary'},
			2: {title: 'Saving', className: 'saveButton-saving', bootstrapButtonType: 'warning'},
			3: {title: '√ Saved!', className: 'saveButton-saved', bootstrapButtonType: 'success'}
		}[this.props.saveState];
		return (
			<div className="saveCancelButtons">
				<button className="btn btn-default" disabled={this.props.saveState != SaveButtonStates.save} data-button={"cancel" + defaultString(this.props.dataButtonSuffix, '')} onClick={this.props.buttonPressedCallback}>Cancel</button>
				<button className={'btn-' + stateInfo.bootstrapButtonType + ' btn ' + stateInfo.className} data-button={"save" + defaultString(this.props.dataButtonSuffix, '')} disabled={this.props.saveState != SaveButtonStates.save} onClick={this.props.buttonPressedCallback}>{stateInfo.title}{this.props.saveState == 2 ? (<div className="spinner"></div>) : ''}</button>
			</div>
		);
	}

});

// hack until we have webpack/requireJS
window.SaveButtonStates = SaveButtonStates;
window.SaveCancelButtons = SaveCancelButtons;
window.SaveButton = SaveButton;
