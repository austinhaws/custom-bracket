@extends('layouts.app')

@section('content')
    <div class="container">
        <div class="row">
            <div class="col-md-10 col-md-offset-1">
                <div class="panel panel-default">
                    <div class="panel-heading">Played Game Scores</div>

                    <div class="panel-body">
                        <div id="scores"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        globals.data = <?=$data?>;
    </script>

    <script src="js/vendor/redux.js"></script>
    <script src="js/vendor/react-redux.min.js"></script>
    <script type="text/babel" src="js/views/enter-game-scores.js"></script>

@endsection
