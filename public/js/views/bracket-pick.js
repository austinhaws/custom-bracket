/**
 * shows all the games in their brackets and then the final 3 games in the middle
 * responds to games having a pick, pushes the data to the data store and its state
 * pushes changes back down to the games
 * ajax saves picks
 */
var BracketPick = React.createClass({

	propTypes : {
		dataStore: React.PropTypes.object.isRequired
	},
	getInitialState : function() {
		return {
			bracket: this.props.dataStore.bracket,
			games: this.props.dataStore.games,
			pools: this.props.dataStore.pools,
			teams: this.props.dataStore.teams,
			picks: this.props.dataStore.picks
		};
	},
	onTeamPick: function(bracketGameId, poolEntryWinnerId) {
		$.ajax({
			url: 'bracket/pick',
			dataType: 'json',
			data: csrf({bracketGameId: bracketGameId, poolEntryWinnerId: poolEntryWinnerId}),
			cache: false,
			method: 'post',
			success: function(data) {
				// set picks state
				this.setState({picks: data});
			}.bind(this)
		});
	},
	render: function() {
		function filterGamesByPoolId(game) {
			return game.pool_id == this;
		}
		function filterGamesByRound(game) {
			return -1 != this.indexOf(game.round);
		}
		return (
			<div className="tournament">
				<div>
					Score: {this.props.dataStore.score}<br/>
					Possible: {this.props.dataStore.possible}
				</div>
				<BracketSection pool={this.state.pools.top_left} picks={this.state.picks} teams={this.state.teams.top_left} games={this.state.games.filter(filterGamesByPoolId, this.state.pools.top_left.id)} onTeamPick={this.onTeamPick}/>
				<BracketSection pool={this.state.pools.bottom_left} picks={this.state.picks} teams={this.state.teams.bottom_left} games={this.state.games.filter(filterGamesByPoolId, this.state.pools.bottom_left.id)} onTeamPick={this.onTeamPick}/>
		
				<BracketSection pool={this.state.pools.top_right} picks={this.state.picks} teams={this.state.teams.top_right} games={this.state.games.filter(filterGamesByPoolId, this.state.pools.top_right.id)} onTeamPick={this.onTeamPick}/>
				<BracketSection pool={this.state.pools.bottom_right} picks={this.state.picks} teams={this.state.teams.bottom_right} games={this.state.games.filter(filterGamesByPoolId, this.state.pools.bottom_right.id)} onTeamPick={this.onTeamPick}/>
				<BracketFinalFourWinner picks={this.state.picks} teams={this.state.teams} games={this.state.games.filter(filterGamesByRound, [5, 6])} onTeamPick={this.onTeamPick}/>
			</div>
		);
	}

});

// a full pool section of games (4 in a bracket)
var BracketSection = React.createClass({
	propTypes: {
		teams: React.PropTypes.array.isRequired,
		games: React.PropTypes.array.isRequired,
		onTeamPick: React.PropTypes.func.isRequired,
		picks: React.PropTypes.array.isRequired,
		pool: React.PropTypes.object.isRequired
	},
	render: function() {
		function filterGamesByRound(game) {
			return game.round == this;
		}
		var teamList = this.props.teams.map(function(team) {
			return (
				<div className="team" key={team.name}>{team.name} ({team.rank})</div>
			)
		});
		return (
			<div className="bracket">
				<h2>{this.props.pool.name}</h2>
				<div className="teams-list">
					{teamList}
				</div>
				<BracketRound picks={this.props.picks} games={this.props.games.filter(filterGamesByRound, 1)} key="1" teams={this.props.teams} onTeamPick={this.props.onTeamPick}/>
				<BracketRound picks={this.props.picks} games={this.props.games.filter(filterGamesByRound, 2)} key="2" teams={this.props.teams} onTeamPick={this.props.onTeamPick}/>
				<BracketRound picks={this.props.picks} games={this.props.games.filter(filterGamesByRound, 3)} key="3" teams={this.props.teams} onTeamPick={this.props.onTeamPick}/>
				<BracketRound picks={this.props.picks} games={this.props.games.filter(filterGamesByRound, 4)} key="4" teams={this.props.teams} onTeamPick={this.props.onTeamPick}/>
			</div>
		)
	}
});

// a column/round of a BracketSection (just one pool)
var BracketRound = React.createClass({
	propTypes : {
		games : React.PropTypes.array.isRequired,
		teams : React.PropTypes.array.isRequired,
		onTeamPick: React.PropTypes.func.isRequired,
		picks : React.PropTypes.array.isRequired
	},
	roundLocked: function(round) {
		// if the first round has started then can no longer pick games
		return globals.dataStore.lockedRounds.firstRoundDatePassed;
	},
	render: function() {
		// need to check if a game is picked or not to determine if showing a menu or static text
		function findTeamById(team) {
			return team.id == this;
		}
		var that = this;
		var gameNodes = this.props.games.map(function(game) {
			var correctTeam1 = that.props.teams.filter(findTeamById, game.pool_entry_1_id)[0];
			var correctTeam2 = that.props.teams.filter(findTeamById, game.pool_entry_2_id)[0];
			var team1, team2;
			var winnerId;
			var pick;
			pick = that.props.picks.filter(function(pick) {
				return pick.bracket_game_id == game.id;
			})[0];
			if (pick) {
				team1 = that.props.teams.filter(findTeamById, pick.pool_entry_1_id)[0];
				team2 = that.props.teams.filter(findTeamById, pick.pool_entry_2_id)[0];
				winnerId = pick.pool_entry_winner_id;
			} else {
				if (game.round == 1) {
					team1 = correctTeam1;
					team2 = correctTeam2;
				} else {
					team1 = undefined;
					team2 = undefined;
				}
				winnerId = undefined;
			}
			var result;
			if (that.roundLocked(game.round)) {
				result = (
					<GameLocked pick={pick} key={game.id} team1={team1} team2={team2} correctTeam={that.props.teams.filter(findTeamById, game.pool_entry_1_score > game.pool_entry_2_score ? game.pool_entry_1_id : game.pool_entry_2_id)[0]} selectedTeamId={winnerId} gameId={game.id}/>
				);
			} else {
				result = (
					<GamePicker key={game.id} team1={team1} team2={team2} correctTeam1={correctTeam1} correctTeam2={correctTeam2} selectedTeamId={winnerId} gameId={game.id} onTeamPick={that.props.onTeamPick}/>
				);
			}
			return result;
		});
		return (
			<div className="round">
				<div className="round-list">
					<div className="round-list">{gameNodes}</div>
				</div>
			</div>
		);
	}
});

var GameLocked = React.createClass({
	propTypes: {
		team1: React.PropTypes.object,
		team2: React.PropTypes.object,
		correctTeam: React.PropTypes.object,
		gameId: React.PropTypes.number.isRequired,
		pick: React.PropTypes.object
	},
	render: function() {
		var selectedTeam;
		if (this.props.selectedTeamId) {
			if (this.props.team1 && this.props.selectedTeamId == this.props.team1.id) {
				selectedTeam = this.props.team1;
			} else if (this.props.team2 && this.props.selectedTeamId == this.props.team2.id) {
				selectedTeam = this.props.team2;
			}
		}
		if (!selectedTeam) {
			selectedTeam = {
				name: 'Not Picked',
				rank: ' ',
				id: false
			}
		}
		var className;
		switch (this.props.pick.correct) {
			case 'Y':
				className = 'correct';
				break;
			case 'N':
				className = 'incorrect';
				break;
			case '?':
				className = '';
				break;
		}
		return (
			<div className={className}>
				{selectedTeam.name} ({selectedTeam.rank}) {this.props.pick.upset ? '*' : ''}
			</div>
		)
	}
});

/**
 * Game shows a select2 menu with two options
 * menu starts with a react defaultValue and has an onChange item
 * component is told the two teams to put in its menu and its game id
 * parent will tell the data store to make the change and propagate the change to the other games
 */
var GamePicker = React.createClass({
	propTypes: {
		team1: React.PropTypes.object,
		team2: React.PropTypes.object,
		correctTeam1: React.PropTypes.object,
		correctTeam2: React.PropTypes.object,
		selectedTeamId: React.PropTypes.number,
		onTeamPick: React.PropTypes.func.isRequired,
		gameId: React.PropTypes.number.isRequired
	},
	onWinnerPick: function(e) {
		this.props.onTeamPick(this.props.gameId, e.target.value);
	},
	render: function() {
		var team_one = typeof this.props.team1 !== 'undefined' ? this.props.team1 : {id:'team1', name:''};
		var team_two = typeof this.props.team2 !== 'undefined' ? this.props.team2 : {id:'team2', name:''};
		return (
			<div>
				<select defaultValue={this.props.selectedTeamId} onChange={this.onWinnerPick}>
					<option></option>
					<option value={team_one.id}>{team_one.name} ({team_one.rank})</option>
					<option value={team_two.id}>{team_two.name} ({team_two.rank})</option>
				</select>
			</div>
		)
	}
});

var BracketFinalFourWinner = React.createClass({
	propTypes: {
		picks: React.PropTypes.array.isRequired,
		teams: React.PropTypes.object.isRequired,
		games: React.PropTypes.array.isRequired,
		onTeamPick: React.PropTypes.func.isRequired
	},
	render: function() {
		var final4Games = this.props.games.filter(function(game) {
			return game.round == 5;
		});
		var finalGame = this.props.games.filter(function(game) {
			return game.round == 6;
		});

		var teams = this.props.teams.top_left.concat(this.props.teams.bottom_left, this.props.teams.top_right, this.props.teams.bottom_right);
		// show round for for final four
		// show round for final game

		return (
			<div>
				<h2>Final Four</h2>
				<BracketRound picks={this.props.picks} games={final4Games} key="1" teams={teams} onTeamPick={this.props.onTeamPick}/>
				<h2>Final</h2>
				<BracketRound picks={this.props.picks} games={finalGame} key="2" teams={teams} onTeamPick={this.props.onTeamPick}/>
			</div>

		);
	}
});


ReactDOM.render(
	<BracketPick dataStore={globals.dataStore}/>,
	document.getElementById('bracket-form')
);
