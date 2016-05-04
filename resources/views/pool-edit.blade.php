@extends('layouts.app')

@section('content')
    <script>
        globals.pool = <?=$pool?>;
    </script>

    <div id="pool-form"></div>

    <span id="info-blurb">
        After the 'Open Date' people can pick which teams in a pool will be in the bracket as well as enter new teams.<br/>
        After the 'Close Date' people can no longer pick teams nor enter new teams and the pool is ready to be used in a bracket.
    </span>

    <script type="text/babel" src="js/views/pool-edit.js"></script>

@endsection
