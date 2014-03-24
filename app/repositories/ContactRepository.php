<?php
 
class ContactRepository implements ContactRepositoryInterface {

  public function findAll(){
    $contact = Contact::all();

    return Response::json(
        $contact->toArray(),
        200
      );
  }

  public function findById($id){
    $contact = Contact::with('account')->find($id);

    if($contact){
      $response = Response::json(
        $contact->toArray(),
        200
      );
    } else {
      $response = Response::json(array(
        'error' => true,
        'message' => "Contact not found"),
        200
      );
    }

    return $response;
  }

  public function paginate($params){
    $perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.GLOBAL_PER_LIST'); //default to 10 items, see app/config/constants
    $page = isset($params['page']) ? $params['page'] : '1'; //default to page 1
    $sortby = isset($params['sortby']) ? $params['sortby'] : 'lastname'; //default sort to contact lastname
    $orderby = isset($params['orderby']) ? $params['orderby'] : 'ASC'; //default order is Ascending
    $offset = $page*$perPage-$perPage;

    //pulling of data
    $count = Contact::count();
    $contactList = Contact::with('account', 'account.accounttype')->take($perPage)->offset($offset)->orderBy($sortby, $orderby)->get();

    return Response::json(array(
      'data'=>$contactList->toArray(),
      'total'=>$count
    ));

  }

  public function store($data){
    $rules = array(
      'firstname' => 'required|between:1,50',
      'lastname' => 'required|between:1,50',
      'email' => 'required|email|unique:contact',
      'phone' => 'required|between:6,14',
      'mobile' => 'between:9,14'
    );


    $this->validate($data, $rules);

    $contact = new Contact;
    $contact->firstname = $data['firstname'];
    $contact->lastname = $data['lastname'];
    $contact->position = isset($data['position']) ? $data['position'] : null;
    $contact->email = $data['email'];
    $contact->phone = $data['phone'];
    $contact->mobile = isset($data['mobile']) ? $data['mobile'] : null;
    $contact->account = isset($data['account']) ? $data['account'] : null;

    try{
      $contact->save();
    } catch(Exception $e){
      return Response::json(array(
        'error' => true,
        'message' => $e->errorInfo[2]),
        200
      );
    }

    return Response::json(array(
        'error' => false,
        'message' => 'Contact successfully created.'),
        200
    );
  }

  public function update($id, $data){
    $rules = array(
      'firstname' => 'required|between:1,50',
      'lastname' => 'required|between:1,50',
      'email' => 'required|email|unique:contact,email,'.$id,
      'phone' => 'required|between:6,14',
      'mobile' => 'between:9,14'
    );

    $this->validate($data, $rules);

    $contact = Contact::find($id);
    $contact->firstname = $data['firstname'];
    $contact->lastname = $data['lastname'];
    $contact->position = isset($data['position']) ? $data['position'] : null;
    $contact->email = $data['email'];
    $contact->phone = $data['phone'];
    $contact->mobile = isset($data['mobile']) ? $data['mobile'] : null;
    $contact->account = isset($data['account']) ? $data['account'] : null;

    try{
      $contact->save();
    } catch(Exception $e){
      return Response::json(array(
        'error' => true,
        'message' => $e->errorInfo[2]),
        200
      );
    }

    return Response::json(array(
        'error' => false,
        'message' => 'Contact successfully updated'),
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
    $searchWord = $_search['search'];

    $count = Contact::whereHas('account', function($query) use ($searchWord)
                    {
                        $query->where('name', 'like', '%'.$searchWord.'%');

                    })
                    ->orWhere('firstname','like','%'.$searchWord.'%')
                    ->orWhere('lastname','like','%'.$searchWord.'%')
                    //->orWhere('account.name','like','%'.$_search['search'].'%')
                    ->count();

    $contact = Contact::with('account')->whereHas('account', function($query) use ($searchWord)
                    {
                        $query->where('name', 'like', '%'.$searchWord.'%');

                    })
                    ->orWhere('firstname','like','%'.$_search['search'].'%')
                    ->orWhere('lastname','like','%'.$_search['search'].'%')
                    //->orWhere('account.name','like','%'.$_search['search'].'%')
                    ->take($perPage)
                    ->offset($offset)
                    ->orderBy($sortby, $orderby)
                    ->get();

    return Response::json(array(
      'data' => $contact->toArray(), 
      'total' => $count),
      200);
  }

  public function destroy($id){
    $contact = Contact::find($id);

    if($contact){
      $contact->delete();

      $response = Response::json(array(
          'error' => false,
          'message' => 'Contact successfully deleted.'),
          200
      );
    } else {
      $response = Response::json(array(
          'error' => true,
          'message' => "Contact not found"),
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


  public function instance($data = array())
  {
    return new Account($data);
  }

}