var PoolForm = React.createClass({
	getInitialState: function() {
		return {
			id: this.props.initialPool.id,
			name: this.props.initialPool.name,
			open_date: this.props.initialPool.open_date ? this.props.initialPool.open_date : '',
			close_date: this.props.initialPool.closing_date ? this.props.initialPool.closing_date : '',
			teams: this.props.initialPool.teams
		};
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
				url: 'admin/pool/save',
				dataType: 'json',
				data: csrf($.extend({teams: this.props.initialPool.teams}, this.state)),
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
		return (
			<form>
				<input type="hidden" name={this.props.csrfName} value={this.props.csrf}/>
				<input type="hidden" name="poolId" value={this.state.id}/>
				<label for="name">Name:</label><input type="text" id="name" name="name" value={this.state.name} onChange={this.handleChange}/><br/>
				<label for="Open Date">Open Date:</label><input type="text" id="open_date" name="open_date" placeholder="YYYY-MM-DD" value={this.state.open_date} onChange={this.handleChange}/><br/>
				<label for="Close Date">Close Date:</label><input type="text" id="close_date" name="close_date" placeholder="YYYY-MM-DD" value={this.state.close_date} onChange={this.handleChange}/><br/>

				<span id="info-blurb">
					After the 'Open Date' people can pick which teams in a pool will be in the bracket as well as enter new teams.<br/>
					After the 'Close Date' people can no longer pick teams nor enter new teams and the pool is ready to be used in a bracket.
				</span>

				<PoolList initialTeams={this.state.teams}/>

				<button onClick={this.handleSubmit}>Save</button>
			</form>
		);
	}
});

var PoolList = React.createClass({
	getInitialState: function() {
		return {
			teams: this.props.initialTeams
		};
	},

	handleAddTeam: function(e) {
		e.preventDefault();
		var teamName = prompt('Enter new team\'s name:');
		if (teamName) {
			var teams = this.state.teams;
			teams.push({
				id: 0,
				name: teamName,
				votes: 0
			});
			this.setState({teams: teams});
		}
	},

	render: function() {
		var teamNodes = this.state.teams.map(function(team) {
			return (
				<Team name={team.name} votes={team.votes} key={team.id} />
			);
		});
		return (
			<div className="teams-container">
				<div className="add-record-container">
					<a href="#" onClick={this.handleAddTeam}>Add Team</a>
				</div>
				<div className="teamsList">
				{teamNodes}
				</div>
			</div>
		);
	}

});

var Team = React.createClass({
	getInitialState: function() {
		return {
		}
	},
	render: function() {
		return (
			<div>{this.props.name} - {this.props.votes}</div>
		);
	}
});

ReactDOM.render(
	<PoolForm initialPool={globals.pool} csrfName={globals.csrfName} csrf={globals.csrf}/>,
	document.getElementById('pool-form')
);
