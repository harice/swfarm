<?php

/**
 * Description of DocumentRepository
 *
 * @author Avs
 */
class DocumentRepository implements DocumentRepositoryInterface {
    
    public function uploadDocument($data){
          // var_dump($data);
          $this->validate($data);

          if(!(strstr($data['type'], 'application/pdf'))){
            return  array(
              'error' => true,
              'message' => 'file extension must be in pdf'
              );
          } else if(intval($data['size']) > 3145728) { //3mb max file size
            return array(
              'error' => true,
              'message' => 'file size exceeded(3MB).'
              );
          }
          
          $file = new Document;
          $file->fill($data);
          $file->save();
          return $file->id;
 
    }

     public function uploadDocument_2($data){
          // var_dump($data);
          $this->validate($data);

          if(!(strstr($data['type'], 'application/pdf'))){
            return  array(
              'error' => true,
              'message' => 'file extension must be in pdf'
              );
          } else if(intval($data['size']) > 3145728) { //3mb max file size
            return array(
              'error' => true,
              'message' => 'file size exceeded(3MB).'
              );
          }
          
          $file = new Document;
          $file->fill($data);
          $file->save();
         
          return array(
                    'file_id' => $file->id
                );
 
    }

    public function displayDocument($dataEncrypted){
        $data = base64_decode($dataEncrypted);
        
        $data = explode(',', $data);
        if(count($data) != 3){
            return array(
              'error' => true,
              'message' => 'You are not allowed here.'
              );
        }
        
        $fileId = $data[0];
        $email = $data[1];
        $password = $data[2];

        $auth = Auth::once(
                array(  'email' => $email, 
                        'password' => $password,
                        'status' => true
                    )
                );

        if(!$auth){
            return array(
              'error' => true,
              'message' => 'Unauthorized.'
              );
        }
      
        $file = Document::where('issave', '=', 1)->where('id', '=', $fileId)->first();
        if($file){
            header('Content-Type: '.$file->type);
            // return $file->content;
            readfile($file->content);
        } else {
            return array(
              'error' => true,
              'message' => 'file not found.'
              );
        }
    }

    public function documentsCleanUp(){
        $files = Document::where('issave', '=', 0)->where('created_at', '<', 'NOW() - INTERVAL 1 DAY')->get();

        if($files != null){
            foreach($files as $file){
                $file->delete();
            }
        }
    }
   
    public function store($data)
    {
        // try
        // {
        //     $this->validate($data);
        //     $truck = $this->instance();
        //     $truck->fill($data);
            
        //     if (!$truck->save()) {
        //         return array(
        //             'error' => true,
        //             'message' => 'Truck was not created.'
        //         );
        //     }
            
        //     $response = array(
        //         'error' => false,
        //         'message' => Lang::get('messages.success.created', array('entity' => 'Truck')),
        //         'data' => $truck->toArray()
        //     );
            
        //     return $response;
        // }
        // catch (Exception $e)
        // {
        //     return $e->getMessage();
        // }
    }
    
    public function destroy($id)
    {
        // try
        // {
        //     $truck = $this->findById($id);

        //     if (!$truck->delete()) {
        //         return array(
        //             'error' => true,
        //             'message' => 'Truck was not deleted.'
        //         );
        //     }

        //     $response = array(
        //         'error' => false,
        //         'message' => Lang::get('messages.success.deleted', array('entity' => 'Truck')),
        //         'data' => $truck->toArray()
        //     );
            
        //     return $response;
        // }
        // catch (Exception $e)
        // {
        //     return $e->getMessage();
        // }
    }
    
    public function validate($data, $id = null)
    {
        $rules = array(
            'type' => 'required',
            'size' => 'required',
            'content' => 'required'
        );
        
        // if ($id) {
        //     $rules['account_id'] = 'required';
        //     $rules['name'] = 'required|unique:truck,name,'.$id;
        //     $rules['rate'] = 'required';
        // }
        
        $validator = Validator::make($data, $rules);
        
        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
        
        return true;
    }
    
    public function instance($data = array())
    {
        return new Document($data);
    }
    
}
