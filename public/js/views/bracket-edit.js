// the form for entering name/dates for a bracket
var BracketForm = React.createClass({
	getInitialState: function() {
		return {
			bracket: this.props.initialBracket,
			rolls: this.props.initialRolls
		}
	},
	handleChange: function(e) {
		var nextState = {};
		nextState[e.target.name] = e.target.value;
		this.setState(nextState);
	},
	handleSubmit: function(e) {
		e.preventDefault();
		if (!this.state.bracket.name) {
			alert('Must have a name to continue');
		} else {
			$.ajax({
				url: 'admin/bracket/save',
				dataType: 'json',
				data: csrf(this.state),
				cache: false,
				method: 'post',
				success: function(data) {
					if (globals.bracket.id) {
						alert('Saved');
					} else {
						window.location = 'admin/bracket/' + data.id;
					}
				}.bind(this),
				error: function(xhr, status, err) {
					console.error(this.props.url, status, err.toString());
				}.bind(this)
			});
		}
	},
	scoreRound: function(e) {
		e.preventDefault();
		window.location = ['admin/bracket/score', this.state.bracket.id, e.target.dataset.round].join('/');
	},
	rankRollChnage: function(e) {
		var rolls = this.state.rolls;
		rolls.forEach(function(roll) {
			if (roll.rank == e.target.dataset.rank) {
				roll.roll = e.target.value;
			}
		});
		this.setState({rolls: rolls});
	},
	poolChange: function(e) {
		var newState = {};
		newState[e.target.id] = e.target.value;
		this.setState(newState);
	},
	render: function() {
		var that = this;
		function rollForRank(rank) {
			var returnBracketRoll = that.props.initialRolls.filter(function(bracketRoll) {
				return bracketRoll.rank == rank;
			});
			return returnBracketRoll.length ? returnBracketRoll[0].roll : '';
		}
		var includeScoreButtons = this.state.bracket.id;

		var bracketRolls = [];
		for (var i = 0; i < 16; i++) {
			bracketRolls.push(
				<BracketRoll key={i} rank={i + 1} roll={rollForRank(i + 1)} handleChange={this.rankRollChnage}/>
			);
		}
		return (
			<form>
				<input type="hidden" name="bracketId" value={this.state.bracket.id}/>

				<InputField fieldId="name" title="Name" placeholder="" value={this.state.bracket.name} handleChange={this.handleChange}/>
				<InputField fieldId="open_date" title="Open Date" placeholder="YYYY-MM-DD" value={this.state.bracket.open_date} handleChange={this.handleChange}/>

				<InputField fieldId="first_round_date" title="First Round Date" placeholder="YYYY-MM-DD" value={this.state.bracket.first_round_date} handleChange={this.handleChange}/>
				{includeScoreButtons ? <button onClick={this.scoreRound} data-round="1">Score Round 1</button>  : null}

				<InputField fieldId="second_round_date" title="Second Round Date" placeholder="YYYY-MM-DD" value={this.state.bracket.second_round_date} handleChange={this.handleChange}/>
				{includeScoreButtons ? <button onClick={this.scoreRound} data-round="2">Score Round 2</button>  : null}

				<InputField fieldId="third_round_date" title="Third Round Date (Sweet 16)" placeholder="YYYY-MM-DD" value={this.state.bracket.third_round_date} handleChange={this.handleChange}/>
				{includeScoreButtons ? <button onClick={this.scoreRound} data-round="3">Score Round 3  (Sweet 16)</button>  : null}

				<InputField fieldId="fourth_round_date" title="Fourth Round Date (Elite 8)" placeholder="YYYY-MM-DD" value={this.state.bracket.fourth_round_date} handleChange={this.handleChange}/>
				{includeScoreButtons ? <button onClick={this.scoreRound} data-round="4">Score Round 4 (Elite 8)</button>  : null}

				<InputField fieldId="fifth_round_date" title="Fifth Round Date (Final Four)" placeholder="YYYY-MM-DD" value={this.state.bracket.fifth_round_date} handleChange={this.handleChange}/>
				{includeScoreButtons ? <button onClick={this.scoreRound} data-round="5">Score Round 5 (Final Four)</button>  : null}

				<InputField fieldId="sixth_round_date" title="Sixth Round Date (Championship)" placeholder="YYYY-MM-DD" value={this.state.bracket.sixth_round_date} handleChange={this.handleChange}/>
				{includeScoreButtons ? <button onClick={this.scoreRound} data-round="6">Score Round 6 (Championship)</button>  : null}

				<PoolPicker fieldName="Top Left Pool" fieldId="top_left_pool_id" pools={this.props.pools} poolChange={this.poolChange} value={this.state.bracket.top_left_pool_id ? this.state.bracket.top_left_pool_id : ''}/>
				<PoolPicker fieldName="Bottom Left Pool" fieldId="bottom_left_pool_id" pools={this.props.pools} poolChange={this.poolChange} value={this.state.bracket.bottom_left_pool_id ? this.state.bracket.bottom_left_pool_id : ''}/>
				<PoolPicker fieldName="Top Right Pool" fieldId="top_right_pool_id" pools={this.props.pools} poolChange={this.poolChange} value={this.state.bracket.top_right_pool_id ? this.state.bracket.top_right_pool_id : ''}/>
				<PoolPicker fieldName="Bottom Right Pool" fieldId="bottom_right_pool_id" pools={this.props.pools} poolChange={this.poolChange} value={this.state.bracket.bottom_right_pool_id ? this.state.bracket.bottom_right_pool_id : ''}/>

				<h2>Roll for Each Rank</h2>
				{bracketRolls}

				<span id="info-blurb">
					After the 'Open Date' people can predict which teams will win in the bracket.<br/>
					After the 'First Round Date' people can no longer predict teams, games start.<br/>
					Bad things happen if you change pools after going to a game scoring page (games will have old teamids from previous pool).<br/>
					Bad things happen if you use the same pool more than once for a bracket (games get teamids mixed up).<br/>
				</span>

				<button onClick={this.handleSubmit}>Save</button>
			</form>
		);
	}
});

// an input field for the form
var InputField = React.createClass({
	render: function() {
		return (
			<div>
				<label for={this.props.fieldId}>{this.props.title}:</label><input type="text" id={this.props.fieldId} name={this.props.fieldId} placeholder={this.props.placeholder} defaultValue={this.props.value} onChange={this.props.handleChange}/>
			</div>
		);
	}
});

var PoolPicker = React.createClass({

	render: function() {
		var options = [
			<option key="0" value="0"></option>
		];
		this.props.pools.forEach(function(pool) {
			options.push(
				<option key={pool.id} value={pool.id}>{pool.name}</option>
			);
		});
		return (
			<div>
				<label for={this.props.fieldId}>{this.props.fieldName}</label>
				<select value={this.props.value} id={this.props.fieldId} onChange={this.props.poolChange} data-field={this.props.fieldId}>{options}</select>
			</div>
		);
	}
});

var BracketRoll = React.createClass({
	render: function() {
		return (
			<div>
				<span>{this.props.rank}</span> <input name={'roll-' + this.props.rank} type="text" defaultValue={this.props.roll} onChange={this.props.handleChange} data-rank={this.props.rank}/>
			</div>
		);
	}
});


ReactDOM.render(
	<BracketForm initialBracket={globals.bracket} pools={globals.pools} initialRolls={globals.rolls}/>,
	document.getElementById('bracket-form')
);
