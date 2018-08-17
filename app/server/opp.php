<?php

$quarters = ["Q1FY14", "Q2FY14", "Q3FY14", "Q4FY14", "Q1FY15", "Q2FY15", "Q3FY15", "Q4FY15", "Q1FY16", "Q2FY16", "Q3FY16", "Q4FY16", "Q1FY17", "Q2FY17", "Q3FY17", "Q4FY17", "Q1FY18", "Q2FY18", "Q3FY18", "Q4FY18"];
//$quarters = ["Jan FY16", "Feb FY16", "Mar FY16", "Apr FY16", "May FY16", "Jun FY16", "Jul FY16", "Aug FY16", "Sep FY16", "Oct FY16", "Nov FY16", "Dec FY16", "Jan FY17", "Feb FY17", "Mar FY17", "Apr FY17", "May FY17", "Jun FY17"];
//$quarters = ["Apr FY15", "May FY15", "Jun FY15", "Jul FY15", "Aug FY15", "Sep FY15", "Oct FY15", "Nov FY15"];
$quarters = ["FY10", "FY11", "FY12", "FY13", "FY14", "FY15", "FY16", "FY17", "FY18", "FY19"];
//$quarters = ["Enterpr.", "Security", "Collab", "DCV", "SP"];
$quarters = ["Q3FY16", "Q4FY16"];
$quarters = ["Q3FY16", "Q4FY16", "Q1FY17", "Q2FY17", "Q3FY17", "Q4FY17",];
//$quarters = ["Mar-16", "Apr-16", "May-16", "Jun-16", "Jul-16", "Aug-16"];
//$quarters = ["Collaboration", "Enterprise Routing", "Mobility", "Security", "SP Video Infrastructure"];
//$quarters = ["Can Commercial East", "Can Commercial West", "Can Commercial_Central", "Canada Public Sector", "Canada_Enterprise"];

$areas = ["US_Enterprise (AMER)", "Canada (AMER)", "India_Area (APJ)", "Emear_Central (EMEAR)", "Emear_North (EMEAR)", "Emear_South (EMEAR)"];
$areas = ["US_Enterprise (AMER)", "Canada (AMER)", "India_Area (APJ)", "Emear_Central (EMEAR)", "Emear_North (EMEAR)"];
$areas = ["Continental Resources", "Alexander Systems", "Core BTS", "Kapsch AG", "Liberty INC", "Cisco Internal"];
//$areas = ["Verizon Cloud", "Comcast Jiturral", "China Telecom", "Cisco Internal", "British Telecom", "US Telecom"];
//$areas = ["Robert Jackson", "Brian Martin", "Liz Sayer", "Steve Falconer"];
//$areas = ["Commercial West", "Commercial Central", "Commercial East", "Commercial South", "Commercial North"];
//$areas = ["US_Enterprise (AMER)"];
//$areas = ["Collaboration", "Enterprise Routing", "Mobility", "Security", "SP Video Infrastructure"];
//$areas = ["Q1FY16", "Q2FY16", "Q3FY16", "Q4FY16", "Q1FY17", "Q2FY17"];
$areas = ["Can Commercial East", "Can Commercial West", "Can Commercial_Central", "Canada Public Sector", "Canada_Enterprise"];
$areas = ["Health Quest", "Geico Corporation", "Symantec Corporation", "NCR Corporation", "State Farm Mutual"];
$areas = ["Kapstone", "Lenovo Group Limited", "Gilbarco", "Coastal Federal", "Services LLC"];
$areas = ["Robert Jackson", "Brian Martin", "Liz Sayer", "Steve Falconer"];
$areas = ["MBNA CANADA BANK"];


$keys = ["Collaboration", "Computing Systems", "Enterprise Routing", "IOT Software", "Mobility", "Security", "Service Provider Routing", "SP Video Infrastructure", "SP Video Software and Solutions", "Switching", "Wireless", "Other"];
//$keys = ["Enterprise Network", "Security",  "Collaboration", "DCV", "SP"];
//$keys = ["Expired", "Upcoming Renewal"];
//$keys = ["Covered", "Uncovered"];
//$keys = ["On-Time", "Late", "Missed", "Remaining"];
//$keys = ["Attach", "Renew", "Refresh"];
//$keys = ["1st Month", "2nd Month", "3rd Month"];
//$keys = ["Early", "Ontime", "Late1 Month", "Late2 Months", "Late3 Months"];
//$keys = ["TS Attach", "SWSS Attach"];
$keys = ["Collaboration", "Enterprise Routing", "Mobility", "Security", "SP Video Infrastructure"];
//$keys = ["<1 Month", "1-3 Months", "3> Months"];
//$keys = ["Canada", "Global Enterprise", "Latin America", "US Commercial", "US Other", "US PS Marketing"];
//$keys = ["Actionable Opportunity", "SFDC Pipeline"];
$keys_drill = new stdClass();
$keys_drill = [["Unified Communication", "Video", "Webber", "Contact Center", "Other"], ["Ent. Edge Routing", "Ent. Core Routing", "Ent. Switching Access", "Ent. Switching Core", "Ent. Wireless"], ["UCS", "NX2-6K", "NX3K", "NX7K", "MDS"], ["ASA & NGFW", "AMP", "Email Security", "Policy & Access", "Web Security"], ["SP Routing", "Packet Core", "SP Video & SW Solutions", "SP Access", "Other"]];

$keys_inner = ["Actionable Opportunity"];
$keys_inner = ["Actionable Opportunity", "SFDC Pipeline"];


$array = [];

foreach ($quarters as $q) {
    $obj = new stdClass();
    $obj->quarter = $q;
    $areas_array = [];
    foreach ($areas as $a) {
        $obj_2 = new stdClass();
        $obj_2->state = $a;
        $freq_obj = new stdClass();
        foreach ($keys as $ind => $k) {
            $freq_obj->$k = new stdClass();
            $freq_obj_new = new stdClass();
            $areas_drill = new stdClass();
            $total = [0, 0];
            foreach ($keys_drill[$ind] as $k1) {
                $freq_obj_4 = new StdClass();
                foreach ($keys_inner as $k2 => $i) {
                    $t = rand(10, 45) * 1000000;
                    $total[$k2] += $t;
                    $freq_obj_4->$i = $t;
                }
                $areas_drill->$k1 = $freq_obj_4;
                $freq_obj->$k->areas_drill = $areas_drill;
            }

            //   $freq_obj_3 = new StdClass();
            foreach ($keys_inner as $k3 => $i) {
                $freq_obj->$k->$i = $total[$k3];
            }
            // = $freq_obj_3;
        }


//        $freq_obj_2 = new stdClass();
//        foreach ($keys as $k) {
//            $freq_obj_2->$k = rand(10, 45) * 1000000;
//        }

        $obj_2->freq = $freq_obj;
        // $obj_2->freq_2 = $freq_obj_2;
        array_push($areas_array, $obj_2);
    }
    $obj->areas = $areas_array;
    array_push($array, $obj);
}

//var_dump($array);
$json = json_encode($array);
header('Content-Type: application/json');
echo $json;
