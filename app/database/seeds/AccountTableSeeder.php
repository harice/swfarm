<?php

class AccountTableSeeder extends Seeder {
    
    public function run()
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        DB::unprepared("INSERT INTO `account` SET `id` =1, `name` = '4 B Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =2, `name` = '5K Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =3, `name` = '7 Drag Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =4, `name` = 'A & Z Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =5, `name` = 'A Tumbling T Ranch', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =6, `name` = 'ACX Trading Co', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =7, `name` = 'Alamo Ranch Co. Inc', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =8, `name` = 'All Seasons Hay Co', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =9, `name` = 'Alton Roger', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =10, `name` = 'Anderson Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =11, `name` = 'Aqua Fria Packing', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =12, `name` = 'Arizona Hay Co', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =13, `name` = 'Arizona Mariculture', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =14, `name` = 'Arlington Valley Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =15, `name` = 'Armach Agriculture', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =16, `name` = 'Avi Kwa Ame Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =17, `name` = 'B & G Hay Inc', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =18, `name` = 'B & W Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =19, `name` = 'B-Y Ranch', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =20, `name` = 'Barkley Company of AZ', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =21, `name` = 'BFE Landholdings LLC', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =22, `name` = 'Blair Farms Inc', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =23, `name` = 'Blohm Partnership', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =24, `name` = 'Bob Pendergast', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =25, `name` = 'Boschma Dairy', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =26, `name` = 'Brooks Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =27, `name` = 'Bruce Neely', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =28, `name` = 'Bruno Ranch', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =29, `name` = 'BVT', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =30, `name` = 'Carmichael Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =31, `name` = 'Carters Feed', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =32, `name` = 'Catron Cotton Company', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =33, `name` = 'Chamblin Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =34, `name` = 'Chical Haystack Inc.', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =35, `name` = 'Chino Hay Market', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =36, `name` = 'Chris Massey', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =37, `name` = 'CJ Bell Inc', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =38, `name` = 'Clark Root Ranches', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =39, `name` = 'Craig Jensen', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =40, `name` = 'D & D Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =41, `name` = 'D & M Hay Sales', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =42, `name` = 'D M Abrams Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =43, `name` = 'Dan Hardision', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =44, `name` = 'Dan Narramore', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =45, `name` = 'Daniel Nowlin Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =46, `name` = 'Darryl Kuiper', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =47, `name` = 'David  F. Shafer', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =48, `name` = 'Desert Security Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =49, `name` = 'Diamond B Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =50, `name` = 'Discovery West Ranches', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =51, `name` = 'Don Hauser', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =52, `name` = 'Dorame Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =53, `name` = 'Dunlap Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =54, `name` = 'Eagle Tail Farming Partnership', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =55, `name` = 'Eureka Producers Cooperative', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =56, `name` = 'F & M Baldenegro Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =57, `name` = 'Falcon Farms LLC', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =58, `name` = 'Frank Garcia & Sons', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =59, `name` = 'Frank McDaniels Farms Inc', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =60, `name` = 'Fred & Carolyn Bailey', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =61, `name` = 'Fred Benbow', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =62, `name` = 'Gibbons Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =63, `name` = 'Gila River Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =64, `name` = 'Gladden Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =65, `name` = 'Grandview Dairy', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =66, `name` = 'Green Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =67, `name` = 'Greer Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =68, `name` = 'H-Four Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =69, `name` = 'Harquahala Valley Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =70, `name` = 'Harter Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =71, `name` = 'Hartman Quarter Horses', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =72, `name` = 'Hauser & Hauser Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =73, `name` = 'Hubbard Cattle Company', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =74, `name` = 'Hughes Farm & Ranch Supply', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =75, `name` = 'Ian Accomazzo', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =76, `name` = 'J R Preece', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =77, `name` = 'J-J Moyle', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =78, `name` = 'J.V. Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =79, `name` = 'Jerry Maynard', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =80, `name` = 'Jim Hardin', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =81, `name` = 'Jim Mamer Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =82, `name` = 'Jim Ruttle', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =83, `name` = 'John Grizzle Farming', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =84, `name` = 'John Tucker', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =85, `name` = 'John Vanderway', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =86, `name` = 'K & S Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =87, `name` = 'Ken Sheeley Ranches Partners', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =88, `name` = 'Ken Sheely Ranches', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =89, `name` = 'Kevin Johnson', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =90, `name` = 'Kevin Richardson', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =91, `name` = 'L5 Farms LLC', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =92, `name` = 'Ladra Farms II', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =93, `name` = 'Larry Rovey Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =94, `name` = 'Leon Hardison', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =95, `name` = 'Lesco Enterprises', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =96, `name` = 'Lester Hay Co. Inc', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =97, `name` = 'Lonnie Carmichael', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =98, `name` = 'LyreeDale Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =99, `name` = 'M & C Hay', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =100, `name` = 'Mamer Hay Co', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =101, `name` = 'Massey Enterprises', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =102, `name` = 'Mohave Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =103, `name` = 'Molitor Farm and Ranch LLC', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =104, `name` = 'Murdock Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =105, `name` = 'Northside Hay Company Inc', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =106, `name` = 'Outlaw Dairy', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =107, `name` = 'Paul Rovey Dairy', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =108, `name` = 'PRP Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =109, `name` = 'R&B Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =110, `name` = 'Raul Gonzalez', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =111, `name` = 'Reese & Lisa Marshall & Sons', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =112, `name` = 'Richard Sanders', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =113, `name` = 'Rick Sutter', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =114, `name` = 'Rick Young Ranches', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =115, `name` = 'Riverbank Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =116, `name` = 'Rogers Bros. Hay', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =117, `name` = 'Rogers Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =118, `name` = 'Rouseau Farming Company', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =119, `name` = 'Rovey Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =120, `name` = 'S & P Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =121, `name` = 'S&S Hay Company', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =122, `name` = 'San Simone Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =123, `name` = 'Santa Cruz Ranches', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =124, `name` = 'Schulz Farm', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =125, `name` = 'Scott Shroder', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =126, `name` = 'Shamrock Farms Co', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =127, `name` = 'Sierra Negra Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =128, `name` = 'Skousen Farms Parternship', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =129, `name` = 'Steve Mamer', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =130, `name` = 'Sunset Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =131, `name` = 'Tim Bailey', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =132, `name` = 'Tim Rhodes Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =133, `name` = 'Tim Smith', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =134, `name` = 'Timbuck Two Farm Partnership', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =135, `name` = 'Timco Hay Sales', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =136, `name` = 'Tom Burks', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =137, `name` = 'Tommy Mills', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =138, `name` = 'Torres Hay Co.', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =139, `name` = 'Triple S Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =140, `name` = 'Tumbleweed Dairy', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =141, `name` = 'United Hay Company', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =142, `name` = 'Vanderbilt Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =143, `name` = 'Vanderpol Hay Sales', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =144, `name` = 'Vanderslice Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =145, `name` = 'Vicksburg Ranch, GP', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =146, `name` = 'Waddell Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =147, `name` = 'Wakimoto Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =148, `name` = 'Warren Pierson', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =149, `name` = 'West Coast Tillage LLC', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =150, `name` = 'Western Hay Company Inc', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =151, `name` = 'Williams & Williams Hay', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =152, `name` = 'Winnemucca Farms Inc', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =153, `name` = 'Wood Brothers Farm', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =154, `name` = 'WSA Farms', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =155, `name` = 'Circle R Operations', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =156, `name` = 'Versal Transportation', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =157, `name` = 'Arturo Esparza Transport', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =158, `name` = 'PCI Trucking & Logistics, LLC', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =159, `name` = 'TMC Transport', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =160, `name` = 'Muller & Sons Trucking', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =161, `name` = 'McClure & Son Trucking Inc.', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =162, `name` = 'USA Logistics Inc.', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =163, `name` = 'Joe Tex', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =164, `name` = 'Sem Tex Express', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =165, `name` = 'Adrian Olivas', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =166, `name` = 'Mendi Logistics', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");
        DB::unprepared("INSERT INTO `account` SET `id` =167, `name` = 'Bob Broek', `phone` = '(888) 888-8888', `created_at`=CURDATE(), `updated_at`=CURDATE();");

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }
    
}
