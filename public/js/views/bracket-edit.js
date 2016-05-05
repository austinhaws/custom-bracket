var BracketForm = React.createClass({
	getInitialState: function() {
		return this.props.initialBracket;
	},
	handleChange: function(e) {
		var nextState = {};
		nextState[e.target.name] = e.target.value;
		this.setState(nextState);
	},
	handleSubmit: function(e) {
		e.preventDefault();
		if (!this.state.name) {
			alert('Must have a name to continue');
		} else {
			$.ajax({
				url: 'admin/bracket/save',
				dataType: 'json',
				data: csrf(this.state),
				cache: false,
				method: 'post',
				success: function(data) {
					// show a spinner instead
					alert('saved');
				}.bind(this),
				error: function(xhr, status, err) {
					console.error(this.props.url, status, err.toString());
				}.bind(this)
			});
		}
	},
	render: function() {
		console.log(this.state);
		return (
			<form>
				<input type="hidden" name={this.props.csrfName} value={this.props.csrf}/>
				<input type="hidden" name="bracketId" value={this.state.id}/>

				<InputField fieldId="name" title="Name" placeholder="" value={this.state.name} handleChange={this.handleChange}/>
				<InputField fieldId="open_date" title="Open Date" placeholder="YYYY-MM-DD" value={this.state.open_date} handleChange={this.handleChange}/>
				<InputField fieldId="first_round_date" title="First Round Date" placeholder="YYYY-MM-DD" value={this.state.first_round_date} handleChange={this.handleChange}/>
				<InputField fieldId="second_round_date" title="Second Round Date" placeholder="YYYY-MM-DD" value={this.state.second_round_date} handleChange={this.handleChange}/>
				<InputField fieldId="third_round_date" title="Third Round Date" placeholder="YYYY-MM-DD" value={this.state.third_round_date} handleChange={this.handleChange}/>
				<InputField fieldId="fourth_round_date" title="Fourth Round Date" placeholder="YYYY-MM-DD" value={this.state.fourth_round_date} handleChange={this.handleChange}/>
				<InputField fieldId="fifth_round_date" title="Fifth Round Date" placeholder="YYYY-MM-DD" value={this.state.fifth_round_date} handleChange={this.handleChange}/>
				<InputField fieldId="sixth_round_date" title="Sixth Round Date" placeholder="YYYY-MM-DD" value={this.state.sixth_round_date} handleChange={this.handleChange}/>

				<span id="info-blurb">
					After the 'Open Date' people can predict which teams will win in the bracket.<br/>
					After the 'First Round Date' people can no longer predict teams, games start.<br/>
				</span>

				<button onClick={this.handleSubmit}>Save</button>
			</form>
		);
	}
});

var InputField = React.createClass({
	getInitialState: function() {
		return {
			value: this.props.value
		};
	},
	handleChange: function(e) {
		this.setState({value: e.target.value});
		this.props.handleChange(e);
	},
	render: function() {
		return (
			<div>
				<label for={this.props.fieldId}>{this.props.title}:</label><input type="text" id={this.props.fieldId} name={this.props.fieldId} placeholder={this.props.placeholder} value={this.state.value} onChange={this.handleChange}/>
			</div>
		);
	}
});


ReactDOM.render(
	<BracketForm initialBracket={globals.bracket} csrfName={globals.csrfName} csrf={globals.csrf}/>,
	document.getElementById('bracket-form')
);
