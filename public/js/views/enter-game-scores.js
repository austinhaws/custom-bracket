

// the form for entering name/dates for a bracket
var Scores = React.createClass({
	render: function() {
		const rounds = ['First Round', 'Second Round', 'Sweet 16', 'Elite 8', 'Final 4', 'Championship'];
		return (
			<div id="roundsContainer">
				{rounds.map((r, i) =>
					<ConnectedRound key={i} roundNumber={i + 1} roundTitle={r}/>
				)}
			</div>
		);
	}
});

var Round = React.createClass({
	propTypes: {
		// redux
		state: React.PropTypes.object.isRequired,

		// parent
		roundNumber: React.PropTypes.number.isRequired,
		roundTitle: React.PropTypes.string.isRequired
	},
	render: function () {
		var games;
		switch (this.props.roundNumber) {
			case 1:
			case 2:
			case 3:
			case 4:
				// load list of games for the round from every conference (just clump them all together for now)
				//noinspection JSUnresolvedVariable
				games = this.props.state[this.props.state.bracket.top_left_pool_id].games[this.props.roundNumber]
					.concat(this.props.state[this.props.state.bracket.bottom_left_pool_id].games[this.props.roundNumber])
					.concat(this.props.state[this.props.state.bracket.top_right_pool_id].games[this.props.roundNumber])
					.concat(this.props.state[this.props.state.bracket.bottom_right_pool_id].games[this.props.roundNumber]);
				break;

			case 5:
			case 6:
				// make a copy
				games = this.props.state.finals.games[this.props.roundNumber].concat([]);
				break;

			default:
				console.error('what round number were you thinking you wanted?', this.props.roundNumber);
				break;
		}
		return (
			<div className="roundContainer">
				<div className="roundTitle">{this.props.roundTitle}</div>
				{games.map((g, i) => <ConnectedScoreDetail key={i} game={g}/>)}
			</div>
		);
	}
});

var ScoreDetail = React.createClass({
	propTypes: {
		// redux
		state: React.PropTypes.object.isRequired,

		// parent
		game: React.PropTypes.object.isRequired
	},
	render: function () {
		var that = this;
		const team1 = this.props.state.teams.filter(t => t.id == that.props.game.pool_entry_1_id)[0];
		const team2 = this.props.state.teams.filter(t => t.id == that.props.game.pool_entry_2_id)[0];

		var detail;
		if (team1 && team2) {
			detail = (
				<div className="scoreDetail">
					<ConnectedScoreInput key="1" game={this.props.game} team={team1} score={this.props.game.pool_entry_1_score}/>
					<ConnectedScoreInput key="2" game={this.props.game} team={team2} score={this.props.game.pool_entry_2_score}/>
				</div>
			);
		} else {
			detail = <div className="scoreDetail">Teams not yet decided</div>;
		}

		return detail;
	}
});

var ScoreInput = React.createClass({
	propTypes: {
		// from Redux
		state: React.PropTypes.object.isRequired,
		setScore: React.PropTypes.func.isRequired,

		// from Parent
		game: React.PropTypes.object.isRequired,
		team: React.PropTypes.object.isRequired,
		score: React.PropTypes.number
	},
	render: function () {
		return (
			<div className="scoreInput">
				{this.props.team.name} ({this.props.team.rank}) : <input type="text" onChange={e => this.props.setScore(this.props.game.id, this.props.team.id, e.target.value)} value={this.props.score === null ? '' : this.props.score}/><br/>
			</div>
		)
	}
});

// ==== Redux Connectors ==== //

const ConnectedRound = ReactRedux.connect(
	// map state to properties - put properties into the component
	(state) => { return {state: state} },

	// map dispatch to props - provides function-props to component that are a bridge for calling dispatch actions; object just calls this.props.trythis() instead of dispatch(actionmethod)
	(dispatch) => { return {} }
)(Round);

const ConnectedScoreDetail = ReactRedux.connect(
	// props for component
	(state) => { return {state: state} },

	// dispatchers for component
	(dispatch) => { return {} }
)(ScoreDetail);

const ConnectedScoreInput = ReactRedux.connect(
	// props for component
	(state) => { return {state: state} },

	// dispatchers as props for component
	(dispatch) => { return {
		setScore: (gameId, teamId, score) => {
console.log('setting score', gameId, teamId, score);
			const action = {type: globals.constants.ACTION_TYPES.SET_SCORE, payload: {gameId: gameId, score: parseInt(score, 10), teamId: teamId}};

			// redux
			dispatch(action);

			// server
			$.ajax({
				url: 'admin/game/setScore',
				method: 'post',
				data: csrf(action.payload),
				dataType: 'json',
				cache: false
			});
			console.error('ajax to the server the score change');
		}
	}}
)(ScoreInput);


// ==== setup Redux store ==== //

// for ease of use, combine teams in to one list
globals.data.teams = globals.data[globals.data.bracket.top_left_pool_id].teams
	.concat(globals.data[globals.data.bracket.bottom_left_pool_id].teams)
	.concat(globals.data[globals.data.bracket.top_right_pool_id].teams)
	.concat(globals.data[globals.data.bracket.bottom_right_pool_id].teams);

globals.constants.ACTION_TYPES = {SET_SCORE: 'SET_SCORE'};


/*
	action = {
		type: constant action name (required),
		error: error information (optional),
		payload: data for action (optional),
		meta: what else could you possibly want? (optional)
	}
 */
const reduce = (state, action) => {
	let reducers = {};

	// reducer: set score
	reducers[globals.constants.ACTION_TYPES.SET_SCORE] = (state, action) => {
		let newState = Object.assign({}, state);

		// if the game is the one wanted, update its score
		const updateGame = g => {
			if (g.id == action.payload.gameId) {
				if (action.payload.teamId == g.pool_entry_1_id) {
					g.pool_entry_1_score = action.payload.score;
				} else {
					g.pool_entry_2_score = action.payload.score;
				}
			}
		};

		// games are hidden throughout state (probably would've been cleaner to have a gmaes list and ids of games in the locations)
		const keys = [newState.bracket.bottom_left_pool_id, newState.bracket.top_left_pool_id, newState.bracket.bottom_right_pool_id, newState.bracket.top_right_pool_id, 'finals'];
		keys.forEach(k => Object.keys(newState[k].games).forEach(roundKey => newState[k].games[roundKey].forEach(game => updateGame(game))));

		return newState;
	};

	// get reducer requested
	const func = reducers[action.type];

	// ignore internal actions; error on unknown actions
	if (!func && action.type.indexOf('@@') !== 0) {
		console.error('unknown reducer action:', action.type, action)
	}

	// DO IT!
	return func ? func(state, action) : state;
};

ReactDOM.render(<ReactRedux.Provider store={Redux.createStore(reduce, globals.data)}><Scores/></ReactRedux.Provider>, document.getElementById('scores'));
