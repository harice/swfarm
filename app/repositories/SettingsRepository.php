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

        $settings = array(
                        "freight_rate" => $freightRate['value'],
                        "loading_rate" => $loadingRate['value'],
                        "unloading_rate" => $unloadingRate['value'],
                        "trailer_percentage_rate" => $trailerpercentagerate['value'],
            );

        return $settings;
    }
    
}
