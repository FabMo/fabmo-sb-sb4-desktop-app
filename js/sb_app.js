/**
 ***** Main js functionality for SB4 Commands *****  
 **/

function sendCmd(command) {
  var thisCmd = command || $('#cmd-input').val();
    $('#cmd-input').val('');    			 // remove after sent or called
    $("#cmd-help").css("visibility","hidden");
    postSbpAction(thisCmd);

    // Some Commands Need 'SV' to make permanent because each command run like a file; thus need a multiline version
  	var cmd_eval = thisCmd.substring(0,2);
        console.log(thisCmd);
        switch (cmd_eval) {
  			case "VS":
		        var mult_cmds=[
        		thisCmd,
          		'SV'						        // Make Permanent
          		].join("\n");
        		fabmo.runSBP(mult_cmds);	// SEND MULTI >>>  
  				break;
  			case "MS":
		        var mult_cmds=[
        		thisCmd,
          		'SV'						        // Make Permanent
          		].join("\n");
        		fabmo.runSBP(mult_cmds);	// SEND MULTI >>>  
  				break;
  			default:
                fabmo.runSBP(thisCmd);    	// SEND SIMPLE >>>
  				break;
  		}

}

function getUsrResource(remote, local) {                ////## mucking around here testing Easel
  // temporarily only getting local because not detecting error on raspi tablets 
  //    fabmo.navigate(local,{target : '_blank'});

  fabmo.isOnline(function(err, online) {
    if(err) {
      console.log("isOnline Error");
      return;         
    }
    if(online) {
      //fabmo.navigate(remote,{target : '_blank'});    }
      fabmo.navigate(remote,{target : '_self'});    }
    else {
//      fabmo.navigate(local,{target : '_blank'});
      fabmo.navigate(remote,{target : '_blank'});
    }
  });
  $('#cmd-input').val('');
}

function postSbpAction(action) {
  setTimeout(function() { 
    $("#file_txt_area").text("-------Running:" + '\n' + "    " + action); }, 
    200);
}

function setSafeCmdFocus(site) {     // too easy to walk on Manual Keypad (not sure why?); so protect
  console.log("got safeCheck", site) // site for debugging flow
    if (globals.FAbMo_state === "manual") {
        return;
    }
    if (globals.FIll_In_Open === true) {    // let fill-in keep focus
        return;
    }
    if (globals.INject_inputbox_open) {
        $("#insert-input").focus();
    } else {
        $("#cmd-input").focus();
    }
}

function displayFillIn(parameters, title, info) {
    if (title.substring(0,4) === "File") {    // handle as file
        $('#btn_prev_file').show();
        $('#btn_ok_run').text("OK-Run")
    } else {
        $('#btn_prev_file').hide();
        $('#btn_ok_run').text("Run Command")
    }
    if ( parameters === "") {
        $('#fi_params').hide();
        $('#fi_params').val("");
    } else {
        $('#fi_params').show();
        $('#fi_params').val(parameters);
    }
    $('#cur_fi_info').empty();
    if (info === "") {
        $('#cur_fi_info').append("Edit Parameters: double-click the desired field, replace *Required*, over-write defaults as needed, or provide {optional} values.")
        // Command details in <a href='assets/docs/ComRef.pdf'>Command Reference</a>, from Help");
    } else {
        $('#cur_fi_info').append(info);
    }
    $('#modalTitle').empty();
    $('#modalTitle').append(title);
    $('#fill-in-modal').trigger("reset");
    $('#fill-in-modal').foundation('reveal', 'open');
    globals.FIll_In_Open = true;
}

function processCommandInput(command) {
    console.log('got command')
    var command = command.trim().toUpperCase();
    if (command.length == 1) {
        switch (command) {
        case "F":
            $("#cmd-input").val(command);
            $("#menu_files").click();
            break;
        case "M":
            $("#cmd-input").val(command);
            $("#menu_moves").click();
            break;
        case "J":
            $("#cmd-input").val(command);
            $("#menu_jogs").click();
            break;
        case "C":
            $("#cmd-input").val(command);
            $("#menu_cuts").click();
            break;
        case "Z":
            $("#cmd-input").val(command);
            $("#menu_zero").click();
            break;
        case "S":
            $("#cmd-input").val(command);
            $("#menu_settings").click();
            break;
        case "V":
            $("#cmd-input").val(command);
            $("#menu_values").click();
            break;
        case "T":
            $("#cmd-input").val(command);
            $("#menu_tools").click();
            break;
        case "D":
            $("#cmd-input").val(command);
            $("#menu_design").click();
            break;
        case "H":
            $("#cmd-input").val(command);
            $("#menu_help").click();
            break;
        default:
            command = "";
            event.preventDefault();   // ESC as a general clear and update tool
            curLine = "";             // Remove after sent or called
            $(".top-bar").click();    // ... and click to clear any dropdowns
            $("#file_txt_area").text("");
            $("#cmd-input").val(command);
            setSafeCmdFocus();
            break;
        }

//    } else if ((command.length == 2) && (globals.LIcmds).includes(command)) {
    } else if (command.length == 2) {
        // HANDLE COMMAND: First do direct action key single commands                                        
        switch (command) {
        case "JH":
        case "MH":
        case "MO":
        case "M0":
        case "SA":
        case "SR":
        case "SF":
        case "ST":
        case "ZX":
        case "ZY":
        case "ZZ":
        case "ZA":
        case "ZB":
        case "ZC":
        case "Z2":
        case "Z3":
        case "Z4":
        case "Z5":
        case "Z6":
        case "ZT":    
        case "C1":
        case "C2":
        case "C3":
        case "C4":  
        case "C5":  
        case "C6":  
        case "C7":  
        case "C8":  
        case "C9":  
            sendCmd(command);
            break;
        case "FP":
            // curFile = "";                           // ... clear out after running
            // curFilename = "";
            $("#cur_fi_info").text("");
            $("#cmd-input").val(command);
            $('#file').val('');
            $('#file').trigger('click');
            break;
        }

        // HANDLE COMMAND: Then do commands with a FILL-IN sheet
        switch (Array.from(command)[0]) {
            case "C":
                if (command === "CN" || command === "C#") {  // let these two filter on through
                    break;
                }
            case "S":
            case "V":        
                let titleCmd = "", parameters = "";
                $("#cmd-input").val(command);
                console.log(cmds[command].params);
                cmds[command].params.forEach(function(entry) {
                    console.log("entry> ", entry.name, entry.disptype);
                    if (entry.disptype === "2") {
                        parameters += " *" + entry.name + "*, ";
                    } else if (entry.disptype === "1" && entry.default != "") {
    //                    parameters += entry.default + " {<-def| " + entry.name + "}, ";
                        parameters +=  " {" + entry.name + " <def>} " + entry.default +",";
                    } else if (entry.disptype === "1") {               // ignore disptype ""
                        parameters += " {" + entry.name + "}, ";
                    }
                });  
                console.log(parameters)          
                titleCmd = command + ": " + cmds[command].name

                displayFillIn(parameters, titleCmd, "");

                break;
        }    
        
        // HANDLE COMMAND: Then do all the misc special commands
        switch (command) {
            case "SI": // obsolete
            case "FN":
                fabmo.launchApp('editor', {
                'new': true,
                'content': "' Create an OpenSBP job here ...",
                'language': 'sbp'
                });
                break;
                                                                                    // ## mucking around here with Easel and in calling routines &AND NODE-RED
            case "TR":                                                             // testing some Node-Red stuff ... **added to this sbp3_commands
                let tempip = window.globals.ORigin + ':1880/ui';
                getUsrResource(tempip, 'assets/docs/No_Internet.pdf');
                break;        

            case "DE":                                                             // testing some design stuff ... **added to this sbp3_commands
                getUsrResource('http://easel.inventables.com/users/sign_in', 'assets/docs/No_Internet.pdf');
                break;        
            case "DA":
                getUsrResource('https://www.inventables.com/technologies/easel', 'assets/docs/No_Internet.pdf');
                break;
            case "DT":
                //getUsrResource('https://www.tinkercad.com/dashboard', 'assets/docs/No_Internet.pdf'); // also '/join' or '/login'
                getUsrResource('https://www.tinkercad.com/login', 'assets/docs/No_Internet.pdf');
                break;        

            case "HA":
                // version info for this app from fabmo.js api call to fabmo engine ...  
                console.log("at HA");
                $('#cmd-input').val('');
                fabmo.notify('info', 'About: not getting AppInfo from FabMo');
                fabmo.getAppInfo(function(err, info) {
                    console.log("appinfo " + info); 
                    fabmo.notify('info', 'About: not getting AppInfo from FabMo');
                });
                break;

            case "HC":
                    //getUsrResource('http://www.shopbottools.com/ShopBotDocs/files/SBG00253140912CommandRefV3.pdf#CC', 'assets/docs/ComRef.pdf');       
                    getUsrResource('assets/docs/ComRef.pdf', 'assets/docs/ComRef.pdf');       
                    break;        

            case "HL":
                    $('#cmd-input').val('');
                    var cachedConfig = null;
                    // Get the configuration from the tool and update
                    var updateConfig = function() {
                        fabmo.getConfig(function(err, config) {
                            cachedConfig = config;
                            // // Update the tool info statement
                            //     document.getElementById('tool-name').innerHTML = config.engine.profile;
                            //     document.getElementById('envelope-x').innerHTML = config.machine.envelope.xmax - config.machine.envelope.xmin;
                            //     document.getElementById('envelope-y').innerHTML = config.machine.envelope.ymax - config.machine.envelope.ymin;
                            //     document.getElementById('tool-version').innerHTML = config.engine.version;
                            //     document.getElementById('tool-units').innerHTML = config.machine.units;
                            // // Update the configuration 
                                document.getElementById('full-config').innerHTML = JSON.stringify(config, null, '   ');
                        });			
                    }
                // Update it
                $('#helpModal').foundation('reveal', 'open');
                updateConfig();

                break;        
            case "HF":
                getUsrResource('https://handibot.com/forum/list.php?2', 'assets/docs/No_Internet.pdf');
                break;        
            case "HW":
                getUsrResource('https://handibot.com', 'assets/docs/No_Internet.pdf');
                break;        
            case "HQ":
                getUsrResource('http://docs.handibot.com/doc-output/Handibot2_Unboxing.pdf', 'assets/docs/Handibot 2 MANUAL Unboxing Source_v004.pdf');
                break;        
            case "HS":
                getUsrResource('http://docs.handibot.com/doc-output/Handibot2_Safety.pdf', 'assets/docs/Handibot 2 MANUAL Safe Use Source_v002.pdf');
                break;        
            default:
                var newCommandString = command + ", ";
                $("#cmd-input").val(newCommandString);                        // Set Command letters for default case
                setSafeCmdFocus();
                $("#cmd-help").text("?" + newCommandString.substring(0, 2));  // Show the helper button  
                $("#cmd-help").css("visibility","visible");
                break;
        }
        if ((globals.LIcmds).includes(command)) {  // and if we still have something that is in out list
            return true;
        } else {
            // HANDLE COMMAND: Deal with incorrect second Command key
            let trunkated = command.substring(0, 1);
            $("#cmd-input").val(trunkated);
            return false
        }
    }

    if (command.length > 2) {
        return true;
    }    

}
