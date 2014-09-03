<?php

class SettingsRepository implements SettingsRepositoryInterface {

    public function getSettings($name){
        return Settings::where('name', '=',$name)->first(array('value'))->toArray();
    }

    public function getTransportSettings(){
        $freightRate = $this->getSettings('freight_rate');
        $loadingRate = $this->getSettings('loading_rate');
        $unloadingRate = $this->getSettings('unloading_rate');
        $trailerpercentagerate = $this->getSettings('trailer_percentage_rate');
		$fuelrate = $this->getSettings('fuel_rate');

        $settings = array(
                        "freight_rate" => $freightRate['value'],
                        "loading_rate" => $loadingRate['value'],
                        "unloading_rate" => $unloadingRate['value'],
                        "trailer_percentage_rate" => $trailerpercentagerate['value'],
						"fuel_rate" => $fuelrate['value']
            );

        return $settings;
    }

    public function findAll($params)
    {
        try
        {
            if (isset($params['name'])) {
                $response = Settings::where('name', '=',$params['name'])->first(array('value'))->toArray();
            } else {
                $response = Settings::all();
            }

            return $response;
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }

    public function findById($id)
    {
        try
        {
            $trailer = Settings::find($id);

            if (!$trailer) {
                throw new NotFoundException();
            }

            return $trailer;
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }

    public function store($data)
    {
        $this->validate($data);

        try
        {
            $trailer = $this->instance();
            $trailer->fill($data);
            $trailer->save();

            $response = array(
                'error' => false,
                'message' => Lang::get('messages.success.created', array('entity' => 'Settings')),
                'data' => $trailer->toArray()
            );

            return $response;
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }

    public function update($id, $data)
    {
        try
        {
            $setting = Settings::find($id);
            $setting->fill($data);

            if (!$setting->update()) {
                return array(
                    'error' => true,
                    'message' => 'Settings was not saved.'
                );
            }

            return array(
                'error' => false,
                'message' => Lang::get('messages.success.updated', array('entity' => 'Settings'))
            );
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }

    public function updateSettings($data)
    {
        unset($data['name']);
        unset($data['value']);

        foreach ($data['settings'] as $setting) {
            $result = $this->update($setting['id'], $setting);
            if ($result['error']) {
                return Response::json(array(
                    'error' => true,
                    'message' => 'Settings was not saved.'
                ), 500);
            }
        }

        return Response::json(array(
            'error' => false,
            'message' => 'Settings has been saved.'
        ), 200);
    }

    public function destroy($id)
    {
        try
        {
            $trailer = $this->findById($id);
            $trailer->delete();

            $response = array(
                'error' => false,
                'message' => Lang::get('messages.success.deleted', array('entity' => 'Settings')),
                'data' => $trailer->toArray()
            );

            return $response;
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }

    public function validate($data, $id = null)
    {
        $rules = Settings::$rules;

        if ($id) {
            $rules['name'] = 'required|unique:settings,name,'.$id;
        }

        $validator = Validator::make($data, $rules);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return true;
    }

    public function instance($data = array())
    {
        return new Settings($data);
    }

}
