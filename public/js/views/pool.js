// need team entry box

var PoolBox = React.createClass({
	getInitialState: function() {
		return {
			cloudTeams: [],
			uncloudTeams: [],
			numberPicks: 0
		};
	},
	componentDidMount: function() {
		$.ajax({
			url: this.props.url + this.props.id,
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
		var result;
		if (this.state.numberPicks) {
			this.setState({numberPicks: this.state.numberPicks - 1});
			result = true;
			$.ajax({
				url: 'pool/pick/' + teamId,
				dataType: 'json',
				cache: false
			});
		} else {
			alert('You do not have another pick. You will gain more picks as more teams are added to the pool.');
			result = false;
		}
		return result;
	},
	enterTeamCallback: function(teamName) {
		var result;
		if (this.state.numberPicks) {
			this.setState({numberPicks: this.state.numberPicks - 1});
			result = true;
			$.ajax({
				url: 'pool/enterTeam',
				dataType: 'json',
				data: csrf({poolId: this.props.poolId, name: teamName}),
				cache: false,
				method: 'post',
				success: function(data) {
					var unpickedTeams = this.state.uncloudTeams;
					data.picked = 1;
					unpickedTeams.push(data);
					this.setState({uncloudTeams: unpickedTeams});
				}.bind(this),
				error: function(xhr, status, err) {
					console.error(this.props.url, status, err.toString());
				}.bind(this)
			});
		} else {
			alert('Entering a team name uses a pick. You do not have another pick. You will gain more picks as more teams are added to the pool.');
			result = false;
		}
		return result;
	},
	render: function() {
		return (
			<div class="poolsBox">
				<PickCounter numberPicks={this.state.numberPicks}/>
				<TeamCloud data={this.state.cloudTeams} usePickCallback={this.usePickCallback}/>
				<TeamList data={this.state.uncloudTeams} usePickCallback={this.usePickCallback}/>
				<TeamEntry enterTeamCallback={this.enterTeamCallback}/>
			</div>
		);
	}
});

var TeamCloud = React.createClass({
	render: function() {
		var that = this;
		var teamNodes = this.props.data.map(function(team) {
			return (
				<Team name={team.name} key={team.id} id={team.id} initialPicked={team.picked} usePickCallback={that.props.usePickCallback}/>
			);
		});
		return (
			<div className="teamsCloud">
			{teamNodes}
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
			<div className="teamsList">
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
		if (!this.state.picked && this.props.usePickCallback(this.props.id)) {
			this.setState({picked: true});
		}
	},
	render: function() {
		var pickedClass = 'team button ' + (this.state.picked ? 'picked' : '');
		return (
			<span className={pickedClass} onClick={this.handleClick}>{this.props.name}</span>
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
		this.props.enterTeamCallback(this.state.teamName);
	},
	nameChanged: function(event) {
		this.setState({teamName: event.target.value})
	},
	render: function() {
		return (
			<div id="teamEntryContainer">
				<span>Who is missing?</span> <input type="text" id="team-entry" onChange={this.nameChanged} value={this.state.teamName}/> <button id="team-entry-submit" onClick={this.handleClick}>Submit</button>
			</div>
		);
	}
});

var PickCounter = React.createClass({
	render: function() {
		return (
			<div id="numberPicks">You have {this.props.numberPicks} picks remaining</div>
		)
	}
});


ReactDOM.render(
	<PoolBox url="pool/detail/" id={globals.poolId} initialNumberPicks="0" poolId={globals.poolId}/>,
	document.getElementById('poolBox')
);
