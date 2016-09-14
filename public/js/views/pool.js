// need team entry box

var PoolBox = React.createClass({
	getInitialState: function() {
		return {
			teams: [],
			pool: {id: this.props.id}
		};
	},
	componentDidMount: function() {
		$.ajax({
			url: 'pool/detail/' + this.props.id,
			dataType: 'json',
			cache: false,
			success: function(data) {
				this.setState(data);
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	usePickCallback: function(teamId) {
		$.ajax({
			url: 'pool/pick/' + teamId,
			dataType: 'json',
			cache: false,
		});
	},
	enterTeamCallback: function(teamName) {
		$.ajax({
			url: 'pool/enterTeam',
			dataType: 'json',
			data: csrf({poolId: this.props.poolId, name: teamName}),
			cache: false,
			method: 'post',
			success: function(data) {
				var teams = this.state.teams;
				data.picked = 1;
				teams.push(data);
				this.setState({teams: teams});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	render: function() {
		var flags = {
			teamsDivider: false,
			teamEntry: false,
			voteable: false
		};

		switch (poolDateStatus(this.state.pool.open_date, this.state.pool.closing_date)) {
			case -1:
				// upcoming, show list of teams and team entry
				flags.teamEntry = true;
				break;
			case 0:
				// voting, show list of teams with divider line and team entry and voteable
				flags.teamEntry = true;
				flags.teamsDivider = true;
				flags.voteable = true;
				break;
			case 1:
				// voting closed, show list of teams wtihdivider, no team entry, not voteable
				flags.teamsDivider = true;
				break;
		}

		var teamEntry;
		if (flags.teamEntry) {
			teamEntry = <TeamEntry enterTeamCallback={this.enterTeamCallback}/>;
		}
		return (
			<div className="poolsBox col-md-12 col-md-offset-1">
				<div className="panel panel-default">
					<div className="panel-heading h3">{this.state.pool.name} <span className="blurb">16 highest voted teams play in the conference</span></div>
					<div className="panel-body">
						<div className="poolDate">{poolDateString(this.state.pool.open_date, this.state.pool.closing_date)}</div>
						<TeamList data={this.state.teams} usePickCallback={flags.voteable ? this.usePickCallback : false} divider={flags.teamsDivider}/>
						{teamEntry}
					</div>
				</div>
			</div>
		);
	}
});

var TeamList = React.createClass({
	render: function() {
		var that = this;
		var teamNodes = this.props.data.map(function(team) {
			return (
				<Team name={team.name} key={team.id} id={team.id} initialPicked={team.picked} usePickCallback={that.props.usePickCallback}/>
			);
		});
		return (
			<div className={'teamsList ' + (this.props.divider ? 'showDivider' : '')}>
			{teamNodes}
			</div>
		);
	}
});

var Team = React.createClass({
	getInitialState: function() {
		return {
			picked: this.props.initialPicked
		}
	},
	handleClick: function() {
		this.props.usePickCallback(this.props.id);
		this.setState({picked: !this.state.picked});
	},
	render: function() {
		return (
			<div className="team">
				{this.props.usePickCallback ? <div className={'checkbox ' + (this.state.picked ? 'picked' : '')} onClick={this.handleClick}></div> : ''}
				<div className="teamName">{this.props.name}</div>
			</div>
		);
	}

});

var TeamEntry = React.createClass({
	getInitialState: function() {
		return {
			teamName: ''
		};
	},
	handleClick: function(event) {
		event.stopPropagation();
		event.preventDefault();
		if (this.state.teamName) {
			this.props.enterTeamCallback(this.state.teamName);
			this.setState({teamName: ''});
		} else {
			alert('Please a team name and try again');
		}
	},
	nameChanged: function(event) {
		this.setState({teamName: event.target.value})
	},
	render: function() {
		return (
			<div id="teamEntryContainer" className="form-inline">
				<input type="text" id="team-entry" className="form-control" placeholder="new team name" onChange={this.nameChanged} value={this.state.teamName}/>
				<button type="button" className="btn btn-primary" id="team-entry-submit" onClick={this.handleClick}>Submit New Team</button>
			</div>
		);
	}
});

ReactDOM.render(
	<PoolBox id={globals.poolId} poolId={globals.poolId}/>,
	document.getElementById('poolBox')
);
