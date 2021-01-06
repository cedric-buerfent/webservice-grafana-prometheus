//    ACHTUNG DOCUMENT in UTF8-BOM GESPEICHERT!
//     ----- wichtig für Umlaute!

// Javascript file for bastion configuration GUI
// Tested with:
// Mozilla Firefox 72.0.2 
// Google Chome 73.0.3683.86
// Microsoft Internet Explorer 11.0.9600.17031  Win 8.1 26.05.2020


// -----------------------------------------------------------------------------
/* global variables*/
//hier globale variablen hin! "var" verwenden wenn global. Innerhalb fct nur "var" verwenden wenn lokal (sonst globaler Zugriff)
csv_values=[];
csv_pushed=false;

// -----------------------------------------------------------------------------
// Funktionen


//JQuery Library
$(document).ready(function(){
    /* Hier der jQuery-Code */
    //alert('Hallo Welt');

	//erstmaliger Aufruf beim Start
	init();
	
	//Knoepfe etc
	eventhandlers();
	



//ready
});

// ---------------------------------------------------    Startup ----------------------------------------------
// this function is executed directly page is loaded
function init(){

  //Schreibe was in unser Labelfeld. Direkt in den DOM reinscheiben
  mein_label =  $("#divers_output_label_001");
  mein_label.append("<br>nasenbaer");

  //fill dropdown: with connection type  
  //fill_dropdown_values_connection_type();
  
  //fill dropdown: read values via webservice call - you can disable it so no call when starting gui
  //get_dropdown_values_from_webservice();
  
  //reset file input
  $("#fileinput").val('');
  
}


// -------------------------------------------------------------------             
// fills dropdown with json values retrieved from backend 
function get_dropdown_values_from_webservice(){
  console.log("function get_dropdown_values_from_webservice()");
  
  
    //get dropbox
    dropbox = $("#existing_categories");
    //get second csv dropbox
    dropbox_csv = $("#existing_categories_csv");
    avalue=0;
    
		
    //dropbox.append(new Option("Four","04"));
    
	 //handle result of webservice call here    
    function GET_Result(aData){
	  console.log("GET: I Got:");
	  console.log(aData);
	   parse_categories(aData);
	}
	
	
	function parse_categories(aData){
	   console.log("-> parse_categories");
	   //console.log(aData);

	   //clear dropbox
       dropbox.empty();
	   dropbox_csv.empty();	  
	   
	   //iterate over all data and copy into dropbox
	   aData.forEach( iterate_over_categories);
	   
	     function iterate_over_categories(entry) { 
		 //console.log(entry);
		 //console.log(" "+entry.cat_id+" ->"+entry.name);
		 //dropbox.append(new Option("Four","04"));
		 adescription="cat_id: "+entry.cat_id+" name:"+entry.name;
		 dropbox.append(new Option(adescription,String(avalue)));
		 dropbox_csv.append(new Option(adescription,String(avalue)));
		 avalue=avalue+1;
		 
		 }    
	   
	   
	}//function
    
    //execute webcall           
    robust_GET_branch(GET_Result,"","categories");
	
	
}//fct


// -------------------------------------------------------------------             
// fills dropdown with custom values
function fill_dropdown_values_connection_type(){
  console.log("function fill_dropdown_values_connection_type()");
      
  var list_connection_types = ["RDP","HTML5RDP","SSH","HTML5SSH","VNC","HTML5VNC"];
	
	//get dropbox
    dropbox = $("#connection_type");
    //clear dropbox
    dropbox.empty(); 
    
    //iterate over all data and copy into dropbox
    list_connection_types.forEach( iterate_over_categories);
    
    function iterate_over_categories(entry) { 
     //console.log(entry);
	 //console.log(" "+entry.cat_id+" ->"+entry.name);
	 //dropbox.append(new Option("Four","04"));
	 //adescription="cat_id: "+entry.cat_id+" name:"+entry.name;
	 dropbox.append(new Option(entry,entry));
			 
		 }    

  
 }   

// -------------------------------------------------------------------             
// VALIDATE FORM: returns "ok" if servername,ip and connection types are fine.
// used when clicking the create button
function validate_form_create_ping(){
  console.log("validate_form_create_ping()");
  hostname   = $("#input_hostname").val();
  ip         = $("#input_ip").val();
  group      = $("#input_group").val();
  
  var err  = false;
  if(hostname == ""){console.log("hostname empty");
              $("#input_hostname").css('background-color', 'yellow');
              err=true;
              }
  if(ip == ""){console.log("IP empty");
              $("#input_ip").css('background-color', 'yellow');
              err=true;
              }
  if(group == ""){console.log("group empty");
              $("#input_group").css('background-color', 'yellow');
              err=true;
              }
			   
}




// -------------------------------------------------------------------             
// VALIDATE FORM: returns "ok" if servername,ip and connection types are fine.
// used when clicking the create button
function validate_form_singleressource(){
 console.log("validate_form_singleressource()");
 existing_category_text   = $("#existing_categories :selected").text();
 existing_category_value  = $("#existing_categories :selected").val();
 connection_type_text = $("#connection_type :selected").text();
 servername = $("#input_servername").val();
 ip = $("#input_IP").val();

 var err  = false; 
 if(ip == ""){console.log("IP empty");
              $("#input_IP").css('background-color', 'yellow');
              err=true;
              }
 if(servername == ""){console.log("Server empty");
              $("#input_servername").css('background-color', 'yellow');
              err=true;
              }
 //if( existing_category_text.includes("cat_id")){  unsupported by IE
   if( existing_category_text.indexOf("cat_id") !== -1){
     console.log("ok. cat_id exists.");
    } else {
      console.log("BAD. cat_id does not exist.");
      $("#existing_categories").css('background-color', 'yellow');
      err = true;    
	}
 if(err){alert("Sorry some fields not filled.");
 return "no";
 } else {return "ok";}
    
}

// -------------------------------------------------------------------             
// VALIDATE CSV FORM: returns "ok" if csv and categories are fine.
// used when clicking the BalanceMonCSV Button
function validate_form_multiple_csv_essources(){
   console.log("validate_form_multiple_csv_essources()");

   var err  = false; 
   existing_categories_csv_text   = $("#existing_categories_csv :selected").text();
   //if( existing_categories_csv_text.includes("cat_id")){ unsupported by IE
   if( existing_categories_csv_text.indexOf("cat_id") !== -1){
     console.log("ok. cat_id exists.");
    } else {
      console.log("BAD. cat_id does not exist.");
      //colour dropdown box
      $("#existing_categories_csv").css('background-color', 'yellow');
      err = true;    
	}

   //check if global array of files is empty
   console.log(csv_values.length);
   if(csv_values.length == 0){
     console.log("no file loaded or file empty.");
     $("#label_filename").css('background-color', 'yellow');
     err = true;
   }

   if(err){alert("Sorry some fields not filled.");
 return "no";
 } else {return "ok";}
 
}


// --------------------------------------------------- ALL EVENTS HERE ------------------------------------
function eventhandlers(){


// --------------------------------------------------- Eventhandler ---------------------------------------
$("#button_create_ping").click(function(){
    mein_label =  $("#divers_output_label_001");
    mein_label.append("<br>button_create_ping gedrückt!");
    
    //first we check formulaire if fields are empty. Break if not.
	is_okay = validate_form_create_ping();
	if(is_okay == "no"){ return 0;}
	

	//second construct webservice GET parameter
	hostname   = $("#input_hostname").val();
    ip         = $("#input_ip").val();
    group      = $("#input_group").val();
	GET_Sendvalue_String = "";
	GET_Sendvalue_String = "?hostname="+hostname+"&ip="+ip+"&group="+group;
	
	 //handle result of next/following webservice call/webcall    
    function GET_Result(aData){
	  console.log("GET: I Got:");
	  console.log(aData);
	  //alert(aData);
	  console.log(aData.RES);  
      //we show a popup	  
	  if( (typeof(aData.RES)=="string") && (aData.RES.indexOf("ERROR") >= 0)){
	    console.log("Error found.");
	    alert(aData.RES);
	  } else if( (typeof(aData.RES)=="string") && (aData.RES.indexOf("OK") >= 0)){
	    alert(aData.RES);
	  } else {console.log("[WARN] Unknown result.");}  
	}
	
	//execute webcall           
    //robust_GET_branch(GET_Result,"?hostname=nasenbaer","ping");
    robust_GET_branch(GET_Result,GET_Sendvalue_String,"ping");
});

// --------------------------------------------------- Eventhandler ---------------------------------------
$("#button_delete_ping").click(function(){
    mein_label =  $("#divers_output_label_001");
    mein_label.append("<br>button_delete_ping gedrückt!");
    
    //first we check formulaire if fields are empty. Break if not.
	is_okay = validate_form_create_ping();
	if(is_okay == "no"){ return 0;}
	

	//second construct webservice GET parameter
	hostname   = $("#input_hostname").val();
    ip         = $("#input_ip").val();
    group      = $("#input_group").val();
	GET_Sendvalue_String = "";
	GET_Sendvalue_String = "?hostname="+hostname+"&ip="+ip+"&group="+group;
	
	 //handle result of next/following webservice call/webcall    
    function GET_Result(aData){
	  console.log("GET: I Got:");
	  console.log(aData);
	  //alert(aData);
	  console.log(aData.RES);  
      //we show a popup	  
	  if( (typeof(aData.RES)=="string") && (aData.RES.indexOf("ERROR") >= 0)){
	    console.log("Error found.");
	    alert(aData.RES);
	  } else if( (typeof(aData.RES)=="string") && (aData.RES.indexOf("OK") >= 0)){
	    alert(aData.RES);
	  } else if( (typeof(aData.RES)=="string") && (aData.RES.indexOf("WARN") >= 0)){
	    alert(aData.RES);
	  } else {console.log("[WARN] Unknown result.");}  
	}
	
	//execute webcall               
    robust_GET_branch(GET_Result,GET_Sendvalue_String,"pingdelete");
});


// --------------------------------------------------- Eventhandler ---------------------------------------
$("#button_create_netdata").click(function(){
    mein_label =  $("#divers_output_label_001");
    mein_label.append("<br>button_create_netdata gedrückt!");
    
    //first we check formulaire if fields are empty. Break if not.
	is_okay = validate_form_create_ping();
	if(is_okay == "no"){ return 0;}
	

	//second construct webservice GET parameter
	hostname   = $("#input_hostname").val();
    ip         = $("#input_ip").val();
    group      = $("#input_group").val();
	GET_Sendvalue_String = "";
	GET_Sendvalue_String = "?hostname="+hostname+"&ip="+ip+"&group="+group;
	
	 //handle result of next/following webservice call/webcall    
    function GET_Result(aData){
	  console.log("GET: I Got:");
	  console.log(aData);
	  //alert(aData);
	  console.log(aData.RES);  
      //we show a popup	  
	  if( (typeof(aData.RES)=="string") && (aData.RES.indexOf("ERROR") >= 0)){
	    console.log("Error found.");
	    alert(aData.RES);
	  } else if( (typeof(aData.RES)=="string") && (aData.RES.indexOf("OK") >= 0)){
	    alert(aData.RES);
	  } else {console.log("[WARN] Unknown result.");}  
	}
	
	//execute webcall           
    //robust_GET_branch(GET_Result,"?hostname=nasenbaer","ping");
    robust_GET_branch(GET_Result,GET_Sendvalue_String,"createnetdataagent");
});
     
// --------------------------------------------------- Eventhandler   ---------------------------------------
$("#button_delete_netdata").click(function(){
    mein_label =  $("#divers_output_label_001");
    mein_label.append("<br>button_delete_netdata gedrückt!");
    
    //first we check formulaire if fields are empty. Break if not.
	is_okay = validate_form_create_ping();
	if(is_okay == "no"){ return 0;}
	

	//second construct webservice GET parameter
	hostname   = $("#input_hostname").val();
    ip         = $("#input_ip").val();
    group      = $("#input_group").val();
	GET_Sendvalue_String = "";
	GET_Sendvalue_String = "?hostname="+hostname+"&ip="+ip+"&group="+group;
	
	 //handle result of next/following webservice call/webcall    
    function GET_Result(aData){
	  console.log("GET: I Got:");
	  console.log(aData);
	  //alert(aData);
	  console.log(aData.RES);  
      //we show a popup	  
	  if( (typeof(aData.RES)=="string") && (aData.RES.indexOf("ERROR") >= 0)){
	    console.log("Error found.");
	    alert(aData.RES);
	  } else if( (typeof(aData.RES)=="string") && (aData.RES.indexOf("OK") >= 0)){
	    alert(aData.RES);
	  } else if( (typeof(aData.RES)=="string") && (aData.RES.indexOf("WARN") >= 0)){
	    alert(aData.RES);
	  } else {console.log("[WARN] Unknown result.");}  
	}
	
	//execute webcall               
    robust_GET_branch(GET_Result,GET_Sendvalue_String,"deletenetdataagent");
});

// --------------------------------------------------- Eventhandler ---------------------------------------
$("#button_create_wmi").click(function(){
    mein_label =  $("#divers_output_label_001");
    mein_label.append("<br>button_create_wmi gedrückt!");
    
    //first we check formulaire if fields are empty. Break if not.
	is_okay = validate_form_create_ping();
	if(is_okay == "no"){ return 0;}
	

	//second construct webservice GET parameter
	hostname   = $("#input_hostname").val();
    ip         = $("#input_ip").val();
    group      = $("#input_group").val();
	GET_Sendvalue_String = "";
	GET_Sendvalue_String = "?hostname="+hostname+"&ip="+ip+"&group="+group;
	
	 //handle result of next/following webservice call/webcall    
    function GET_Result(aData){
	  console.log("GET: I Got:");
	  console.log(aData);
	  //alert(aData);
	  console.log(aData.RES);  
      //we show a popup	  
	  if( (typeof(aData.RES)=="string") && (aData.RES.indexOf("ERROR") >= 0)){
	    console.log("Error found.");
	    alert(aData.RES);
	  } else if( (typeof(aData.RES)=="string") && (aData.RES.indexOf("OK") >= 0)){
	    alert(aData.RES);
	  } else {console.log("[WARN] Unknown result.");}  
	}
	
	//execute webcall           
    //robust_GET_branch(GET_Result,"?hostname=nasenbaer","ping");
    robust_GET_branch(GET_Result,GET_Sendvalue_String,"createwmiagent");
});
     
// --------------------------------------------------- Eventhandler   ---------------------------------------
$("#button_delete_wmi").click(function(){
    mein_label =  $("#divers_output_label_001");
    mein_label.append("<br>button_delete_wmi gedrückt!");
    
    //first we check formulaire if fields are empty. Break if not.
	is_okay = validate_form_create_ping();
	if(is_okay == "no"){ return 0;}
	

	//second construct webservice GET parameter
	hostname   = $("#input_hostname").val();
    ip         = $("#input_ip").val();
    group      = $("#input_group").val();
	GET_Sendvalue_String = "";
	GET_Sendvalue_String = "?hostname="+hostname+"&ip="+ip+"&group="+group;
	
	 //handle result of next/following webservice call/webcall    
    function GET_Result(aData){
	  console.log("GET: I Got:");
	  console.log(aData);
	  //alert(aData);
	  console.log(aData.RES);  
      //we show a popup	  
	  if( (typeof(aData.RES)=="string") && (aData.RES.indexOf("ERROR") >= 0)){
	    console.log("Error found.");
	    alert(aData.RES);
	  } else if( (typeof(aData.RES)=="string") && (aData.RES.indexOf("OK") >= 0)){
	    alert(aData.RES);
	  } else if( (typeof(aData.RES)=="string") && (aData.RES.indexOf("WARN") >= 0)){
	    alert(aData.RES);
	  } else {console.log("[WARN] Unknown result.");}  
	}
	
	//execute webcall               
    robust_GET_branch(GET_Result,GET_Sendvalue_String,"deletewmiagent");
});

// --------------------------------------------------- Eventhandler ---------------------------------------
$("#button_balancemoncsv").click(function(){
    mein_label =  $("#divers_output_label_001");
    mein_label.append("<br>button_balancemoncsv gedrückt!");
    
    //access global variable
    console.log(csv_values);
	
		 
  //handle result of webservice call here    
    function POST_Result(aData){
	  console.log("POST: I Got:");
	  console.log(aData);
	  alert(aData.Say);
	  //on GUI show it is not running anymore
	  mein_label =  $("#csvstat");
	  //empty it
      mein_label.text("");
	}
	
  	//validate forms if OK
	is_okay = validate_form_multiple_csv_essources();
	if(is_okay == "no"){ return 0;}
	
	//Get ID from dropdown box
	//e.g. cat_id: 5 name: Serveurs_Philips
    existing_categories_csv_text   = $("#existing_categories_csv :selected").text();
    string_array =  existing_categories_csv_text.split(" ");
    existing_category_csv_text_id="0";
    console.log("-->"+String(string_array.length)); 
    if( string_array.length > 2){
       existing_category_csv_text_id   = string_array[1];
       existing_category_csv_text_name = string_array[3];
       //console.log("-->"+existing_category_csv_text_name);
       //console.log("-->"+existing_category_csv_text_id);
    } else { console.log("no split ID and name because not enough values.");alert("Sorry. No ID. Ask Admin."); return 0;}
	console.log("ID:"+existing_category_csv_text_id);
	
	//construct new array object
	//var send_data = new Object();
	
	
	//append category ID to local array:	
    csv_values.push(["cat_id",existing_category_csv_text_id]);     
      
	    
	
	//becomes e.g.
	//[["testcb","10.1.1.1","DESC1","user-automation-regie","RDP"],
	// ["testcb1","10.1.1.2","DESC2","user-automation-regie","HTML5RDP"],
	// ["testcb4","10.1.1.4","DESC4","user-automation-regie","SSH"],
	// ["cat_id","5"]]
	

  var send_data = new Object();
  //send_data.RES_ARRAY=JSON.stringify(csv_values);
  send_data.RES_ARRAY=csv_values;
  var send_data_jsonstring = JSON.stringify(send_data);
	
  //jsonstring draus:
  //var send_data_jsonstring = JSON.stringify(csv_values);
  //reset all values to zero. Else append id will be appended multiple times
  csv_values=[];  
  console.log("Sending "+send_data_jsonstring);
  //execute webservice call	
  //robust_POST_branch(POST_Result,send_data_jsonstring,"csv");
  robust_POST_branch(POST_Result,send_data_jsonstring,"csv");
  
  //on GUI show it is running
  mein_label =  $("#csvstat");
  mein_label.text("running");
  
  
  
	    
});

// --------------------------------------------------- Eventhandler ---------------------------------------
$("#button_close").click(function(){
    mein_label =  $("#divers_output_label_001");
    mein_label.append("<br>button_close gedrückt!");
    // ------- geht nicht Firefox 2020
    //window.close();
	//javascript:self.close();
	//window.open('','_parent','');
    //window.close();
    // ---- geht firefox 2020:
	//window.location.replace("http://www.google.com"); //not compatible IE
	window.location = "http://www.google.com";  	
});

// --------------------------------------------------- Eventhandler ---------------------------------------
$("#button_test").click(function(){
    mein_label =  $("#divers_output_label_001");
    mein_label.append("<br>button_test gedrückt!");
    
    //handle data to send to webservice call here
	var to = new Object();
    to.firstname = "Cedric";
    to.lastname  = "Bürfent";
    console.log("Sending:");console.log(to);
    
    //handle result of webservice call here    
    function GET_Result(aData){
	  console.log("GET: I Got:");
	  console.log(aData);
	}
	
	function JSON_Result(aData){
	console.log("JSON: I Got:");
	  console.log(aData);
	  }
    
    //execute webcall
    robust_GET(GET_Result,"");
       
});

// --------------------------------------------------- Eventhandler ---------------------------------------
$("#button_test2").click(function(){

    mein_label =  $("#divers_output_label_001");
    mein_label.append("<br>button_test2 gedrückt!");
    
    //handle data to send to webservice call here
    
    //http://127.0.0.1:8081/ping?hostname=srv-test2&ip=99.99.99.99&group=Group-Test1
	var to = new Object();
    to.hostname = "srv-test3";
    to.ip  = "99.99.99.99";
    to.group = "Group-Test1";
    console.log("Sending:");console.log(to);
    GET_Sendvalue_String = "?hostname="+to.hostname+"&ip="+to.ip+"&group="+to.group;
    
    //handle result of webservice call here    
    function GET_Result(aData){
	  console.log("GET: I Got:");
	  console.log(aData);
	  //alert(aData);
	  //var arr = JSON.parse(aData);
	  //console.log(arr);
	  console.log(aData.RES);
	}
	
	function JSON_Result(aData){
	console.log("JSON: I Got:");
	  console.log(aData);
	  }
    
    //execute webcall           
    //robust_GET_branch(GET_Result,"?hostname=nasenbaer","ping");
    robust_GET_branch(GET_Result,GET_Sendvalue_String,"ping");
    
    //fill_dropdown_values_connection_type();
    
   
});

// --------------------------------------------------- Eventhandler ---------------------------------------
$("#button_test2a").click(function(){

    mein_label =  $("#divers_output_label_001");
    mein_label.append("<br>button_test2a gedrückt!");
    
    //handle data to send to webservice call here
    
    //http://127.0.0.1:8081/ping?hostname=srv-test2&ip=99.99.99.99&group=Group-Test1
	var to = new Object();
    to.hostname = "srv-test3";
    to.ip  = "99.99.99.99";
    to.group = "Group-Test1";
    console.log("Sending:");console.log(to);
    GET_Sendvalue_String = "?hostname="+to.hostname+"&ip="+to.ip+"&group="+to.group;
    
    //handle result of webservice call here    
    function GET_Result(aData){
	  console.log("GET: I Got:");
	  console.log(aData);
	  //alert(aData);
	  //var arr = JSON.parse(aData);
	  //console.log(arr);
	  console.log(aData.RES);
	}
	
	function JSON_Result(aData){
	console.log("JSON: I Got:");
	  console.log(aData);
	  }
    
    //execute webcall           
    //robust_GET_branch(GET_Result,"?hostname=nasenbaer","ping");
    robust_GET_branch(GET_Result,GET_Sendvalue_String,"pingdelete");
    
    //fill_dropdown_values_connection_type();
    
   
});


// --------------------------------------------------- Eventhandler ---------------------------------------
$("#button_test3a").click(function(){

    mein_label =  $("#divers_output_label_001");
    mein_label.append("<br>button_test3a gedrückt!");
    
    //handle data to send to webservice call here
    
    //http://127.0.0.1:8081/ping?hostname=srv-test2&ip=99.99.99.99&group=Group-Test1
	var to = new Object();
    to.hostname = "srv-netdatatest";
    to.ip  = "127.0.0.1";
    to.group = "Group-TEST";
    console.log("Sending:");console.log(to);
    GET_Sendvalue_String = "?hostname="+to.hostname+"&ip="+to.ip+"&group="+to.group;
    
    //handle result of webservice call here    
    function GET_Result(aData){
	  console.log("GET: I Got:");
	  console.log(aData);
	  //alert(aData);
	  //var arr = JSON.parse(aData);
	  //console.log(arr);
	  console.log(aData.RES);
	  //we show a popup	  
	  if( (typeof(aData.RES)=="string") && (aData.RES.indexOf("ERROR") >= 0)){
	    console.log("Error found.");
	    alert(aData.RES);
	  } else if( (typeof(aData.RES)=="string") && (aData.RES.indexOf("OK") >= 0)){
	    alert(aData.RES);
	  } else {console.log("[WARN] Unknown result.");}  
	  
	}
	
	function JSON_Result(aData){
	console.log("JSON: I Got:");
	  console.log(aData);
	  }
    
    //execute webcall           
    //robust_GET_branch(GET_Result,"?hostname=nasenbaer","ping");
    robust_GET_branch(GET_Result,GET_Sendvalue_String,"createnetdataagent");
    
    //fill_dropdown_values_connection_type();
    
   
});

// --------------------------------------------------- Eventhandler ---------------------------------------
$("#button_test3b").click(function(){

    mein_label =  $("#divers_output_label_001");
    mein_label.append("<br>button_test3b gedrückt!");
    
    //handle data to send to webservice call here
    
    //http://127.0.0.1:8081/ping?hostname=srv-test2&ip=99.99.99.99&group=Group-Test1
	var to = new Object();
    to.hostname = "srv-netdatatest";
    to.ip  = "127.0.0.1";
    to.group = "Group-TEST";
    console.log("Sending:");console.log(to);
    GET_Sendvalue_String = "?hostname="+to.hostname+"&ip="+to.ip+"&group="+to.group;
    
    //handle result of webservice call here    
    function GET_Result(aData){
	  console.log("GET: I Got:");
	  console.log(aData);
	  //alert(aData);
	  //var arr = JSON.parse(aData);
	  //console.log(arr);
	  console.log(aData.RES);
	  //we show a popup	  
	  if( (typeof(aData.RES)=="string") && (aData.RES.indexOf("ERROR") >= 0)){
	    console.log("Error found.");
	    alert(aData.RES);
	  } else if( (typeof(aData.RES)=="string") && (aData.RES.indexOf("OK") >= 0)){
	    alert(aData.RES);
	  } else {console.log("[WARN] Unknown result.");}
	}
	
	function JSON_Result(aData){
	console.log("JSON: I Got:");
	  console.log(aData);	  	
	  }
    
    //execute webcall           
    //robust_GET_branch(GET_Result,"?hostname=nasenbaer","ping");
    robust_GET_branch(GET_Result,GET_Sendvalue_String,"deletenetdataagent");
    
    //fill_dropdown_values_connection_type();
   
});

// --------------------------------------------------- Eventhandler ---------------------------------------
$("#button_test3c").click(function(){

    mein_label =  $("#divers_output_label_001");
    mein_label.append("<br>button_test3c gedrückt!");
    
    //handle data to send to webservice call here
    
    //http://127.0.0.1:8081/ping?hostname=srv-test2&ip=99.99.99.99&group=Group-Test1
	var to = new Object();
    to.hostname = "srv-wmitest";
    to.ip  = "127.0.0.1";
    to.group = "Group-TEST";
    console.log("Sending:");console.log(to);
    GET_Sendvalue_String = "?hostname="+to.hostname+"&ip="+to.ip+"&group="+to.group;
    
    //handle result of webservice call here    
    function GET_Result(aData){
	  console.log("GET: I Got:");
	  console.log(aData);
	  //alert(aData);
	  //var arr = JSON.parse(aData);
	  //console.log(arr);
	  console.log(aData.RES);
	  //we show a popup	  
	  if( (typeof(aData.RES)=="string") && (aData.RES.indexOf("ERROR") >= 0)){
	    console.log("Error found.");
	    alert(aData.RES);
	  } else if( (typeof(aData.RES)=="string") && (aData.RES.indexOf("OK") >= 0)){
	    alert(aData.RES);
	  } else {console.log("[WARN] Unknown result.");}
	}
	
	function JSON_Result(aData){
	console.log("JSON: I Got:");
	  console.log(aData);	  	
	  }
    
    //execute webcall           
    //robust_GET_branch(GET_Result,"?hostname=nasenbaer","ping");
    robust_GET_branch(GET_Result,GET_Sendvalue_String,"createwmiagent");
    
    //fill_dropdown_values_connection_type();
   
});

// --------------------------------------------------- Eventhandler ---------------------------------------
$("#button_test3d").click(function(){

    mein_label =  $("#divers_output_label_001");
    mein_label.append("<br>button_test3d gedrückt!");
    
    //handle data to send to webservice call here
    
    //http://127.0.0.1:8081/ping?hostname=srv-test2&ip=99.99.99.99&group=Group-Test1
	var to = new Object();
    to.hostname = "srv-wmitest";
    to.ip  = "127.0.0.1";
    to.group = "Group-TEST";
    console.log("Sending:");console.log(to);
    GET_Sendvalue_String = "?hostname="+to.hostname+"&ip="+to.ip+"&group="+to.group;
    
    //handle result of webservice call here    
    function GET_Result(aData){
	  console.log("GET: I Got:");
	  console.log(aData);
	  //alert(aData);
	  //var arr = JSON.parse(aData);
	  //console.log(arr);
	  console.log(aData.RES);
	  //we show a popup	  
	  if( (typeof(aData.RES)=="string") && (aData.RES.indexOf("ERROR") >= 0)){
	    console.log("Error found.");
	    alert(aData.RES);
	  } else if( (typeof(aData.RES)=="string") && (aData.RES.indexOf("OK") >= 0)){
	    alert(aData.RES);
	  } else {console.log("[WARN] Unknown result.");}
	}
	
	function JSON_Result(aData){
	console.log("JSON: I Got:");
	  console.log(aData);	  	
	  }
    
    //execute webcall           
    //robust_GET_branch(GET_Result,"?hostname=nasenbaer","ping");
    robust_GET_branch(GET_Result,GET_Sendvalue_String,"deletewmiagent");
    
    //fill_dropdown_values_connection_type();
   
});


// --------------------------------------------------- Eventhandler ---------------------------------------
$("#button_test3").click(function(){

    mein_label =  $("#divers_output_label_001");
    mein_label.append("<br>button_test3 gedrückt!");
    
   //get_dropdown_values_from_webservice();
    //handle result of next/following webservice call/webcall    
    function GET_Result(aData){
	  console.log("GET: I Got:");
	  console.log(aData);
	  //alert(aData);
	  console.log(aData.RES);  
      //we show a popup	  
	  if( (typeof(aData.RES)=="string") && (aData.RES.indexOf("BAD") >= 0)){
	    console.log("Error found.");
	    alert(aData.RES);
	  } else if( (typeof(aData.RES)=="string") && (aData.RES.indexOf("OK") >= 0)){
	    alert(aData.RES);
	  } else {console.log("[WARN] Unknown result.");}  
	}
	
	//execute webcall           
    //robust_GET_branch(GET_Result,"?hostname=nasenbaer","ping");
    robust_GET_branch(GET_Result,"","configcheck");
   
   
});



// --------------------------------------------------- Eventhandler ---------------------------------------
$("#button_test4").click(function(){
    //Send_POST csv (json)

    mein_label =  $("#divers_output_label_001");
    mein_label.append("<br>button_test4 gedrückt!");
   
   function GET_Result(aData){
	  console.log("GET: I Got:");
	  console.log(aData);
	  //alert(aData);
	  console.log(aData.RES);  
      //we show a popup	  
	  if( (typeof(aData.RES)=="string") && (aData.RES.indexOf("BAD") >= 0)){
	    console.log("Error found.");
	    alert(aData.RES);
	  } else if( (typeof(aData.RES)=="string") && (aData.RES.indexOf("OK") >= 0)){
	    alert(aData.RES);
	  } else {console.log("[WARN]");}  
	}
	
	//execute webcall           
    //robust_GET_branch(GET_Result,"?hostname=nasenbaer","ping");
    robust_GET_branch(GET_Result,"","reload");

       
});


// --------------------------------------------------- Eventhandler ---------------------------------------
$("#button_test4a").click(function(){
	//Send_POST 1 (json)
    mein_label =  $("#divers_output_label_001");
    mein_label.append("<br>button_test4a gedrückt!");
   
   //handle result of webservice call here    
    function POST_Result(aData){
	  console.log("POST: I Got:");
	  console.log(aData);
	  console.log(aData.Say);
	  alert(aData.Say);
	}
	
	//test=[['testcbX', '10.1.1.1', 'DESC1', 'user-automation-regie', 'RDP'], ['testcb1Y', '10.1.1.2', 'DESC2', 'user-automation-regie', 'HTML5RDP'],['cat_id', '99']];
	var send_data = new Object();
	send_data.RES_Description = "srv-cbced-001";   //description=servername
	send_data.RES_IP = "127.0.0.1";
	send_data.RES_Comm = "COMMENTAIRE"
	send_data.RES_User = "user-automation-regie";
	send_data.SERVICE_Type = "RDP"; //app.getOptionBox("Connection Type") e.g. RDP
    send_data.CATEGORIE = "24"; //becomes later https://safe.strg.arte/publicapi/arte/categories/"+str(CAT_NUM)+"/"  link + cat_id
    
	var send_data_jsonstring = JSON.stringify(send_data);


    console.log("Sending:"+send_data_jsonstring);
	robust_POST_branch(POST_Result,send_data_jsonstring,"createsingleressource");

});	
	
// --------------------------------------------------- Eventhandler ---------------------------------------
$("#button_test5").click(function(){
	//get form  values directly
    mein_label =  $("#divers_output_label_001");
    mein_label.append("<br>button_test5 gedrückt!");
    
    //first we check formulaire if fields are empty. Break if not.
	is_okay = validate_form_singleressource();
	if(is_okay == "no"){ return 0;}
   
	servername = "";
	ip         = "";
	existing_category_text = "";  //cat_id:1 name:RDS
	existing_category_value = ""; //
	connection_type_text = "";
	 
    //$('#dropDownId').val();
    //get dropbox
    existing_category_text   = $("#existing_categories :selected").text();
    existing_category_value  = $("#existing_categories :selected").val();
    
    connection_type_text = $("#connection_type :selected").text();
    
    servername = $("#input_servername").val();
    ip = $("#input_IP").val();
    
    console.log("Servername               :"+servername);
    console.log("IP                      :"+ip);
    console.log("Existing Category (Text) :"+existing_category_text);
    console.log("Existing Category (Value):"+existing_category_value);
    console.log("Connection Type (Text)   :"+connection_type_text);
    
    //cat_id: 5 name: Serveurs_Philips
    string_array =  existing_category_text.split(" ");
    if( string_array.length > 2){
       existing_category_text_id   = string_array[1];
       existing_category_text_name = string_array[3];
       console.log("Existing Category (Text) Split ID   :"+existing_category_text_id);
       console.log("Existing Category (Text) Split name :"+existing_category_text_name);
	} else { console.log("no split ID and name becaus not enough values.");alert("Sorry. No ID. Ask Admin.");return 0;}
    //console.log(string_array);

  validate_form_singleressource();   
       
});



// --------------------------------------------------- Eventhandler ---------------------------------------
$("#button_test6").click(function(){
    //simple login test
    
    mein_label =  $("#divers_output_label_001");
    mein_label.append("<br>button_test6 gedrückt!");
   
    
	 //handle result of webservice call here    
    function GET_Result(aData){
	  console.log("GET: I Got:");
	  console.log(aData);
	}
    
    //execute webcall            
    robust_GET_branch(GET_Result,"","login");
       
});

// --------------------------------------------------- Eventhandler ---------------------------------------
$("#button_test7").click(function(){

    mein_label =  $("#divers_output_label_001");
    mein_label.append("<br>button_test7 gedrückt!");
   
    
	 //handle result of webservice call here    
    function GET_Result(aData){
	  console.log("GET: I Got:");
	  console.log(aData);
	}
	
	 mein_label =  $("#csvstat");
     mein_label.text("running");
   
    
    //execute webcall            
    robust_GET_branch(GET_Result,"","values_after_login");
       
});



// --------------------------------------------------- Eventhandler ---------------------------------------
// LOAD CSV FILE
$("#fileinput").change(function(event){

    mein_label =  $("#divers_output_label_001");
    mein_label.append("<br>fileinput!");
    
    console.log("fileinput - file selected");


    var file = event.target.files[0]; 
    console.log(file.name);

    // ------------ HTML5 Javascript Filereader Win 8.1 IE OK, Firefox OK
   var reader = new FileReader();
   //console.log(reader.readAsArrayBuffer(file));
   //reader.readAsDataURL(file);
   //reader.readAsArrayBuffer(file);
   reader.readAsText(file);

   //reader.onload = function (oFREvent) { console.log(oFREvent.target.result);};
   reader.onload = function (oFREvent) {
  file_as_text = oFREvent.target.result; 
  console.log(file_as_text);
  
   string_array =  file_as_text.split("\n");
  //string_array =  file_as_text.split(" ");
  console.log(string_array);
  
  all_values=[];
  for(i=0;i<string_array.length;i++){
    //away with \n etc chars at end
    oneline = string_array[i].trim();
    console.log(i+":"+oneline);
    //commata separate fields
	all_fields = oneline.split(";");
    //ignore empty lines
	if(oneline != ""){ all_values.push(all_fields);}
	
    //we can trim: .replace(/\\n/g, '')  or  strObj.trim();
  }
  console.log(all_values);
  
  //becomes now a global variable
  csv_values = all_values;
  
  //display what we read
  alert("Reading this:"+csv_values);
  
  
 
};//onload
  

});



//eventhandlers
}

// --------------------------------------  AJAX Ziel --------------------------------
function robust_GET(aCallback,GETvars){
    //var endPoint="http://192.168.178.39:3000/query";
    //var endPoint="http://192.168.178.39:3000/allparams_simple";
    //var endPoint="http://192.168.178.39:3000/allparams";
    //var endPoint="http://192.168.178.40:8081/test/index.html";
    //var endPoint="http://127.0.0.1:8081/test/index.html";  //local
    var endPoint="http://172.24.9.58:9091/test/index.html";
    
     //get checkbox status if query localhost webservice
    localhost_checkbox = $("#enable_local");
    console.log(localhost_checkbox.prop('checked') );
    if(localhost_checkbox.prop('checked')){
       endPoint="http://127.0.0.1:8081/test/index.html";
    }
    
    console.log("Endpoint: "+endPoint);
    endPoint=endPoint+GETvars;
    console.log("Get variables to send: "+endPoint);
    
    $.get(endPoint, function(data, status){
    //$.get(" http://127.0.0.1:3000/query", function(data, status){
    //$.get(" http://192.168.178.39:3000/query", function(data, status){
    //console.log(data);
    aCallback(data);
    });

//robust_GET
}

// --------------------------------------  AJAX Ziel mit Sub-Path/Branch --------------------
function robust_GET_branch(aCallback,GETvars,branch){
    //var endPoint="http://192.168.178.39:3000/query";
    //var endPoint="http://192.168.178.39:3000/allparams_simple";
    //var endPoint="http://192.168.178.39:3000/allparams";
    //var endPoint="http://192.168.178.40:8081/test/index.html";
    //var endPoint="http://127.0.0.1:8081/"+branch;  //local dev
    //see below for DEV localhost button
    var endPoint="http://172.24.9.58:9091/"+branch;
	//var endPoint="http://192.168.178.41:8081/"+branch;    
    //srv-cacti-vm:
    //var endPoint="http://172.24.9.101:8081/"+branch;
    
    //get checkbox status if query localhost webservice
    localhost_checkbox = $("#enable_local");
    console.log(localhost_checkbox.prop('checked') );
    if(localhost_checkbox.prop('checked')){
       endPoint="http://127.0.0.1:8081/"+branch;
    }
       
    console.log("Endpoint: "+endPoint);
    endPoint=endPoint+GETvars;
    console.log("Get variables to send: "+endPoint);
    
    $.get(endPoint, function(data, status){
    //$.get(" http://127.0.0.1:3000/query", function(data, status){
    //$.get(" http://192.168.178.39:3000/query", function(data, status){
    //console.log(data);
    aCallback(data);
    });

//robust_GET
}

// --------------------------------------  AJAX POST Ziel mit Sub-Path/Branch ----------------
function robust_POST_branch(aCallback,POSTvars,branch)
{
   //var endPoint="http://192.168.178.39:3000/query";
   //var endPoint="http://127.0.0.1:8081/"+branch;
   //var endPoint="http://172.24.9.58:9091/"+branch;
   //srv-cacti-vm:
   //var endPoint="http://172.24.9.101:8081/"+branch
 $.ajax({
           type: "POST",
           url: endPoint,
           data: POSTvars, //"", // JSON.stringify(..) serializes the form's elements d.h. creates a json string
           success: function(data)
           {
               //alert(data); // show response from the php script.
               console.log(data);
               aCallback(data);
           }
         });
}   



//Endlosschleife
function periodic_loop1(){
    var zeitstring="";
    zeitstring = new Date().toLocaleString('de-DE');
    //console.log(zeitstring);
    //rekursiv
    setTimeout("periodic_loop1();", 1000);
}
