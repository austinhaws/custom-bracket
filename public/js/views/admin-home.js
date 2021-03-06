var PoolsBox = React.createClass({
	getInitialState: function() {
		return {
			pools: [],
			saveState: SaveButtonStates.noChanges
		};
	},
	componentDidMount: function() {
		$.ajax({
			url: 'pool/list',
			dataType: 'json',
			cache: false,
			success: function(data) {
				this.setState({pools: data, saveState: SaveButtonStates.noChanges});
			}.bind(this)
		});
	},
	poolDateChanged: function (event) {
		var poolId = event.target.dataset.poolid;
		var newDate = event.target.value;
		var dateType = event.target.dataset.datetype;

		var pool = this.state.pools.find(p => p.id == poolId);
		pool[dateType] = newDate;

		this.state.saveState = SaveButtonStates.save;

		this.setState(this.state);

		// toggle save/cancel button status
	},
	buttonPressed: function (event) {
		switch (event.target.dataset.button) {
			case 'cancel':
				this.componentDidMount();
				break;
			case 'save':
				this.state.saveState = SaveButtonStates.saving;
				this.setState(this.state);
				$.ajax({
					url: 'admin/pool/savePools',
					method: 'post',
					data: csrf({pools: JSON.stringify(this.state.pools)}),
					dataType: 'json',
					cache: false,
					success: function(data) {
						this.state.saveState = SaveButtonStates.saved;
						this.setState(this.state);
					}.bind(this)
				});
				break;
			default:
				console.error('Unknown button type:' + event.target.dataset.button);
				break;
		}
	},
	viewTeams: function (pool) {
		window.location = 'admin/pool/' + pool.id;
	},
	render: function() {
		var that = this;
		var poolEdits = this.state.pools.map(function (pool) {
			return (
				<tr key={pool.id}>
					<td>{pool.name}</td>
					<td><input onChange={that.poolDateChanged} data-datetype="open_date" data-poolid={pool.id} className="form-control" placeholder="YYYY-MM-DD" type="text" value={pool.open_date ? pool.open_date : ''}/></td>
					<td><input onChange={that.poolDateChanged} data-datetype="closing_date" data-poolId={pool.id} className="form-control closingDate" placeholder="YYYY-MM-DD"  type="text" value={pool.closing_date ? pool.closing_date : ''}/></td>
					<td><button className="view-pool-teams btn-info btn" onClick={() => that.viewTeams(pool)}>View Teams</button></td>
				</tr>
			);
		});

		return (
			<div className="poolsBox inputTable">
				<table id="poolsList">
					<thead>
						<tr><th /><th>Open Date</th><th>Close Date</th></tr>
					</thead>
					<tbody>
						{poolEdits}
					</tbody>
					<tfoot>
						<tr><td colSpan="100">
							<SaveCancelButtons saveState={this.state.saveState} dataButton="save" buttonPressedCallback={this.buttonPressed}/>
						</td></tr>
					</tfoot>
				</table>
			</div>
		);
	}
});

var BracketBox = React.createClass({
	// for now, only one bracket, can add more if this gets loved
	getInitialState: function() {
		return {
			bracket: false,
			rolls: false,
			rollsSaveState: SaveButtonStates.noChanges,
			bracketSaveState: SaveButtonStates.noChanges
		};
	},
	componentDidMount: function(resetType) {
		$.ajax({
			url: 'bracket/list',
			dataType: 'json',
			cache: false,
			success: function(data) {
				delete data.pools;
				var rolls = data.rolls;
				delete data.rolls;
				this.setState({
					bracket: (!resetType || resetType == 'bracket') ? data : this.state.bracket,
					rolls: (!resetType || resetType == 'rolls') ? rolls : this.state.rolls,
					bracketSaveState: resetType == 'bracket' ? SaveButtonStates.noChanges : this.state.bracketSaveState,
					rollsSaveState: resetType == 'rolls' ? SaveButtonStates.noChanges : this.state.rollsSaveState
				});
			}.bind(this)
		});
	},
	buttonPressed: function (event) {
		switch (event.target.dataset.button) {
			case 'scores':
				window.location = 'admin/enterScores';
				break;
			case 'cancelDates':
				this.componentDidMount('bracket');
				break;
			case 'saveDates':
				this.state.bracketSaveState = SaveButtonStates.saving;
				this.setState(this.state);
				$.ajax({
					url: 'admin/bracket/save',
					method: 'post',
					data: csrf({bracket: this.state.bracket}),
					dataType: 'json',
					cache: false,
					success: function(data) {
						this.state.bracketSaveState = SaveButtonStates.saved;
						this.setState(this.state);
					}.bind(this)
				});
				break;
			case 'saveRolls':
				this.state.rollsSaveState = SaveButtonStates.saving;
				this.setState(this.state);
				$.ajax({
					url: 'admin/bracket/save',
					method: 'post',
					data: csrf({rolls: this.state.rolls}),
					dataType: 'json',
					cache: false,
					success: function(data) {
						this.state.rollsSaveState = SaveButtonStates.saved;
						this.setState(this.state);
					}.bind(this)
				});
				break;
			case 'cancelRolls':
				this.componentDidMount('rolls');
				break;
			default:
				console.error('Unknown button type:' + event.target.dataset.button);
				break;
		}
	},
	bracketDateChanged: function (event) {
		var newDate = event.target.value;
		var dateType = event.target.dataset.datetype;
		this.state.bracket[dateType] = newDate;
		this.state.bracketSaveState = SaveButtonStates.save;
		this.setState(this.state);
	},
	bracketRollChanged: function (event) {
		var newRoll = event.target.value;
		var rank = event.target.dataset.rank;
		this.state.rolls[+rank - 1].roll = newRoll;
		this.state.rollsSaveState = SaveButtonStates.save;
		this.setState(this.state);
	},
	render: function() {
		var rollInputs = [];
		var dateInputs = [];
		if (this.state.bracket) {
			var that = this;
			dateInputs = [
				['open_date', 'Bracket Opens for Picks'],
				['first_round_date_day_1', 'First Round (Day 1)'],
				['first_round_date_day_2', 'First Round (Day 2)'],
				['second_round_date', 'Second Round'],
				['third_round_date', 'Sweet Sixteen'],
				['fourth_round_date', 'Elite Eight'],
				['fifth_round_date', 'Final Four'],
				['sixth_round_date', 'Pandimensional Champion']
			].map(function (o) {
				return (
					<tr key={o[0]}>
						<td>{o[1]}</td>
						<td><input onChange={that.bracketDateChanged} data-datetype={o[0]} className="form-control" placeholder="YYYY-MM-DD" type="text" value={that.state.bracket[o[0]] ? that.state.bracket[o[0]] : ''}/></td>
					</tr>
				);
			});

			rollInputs = this.state.rolls.map(roll => (
				<tr key={roll.id}>
					<td>{'Rank ' + roll.rank}</td>
					<td><input onChange={that.bracketRollChanged} data-rank={roll.rank} className="form-control" placeholder="0d0 + 0d0 - 0" type="text" value={roll.roll ? roll.roll : ''}/></td>
				</tr>
			));
		}
		return (
			<div className="bracketsBox inputTable">
				<table id="bracketTable">
					<thead>
						<tr>
							<th colSpan="100">Dates</th>
						</tr>
					</thead>
					<tbody>
						{dateInputs}
					</tbody>
					<tfoot>
						<tr><td colSpan="100">
							<SaveCancelButtons saveState={this.state.bracketSaveState} dataButtonSuffix="Dates" buttonPressedCallback={this.buttonPressed}/>
						</td></tr>
						<tr><td colSpan="100">
							<button id="enter-scores-button" className="btn btn-primary" data-button="scores" onClick={this.buttonPressed}>Enter Scores</button>
						</td></tr>
					</tfoot>
				</table>
				<table id="bracketRollsTable">
					<thead>
						<tr>
							<th colSpan="100">Rolls by Rank</th>
						</tr>
					</thead>
					<tbody>
						{rollInputs}
					</tbody>
					<tfoot>
						<tr><td colSpan="100">
							<SaveCancelButtons saveState={this.state.rollsSaveState} dataButtonSuffix="Rolls" buttonPressedCallback={this.buttonPressed}/>
					</td></tr>
					</tfoot>
				</table>
			</div>
		);
	}
});

ReactDOM.render(<PoolsBox/>, document.getElementById('poolsBox'));
ReactDOM.render(<BracketBox/>, document.getElementById('bracketBox'));
