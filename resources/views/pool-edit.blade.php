@extends('layouts.app')

@section('content')
    <script>
        globals.poolId = <?=$poolId?>;
    </script>

    <div id="pool-form"></div>

    <script type="text/babel" src="js/views/pool-edit.js"></script>

@endsection
