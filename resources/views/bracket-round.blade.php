@extends('layouts.app')

@section('content')
    <script>
        globals.bracket = <?=$bracket?>;
        globals.pools = <?=$pools?>;
        globals.games = <?=$games?>;
        globals.round = <?=$round?>;
    </script>

    <div id="bracket-round"></div>

    <script type="text/babel" src="js/views/bracket-round.js"></script>
    <style>
        #bracket-round {
            width: 400px;
            margin: 0 auto;
        }
        .game {
            border: 1px solid #222;
            border-radius: 13px;
            box-shadow: black 1px 1px;
            padding: 10px;
            margin: 0 0 25px 0;
            background-color: #f5fff8;
        }
        .team {
            overflow: auto;
        }
        .team:first-child {
            margin: 0 0 15px 0;
        }
        .team .team-name {
            line-height: 30px;
            text-align: right;
            width: 50%;
            float: left;
            margin: 0 10px 0 0;
        }
        .team input {
            float: left;
            width: 45%;
        }
    </style>

@endsection
