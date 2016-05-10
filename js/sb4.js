/**
 * Main js file for SB4
 * This is where the SB4 application starts.  
 * Includes the document ready event
 */

function sendCmd(command) {
  var thisCmd = command || $('#cmd-input').val();
  $("#txt_area").text("Running > " + thisCmd);
    fabmo.runSBP(thisCmd);    // SEND IT >>>
  $('#cmd-input').val('');    // remove after sent or called
}

// https://www.kirupa.com/html5/check_if_internet_connection_exists_in_javascript.htm
// function doesConnectionExist() {
//     var xhr = new XMLHttpRequest();
//     var file = "http://www.shopbottools.com/ShopBotDocs/files/SBG00253140912CommandRefV3.pdf";
//     var randomNum = Math.round(Math.random() * 10000);
     
//     xhr.open('HEAD', file + "?rand=" + randomNum, false);
     
//     try {
//         xhr.send();
         
//         if (xhr.status >= 200 && xhr.status < 304) {
//             return true;
//         } else {
//             return false;
//         }
//     } catch (e) {
//         return false;
//     }
// }

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
      case "SI":
      case "FN":
        fabmo.launchApp('editor', {
          'new': true,
          'content': "' Create an OpenSBP job here ...",
          'language': 'sbp'
        });
        break;
      case "HC":
        fabmo.navigate('http://www.shopbottools.com/ShopBotDocs/files/SBG00253140912CommandRefV3.pdf', {target : '_blank'});
        break;        
      case "HF":
        fabmo.navigate('https://handibot.com/forum/list.php?2', {target : '_blank'});
        break;        
      case "HW":
        fabmo.navigate('https://handibot.com', {target : '_blank'});
        console.log ("error test " + err);
        break;        
      case "HQ":
        fabmo.navigate('http://docs.handibot.com/doc-output/Handibot_2_MANUAL_Setup.pdf', {target : '_blank'});
        break;        
      case "HS":
        fabmo.navigate('http://docs.handibot.com/doc-output/Handibot_Safety.pdf', {target : '_blank'});
        break;        

      // case "HC":
      //   fabmo.navigate('../assets/ComRef.pdf', {target : '_blank'});
      //   break;        
      // case "HQ":
      //   if (doesConnectionExist) {
      //     fabmo.navigate('http://docs.handibot.com/doc-output/Handibot_2_MANUAL_Setup.pdf', {target : '_blank'});
      //   } else {
      //     fabmo.notify('warning', 'Uh Oh!');
      //   } 
      //   break;

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

$(document).ready(function() {
  // Set and try to maintain focus in Command Input box
  $("#cmd-input").focus();

  // Start and customize foundation
  $(document).foundation({
    reveal: {
      animation_speed: 500
    },
    tooltip: {
      disable_for_touch: true
    },
    abide: {
      live_validate: false,
      validate_on_blur: false,
    },
    topbar: {
      custom_back_text: false,
      is_hover: false,
      mobile_show_parent_link: true
    }
  });


  // *** Get MENUs Items from JSON file @initial load ***
  $.getJSON(
    'assets/sb3_commands.json',
      // originally derived from 'https://raw.githubusercontent.com/FabMo/FabMo-Engine/master/runtime/opensbp/sb3_commands.json'
      // ... now using local copy with lots of mods and updates 
    function(data) {
      getExcludedAxes(function(excluded_axes_str){

        console.log("newAxis - " + excluded_axes_str);
        for (key in data) {
          switch (key.substring(0, 1)) {
            case "F":
              $("#menu_files").append('<li class="menuDD" id="' + key + '"><a >' + key + ' - ' + data[key]["name"] || "Unnamed" + '</a></li>');
              break;
            case "M":
              if (excluded_axes_str.indexOf(key.substring(1,2)) == -1) {
                $("#menu_moves").append('<li class="menuDD" id="' + key + '"><a >' + key + ' - ' + data[key]["name"] || "Unnamed" + '</a></li>');
              }
              break;
            case "J":
              if (excluded_axes_str.indexOf(key.substring(1,2)) == -1) {
                $("#menu_jogs").append('<li class="menuDD" id="' + key + '"><a >' + key + ' - ' + data[key]["name"] || "Unnamed" + '</a></li>');
              }
              break;
            case "C":
              $("#menu_cuts").append('<li class="menuDD" id="' + key + '"><a >' + key + ' - ' + data[key]["name"] || "Unnamed" + '</a></li>');
              break;
            case "Z":
              if (excluded_axes_str.indexOf(key.substring(1,2)) == -1) {
                $("#menu_zero").append('<li class="menuDD" id="' + key + '"><a >' + key + ' - ' + data[key]["name"] || "Unnamed" + '</a></li>');
              }
              break;
            case "S":
              $("#menu_settings").append('<li class="menuDD" id="' + key + '"><a >' + key + ' - ' + data[key]["name"] || "Unnamed" + '</a></li>');
              break;
            case "V":
              $("#menu_values").append('<li class="menuDD" id="' + key + '"><a >' + key + ' - ' + data[key]["name"] || "Unnamed" + '</a></li>');
              break;
            case "H":
              $("#menu_help").append('<li class="menuDD" id="' + key + '"><a >' + key + ' - ' + data[key]["name"] || "Unnamed" + '</a></li>');
              break;
          }
        }

        $(document).foundation('dropdown', 'reflow');

        // ** Set Up Response to Menu Click/Selection (paste in 2 Letter Command ***
        // ... had to do this within the load and after the menu created, otherwise no binding to individual elements
        // $(".menuDD").bind( 'click', function() {
        //  var thisCmd = this.id;
        //  $("#cmd-input").val(thisCmd + ", ");
        //  $("#cmd-input").focus();
        //  //console.log('got change ... ' + thisCmd);
        // });

        $(".menuDD").bind('click', function(event) {
          var commandText = this.id;
          $(document).foundation('dropdown', 'reflow');
          processCommandInput(commandText);
        });
        
      });


    });

  // ** Initialize Default Appearance
  fabmo.showDRO();

  // Update the generic UI textboxes with config data from the engine
  updateUIFromEngineConfig();

  // Update the speed UI textboxes with config data from the engine (speeds are formatted)
  updateSpeedsFromEngineConfig();

  // Handle and Bind generic UI textboxes that directly change opensbp configs
  $('.opensbp_input').change(function() {
    setConfig(this.id, this.value);
  });

  // Handle and Bind updates from formatted SPEED textboxes
  $('.opensbp_input_formattedspeeds').change(function() {
    switch (this.id) {
      case 'formatted_movexy_speed':
        var mult_cmds=[
          'VS,' + this.value,
          'SV'
          ].join("\n");
          //console.log("Commands are: \n" + mult_cmds);
        fabmo.runSBP(mult_cmds);
        break;
      case 'formatted_movez_speed':
        var mult_cmds=[
          'VS,,' + this.value,
          'SV'
          ].join("\n");
        fabmo.runSBP(mult_cmds);
        break;
      case 'formatted_jogxy_speed':
        var mult_cmds=[
          'VS,,,,,,' + this.value,
          'SV'
          ].join("\n");
        fabmo.runSBP(mult_cmds);
        break;
      case 'formatted_jogz_speed':
        var mult_cmds=[
          'VS,,,,,,,' + this.value,
          'SV'
          ].join("\n");
        fabmo.runSBP(mult_cmds);
        break;
    }
    console.log("changed speeds ...");
    updateSpeedsFromEngineConfig();
    $("#cmd-input").focus();
  });

  // *** Respond to Command Entry
  var xTriggered = 0;

  $("#cmd-input").keyup(function(event) {

    // For Debug
    var msg = "Handler for .keyup() called " + xTriggered + " time(s). (Key = " + event.which + ")";
    var commandInputText = $("#cmd-input").val();
    xTriggered++;
    console.log(msg, "html");
    console.log(event);

    switch (event.which) {
      case 13:
        sendCmd(); // On ENTER ... SEND the command
        break;
      case 27:
        event.preventDefault(); // ESC as a general clear and update tool
        curLine = ""; // Remove after sent or called
        $(".top-bar").click(); // ... and click to clear any dropdowns
        $("#txt_area").text("");
        $("#cmd-input").focus();
        updateUIFromEngineConfig();
        updateSpeedsFromEngineConfig();
        break;
      case 8:
      case 46:
        break;
      default:
        var ok = processCommandInput(commandInputText);
        if (ok) {
          $(".top-bar").click();
          $("#cmd-input").focus();
        }
        break;
    }

  }); // $("#cmd-input").keyup()

  $("#cmd-input").keydown(function(event) {
    switch (event.which) {
      case 13:
        // document.getElementById("cmd-input").value = ""; // remove after sent or called
        event.preventDefault();
        break;
      default:
        break;
    }
  });

  // Hidden file element for FP command
  $('#file').change(function(evt) {
    var file = $('#fileform');
    var filename = $('#file').val().split('\\').pop();
    fabmo.submitJob({
      file: file,
      name: filename,
      description: '... called from Sb4'
    });
  });

  // Clear Command Line after a status report is recieved
  fabmo.on('status', function(status) {
    $('#cmd-input').val("");
    console.log('got status report ...');
    if (!status.job) {
      $("#txt_area").text("");
      updateSpeedsFromEngineConfig();
    }
  });




  // Just for testing stuff ... 
  $("#other").click(function() {
    console.log('got change');
    sendCmd("Command from Button Click");
    event.preventDefault();
  });


  //var speed_XY = parseFloat($('#opensbp-movexy_speed').val());
  //console.log("Speed is: " + speed_XY.toFixed(2));
  //console.log("Twice the speed is: " + (2*speed_XY).toFixed(2));
});
