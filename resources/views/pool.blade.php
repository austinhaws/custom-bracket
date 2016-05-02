@extends('layouts.app')

@section('content')
    <script>
        globals.poolId = <?=$poolId?>;
    </script>

    <div id="poolBox"></div>

    <script type="text/babel" src="js/views/pool.js"></script>

    <link rel="stylesheet" href="css/views/pool.css">

@endsection
