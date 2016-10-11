var BracketPick = React.createClass({
	getInitialState : function () {
		return {
			data: false,
			conferences: false
		};
	},
	componentDidMount: function () {
		// ajax data
		$.ajax({
			url: 'bracket',
			dataType: 'json',
			cache: false,
			success: function (data) {
				var teams = data.pools.reduce((aggregate, pool) => aggregate.concat(pool.entries), []);

				function node(team1, team2, game, pick) {
					var winningTeamId = game ? (game.pool_entry_1_score > game.pool_entry_2_score ? game.pool_entry_1_id : game.pool_entry_2_id) : false;
					return {
						round: game.round,
						pickedTeamId: pick ? pick.pool_entry_winner_id : false,
						winningTeam: teams.find(team => team.id == winningTeamId),
						team1: team1,
						team2: team2,
						game: game,
						pick: pick
					}
				}

				function firstRoundNode(rank1, rank2, poolWithEntries) {
					var team1 = poolWithEntries.entries.find(entry => entry.rank == rank1);
					var team2 = poolWithEntries.entries.find(entry => entry.rank == rank2);
					var game = data.games.find(g => g.pool_entry_1_id == team1.id && g.pool_entry_2_id == team2.id && g.round == 1);
					var pick = data.picks.find(p => p.bracket_game_id == game.id);
					return node(
						team1,
						team2,
						game,
						pick
					);
				}

				function fillNextRound(previousRound) {
					var round = [];
					for (var x = 0; x < previousRound.length; x += 2) {
						var game = data.games.find(g => g.prev_bracket_game_1_id == previousRound[x].game.id && g.prev_bracket_game_2_id == previousRound[x + 1].game.id);
						var pick = data.picks.find(p => p.bracket_game_id == game.id);
						round.push(node(
							pick ? teams.find(team => team.id == pick.pool_entry_1_id) : false,
							pick ? teams.find(team => team.id == pick.pool_entry_2_id) : false,
							game,
							pick
						));
					}
					return round;
				}

				function compileConference(poolWithEntries) {
					var conference = {
						conference: poolWithEntries,
						round1: [
							firstRoundNode(1, 16, poolWithEntries),
							firstRoundNode(8, 9, poolWithEntries),
							firstRoundNode(5, 12, poolWithEntries),
							firstRoundNode(4, 13, poolWithEntries),
							firstRoundNode(6, 11, poolWithEntries),
							firstRoundNode(3, 14, poolWithEntries),
							firstRoundNode(7, 10, poolWithEntries),
							firstRoundNode(2, 15, poolWithEntries)
						]
					};
					conference.round2 = fillNextRound(conference.round1);
					conference.round3 = fillNextRound(conference.round2);
					conference.round4 = fillNextRound(conference.round3);
					return conference;
				}
				/**
				 * organize data in to tree of conferences and rounds and games and picks so that layout and usage is dead simple
				 * and quick since it doesn't have to recalculate this every time
				 *
				 * each node contains:
				 * 		• round (1, 2, 3, 4, 5, 6)
				 * 		• winning team id - what team really won (or null if not yet played)
				 * 		• picked team id - what the user picked (or null if not yet picked)
				 * 		• team 1 - which team to show in slot one of menu
				 * 		• team 2 - which team to show in slot two of menu
				 * 		• gameId - for server communication
				 *
				 * 	put these in an ordered tree
				 * 	topLeft: {
				 * 		conference: {conference object}
				 * 		round1: [
				 * 			game1: {node}
				 * 			game2: {node}
				 * 			game3: {node}
				 * 			game4: {node}
				 * 			game5: {node}
				 * 			game6: {node}
				 * 			game7: {node}
				 * 			game8: {node}
				 * 		],
				 * 		round2: [
				 *			game1: {node}
				 *			game2: {node}
				 *			game3: {node}
				 *			game4: {node}
				 * 		],
				 * 		round3: [
				 * 			game1: {node}
				 * 			game2: {node}
				 *		],
				 *		round4: [
				 *			game1: {node}
				 * 		]
				 * 	},
				 * 	bottomLeft: {roundNodes}
				 * 	topRight: {roundNodes}
				 * 	bottomRight: {roundNodes}
				 * 	finals: {
				 * 		round5: [
				 * 			game1: {node}
				 * 			game2: {node}
				 * 		],
				 * 		round6: [
				 * 			game1: {node}
				 * 		]
				 * 	}
				 */
				// each node contains:
					//
				var conferences = {
					topLeft: compileConference(data.pools.find(pool => pool.id == data.bracket.top_left_pool_id)),
					bottomLeft: compileConference(data.pools.find(pool => pool.id == data.bracket.bottom_left_pool_id)),
					topRight: compileConference(data.pools.find(pool => pool.id == data.bracket.top_right_pool_id)),
					bottomRight: compileConference(data.pools.find(pool => pool.id == data.bracket.bottom_right_pool_id)),
				};
				conferences.finals = {
					round5: [
						fillNextRound(conferences.topLeft.round4.concat(conferences.bottomLeft.round4)),
						fillNextRound(conferences.topRight.round4.concat(conferences.bottomRight.round4))
					]
				};
				conferences.finals.round6 = [
					fillNextRound(conferences.finals.round5[0].concat(conferences.finals.round5[1]))
				];
// console.log(conferences);
// console.log(data);
				this.setState({
					data: data,
					conferences: conferences
				});
			}.bind(this)
		});
	},
	pickChanged: function (pick) {
		console.log('pick changed', pick);
	},
	render: function () {
		if (this.state.bracket) {
			var pools = {
				topLeft: this.state.pools.find(p => p.id == this.state.bracket.top_left_pool_id),
				bottomLeft: this.state.pools.find(p => p.id == this.state.bracket.bottom_left_pool_id),
				topRight: this.state.pools.find(p => p.id == this.state.bracket.top_right_pool_id),
				bottomRight: this.state.pools.find(p => p.id == this.state.bracket.bottom_right_pool_id)
			};
		}
		return this.state.data ? (
			<div className="container">
				<div className="row">
					<div className="col-md-10 col-md-offset-1">
						<div className="panel panel-default">
							<div className="panel-heading h3">
								Make Your Picks
							</div>
							<div className="panel-body">
								<div className="conferencesColumn">
									<ConferencePick conference={this.state.conferences.topLeft} pickChangedCallback={this.pickChanged}/>
									<ConferencePick conference={this.state.conferences.bottomLeft} pickChangedCallback={this.pickChanged}/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		) : (
			<div></div>
		);
	}

});

var ConferencePick = React.createClass({
	propTypes: {
		conference: React.PropTypes.object.isRequired,
		pickChangedCallback: React.PropTypes.func.isRequired
	},
	render: function () {
		var that = this;
		// show the 1st 16 teams playing each other
		var round0List = [1, 16, 8, 9, 5, 12, 4, 13, 6, 11, 3, 14, 7, 10, 2, 15].map(function (rank) {
			var entry = that.props.conference.conference.entries.find(e => e.rank == rank);
			return ( <div key={entry.name} className="entry">{entry.name + ' (' + entry.rank + ')'}</div> );
		});
		var round1List = this.props.conference.round1.map(node => <PickMenu key={node.game.id} node={node} pickChangedCallback={that.props.pickChangedCallback}/>);
		var round2List = this.props.conference.round2.map(node => <PickMenu key={node.game.id} node={node} pickChangedCallback={that.props.pickChangedCallback}/>);
		var round3List = this.props.conference.round3.map(node => <PickMenu key={node.game.id} node={node} pickChangedCallback={that.props.pickChangedCallback}/>);
		var round4List = this.props.conference.round4.map(node => <PickMenu key={node.game.id} node={node} pickChangedCallback={that.props.pickChangedCallback}/>);
		// show each round up to the conference  champ
		return (
			<div className="conference leftToRight">
				<div key="title" className="conferenceTitle">{this.props.conference.conference.name}</div>
				<div key="round0" className="roundList entries">{round0List}</div>
				<div key="round1" className="roundList">{round1List}</div>
				<div key="round2" className="roundList">{round2List}</div>
				<div key="round3" className="roundList">{round3List}</div>
				<div key="round4" className="roundList">{round4List}</div>
			</div>
		);
	}

});

var PickMenu = React.createClass({
	propTypes: {
		node: React.PropTypes.object.isRequired,
		pickChangedCallback: React.PropTypes.func.isRequired
	},
	pickChanged: function (ev) {
		this.props.pickChangedCallback(this.props.gameId, ev.target.value);
	},
	render: function () {
// console.log(this.props.node);
		return (
			<select key={this.props.node.game.id} onChange={this.props.pickChangedCallback}>
				<option value=""></option>
				<option value={this.props.node.team1 ? this.props.node.team1.id : ''}>{this.props.node.team1 ? this.props.node.team1.name + ' (' + this.props.node.team1.rank + ')' : ''}</option>
				<option value={this.props.node.team2 ? this.props.node.team2.id : ''}>{this.props.node.team2 ? this.props.node.team2.name + ' (' + this.props.node.team2.rank + ')' : ''}</option>
			</select>
		);
	}
});


ReactDOM.render(<BracketPick/>, document.getElementById('bracket-form'));
