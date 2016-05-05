@extends('layouts.app')

@section('content')
    <script>
        globals.bracket = <?=$bracket?>;
    </script>

    <div id="bracket-form"></div>

    <script type="text/babel" src="js/views/bracket-edit.js"></script>

@endsection
