<?php
 
class UsersRepository implements UsersRepositoryInterface {

  public function findById($id){
  	$user = User::with('roles')->find($id);
    
    if($user){
      $response = Response::json(
        $user,
        200
      );
    } else {
      $response = Response::json(array(
        'error' => true,
        'message' => "User not found"),
        200
      );
    }

    return $response;
    
  }

  public function findAll(){
  	return User::where('id', '!=', 1)->get(); //exclude the super admin
  }


  public function paginate($data){
    $perPage = isset($data['perpage']) ? $data['perpage'] : Config::get('constants.USERS_PER_LIST'); //default to 10 items, see app/config/constants
    $page = isset($data['page']) ? $data['page'] : '1'; //default to page 1
    $sortby = isset($data['sortby']) ? strtolower($data['sortby']) : 'lastname'; //default sort to lastname
    $orderby = isset($data['orderby']) ? strtolower($data['orderby']) : 'asc'; //default order is Ascending
    $offset = $page*$perPage-$perPage;

    $errorMsg = null;
    //check if input pass are valid
    if(!($sortby == 'firstname' || $sortby == 'lastname' || $sortby == 'email')){
      $errorMsg = 'Sort by category not found.';
    } else if(!($orderby == 'asc' || $orderby == 'desc')){
      $errorMsg = 'Order by category not found(ASC or DESC expected).';
    } else {
      //pulling of data
      $count = User::where('id', '!=', 1)->count();
      $usersList = User::with('roles')->where('id', '!=', 1)->take($perPage)->offset($offset)->orderBy($sortby, $orderby)->get();

      $response = Response::json(array(
        'data'=>$usersList->toArray(),
        'total'=>$count
      ));
    }

    if($errorMsg){
      $response = Response::json(array(
        'error' => true,
        'message' => $errorMsg),
        200
      );
    }

    return $response;
    
  }

  public function store($data){

    $rules = array(
      //'password' => 'required|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/|between:8,15|confirmed',
      //'password_confirmation' => 'required|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/|between:8,15',
      'email' => 'required|email|unique:users',
      'firstname' => 'required|between:2,50',
      'lastname' => 'required|between:2,50',
      'emp_no' => 'required|unique:users',
      'suffix' => 'between:2,6',
      'phone' => 'between:14,14',
      'mobile' => 'between:14,14',
      'position' => 'between:2,50',
      'profileimg' => 'image|max:3000'
    );

  	$this->validate($data, $rules);
   
  	$user = new User;
  	$user->email = $data['email'];
  	$user->firstname = $data['firstname'];
  	$user->lastname = $data['lastname'];
  	$user->suffix = isset($data['suffix']) ? $data['suffix'] : null;
  	$user->emp_no = $data['emp_no'];
  	$user->mobile = isset($data['mobile']) ? $data['mobile'] : null;
  	$user->phone = isset($data['phone']) ? $data['phone'] : null;
  	$user->position = isset($data['position']) ? $data['position'] : null;
    $generatedPassword = Str::random(10); //replace with this if the system has already email to user features - Hash::make(Str::random(10));
    $user->confirmcode = Hash::make(Str::random(5)); //use for email verification
    $user->password = Hash::make($generatedPassword);
    
    //saving profile image
    $isImgSave = $this->saveImage($data);

    if(is_array($isImgSave)) {
      return Response::json(
          $isImgSave,
          200
      );
    } else { //save successfully
        $user->profileimg = $isImgSave;
    }

    $user->save();

    //send email verification
    $emailStatus = $this->sendEmailVerification($user, $generatedPassword);

    //saving user roles posted by client
    if(isset($data['roles']) && $data['roles'] != ''){
        $roleIds = explode(',', $data['roles']);
        Event::fire('user.roles',$roleIds);
    }

  	return Response::json(array(
  	    'error' => false,
        'message' => Lang::get('messages.success.created', array('entity' => 'User')),
        'emailStatus' => $emailStatus
        ),
  	    200
  	);
  }

  public function update($id, $data){
    $rules = array(
      //'password' => 'required|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/|between:8,15|confirmed',
      //'password_confirmation' => 'required|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/|between:8,15',
      'email' => 'required|email|unique:users,email,'.$id,
      'firstname' => 'required|between:2,50',
      'lastname' => 'required|between:2,50',
      'emp_no' => 'required|unique:users,emp_no,'.$id,
      'suffix' => 'between:2,6',
      'phone' => 'between:14,14',
      'mobile' => 'between:14,14',
      'position' => 'between:2,50'
    );


    $user = User::find($id); //get the user row

    if($user) {
      $this->validate($data, $rules);
      
      //$user->password = $data['password'];
      $user->email = $data['email'];
      $user->firstname = $data['firstname'];
      $user->lastname = $data['lastname'];
      $user->suffix = isset($data['suffix']) ? $data['suffix'] : null;
      $user->emp_no = $data['emp_no'];
      $user->mobile = isset($data['mobile']) ? $data['mobile'] : null;
      $user->phone = isset($data['phone']) ? $data['phone'] : null;
      $user->position = isset($data['position']) ? $data['position'] : null;

      //saving profile image
      if(isset($data['imagedata'])) {
        $isImgSave = $this->saveImage($data);

        if(is_array($isImgSave)) {
          return Response::json(
              $isImgSave,
              200
          );
        } else { //save successfully
            $user->profileimg = $isImgSave;
        }
      } else if(isset($data['imageremove'])){
        $user->profileimg = '';
      }
      $user->save();

      if(isset($data['roles'])){
        if($data['roles'] != ''){
          $roleIds = explode(',', $data['roles']);
          $sync = $user->roles()->sync($roleIds);
          $sync['user'] = $user;
          Event::fire('sync.roles',array($sync));
        } else {
          //remove all assign roles to user
          // $user->roles()->detach();
          Event::fire('sync.roles',array($user->roles()->detach()));
        }
      }

      $response = Response::json(array(
          'error' => false,
          'message' => Lang::get('messages.success.updated', array('entity' => 'User'))),
          200
      );
    } else {
      $response = Response::json(array(
          'error' => true,
          'message' => Lang::get('messages.notfound', array('entity' => 'User'))),
          200
      );
    }

    return $response;    
  }

  public function destroy($id){
    $user = User::find($id);

    if($user){
      $user->delete();

      $response = Response::json(array(
          'error' => false,
          'message' => Lang::get('messages.success.deleted', array('entity' => 'User'))),
          200
      );
    } else {
      $response = Response::json(array(
          'error' => true,
          'message' => Lang::get('messages.notfound', array('entity' => 'User'))),
          200
      );
    }

    return $response;
  }

  public function validate($data, $rules){
    $validator = Validator::make($data, $rules);

    if($validator->fails()) { 
    	throw new ValidationException($validator); 
    }
  }

  public function instance($data = array()){
    return new User($data);
  }

  public function auth() {
    $userroles = DB::table('userroles')->where('user','=', Auth::user()->id)->select('role')->get();

    $role_ids = array();
    $permission_ids = array();
    if(sizeof($userroles) > 0)
    {
      foreach ($userroles as $k) {
        $role_ids[] = intval($k->role);
      }

      $permission = DB::table('permission')->whereIn('role',$role_ids)->groupBy('permissioncategorytype')->select('permissioncategorytype')->get();
      if(sizeof($permission) > 0) {
        foreach ($permission as $k) {
          $permission_ids[] = intval($k->permissioncategorytype);
        }
      }
    }

    $user['id'] = Auth::user()->id;
    $user['firstname'] = Auth::user()->firstname;
    $user['lastname'] = Auth::user()->lastname;
    $user['suffix'] = Auth::user()->suffix;

    return Response::json(array(
          'user' => $user,
          'permission' => $permission_ids),
          200
      );
  }

  public function search($_search)
  {
    $perPage  = isset($_search['perpage']) ? $_search['perpage'] : Config::get('constants.USERS_PER_LIST');
    $page     = isset($_search['page']) ? $_search['page'] : 1;
    $sortby   = isset($_search['sortby']) ? $_search['sortby'] : 'lastname';
    $orderby  = isset($_search['orderby']) ? $_search['orderby'] :'ASC';
    $offset   = $page * $perPage - $perPage;

    $_cnt = User::with('roles')->where('firstname','like','%'.$_search['search'].'%')
                    ->orWhere('lastname','like','%'.$_search['search'].'%')
                    ->orWhere('email','like','%'.$_search['search'].'%')
                    ->where('id', '!=', 1)
                    ->count();

    $_user = User::with('roles')->where('firstname','like','%'.$_search['search'].'%')
                    ->orWhere('lastname','like','%'.$_search['search'].'%')
                    ->orWhere('email','like','%'.$_search['search'].'%')
                    ->where('id', '!=', 1)
                    ->take($perPage)
                    ->offset($offset)
                    ->orderBy($sortby, $orderby)
                    ->get();
    return Response::json(array('data' => $_user->toArray(), 'total' => $_cnt),200);
  }

  public function sendEmailVerification($userObj, $password){
    // I'm creating an array with user's info but most likely you can use $user->email or pass $user object to closure later
    $user = array(
        'email'=>$userObj->email,
        'name'=>$userObj->firstname.' '.$userObj->lastname
    );
     
    // the data that will be passed into the mail view blade template
    $data = array(
        'username' => $userObj->email,
        'password' => $password,
        'verifyUrl' => url('apiv1/verifyAccount?passkey='.urlencode($userObj->confirmcode))
    );
    //Mail::pretend();
    // use Mail::send function to send email passing the data and using the $user variable in the closure
    return Mail::send('emails.emailVerification', $data, function($message) use ($user)
    {
      $message->from('donotreply@swfarm.com', 'Southwest Farm Admnistrator');
      $message->to($user['email'], $user['name'])->subject('Southwest Farm - Verify your account');
    });
  }

  public function verifyAccount($confirmcode){
    $confirmcode = urldecode($confirmcode);
    $user = User::where('confirmcode', '=', $confirmcode)->first();
    $data = array();
    if($user){
      $data['firstname'] = ucfirst($user->firstname);
      $data['lastname'] = ucfirst($user->lastname);
      if($user->validated == 0) { //Account is not yet validated
        $user->validated = 1;
        $user->save();
        $data['error'] = false;
        $data['message'] = "Your user account is now validated. Click <a href='".url()."''>here</a> to login to Southwest Farm application.";
      } else {
        $data['error'] = true;
        $data['message'] = "User account is already validated. Click <a href='".url()."''>here</a> to login to Southwest Farm application.";
      }
    } else {
      $data['error'] = true;
      $data['message'] = "User with that confirmation code not found. Please check the link and try again.";
    }

    return View::make('verifyAccount', $data);
    
  }

  public function saveImage($data){
    if(isset($data['imagedata'])) {
      if(!(strstr($data['imagetype'], 'image/jpg') || strstr($data['imagetype'], 'image/jpeg') || strstr($data['imagetype'], 'image/gif') || strstr($data['imagetype'], 'image/png'))){
        return  array(
          'error' => true,
          'message' => 'image extension must be in jpg, gif or png'
          );
      } else if(intval($data['imagesize']) > 3145728) { //3mb max file size
        return array(
          'error' => true,
          'message' => 'image file size exceeded.'
          );
      }
      
      // $user->profileimg = $this->saveImage($data['imagedata'], $data['imagetype'], $data['username']);
      define('UPLOAD_DIR', 'images/profile/');
      $base64img = str_replace('data:'.$data['imagetype'].';base64,', '', $data['imagedata']);
      $filedecode = base64_decode($base64img);
      $file = UPLOAD_DIR . $data['username'] . '.jpg';
      file_put_contents($file, $filedecode);

      return $file;
      
    }
    
  }


  public function updateProfile($id, $data){
    $rules = array(
      //'username' => 'required|unique:users,username,'.$id,
      'password' => 'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/|between:8,15|confirmed',
      'email' => 'required|email|unique:users,email,'.$id,
      'firstname' => 'required|between:2,50',
      'lastname' => 'required|between:2,50',
      'emp_no' => 'required|unique:users,emp_no,'.$id,
      'suffix' => 'between:2,6',
      'phone' => 'between:14,14',
      'mobile' => 'between:14,14',
      'position' => 'between:2,50'
    );

    // $errorMessages = array(
    //   'password.regex'    => 'The :attribute format is invalid, it must contain one numeric and one capital letters.'
    // );

    $user = User::find($id); //get the user row

    if($user) {
      $this->validate($data, $rules);

      //$user->username = $data['username'];
      if(isset($data['password']) && $data['password'] != ''){
        $user->password = Hash::make($data['password']);
      }
      $user->email = $data['email'];
      $user->firstname = $data['firstname'];
      $user->lastname = $data['lastname'];
      $user->suffix = isset($data['suffix']) ? $data['suffix'] : null;
      $user->emp_no = $data['emp_no'];
      $user->mobile = isset($data['mobile']) ? $data['mobile'] : null;
      $user->phone = isset($data['phone']) ? $data['phone'] : null;
      $user->position = isset($data['position']) ? $data['position'] : null;

      //saving profile image
      if(isset($data['imagedata'])) {
        $data['username'] = $user->username;
        $isImgSave = $this->saveImage($data);

        if(is_array($isImgSave)) {
          return Response::json(
              $isImgSave,
              200
          );
        } else { //save successfully
            $user->profileimg = $isImgSave;
        }
      } else if(isset($data['imageremove'])){
        $user->profileimg = '';
      }
      $user->save();

      $response = Response::json(array(
          'error' => false,
          'message' => Lang::get('messages.success.updated', array('entity' => 'Profile')),
          ),
          200
      );
    } else {
      $response = Response::json(array(
          'error' => true,
          'message' => Lang::get('messages.notfound', array('entity' => 'User'))),
          200
      );
    }

    return $response;    
  }

}