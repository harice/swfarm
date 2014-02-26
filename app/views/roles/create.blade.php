@section('content')

<div class="row">
	<div class="col-md-12">
		<ol class="breadcrumb">
			<li><a href="#">Dashboard</a></li>
			<li><a href="#">Role</a></li>
			<li class="active">Add</li>
		</ol>
	</div>
</div>

<div class="row">
	<div class="col-md-12">
		<div class="page-header">
		  <h1>Role <small>Add</small></h1>
		</div>
	</div>
</div>

<div class="row">
	<div class="col-md-6">
		<form role="form" id="form-addrole" onsubmit="event.preventDefault();">
			<div class="form-group">
				<label for="rolesName">Role Name</label>
				<input type="text" class="form-control" id="rolename" placeholder="Enter role name">
			</div>
			<div class="form-group">
				<label for="rolesDescription">Description</label>
				<textarea class="form-control" rows="3" name="description" id="roledescription"></textarea>
			</div>
			<button type="submit" class="btn btn-default" name="submit-role">Create</button>
		</form>
	</div>
</div>

@stop