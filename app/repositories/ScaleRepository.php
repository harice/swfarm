<?php

/**
 * Description of ScaleRepository
 *
 * @author Das
 */
class ScaleRepository implements ScaleRepositoryInterface {

    public function findAll($params)
    {
        try
        {
            $perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.GLOBAL_PER_LIST');
            $sortby = isset($params['sortby']) ? $params['sortby'] : 'name';
            $orderby = isset($params['orderby']) ? $params['orderby'] : 'asc';

            return Scale::join('account', 'scale.account_id', '=', 'account.id')
                ->select('scale.id', 'scale.name as name', 'scale.rate as rate','account.name as account_name')
                ->orderBy($sortby, $orderby)
                ->paginate($perPage);
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }

    public function search($params)
    {
        try
        {
            $perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.GLOBAL_PER_LIST');
            $sortby = isset($params['sortby']) ? $params['sortby'] : 'name';
            $orderby = isset($params['orderby']) ? $params['orderby'] : 'asc';
            $searchWord = $params['search'];

            return Scale::join('account', 'scale.account_id', '=', 'account.id')
                ->select('scale.id', 'scale.name as name', 'scale.rate as rate','account.name as account_name')
                ->where(function ($query) use ($searchWord) {
                    $query->orWhere('scale.name','like','%'.$searchWord.'%');
                    $query->orWhere('account.name','like','%'.$searchWord.'%');
                })
                ->orderBy($sortby, $orderby)
                ->paginate($perPage);
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }

    public function findById($id)
    {
        $scale = Scale::with('account')->find($id);

        if ($scale) {
            return $scale;
        }

        throw new NotFoundException('Scale was not found.');
    }

    public function store($data)
    {
        $data['rate'] = (int)str_replace(array('.', ','), '' , number_format(floatval($data['rate']), 2, '.', ''));
        $this->validate($data);
        $data['rate'] = number_format(($data['rate'] / 100), 2, '.', '');

        try
        {
            $scale = $this->instance();
            $scale->fill($data);

            if ($scale->save()) {
                return array(
                    'error' => false,
                    'message' => Lang::get('messages.success.created', array('entity' => 'Scale')),
                    'data' => $scale
                );
            }

            return array(
                'error' => true,
                'message' => 'Scale was not created.'
            );
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }

    public function update($id, $data)
    {
        $this->validate($data, $id);

        try
        {
            $scale = $this->findById($id);
            $scale->fill($data);

            if (!$scale->update()) {
                return array(
                    'error' => true,
                    'message' => 'Scale was not updated.'
                );
            }

            $response = array(
                'error' => false,
                'message' => Lang::get('messages.success.updated', array('entity' => 'Scale')),
                'data' => $scale
            );

            return $response;
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }

    public function destroy($id)
    {
        try
        {
            $scale = $this->findById($id);

            if ($scale) {
                $weightticket_scale = WeightTicketScale::where('scale_id', '=', $id)->get();

                if (!$weightticket_scale->count()) {
                    $scale->forceDelete();

                    return array(
                        'error' => false,
                        'message' => Lang::get('messages.success.deleted', array('entity' => 'Scale')),
                        'data' => null
                    );
                } else {
                    return array(
                        'error' => true,
                        'message' => 'Scale has weight ticket.'
                    );
                }
            }

            return array(
                'error' => true,
                'message' => 'Scale was not deleted.'
            );
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }

    public function validate($data, $id = null)
    {
        $rules = Scale::$rules;
        $messages = array(
            'rate.max' => 'The fee may not be greater than 100.00 .'
        );

        if ($id) {
            $rules['name'] = 'required|unique:scale,name,'.$id;
        }

        $validator = Validator::make($data, $rules, $messages);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return true;
    }

    public function instance($data = array())
    {
        return new Scale($data);
    }

}
