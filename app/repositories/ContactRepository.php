<?php

class ContactRepository implements ContactRepositoryInterface {

    public function findAll()
    {
        $contact = Contact::all();

        return Response::json(
                $contact->toArray(), 200
        );
    }

    public function findById($id)
    {
        $contact = Contact::with('account')->find($id);

        $contact = $contact->toArray();
        $accounttype = AccountType::where('id', '=', $contact["account"]["accounttype"])->get(array('name'));
        $accounttype = $accounttype->toArray();
        $account_name = $accounttype["0"]["name"];

        $contact["account"]["account_name"] = $account_name;

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

    public function paginate($params)
    {
        $perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.GLOBAL_PER_LIST'); //default to 10 items, see app/config/constants
        $page = isset($params['page']) ? $params['page'] : '1'; //default to page 1
        $sortby = isset($params['sortby']) ? $params['sortby'] : 'lastname'; //default sort to contact lastname
        $orderby = isset($params['orderby']) ? $params['orderby'] : 'ASC'; //default order is Ascending
        $offset = $page * $perPage - $perPage;

        //pulling of data
        $count = Contact::count();
        $contactList = Contact::with('account', 'account.accounttype')->take($perPage)->offset($offset)->orderBy($sortby, $orderby)->get();

        return Response::json(array(
                'data' => $contactList->toArray(),
                'total' => $count
        ));
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
            'rate' => 'regex:/^([0-9]{1,3})([,\.]([0-9]{1,2})){0,1}$/'
        );
        
        if (isset($data['rate'])) {
            if (!$this->hasRate($data['account'])) {
                unset($data['rate']);
            }
        }

        $this->validate($data, $rules);
        
        if ($data['rate'] > 100.00) {
            throw new Exception('Please enter a rate less than 100.00');
        }

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
        } catch (Exception $e) {
            return Response::json(array(
                    'error' => true,
                    'message' => $e->errorInfo[2]), 200
            );
        }

        return Response::json(array(
                'error' => false,
                'message' => Lang::get('messages.success.created', array('entity' => 'Contact'))), 200
        );
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
            'rate' => 'regex:/^([0-9]{1,3})([,\.]([0-9]{1,2})){0,1}$/'
        );
        
        if (isset($data['rate'])) {
            if (!$this->hasRate($data['account'])) {
                unset($data['rate']);
            }
        }

        $this->validate($data, $rules);
        
        if ($data['rate'] > 100.00) {
            throw new Exception('Please enter a rate less than 100.00');
        }

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
        } catch (Exception $e) {
            return Response::json(array(
                    'error' => true,
                    'message' => $e->errorInfo[2]), 200
            );
        }

        return Response::json(array(
                'error' => false,
                'message' => Lang::get('messages.success.updated', array('entity' => 'Contact'))), 200
        );
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

        $contact = Contact::with('account')
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
            $contact->delete();

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
        $validator = Validator::make($data, $rules);

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
        $account = Account::find($account_id);
        if ($account->accounttype == 3 || $account->accounttype == 4) {
            return true;
        }

        return false;
    }
}
