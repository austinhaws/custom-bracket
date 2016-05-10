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

@endsection
