var BracketScores = React.createClass({
	render: function() {
		return (
			<div>
				<UsersList data={this.props.data}/>
				<Bracket data={this.props.data}/>
			</div>
		);
	}
});

var UsersList = React.createClass({
	render: function() {
		var scoresList = [];
		for (var userId in this.props.data.scores) {
			var username = this.props.data.users.filter(function(user) {
				return user.id == userId;
			})[0].name;
			scoresList.push(
				<li key={userId}>{username} : {this.props.data.scores[userId]} (Possible: {this.props.data.possibles[userId]})</li>
			);
		};

		return (
			<ul>{scoresList}</ul>
		);
	}
});


var Bracket = React.createClass({
	render: function() {
		function gamesByPoolId(games, poolId) {
			return games.filter(function(game) {
				return game.pool_id == poolId;
			});
		}

		var games = {
			top_left: gamesByPoolId(this.props.data.games, this.props.data.pools[0].id),
			bottom_left: gamesByPoolId(this.props.data.games, this.props.data.pools[1].id),
			top_right: gamesByPoolId(this.props.data.games, this.props.data.pools[2].id),
			bottom_right: gamesByPoolId(this.props.data.games, this.props.data.pools[3].id)
		};
		// filter games by game.poolId =
		// filter teams by pool
		var teams = this.props.data.pools[0].teams.concat(this.props.data.pools[1].teams.concat(this.props.data.pools[2].teams.concat(this.props.data.pools[3].teams.concat())));

		function filterGamesByRound(game) {
			return game.round == this;
		}
		var finalFourGames = this.props.data.games.filter(filterGamesByRound, 5);
		var finalGame = this.props.data.games.filter(filterGamesByRound, 6);
		return (
			<div className="pool">
				<Pool pool={this.props.data.pools[0]} games={games.top_left}/>
				<Pool pool={this.props.data.pools[1]} games={games.bottom_left}/>

				<Round teams={teams} games={[finalFourGames[0]]}/>
				<Round teams={teams} games={finalGame}/>
				<Round teams={teams} games={[finalFourGames[1]]}/>

				<Pool pool={this.props.data.pools[2]} games={games.top_right}/>
				<Pool pool={this.props.data.pools[3]} games={games.bottom_right}/>
			</div>
		);
	}
});

var Pool = React.createClass({
	render: function() {
		var rounds = [];
		for (var round = 1; round <= 4; round++) {
			var roundGames = this.props.games.filter(function(game) {
				return game.round == this;
			}, round);
			rounds.push(
				<Round key={round} games={roundGames} teams={this.props.pool.teams}/>
			);
		}
		return (
			<div className="pool">
				<h3>{this.props.pool.pool.name}</h3>
				<Teams teams={this.props.pool.teams}/>
				{rounds}
			</div>
		);
	}
});

var Teams = React.createClass({
	render: function() {
		var teams = this.props.teams.map(function(team) {
			return (
				<div key={team.id} className="team">{team.name} ({team.rank})</div>
			);
		});

		return (
			<div className="teams">{teams}</div>
		);
	}
});


var Round = React.createClass({
	render: function() {
		var that = this;
		var games = this.props.games.map(function(game) {
			return (
				<Game key={game.id} game={game} teams={that.props.teams}/>
			);
		});
		return (
			<div className="round-list">{games}</div>
		)
	}
});

var Game = React.createClass({
	render: function() {
		function teamFilterById(team) {
			return team.id == this;
		}
		var team1 = this.props.teams.filter(teamFilterById, this.props.game.pool_entry_1_id)[0];
		var team2 = this.props.teams.filter(teamFilterById, this.props.game.pool_entry_2_id)[0];
		var winnerId;
		if (this.props.game.pool_entry_1_score > this.props.game.pool_entry_2_score) {
			winnerId = this.props.game.pool_entry_1_id;
		} else if (this.props.game.pool_entry_1_score < this.props.game.pool_entry_2_score) {
			winnerId = this.props.game.pool_entry_2_id;
		} else {
			winnerId = false;
		}
		return (
			<div className="game">
			Round:{this.props.game.round}
				<Team team={team1} winner={team1 && winnerId == team1.id} score={this.props.game.pool_entry_1_score}/>
				<Team team={team2} winner={team2 && winnerId == team2.id} score={this.props.game.pool_entry_2_score}/>
			</div>
		);
	}
});

var Team = React.createClass({
	render: function() {
		return (
			<div className={'team ' + (this.props.winner ? 'winner' : '')}>
				<div className="name">{this.props.team ? this.props.team.name : ''}</div>
				<div className="rank">{this.props.team ? '(' + this.props.team.rank + ')' : ''}</div>
				<div className="score">{this.props.score}</div>
			</div>
		);
	}
});


ReactDOM.render(
	<BracketScores data={globals.data}/>,
	document.getElementById('bracketScoresContainer')
);
