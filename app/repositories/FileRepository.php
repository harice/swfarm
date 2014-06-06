<?php

/**
 * Description of FileRepository
 *
 * @author Avs
 */
class FileRepository implements FileRepositoryInterface {
    
    public function uploadFile($data){
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
          
          $file = new Files;
          $file->fill($data);
          $file->save();

          // $user->profileimg = $this->saveImage($data['imagedata'], $data['imagetype'], $data['username']);
          //define('UPLOAD_DIR', 'images/profile/');
          // $base64img = str_replace('data:'.$data['imagetype'].';base64,', '', $data['imagedata']);
          // $filedecode = base64_decode($base64img);
          // $file = UPLOAD_DIR . $data['username'] . '.jpg';
          // file_put_contents($file, $filedecode);

          return $file->id;
 
    }

    public function displayFile($fileId){
        $file = Files::where('issave', '=', 1)->where('id', '=', $fileId)->first();
        if($file){
            // header('Content-Type: '.$file->type);
            return $file->content;
            //readfile($file->content);
        } else {
            return array(
              'error' => true,
              'message' => 'file not found.'
              );
        }
    }

    public function filesCleanUp(){
        $files = Files::where('issave', '=', 0)->where('created_at', '<', 'NOW() - INTERVAL 1 DAY')->get();

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
            'name' => 'required',
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
        return new File($data);
    }
    
}
