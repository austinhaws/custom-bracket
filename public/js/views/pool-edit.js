var PoolForm = React.createClass({
	getInitialState: function() {
		return {
			id: this.props.initialPool.id,
			name: this.props.initialPool.name,
			open_date: this.props.initialPool.open_date ? this.props.initialPool.open_date : '',
			close_date: this.props.initialPool.closing_date ? this.props.initialPool.closing_date : ''
		};
	},
	handleChange: function(e) {
		var nextState = {};
		nextState[e.target.name] = e.target.value;
		this.setState(nextState);
	},
	handleSubmit: function(e) {
		if (!this.state.name) {
			alert('Must have a name to continue');
			e.preventDefault();
		}
	},
	render: function() {
		return (
			<form method="post" action="admin/pool/save" onSubmit={this.handleSubmit}>
				<input type="hidden" name={this.props.csrfName} value={this.props.csrf}/>
				<input type="hidden" name="poolId" value={this.state.id}/>
				<label for="name">Name:</label><input type="text" id="name" name="name" value={this.state.name} onChange={this.handleChange}/><br/>
				<label for="Open Date">Open Date:</label><input type="text" id="open_date" name="open_date" placeholder="YYYY-MM-DD" value={this.state.open_date} onChange={this.handleChange}/><br/>
				<label for="Close Date">Close Date:</label><input type="text" id="close_date" name="close_date" placeholder="YYYY-MM-DD" value={this.state.close_date} onChange={this.handleChange}/><br/>
				<input type="submit" value="Save"/>
			</form>
		);
	}
});

ReactDOM.render(
	<PoolForm initialPool={globals.pool} csrfName={globals.csrfName} csrf={globals.csrf}/>,
	document.getElementById('pool-form')
);
