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
            $perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.GLOBAL_PER_LIST');
            
            return StorageLocation::with('section')->paginate($perPage);
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
            'message' => "A problem was encountered while saving sections.");
        }

        return $response;
        
    }

    private function addSection($storagelocation_id, $sections = array())
    {
        foreach ($sections as $section) {
            $section['storagelocation_id'] = $storagelocation_id;
            
            $this->validate($section, 'Section');
            if(isset($section['id']))
                $sectionLocation = Section::find($section['id']);
            else
                $sectionLocation = new Section();

            $sectionLocation->fill($section);
            $sectionLocation->save();

        }
        return true;
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
        $this->validate($data, 'StorageLocation');
        $storagelocation = $this->findById($id);
        $storagelocation->fill($data);
        
        if (!$storagelocation->update()) {
            return array(
                'error' => true,
                'message' => 'Storage location was not updated.'
            );
        }

        if(isset($data['sections']) && count($data['sections']) > 0){
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
                    'message' => "A problem was encountered while saving section"), 500);
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

    // public function validate($data, $id = null)
    // {
    //     $rules = StorageLocation::$rules;

    //     // $rules = array(
    //     //     'account_id' => 'required',
    //     //     'name' => 'required|unique:storagelocation,name,'.$data['account_id'].',account_id',
    //     //     'description' => 'max:250'
    //     // );

    //     $validator = Validator::make($data, $rules);
        
    //     if ($validator->fails()) {
    //         throw new ValidationException($validator);
    //     }
        
    //     return true;
    // }

    public function validate($data, $entity)
    {   
        $validator = Validator::make($data, $entity::$rules);
       
        if($validator->fails()) { 
            throw new ValidationException($validator); 
        }
        
        return true;
    }
    
    public function instance($data = array())
    {
        return new StorageLocation($data);
    }
    
}
