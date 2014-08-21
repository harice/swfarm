<?php

/**
 * Description of Storage Location Repository
 *
 * @author Avs
 */
class StorageLocationRepository implements StorageLocationRepositoryInterface {
    
    public function findAll($params)
    {
        try
        {
            $perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.USERS_PER_LIST');
            $sortby = isset($params['sortby']) ? $params['sortby'] : 'account_name';
            $orderby = isset($params['orderby']) ? $params['orderby'] : 'asc';
            
            $result = StorageLocation::join('account', 'account_id', '=', 'account.id');
            
            if (isset($params['accountId'])) {
                $result = $result->where('account_id', '=', $params['accountId']);
            }
            
            $result = $result->select(
                    'storagelocation.id',
                    'storagelocation.name',
                    'storagelocation.description',
                    'storagelocation.account_id',
                    'account.name as account_name'
                )
                ->with('section')
                ->with('section.stacklocation')
                ->orderBy($sortby, $orderby)
                ->paginate($perPage);
            
            return $result;
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }
    
    public function findById($id)
    {
        $storagelocation = StorageLocation::with('section')->find($id);
        
        if (!$storagelocation) {
            return array(
                'error' => true,
                'message' => 'Storage location not found.'
            );
        }
        
        return $storagelocation->toArray();
        
    }

    public function getStorageLocationByAccount($accountId)
    {
        $storagelocation = StorageLocation::with('section')->where('account_id', '=', $accountId)->get();
        
        if (!$storagelocation) {
            return array(
                'error' => true,
                'message' => 'Storage location not found.'
            );
        }
        
        return $storagelocation->toArray();
        
    }

    public function getStorageLocationOfWarehouse()
    {
        $storagelocation = StorageLocation::with('section')->whereHas('account', function($account){
            $account->whereHas('accounttype', function($accounttype){
                $accounttype->where('accounttype_id', '=', 10); //warehouse account type
            });
        })->get();
        
        if (!$storagelocation) {
            return array(
                'error' => true,
                'message' => 'Storage location not found.'
            );
        }
        
        return $storagelocation->toArray();
        
    }


    
    public function search($params)
    {
        try
        {
            $perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.USERS_PER_LIST');
            $sortby = isset($params['sortby']) ? $params['sortby'] : 'account_name';
            $orderby = isset($params['orderby']) ? $params['orderby'] : 'asc';
            $searchWord = $params['search'];
            
            return StorageLocation::join('account', 'account_id', '=', 'account.id')
                ->select(
                    'storagelocation.id',
                    'storagelocation.name',
                    'storagelocation.description',
                    'storagelocation.account_id',
                    'account.name as account_name'
                )
                ->where(function ($query) use ($searchWord) {
                    $query->orWhere('storagelocation.name','like','%'.$searchWord.'%');
                    $query->orWhere('account.name','like','%'.$searchWord.'%');
                })
                ->with('section')
                ->orderBy($sortby, $orderby)
                ->paginate($perPage);
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }
    
    public function store($data)
    {
        DB::beginTransaction();
        $this->validate($data, 'StorageLocation');
        $storagelocation = $this->instance();
        $storagelocation->fill($data);

        if (!$storagelocation->save()) {
            return array(
                'error' => true,
                'message' => 'Storage location was not created.'
            );
        }

        $sections = $this->addSection($storagelocation->id, $data['sections']);
        
        if($sections){
            DB::commit();
            $response = array(
                'error' => false,
                'message' => Lang::get('messages.success.created', array('entity' => 'Storage location'))
            );
        } else {
            DB::rollback();
            $response = array(
            'error' => true,
            'message' => "Please enter a unique Section name.");
        }

        return $response;
        
    }

    private function addSection($storagelocation_id, $sections = array())
    {
        $response = false;
        foreach ($sections as $section) {
            $section['storagelocation_id'] = $storagelocation_id;
            
            
            if(isset($section['id'])) {
                if (!$this->validateSection($section, 'Section', $section['id'])) {
                    return false;
                }
                $sectionLocation = Section::find($section['id']);
            }
            else {
                if (!$this->validateSection($section, 'Section')) {
                    return false;
                }
                $sectionLocation = new Section();
            }

            $sectionLocation->fill($section);
            $sectionLocation->save();
            
            $response = true;
        }
        
        return $response;
    }
    
    public function validateSection($data, $entity, $id = null)
    {
        $messages = array(
            'name.unique' => 'Section name should be unique.'
        );
        
        if ($id) {
            $entity::$rules['name'] = 'required|unique:section,name,' .$id;
        }
        
        $validator = Validator::make($data, $entity::$rules, $messages);
        
        if($validator->passes()) {
            return true;
        }
        
        return false;
    }
    
    public function hasDuplicateSectionName(array $sections) {
        $names = array();
        foreach ($sections as $section) {
            $names[] = $section['name'];
        }
        
        $dupe_array = array_count_values($names);
        foreach($dupe_array as $name){
            if($name > 1){
                return true;
            }
        }
        return false;
    }

    private function removeSection($storagelocation_id, $sections = array())
    {
        $existingSectionId = array();
        if($sections != null){
            foreach($sections as $item){
                $sectionData = $item;
                if(isset($sectionData['id'])){
                    $existingSectionId[] = $sectionData['id'];
                }
            }
        }

        if($existingSectionId == null){ //delete all section associated with this storage location
            $result = Section::with('storagelocation')
                    ->whereHas('storagelocation', function($query) use ($storagelocation_id)
                    {
                        $query->where('id', '=', $storagelocation_id);

                    })
                    ->delete();
        } else { //delete section that is included in array
            $result = Section::with('storagelocation')
                    ->whereHas('storagelocation', function($query) use ($storagelocation_id)
                    {
                        $query->where('id', '=', $storagelocation_id);

                    })
                    ->whereNotIn('id',$existingSectionId)
                    ->delete();
        }
        return $result;
    }
    
    public function update($id, $data)
    {   
        DB::beginTransaction();
        $this->validate($data, 'StorageLocation', $id);
        $storagelocation = StorageLocation::find($id);
        // var_dump(storagelocation);
        $storagelocation->fill($data);
        
        if (!$storagelocation->update()) {
            return array(
                'error' => true,
                'message' => 'Storage location was not updated.'
            );
        }

        if(isset($data['sections']) && count($data['sections']) > 0){
            if ($this->hasDuplicateSectionName($data['sections'])) {
                return Response::json(array(
                    'error' => true,
                    'message' => "Please enter a unique Section name."), 500);
            }
            
            $removeSectionResult = $this->removeSection($id, $data['sections']); //delete sections that is remove by client
            $sectionResult = $this->addSection($storagelocation->id, $data['sections']);
            
            if($sectionResult){
                DB::commit();
                return Response::json(array(
                    'error' => false,
                    'message' => Lang::get('messages.success.updated', array('entity' => 'Storage location'))
                ));
            } else {
                DB::rollback();
                return Response::json(array(
                    'error' => true,
                    'message' => "Please enter a unique Section name."), 500);
            }
        } else {
            DB::rollback();
            return Response::json(array(
                'error' => true,
                'message' => "Atleast one section is required"), 500);
        }
    }
    
    public function destroy($id)
    {
        $storagelocation = StorageLocation::find($id);
        if($storagelocation){
            $storagelocation->delete();
            return array(
            'error' => false,
            'message' => Lang::get('messages.success.deleted', array('entity' => 'Storage location'))
        );
        } else {
             return array(
                'error' => true,
                'message' => 'Storage location was not found.'
            );
        }
        
    }

    public function validate($data, $entity, $id = null)
    {
        $messages = array(
            'name.unique' => 'Location name should be unique.'
        );
        
        if ($entity == 'StorageLocation') {
            if ($id) {
                $entity::$rules['name'] = 'required|unique:storagelocation,name,'.$id;
            }
        }
        
        if ($entity == 'Section') {
            $messages['name.unique'] = 'Section name should be unique.';
            $entity::$rules['name'] = 'required|unique:section,name';
            
            if ($id) {
                // To Do: Modify this rule to enforce unique Section name in each Storage Location.
                $entity::$rules['name'] = 'required|unique:section,name,' .$id;
            }
        }
        
        $validator = Validator::make($data, $entity::$rules, $messages);
       
        if($validator->fails()) { 
            throw new ValidationException($validator); 
        }
        
        return true;
    }
    
    public function instance($data = array())
    {
        return new StorageLocation($data);
    }

    public function getAllStorageLocation(){
        $storageLocation = Section::with('storagelocationName')->get();
        // $storageLocation = StorageLocation::with('section')->get();
        // var_dump($storageLocation->toArray());
        $locationResult = array();
        foreach($storageLocation as $location){
            array_push($locationResult, array('id' => $location->id, 'locationName' => $location['storagelocation_name']['name'].' - '.$location['name']));
        }
        return $locationResult;
    }
    
}
