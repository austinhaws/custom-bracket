var GamesList = React.createClass({
	getInitialState: function() {
		return {
			games: this.props.initialGames
		};
	},
	scoreChanged: function(gameId, teamNumber, score) {
		var game = this.state.games.filter(function(game) {
			return game.id == gameId;
		})[0];
		game['pool_entry_' + teamNumber + '_score'] = score;

		this.setState({games:this.state.games});
	},
	saveGames: function() {
		$.ajax({
			url: 'admin/bracket/score/save',
			dataType: 'json',
			data: csrf({games: this.state.games}),
			cache: false,
			method: 'post',
			success: function(data) {
				// show a spinner instead
				alert('saved');
			}.bind(this),
		});
	},
	render: function() {
		var that = this;
		var games = this.state.games.map(function(game) {
			return (
				<Game game={game} teams={that.props.teams} key={game.id} scoreChanged={that.scoreChanged}/>
			);
		});
		return (
			<div>
				<h2>Round {this.props.round}</h2>
				{games}
				<button onClick={this.saveGames}>Save</button>
			</div>
		);
	}
});

var Game = React.createClass({
	getInitialState : function() {
		if (!this.props.game.pool_entry_1_score) {
			this.props.game.pool_entry_1_score = '';
		}
		if (!this.props.game.pool_entry_2_score) {
			this.props.game.pool_entry_2_score = '';
		}
		return this.props.game;
	},
	scoreChanged: function(e) {
		this.props.scoreChanged(this.state.id, e.target.dataset.team, e.target.value);
	},
	render: function() {
		var team1Name;
		var team2Name;
		var state = this.state;
		this.props.teams.forEach(function(team) {
			if (team.id == state.pool_entry_1_id) {
				team1Name = team.name;
			}
			if (team.id == state.pool_entry_2_id) {
				team2Name = team.name;
			}
		});
		return (
			<div className="game">
				<div className="team"><div className="team-name">{team1Name}</div> <input type="text" value={this.state.pool_entry_1_score} onChange={this.scoreChanged} data-team="1"/></div>
				<div className="team"><div className="team-name">{team2Name}</div> <input type="text" value={this.state.pool_entry_2_score} onChange={this.scoreChanged} data-team="2"/></div>
			</div>
		)
	}
});

var teams = globals.pools[0].teams.concat(globals.pools[1].teams.concat(globals.pools[2].teams.concat(globals.pools[3].teams.concat())));
ReactDOM.render(
	<div>
		<a href={'admin/bracket/' + globals.bracket.id}>Back To Bracket</a>
		<GamesList initialGames={globals.games} round={globals.round} teams={teams}/>
	</div>,
	document.getElementById('bracket-round')
);
