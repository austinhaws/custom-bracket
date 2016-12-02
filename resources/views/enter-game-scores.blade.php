@extends('layouts.app')

@section('content')
    <div class="bracket-form">
        <div class="panel panel-default">
            <div class="panel-heading">Played Game Scores</div>
            <div class="panel-body">
                <div id="scores" class="bracket-form"></div>
            </div>
        </div>
    </div>

    <script>
        globals.data = <?=$data?>;
    </script>

    <script src="js/vendor/redux.js"></script>
    <script src="js/vendor/react-redux.min.js"></script>
    <script type="text/babel" src="js/components/saveButton.js"></script>
    <script type="text/babel" src="js/views/enter-game-scores.js"></script>

@endsection
