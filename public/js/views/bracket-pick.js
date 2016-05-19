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
			teams: this.props.dataStore.teams
		};
	},
	render: function() {
		function filterGamesByPoolId(game) {
			return game.pool_id == this;
		}
		return (
			<div className="tournament">
				<BracketSection teams={this.state.teams.top_left} games={this.state.games.filter(filterGamesByPoolId, this.state.pools.top_left.id)}/>
				<BracketSection teams={this.state.teams.bottom_left} games={this.state.games.filter(filterGamesByPoolId, this.state.pools.bottom_left.id)}/>
		
				<BracketSection teams={this.state.teams.top_right} games={this.state.games.filter(filterGamesByPoolId, this.state.pools.top_right.id)}/>
				<BracketSection teams={this.state.teams.bottom_right} games={this.state.games.filter(filterGamesByPoolId, this.state.pools.bottom_right.id)}/>
			</div>
		);
	}

});

// a full pool section of games (4 in a bracket)
var BracketSection = React.createClass({
	propTypes: {
		teams: React.PropTypes.array.isRequired,
		games: React.PropTypes.array.isRequired
	},
	render: function() {
		function filterGamesByRound(game) {
			return game.round == this;
		}
		// TODO: sort games so they come in the right order? or is it naturally that way?
		var teamList = this.props.teams.map(function(team) {
			return (
				<div className="team" key={team.name}>{team.name} ({team.rank})</div>
			)
		});
		return (
			<div className="bracket">
				<div className="teams-list">
					{teamList}
				</div>
				<BracketRound games={this.props.games.filter(filterGamesByRound, 1)} key="1" teams={this.props.teams}/>
				<BracketRound games={this.props.games.filter(filterGamesByRound, 2)} key="2" teams={this.props.teams}/>
				<BracketRound games={this.props.games.filter(filterGamesByRound, 3)} key="3" teams={this.props.teams}/>
				<BracketRound games={this.props.games.filter(filterGamesByRound, 4)} key="4" teams={this.props.teams}/>
			</div>
		)
	}
});

// a column/round of a BracketSection (just one pool)
var BracketRound = React.createClass({
	propTypes : {
		games : React.PropTypes.array.isRequired,
		teams : React.PropTypes.array.isRequired
	},
	render: function() {
		// need to check if a game is picked or not to determine if showing a menu or static text
		function findTeamById(team) {
			return team.id == this;
		}
		var that = this;
		var gameNodes = this.props.games.map(function(game) {
			var team1 = that.props.teams.filter(findTeamById, game.pool_entry_1_id)[0];
			var team2 = that.props.teams.filter(findTeamById, game.pool_entry_2_id)[0];
			return (
				<GamePicker key={game.id} team1={team1} team2={team2} selectedTeamId={game.id}/>
			);
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
		selectedTeamId: React.PropTypes.number.isRequired
	},
	render: function() {
		var team_one = typeof this.props.team1 !== 'undefined' ? this.props.team1 : {id:'team1', name:''};
		var team_two = typeof this.props.team2 !== 'undefined' ? this.props.team2 : {id:'team2', name:''};
		return (
			<div>
				<select defaultValue={this.props.selectedTeamId}>
					<option></option>
					<option value={team_one.id}>{team_one.name}</option>
					<option value={team_two.id}>{team_two.name}</option>
				</select>
			</div>
		)
	}
});

ReactDOM.render(
	<BracketPick dataStore={globals.dataStore}/>,
	document.getElementById('bracket-form')
);
