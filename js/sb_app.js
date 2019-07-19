/**
 * Main js file for SB4 // SB4 application starts here afte initialize_ready  
 * Includes the document ready event
 **/

function sendCmd(command) {
  var thisCmd = command || $('#cmd-input').val();
    postSbpAction(thisCmd);
  // Some Commands Need 'SV' to make permanent; thus multiline version
  	var cmd_eval = thisCmd.substring(0,2);
        console.log(thisCmd);
  		switch (cmd_eval) {
  			case "VS":
		        var mult_cmds=[
        		thisCmd,
          		'SV'						// Make Permanent
          		].join("\n");
        		fabmo.runSBP(mult_cmds);	// SEND MULTI >>>  
  				break;
  			case "MS":
		        var mult_cmds=[
        		thisCmd,
          		'SV'						// Make Permanent
          		].join("\n");
        		fabmo.runSBP(mult_cmds);	// SEND MULTI >>>  
  				break;
  			default:
			    fabmo.runSBP(thisCmd);    	// SEND SIMPLE >>>
  				break;
  		}
  $('#cmd-input').val('');    				// remove after sent or called
}

function getUsrResource(remote, local) {
  // temporarily only getting local because not detecting error on raspi tablets 
      fabmo.navigate(local,{target : '_blank'});

  // fabmo.isOnline(function(err, online) {
  //   if(err) {
  //     console.log("isOnline Error");
  //     return;         
  //   }
  //   if(online) {
  //     fabmo.navigate(remote,{target : '_blank'});    }
  //     //fabmo.navigate(remote,{target : '_self'});    }
  //   else {
  //     fabmo.navigate(local,{target : '_blank'});
  //   }
  // });
}

function postSbpAction(action) {
  setTimeout(function() { 
    $("#txt_area").text("-------Running:" + '\n' + "    " + action); }, 
    200);
    $('#cmd-input').val('>');
}

function processCommandInput(command) {
  var command = command.trim().toUpperCase();
  if (command.length == 1) {
    switch (command) {
      case "K":
      	command = "SK";
      	command.length = 2;
      	break;
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
      case "H":
        $("#cmd-input").val(command);
        $("#menu_help").click();
        break;
      default:
        command = "";
        event.preventDefault(); // ESC as a general clear and update tool
        curLine = ""; // Remove after sent or called
        $(".top-bar").click(); // ... and click to clear any dropdowns
        $("#txt_area").text("");
        $("#cmd-input").val(command);
        $("#cmd-input").focus();
        break;
    }
  } else if (command.length == 2) {
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
      case "C2":
      case "C3":
        sendCmd(command);
        break;
      case "CN":
      	command = "C#";
      case "FP":
        $("#cmd-input").val(command);
        $('#file').trigger('click');
        break;

      case "CC":
        let display, parameters="";
        $("#cmd-input").val(command);
        //console.log(cmds[command].params);
        cmds[command].params.forEach(function(entry) {
          console.log("an entry> " + entry.name);
          parameters += "{" + entry.name + "}, ";
        });  
          console.log(parameters)          
          display = command + ": " + cmds[command].name
          $('#params').append(parameters);
          $('#curfilename').append("Parameters for Command");
          $('#modalTitle').empty();
          $('#modalTitle').append(display);
          $('#myModal').foundation('reveal', 'open');
        console.log('ready to call CMD')
        break;

      case "SI":
      case "FN":
        fabmo.launchApp('editor', {
          'new': true,
          'content': "' Create an OpenSBP job here ...",
          'language': 'sbp'
        });
        break;
      case "HA":
        fabmo.notify('info', 'About: Sb4 Version 4.0.14');
        break;
      case "HC":
        console.log("triggered");
        getUsrResource('http://www.shopbottools.com/ShopBotDocs/files/SBG00253140912CommandRefV3.pdf', 'assets/docs/ComRef.pdf')       
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
      case "SK":
      	//need "K" call
      	break;
      default:
        var newCommandString = command + ", ";
        $("#cmd-input").val(newCommandString);
        $("#cmd-input").focus();
        break;
    }
    return true;
  }
  return false
}
