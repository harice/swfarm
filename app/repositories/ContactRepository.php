<?php

// use UsersRepository;

class ContactRepository implements ContactRepositoryInterface {

    public function findAll($params)
    {
        $perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.GLOBAL_PER_LIST');
        $sortby = isset($params['sortby']) ? $params['sortby'] : 'lastname';
        $orderby = isset($params['orderby']) ? $params['orderby'] : 'ASC';
        $paginated = isset($params['paginated']) ? $params['paginated'] : true;
        
        $contacts = Contact::with('account.accounttype');
        
        if (isset($params['accountType'])) {
            $contacts = $contacts->whereHas('account', function($q)
            use ($params) {
                $q->whereHas('accounttype', function($q)
                use ($params) {
                    $q->where('accounttype_id', '=', $params['accountType']);
                });
            });
        }
        
        $contacts = $contacts->orderBy($sortby, $orderby);
        
        if (!$paginated) {
            $perPage = $contacts->count();
        }
        
        $contacts = $contacts->paginate($perPage);
        
        return $contacts;
    }

    public function findById($id)
    {
        $contact = Contact::with('account')->find($id);

        $contact = $contact->toArray();
        // $accounttype = AccountType::where('id', '=', $contact["account"]["accounttype"])->get(array('name'));
        // $accounttype = $accounttype->toArray();
        // $account_name = $accounttype["0"]["name"];

        // $contact["account"]["account_name"] = $account_name;

        if ($contact) {
            $response = Response::json(
                    $contact, 200
            );
        } else {
            $response = Response::json(array(
                    'error' => true,
                    'message' => "Contact not found"), 200
            );
        }

        return $response;
    }

    public function store($data)
    {
        $rules = array(
            'firstname' => 'required|between:1,50',
            'lastname' => 'required|between:1,50',
            'suffix' => 'between:2,6',
            'account' => 'required|exists:account,id',
            'email' => 'required|email|unique:contact',
            'phone' => 'required|between:14,14',
            'mobile' => 'between:14,14',
            'rate' => 'sometimes|numeric|min:0|max:10000'
        );

        //
        
        if (!$this->hasRate($data['account'])) {
            if (isset($data['rate'])) {
                unset($data['rate']);
            }
        } else {
            if(isset($data['rate'])){
                $data['rate'] = (int)str_replace(array('.', ','), '' , number_format(floatval($data['rate']), 2, '.', ''));
                $this->validate($data, $rules);
                $data['rate'] = number_format(($data['rate'] / 100), 2, '.', '');
            }
            
        }

        $this->validate($data, $rules);

        //check if account is SWF trucker
        $isSWFTrucker = $this->isContactAccountSWFTrucker($data['account']);

        DB::beginTransaction();

        $contact = new Contact;

        $contact->account = $data['account'];
        $contact->firstname = $data['firstname'];
        $contact->lastname = $data['lastname'];
        $contact->suffix = isset($data['suffix']) ? $data['suffix'] : null;
        $contact->position = isset($data['position']) ? $data['position'] : null;
        $contact->email = $data['email'];
        $contact->phone = $data['phone'];
        $contact->mobile = isset($data['mobile']) ? $data['mobile'] : null;
        $contact->rate = isset($data['rate']) ? $data['rate'] : null;

        try {
            $contact->save();
            if(!$isSWFTrucker){
                DB::commit();
            }
        } catch (Exception $e) {
            DB::rollback();
            return Response::json(array(
                    'error' => true,
                    'message' => $e->errorInfo[2]), 200
            );
        }

        if($isSWFTrucker){ // if SWF trucker, create an entry to user table for him to be logged in into the system
            //create a user account
            $userData = array(
                'email' => $data['email'],
                'firstname' => $data['firstname'],
                'lastname' => $data['lastname'],
                'emp_no' => Hash::make(Str::random(3)),
                'suffix' => $data['suffix'],
                'phone' => $data['phone'],
                'mobile' => $data['mobile'],
                'position' => isset($data['position']) ? $data['position'] : null,
                'contact_id' => $contact->id
            );

            try {
                $userRepo = new UsersRepository;
                $userRepo->store($userData);
                DB::commit();
            } catch (Exception $e) {
                DB::rollback();
                return Response::json(array(
                        'error' => true,
                        'message' => $e->errorInfo[2]), 200
                );
            }
            
        }

        

        if(isset($data['object_id'])){
            $isMobile = true;
        } else {
            $isMobile = false;
        }

        if($isMobile){
            return Response::json(array(
                'error' => false,
                'message' => Lang::get('messages.success.created', array('entity' => 'Contact')),
                'data' => array('id' => $contact->id, 'object_id' => $data['object_id'])), 200
            );
        } else {
            return Response::json(array(
                'error' => false,
                'message' => Lang::get('messages.success.created', array('entity' => 'Contact'))), 200
            );
        }
        
    }

    public function update($id, $data)
    {
        $rules = array(
            'firstname' => 'required|between:1,50',
            'lastname' => 'required|between:1,50',
            'suffix' => 'between:2,6',
            'account' => 'required|exists:account,id',
            'email' => 'required|email|unique:contact,email,' . $id,
            'phone' => 'required|between:14,14',
            'mobile' => 'between:14,14',
            'rate' => 'sometimes|numeric|min:0|max:10000'
        );
        
        if (!$this->hasRate($data['account'])) {
            if (isset($data['rate'])) {
                unset($data['rate']);
            }
            $this->validate($data, $rules);
        } else {
            if(isset($data['rate'])){
                $data['rate'] = (int)str_replace(array('.', ','), '' , number_format(floatval($data['rate']), 2, '.', ''));
                $this->validate($data, $rules);
                $data['rate'] = number_format(($data['rate'] / 100), 2, '.', '');
            }
        }

        $isSWFTrucker = $this->isContactAccountSWFTrucker($data['account']);

        $contact = Contact::find($id);

        $contact->account = $data['account'];
        $contact->firstname = $data['firstname'];
        $contact->lastname = $data['lastname'];
        $contact->suffix = isset($data['suffix']) ? $data['suffix'] : null;
        $contact->position = isset($data['position']) ? $data['position'] : null;
        $contact->email = $data['email'];
        $contact->phone = $data['phone'];
        $contact->mobile = isset($data['mobile']) ? $data['mobile'] : null;
        $contact->rate = isset($data['rate']) ? $data['rate'] : null;

        try {
            $contact->save();
            if(!$isSWFTrucker){
                DB::commit();
            }
        } catch (Exception $e) {
            return Response::json(array(
                    'error' => true,
                    'message' => $e->errorInfo[2]), 200
            );
        }

        if($isSWFTrucker){ // if SWF trucker, update an entry to user table for him to be logged in into the system
            //create a user account

            $user = User::where('contact_id', '=', $contact->id)->first();
            
            if($user){
                $userData = array(
                    'email' => $data['email'],
                    'firstname' => $data['firstname'],
                    'lastname' => $data['lastname'],
                    'emp_no' => Hash::make(Str::random(3)),
                    'suffix' => $data['suffix'],
                    'phone' => $data['phone'],
                    'mobile' => $data['mobile'],
                    'position' => isset($data['position']) ? $data['position'] : null
                );

                try {
                    $userRepo = new UsersRepository;
                    $userRepo->update($user->id, $userData);
                    DB::commit();
                } catch (Exception $e) {
                    DB::rollback();
                    return Response::json(array(
                            'error' => true,
                            'message' => $e->errorInfo[2]), 200
                    );
                }
            }
            
        }

        if(isset($data['object_id'])){
            $isMobile = true;
        } else {
            $isMobile = false;
        }

        if($isMobile){
            return Response::json(array(
                'error' => false,
                'message' => Lang::get('messages.success.updated', array('entity' => 'Contact')),
                'data' => array('id' => $contact->id, 'object_id' => $data['object_id'])), 200
            );
        } else {
            return Response::json(array(
                'error' => false,
                'message' => Lang::get('messages.success.updated', array('entity' => 'Contact'))), 200
            );
        }
        
    }

    public function search($_search)
    {
        $perPage = isset($_search['perpage']) ? $_search['perpage'] : Config::get('constants.USERS_PER_LIST');
        $page = isset($_search['page']) ? $_search['page'] : 1;
        $sortby = isset($_search['sortby']) ? $_search['sortby'] : 'lastname';
        $orderby = isset($_search['orderby']) ? $_search['orderby'] : 'ASC';
        $offset = $page * $perPage - $perPage;
        $searchWord = $_search['search'];

        $count = Contact::whereHas('account', function($query) use ($searchWord) {
                    $query->where('name', 'like', '%' . $searchWord . '%');
                })
            ->orWhere(function ($query) use ($searchWord) {
                    $query->orWhere('firstname', 'like', '%' . $searchWord . '%')
                    ->orWhere('lastname', 'like', '%' . $searchWord . '%');
                })
            ->whereNull('deleted_at')
            ->count();

        $contact = Contact::with('account.accounttype')
            ->whereHas('account', function($query) use ($searchWord) {
                    $query->where('name', 'like', '%' . $searchWord . '%');
                })
            ->orWhere(function ($query) use ($searchWord) {
                    $query->orWhere('firstname', 'like', '%' . $searchWord . '%')
                    ->orWhere('lastname', 'like', '%' . $searchWord . '%');
                })
            ->whereNull('deleted_at')
            ->take($perPage)
            ->offset($offset)
            ->orderBy($sortby, $orderby)
            ->get();

        return Response::json(array(
                'data' => $contact->toArray(),
                'total' => $count), 200);
    }

    public function destroy($id)
    {
        $contact = Contact::find($id);

        if ($contact) {
            
            $order = Order::where('contact_id', '=', $id)->get();
            $originloader = TransportSchedule::where('originloader_id', '=', $id)->get();
            $destinationloader = TransportSchedule::where('destinationloader_id', '=', $id)->get();
            
            if (!$order->count() && !$originloader->count() && !$destinationloader->count()) {
                $contact->forceDelete();
            } else {
                $contact->delete();
            }
            //find a contact which is also a user
            $userRepo = new UsersRepository;
            $user = User::where('contact_id', '=', $contact->id)->first();
            if($user){
                $userRepo->destroy($user->id);
            }

            $response = Response::json(array(
                    'error' => false,
                    'message' => Lang::get('messages.success.deleted', array('entity' => 'Contact'))), 200
            );
        } else {
            $response = Response::json(array(
                    'error' => true,
                    'message' => Lang::get('messages.notfound', array('entity' => 'Contact'))), 200
            );
        }

        return $response;
    }

    public function validate($data, $rules)
    {
        $messages = array(
            'rate.max' => 'The fee may not be greater than 100.00'
        );
        $validator = Validator::make($data, $rules, $messages);

        $validator->sometimes('rate', 'required', function($data)
        {
            return $this->hasRate($data['account']);
        });

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
    }

    public function instance($data = array())
    {
        return new Account($data);
    }

    /**
     * Check if Account has rate.
     * 
     * @param type $account_id
     * @return boolean
     */
    public function hasRate($account_id)
    {
        $types = array(3,4,8); // Loader, Operator, Southwest Farms
        $account = Account::where('id','=',$account_id)
                        ->whereHas('accounttype', function($q) use($types) { $q->whereIn('accounttype_id', $types); } )
                        ->groupBy('id')->count();
        
        if($account) return true;
        return false;
    }

    public function isContactAccountSWFTrucker($account_id){
        $accountTypes = array(Config::get('constants.ACCOUNTTYPE_SWFTRUCKER'));
        $accounts = Account::with('accounttype')
                  ->whereHas('accounttype', function($q) use ($accountTypes) { 
                        $q->whereIn('accounttype_id', $accountTypes); 
                  } )->where('id', '=', $account_id)
                  ->count();
        return $accounts > 0 ? true:false;
    }
}
