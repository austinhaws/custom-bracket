@extends('layouts.app')

@section('content')
    <script>
        globals.pool = <?=$pool?>;
    </script>

    <div id="pool-form"></div>

    <script type="text/babel" src="js/views/pool-edit.js"></script>

@endsection
