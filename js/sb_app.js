/**
 * Main js file for SB4 // SB4 application starts here after initialize_ready  
 * Includes the document ready event
 **/

function sendCmd(command, callback) {
  var thisCmd = command || $('#cmd-input').val();
    $('#cmd-input').val('');    			 // remove after sent or called
    postSbpAction(thisCmd);

    // Some Commands Need 'SV' to make permanent; thus multiline version
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

        // $("#cmd-input").focus(function () {
        //     $("#cmd-input").val("");
        // });
    
    
    callback($('#cmd-input').val(''));    			// Remove after sent or called
    
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
}

function postSbpAction(action) {
  setTimeout(function() { 
    $("#txt_area").text("-------Running:" + '\n' + "    " + action); }, 
    200);
}

function setSafeCmdFocus(site) {                                     // Too easy to walk on Manual Keypad (not sure why?); so protect
//console.log("got safeCheck",site)         ////## don't need site ... all calls in init_set ...
    if (globals.FAbMo_state === "manual") {
        return;
    }
    if (globals.INject_inputbox_open) {
        $("#insert-input").focus();
    } else {
        $("#cmd-input").focus();
    }
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
        $("#txt_area").text("");
        $("#cmd-input").val(command);
        setSafeCmdFocus();
        break;
    }
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
        curFile = "";                           // ... clear out after running
        curFilename = "";
        $("#curfilename").text("");
        $("#cmd-input").val(command);
        $('#file').val('');
        $('#file').trigger('click');
        break;
    }

    // HANDLE COMMAND: Then do commands with a fill-in sheet
    switch (Array.from(command)[0]) {
        case "C":
            if (command === "CN" || command === "C#") {  // let these two filter on through
                break;
            }
        case "S":
        case "V":        
            let display, parameters="";
            $("#cmd-input").val(command);
            console.log(cmds[command].params);
            cmds[command].params.forEach(function(entry) {
               console.log("an entry> " + entry.name);
               parameters += "{" + entry.name + "}, ";
            });  
            console.log(parameters)          
            display = command + ": " + cmds[command].name
            $('#params').empty();
//          $('#params').append(parameters);
            $('#params').attr("placeholder", parameters);
            $('#curfilename').empty();
            $('#curfilename').append("Parameters for Command: details in <a href='assets/docs/ComRef.pdf'>Command Reference</a>, see Help");
            $('#modalTitle').empty();
            $('#modalTitle').append(display);
            $('#fill-in-modal').foundation('reveal', 'open');
            console.log('ready to call CMD')
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
        break;
      case "DT":
        //getUsrResource('https://www.tinkercad.com/dashboard', 'assets/docs/No_Internet.pdf'); // also '/join' or '/login'
        getUsrResource('https://www.tinkercad.com/login', 'assets/docs/No_Internet.pdf');
        break;        

      case "HA":
        fabmo.notify('info', 'About: Sb4 Version 4.0.14');
        break;
      case "HC":
        getUsrResource('http://www.shopbottools.com/ShopBotDocs/files/SBG00253140912CommandRefV3.pdf', 'assets/docs/ComRef.pdf')       
        break;        
      case "HL":
        //getUsrResource('http://www.shopbottools.com/ShopBotDocs/files/SBG00253140912CommandRefV3.pdf', 'assets/docs/ComRef.pdf')       

    		var cachedConfig = null;
		    // Get the configuration from the tool and update
		    var updateConfig = function() {
			    fabmo.getConfig(function(err, config) {
            cachedConfig = config;
// console.log(config)            
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
        $("#cmd-input").val(newCommandString);
        setSafeCmdFocus();
        break;
    }
    return true;
  }
  return false
}
