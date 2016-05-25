@extends('layouts.app')

@section('content')
    <script>
        globals.data = <?echo $data?>;
    </script>

    <div id="bracketScoresContainer"></div>

    <script type="text/babel" src="js/views/bracket-scores.js"></script>

@endsection
