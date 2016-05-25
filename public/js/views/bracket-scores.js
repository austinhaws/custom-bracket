var BracketScores = React.createClass({
	render: function() {
		var teams = this.props.data.pools[0].teams.concat(this.props.data.pools[1].teams.concat(this.props.data.pools[2].teams.concat(this.props.data.pools[3].teams.concat())));

		// group games in to users
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
		return (
			<div>your bracket goes here</div>
		);
	}
});

ReactDOM.render(
	<BracketScores data={globals.data}/>,
	document.getElementById('bracketScoresContainer')
);
