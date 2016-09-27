function PoolModel() {
	var data = {
		poolList: false,
		originalPoolList: false,
		eventHandlers: {},
		that: this
	};
	data.eventHandlers[PoolModel.Event_PoolListChanged] = [];

	// first parameter is the event constant type, the rest of the parameters are passed through to event callbacks
	function triggerEvent(...args) {
		data.eventHandlers[args[0]].forEach(f => f(...args.slice(1)));
	}

	this.addListener = function(listener, obj) {
		if (!(listener in data.eventHandlers)) {
			console.error('listener not recognized:' + listener);
		}
		data.eventHandlers[listener].push(obj);
	};


	// called to load the pools from the server
	this.loadPools = function() {
		$.ajax({
			url: 'pool/list',
			dataType: 'json',
			cache: false,
			success: function(data) {
				data.poolList = data;
				data.originalPoolList = data.concat();
				triggerEvent(PoolModel.Event_PoolListChanged, data.poolList, data.originalPoolList);
			}.bind(this)
		});
	};

}
PoolModel.Event_PoolListChanged = "poolListChanged";

var PoolsBox = React.createClass({
	propTypes: {
		// poolModel: React.PropTypes.object.required
	},
	getInitialState: function() {
		return {
			pools: [],
			startPools: []
		};
	},
	eventPoolsChanged: function (pools, origPools) {
		this.setState({pools: pools, startPools: origPools});
	},
	componentDidMount: function() {
		this.props.poolModel.addListener(PoolModel.Event_PoolListChanged, this.eventPoolsChanged);
		this.props.poolModel.loadPools();
	},
	poolDateChanged: function (event) {
		var poolId = event.target.dataset.poolid;
		var newDate = event.target.value;
		var dateType = event.target.dataset.datetype;

		var pool = this.state.pools.find(p => p.id == poolId);
		pool[dateType] = newDate;

		this.setState(this.state);

		// toggle save/cancel button status
	},
	buttonPressed: function (event) {
		switch (event.target.dataset.buttontype) {
			case 'cancel':
				this.setState({pools: this.state.startPools.concat([]), startPools: this.state.startPools});
				break;
			case 'save':
				$.ajax({
					url: 'admin/pool/savePools',
					method: 'post',
					data: csrf({pools: JSON.stringify(this.state.pools)}),
					dataType: 'json',
					cache: false,
					success: function(data) {
console.log(data);
						alert('Saved');
					}.bind(this)
				});
				break;
			default:
				console.error('Unknown button type:' + event.target.dataset.buttontype);
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
					<td><input onChange={that.poolDateChanged} data-datetype="open_date" data-poolid={pool.id} className="form-control" placeholder="YYYY-MM-DD" type="text" defaultValue={pool.open_date}/></td>
					<td><input onChange={that.poolDateChanged} data-datetype="closingd_date" data-poolId={pool.id} className="form-control closingDate" placeholder="YYYY-MM-DD"  type="text" defaultValue={pool.closing_date}/></td>
					<td><button className="view-pool-teams btn-info btn" onClick={() => that.viewTeams(pool)}>View Teams</button></td>
				</tr>
			);
		});

		return (
			<div class="poolsBox">
				<table id="poolsList">
					<thead>
						<tr><th /><th>Open Date</th><th>Close Date</th></tr>
					</thead>
					<tbody>
						{poolEdits}
					</tbody>
					<tfoot>
						<tr><td colSpan="100">
							<button type="button" className="btn btn-default" data-buttonType="cancel" onClick={this.buttonPressed}>Cancel</button>
							<button type="button" className="btn btn-primary" data-buttontype="save" onClick={this.buttonPressed}>Save</button>
						</td></tr>
					</tfoot>
				</table>
			</div>
		);
	}
});

console.error('need to show bracket in its box');
var BracketsBox = React.createClass({
	getInitialState: function() {
		return {
			brackets: []
		};
	},
	componentDidMount: function() {
		$.ajax({
			url: 'bracket/list',
			dataType: 'json',
			cache: false,
			success: function(data) {
				this.setState({brackets: data});
			}.bind(this),
		});
	},
	render: function() {
		var bracketNodes = this.state.brackets.map(function(bracket) {
			return (
				<Bracket bracket={bracket} key={bracket.id}/>
			);
		});

		return (
		<div>
			<div>
				<a href="admin/bracket/add">Add New Bracket</a>
			</div>
			<div>
				{bracketNodes}
			</div>
		</div>
		);
	}
});

var Bracket = React.createClass({
	render: function() {
		return (
		<div className="bracket">
			<h2>
			<a href={'admin/bracket/' + this.props.bracket.id}>{this.props.bracket.name}</a> <span className="dates"> {poolDateString(this.props.bracket.open_date, this.props.bracket.first_round_date)}</span>
		</h2>
		</div>
		)
	}
});


ReactDOM.render(
	<div>
		<PoolsBox poolModel={new PoolModel()}/>
	</div>
	,
	document.getElementById('poolsBox')
);
