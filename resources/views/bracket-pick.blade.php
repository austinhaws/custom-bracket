@extends('layouts.app')

@section('content')
    <script>
        globals.dataStore = {
              bracket: <? echo $bracket; ?>,
              games: <? echo $games; ?>,
              pools: <? echo $pools; ?>,
              teams: <? echo $teams; ?>
        };
    </script>

    <div id="bracket-form"></div>

    <style>
        .bracket {
            display: flex;
            margin: 20px 0;
            justify-content: space-around;
        }
        .teams-list, .round-list {
            height: 400px;
            display: flex;
            justify-content: space-around;
            flex-direction: column;
        }
    </style>

    <script type="text/babel" src="js/views/bracket-pick.js"></script>

@endsection
