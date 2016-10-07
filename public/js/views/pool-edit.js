var PoolForm = React.createClass({
	getInitialState: function() {
		return {
			poolId: this.props.initialPoolId,
			pool: {
				id: false,
				name: '',
				closing_date: '',
				open_date: '',
				teams: []
			},
			saveState: SaveButtonStates.noChanges
		};
	},
	componentDidMount: function (nextState) {
		if (this.state.poolId) {
			$.ajax({
				url: 'admin/pool/load/' + this.state.poolId,
				method: 'post',
				data: csrf(),
				dataType: 'json',
				cache: false,
				success: function(data) {
					this.state.teams = data.teams;
					delete data.teams;
					this.state.pool = data;
					this.state.saveState = nextState === undefined ? SaveButtonStates.noChanges : nextState;
					this.setState(this.state);
				}.bind(this)
			});

		}
	},
	poolInputChanged: function (event) {
		// get data type attribute
		var dataType = event.target.dataset['datatype'];

		// set state's pool's data type field
		this.state.pool[dataType] = event.target.value;

		this.state.saveState = SaveButtonStates.save;

		// set state
		this.setState(this.state);
	},
	buttonPressed: function (event) {
		switch (event.target.dataset['button']) {
			case 'save':
				this.state.saveState = SaveButtonStates.saving;
				this.setState(this.state);
				$.ajax({
					url: 'pools/' + this.state.pool.id,
					method: 'post',
					data: csrf({pool: JSON.stringify(this.state.pool)}),
					dataType: 'json',
					cache: false,
					success: function(data) {
						this.state.saveState = SaveButtonStates.saved;
						this.setState(this.state);
					}.bind(this)
				});
				break;
			case 'cancel':
				this.componentDidMount(SaveButtonStates.noChanges);
				break;
			default:
				console.error('Unknown button type:' + event.target.dataset['button']);
				break;
		}
	},
	render: function() {
		var ranks = [];
		for (var x = 1; x <= 16; x++) {
			ranks.push(<div key={x} className="listRow">{x <= 16 ? x : ''}</div>);
		}
		var teams = [];
		if (this.state.teams && this.state.teams.length) {
			teams = this.state.teams.map(team =>
				<div key={team.id} className="listRow" data-teamid={team.id}>{team.name} <span className="teamVotes">{team.votes > 0 ? team.votes + ' vote' + (team.votes > 1 ? 's' : '') : ''}</span></div>
			);
		}

		return (

			<div className="container">
				<div className="row">
					<div className="col-md-10 col-md-offset-1">
						<div className="panel panel-default">
							<div className="panel-heading h3">
								<div className="form-group">
									<ControlledInputText onChange={this.poolInputChanged} className="center-text h4" dataAttribs={{'data-datatype':'name'}} placeholder='Conference Name' initialValue={this.state.pool.name ? this.state.pool.name : ''}/>
								</div>
								<div className="subtitle">
									<div className="dataNugget form-group"><label>Open Date:</label><ControlledInputText onChange={this.poolInputChanged} dataAttribs={{'data-datatype':'open_date'}} placeholder='YYYY-MM-DD' initialValue={defaultString(this.state.pool.open_date, '')}/></div>
									<div className="dataNugget form-group"><label>Close Date:</label><ControlledInputText onChange={this.poolInputChanged} dataAttribs={{'data-datatype':'closing_date'}} placeholder='YYYY-MM-DD' initialValue={defaultString(this.state.pool.closing_date, '')}/></div>
								</div>
								<div className="form-buttons-div form-group">
									<SaveCancelButtons saveState={this.state.saveState} dataButton="save" buttonPressedCallback={this.buttonPressed}/>
								</div>
							</div>
							<div className="panel-body">
								<div className="poolContainer">
									<div className="ranksContainer">{ranks}</div>
									<div className="teamsContainer">{teams}</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

		);
	}
});

// this is a controlled input text field; its state is stored by the parent and the parent is told when to change through the onchange callback
var ControlledInputText = React.createClass({
	propTypes: {
		// callback when value changes
		onChange: React.PropTypes.func.isRequired,
		// map of data attributes to add to the input: ie data-datetype
		dataAttribs: React.PropTypes.object,
		// classNames to put on the input
		className: React.PropTypes.string,
		// placeholder text
		placeholder: React.PropTypes.string,
		// start value in the input
		initialValue: React.PropTypes.string.isRequired
	},
	componentDidMount: function () {
		// http://stackoverflow.com/questions/31273093/how-to-add-custom-html-attributes-in-jsx
		if (this.props.dataAttribs) {
			var ref = this.refs.myInput;
			Object.keys(this.props.dataAttribs).forEach(key => ref.setAttribute(key, this.props.dataAttribs[key]));
		};
	},
	render: function () {
		var dataAttribStr = '';
		if (this.dataAttribs) {
			dataAttribStr = Object.keys(this.dataAttribs).reduce((output, key) => output + ' ' + 'key="' + this.dataAttribs[key] + '"', '');
		}
		return <input ref="myInput" onChange={this.props.onChange} className={'form-control ' + this.props.className} placeholder={this.props.placeholder} type="text" value={this.props.initialValue}/>
	}
});

var PoolList = React.createClass({
	getInitialState: function() {
		return {
			teams: this.props.initialTeams
		};
	},

	handleAddTeam: function(e) {
		e.preventDefault();
		var teamName = prompt('Enter new team\'s name:');
		if (teamName) {
			var teams = this.state.teams;
			teams.push({
				id: 0,
				name: teamName,
				votes: 0
			});
			this.setState({teams: teams});
		}
	},

	render: function() {
		var teamNodes = this.state.teams.map(function(team) {
			return (
				<Team name={team.name} votes={team.votes} key={team.id ? team.id : team.name} />
			);
		});
		return (
			<div className="teams-container">
				<div className="add-record-container">
					<a href="#" onClick={this.handleAddTeam}>Add Team</a>
				</div>
				<div className="teamsList">
				{teamNodes}
				</div>
			</div>
		);
	}

});

var Team = React.createClass({
	getInitialState: function() {
		return {
		}
	},
	render: function() {
		return (
			<div>{this.props.name} - {this.props.votes}</div>
		);
	}
});

ReactDOM.render(
	<PoolForm initialPoolId={globals.poolId}/>,
	document.getElementById('pool-form')
);
