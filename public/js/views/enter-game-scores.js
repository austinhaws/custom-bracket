

// the form for entering name/dates for a bracket
var Scores = React.createClass({
	propTypes: {
		// redux
		state: React.PropTypes.object.isRequired,
		resetData: React.PropTypes.func.isRequired,
		setSaveState: React.PropTypes.func.isRequired
	},
	saveButtonPressed: function (e) {
		switch (e.target.dataset.button) {
			case 'cancel':
				this.props.resetData();
				break;
			case 'save':
				this.props.setSaveState(SaveButtonStates.saving);
				$.ajax({
					url: 'admin/game/setGameScores',
					method: 'post',
					data: csrf({games: this.props.state.games}),
					dataType: 'json',
					cache: false,
					success: () => {
						this.props.setSaveState(SaveButtonStates.saved);
					}
				});
				break;
			default:
				console.error('Unknown button type:' + event.target.dataset.button);
				break;
		}
	},
	render: function() {
		const rounds = ['First Round', 'Second Round', 'Sweet 16', 'Elite 8', 'Final 4', 'Championship'];
		let roundComponents = [];
		for (let x = 1; x <= 6; x++) {
			roundComponents.push(<ConnectedRound key={x} roundNumber={x} roundTitle={rounds[x - 1]}/>)
		}
		return (
			<div className="masterContainer">
				<SaveCancelButtons saveState={this.props.state.saveState} buttonPressedCallback={this.saveButtonPressed}/>
				<div id="roundsContainer">
					{roundComponents}
				</div>
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
		const detail = this.props.state.showRound[this.props.roundNumber] ? <div className="roundContainer">{games.map((gid, i) => <ConnectedScoreDetail key={i} gameId={gid}/>)}</div> : '';
			return (
			<div className="roundList">
				<div className="roundTitle">{this.props.roundTitle} <ConnectedShowHideRoundButton roundNumber={this.props.roundNumber}/></div>
				{detail}
			</div>
		);
	}
});

var ScoreDetail = React.createClass({
	propTypes: {
		// redux
		state: React.PropTypes.object.isRequired,

		// parent
		gameId: React.PropTypes.number.isRequired
	},
	render: function () {
		const game = this.props.state.games[this.props.gameId];
		const team1 = this.props.state.teams[game.pool_entry_1_id];
		const team2 = this.props.state.teams[game.pool_entry_2_id];
		var detail;
		if (team1 && team2) {
			detail = (
				<div className="scoreDetail">
					<ConnectedScoreInput key="1" game={game} team={team1} score={game.pool_entry_1_score}/>
					<ConnectedScoreInput key="2" game={game} team={team2} score={game.pool_entry_2_score}/>
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
				(<span className="rank">{this.props.team.rank}</span>) {this.props.team.name} : <input type="text" onChange={e => this.props.setScore(this.props.game.id, this.props.team.id, e.target.value)} value={this.props.score === null ? '' : this.props.score}/><br/>
				<div className="roll">{this.props.state.rolls[this.props.team.rank]}</div>
			</div>
		)
	}
});

const ShowHideRoundButton = React.createClass({
	propTypes: {
		// redux
		state: React.PropTypes.object.isRequired,
		showRound: React.PropTypes.func.isRequired,

		// parent
		roundNumber: React.PropTypes.number.isRequired
	},
	render: function () {
		return (
			<button className="btn-default btn" data-round={this.props.roundNumber} onClick={() => this.props.showRound(this.props.roundNumber, !this.props.state.showRound[this.props.roundNumber])}>
				{this.props.state.showRound[this.props.roundNumber] ? 'Hide' : 'Show'}
			</button>
		);
	}
});

// ==== Redux Connectors ==== //

const ConnectedScores = ReactRedux.connect(
	(state) => {return {state: state} },
	(dispatch) => { return {
		resetData: () => dispatch({type: globals.constants.ACTION_TYPES.RESET_DATA}),
		setSaveState: (saveState) => dispatch({type: globals.constants.ACTION_TYPES.SET_SAVE_STATE, payload: saveState})
	} }
)(Scores);

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
		setScore: (gameId, teamId, score) => dispatch({type: globals.constants.ACTION_TYPES.SET_SCORE, payload: {gameId: gameId, score: score ? parseInt(score, 10) : '', teamId: teamId}})
	}}
)(ScoreInput);

const ConnectedShowHideRoundButton = ReactRedux.connect(
	(state) => { return {state: state} },
	(dispatch) => { return {
		showRound: (roundNumber, isShown) => dispatch({type: globals.constants.ACTION_TYPES.ROUND_SHOWN, payload: {roundNumber: roundNumber, isShown: isShown}})
	}}
)(ShowHideRoundButton);


// ==== setup Redux store ==== //

// for ease of use, combine teams in to one list (with id idx)
globals.data.teams = globals.data[globals.data.bracket.top_left_pool_id].teams
	.concat(globals.data[globals.data.bracket.bottom_left_pool_id].teams)
	.concat(globals.data[globals.data.bracket.top_right_pool_id].teams)
	.concat(globals.data[globals.data.bracket.bottom_right_pool_id].teams)
	.reduce((teams, team) => {
		teams[team.id] = team;
		return teams;
	}, []);
globals.data.saveState = SaveButtonStates.noChanges;
globals.data.showRound = {1: true, 2: true, 3: true, 4: true, 5: true, 6: true};
globals.constants.ACTION_TYPES = {
	SET_SCORE: 'SET_SCORE',
	RESET_DATA: 'RESET_DATA',
	SET_SAVE_STATE: 'SET_SAVE_STATE',
	ROUND_SHOWN: 'ROUND_SHOWN'
};
globals.originalData = JSON.parse(JSON.stringify(globals.data));

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

	const copyState = (state) => Object.assign({}, state);

	// reducer: set score
	reducers[globals.constants.ACTION_TYPES.SET_SCORE] = (state, action) => {
		let newState = copyState(state);

		// update game
		let game = state.games[action.payload.gameId];
		if (action.payload.teamId == game.pool_entry_1_id) {
			game.pool_entry_1_score = action.payload.score;
		} else {
			game.pool_entry_2_score = action.payload.score;
		}

		// update dependent games
		(function supplyDependentTeams(game) {
			if (game.pool_entry_1_score && game.pool_entry_2_score) {
				let winner_entry_id = game.pool_entry_1_score > game.pool_entry_2_score ? game.pool_entry_1_id : game.pool_entry_2_id;
				if (winner_entry_id) {
					const games = Object.values(newState.games);
					let prevGame1 = games.filter(g => g.prev_bracket_game_1_id == game.id);
					let prevGame2 = games.filter(g => g.prev_bracket_game_2_id == game.id);
					if (prevGame1.length) {
						prevGame1[0].pool_entry_1_id = winner_entry_id;
						prevGame1[0].pool_entry_1_rank = newState.teams[winner_entry_id].rank;
						supplyDependentTeams(prevGame1[0]);
					}
					if (prevGame2.length) {
						prevGame2[0].pool_entry_2_id = winner_entry_id;
						supplyDependentTeams(prevGame2[0]);
					}
				}
			}
		})(game);

		newState.saveState = SaveButtonStates.save;

		return newState;
	};

	// reducer: reset data
	reducers[globals.constants.ACTION_TYPES.RESET_DATA] = (state, action) => {
		return JSON.parse(JSON.stringify(globals.originalData));
	};

	// reducer: save state
	reducers[globals.constants.ACTION_TYPES.SET_SAVE_STATE] = (state, action) => {
		let newState = copyState(state);
		newState.saveState = action.payload;
		return newState;
	};

	// reducer: show/hide round
	reducers[globals.constants.ACTION_TYPES.ROUND_SHOWN] = (state, action) => {
		let newState = copyState(state);
		newState.showRound[action.payload.roundNumber] = action.payload.isShown;
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

ReactDOM.render(<ReactRedux.Provider store={Redux.createStore(reduce, globals.data)}><ConnectedScores/></ReactRedux.Provider>, document.getElementById('scores'));
