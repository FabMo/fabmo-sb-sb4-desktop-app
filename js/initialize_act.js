/**
 * Initialize App on Document-Ready
 * Most Event Handling except KeyPad Stuff
 */

let cmds = [];
let JOg_Pad_Open = false;

if (!window.Haptics)
	alert("The haptics.js library is not loaded.");

$(document).ready(function() {
    $(document).foundation({            // Start and customize foundation
      tooltip: {
        disable_for_touch: true
      },
      topbar: {                         // important!
        custom_back_text: false,
        is_hover: false,
        mobile_show_parent_link: true
      }
    });

    // *** Let' Figure out where we are ...
    let pathname = window.location.pathname; // Returns path only (/path/example.html)
    let url      = window.location.href;     // Returns full URL (https://example.com/path/example.html)
    let origin   = window.location.origin;   // Returns base URL (https://example.com)
    //console.log("pathname- " + pathname);
    //console.log("url- " + url);
    //console.log("origin- " + origin);
    $("#copyright").append("   [" + origin + "]");

    // *** Get MENUs Items from JSON file @initial load ***
    $.getJSON(     // ## never solved problem of getting into index.html for debug
      'assets/sb3_commands.json',       // Originally from 'https://raw.githubusercontent.com/FabMo/FabMo-Engine/master/runtime/opensbp/sb3_commands.json'
      function(data) {                  // ... now using local copy with lots of mods and updates
        getExcludedAxes(function(excluded_axes_str){
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
                cmds[key]=data[key];
                console.log(cmds[key])
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
          // binding must be inside this function
          $(".menuDD").bind('click', function(event) {
            var commandText = this.id;
            $(document).foundation('dropdown', 'reflow');
            processCommandInput(commandText);
          });
        });
      });
  
    updateUIFromEngineConfig();
  
    updateSpeedsFromEngineConfig();
  
    $('.opensbp_input').change(function() {  // Handle and Bind generic UI textboxes
      setConfig(this.id, this.value);
    });
    
    $('.opensbp_input_formattedspeeds').change(function() {  // Handle and Bind updates from formatted SPEED textboxes
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
  
    // ** Set-Up Response to Command Entry
      //var xTriggered = 0; // ## used?
    $("#cmd-input").keyup(function(event) {
      // For Debug
      //var msg = "Handler for .keyup() called " + xTriggered + " time(s). (Key = " + event.which + ")";
      var commandInputText = $("#cmd-input").val();
      //xTriggered++;
      //console.log(msg, "html");
      //console.log(event);
  
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
    });
  
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

    // ** Final run CALL for FP command; first clears anything in JogQueue then Runs and puts file in JobManager history then clears file remnants
      let curFilename, curFile
      let lines = new Array()
    $('#file').change(function(evt) {
    //document.getElementById('file').addEventListener('input', function(evt) {
      evt.preventDefault();
      console.log("got entry");
      console.log(evt);
      console.log("file- " + curFile);
      let file = document.getElementById("file").files[0];
      let fileReader = new FileReader();
      fileReader.onload = function(fileLoadedEvent){
          lines = fileLoadedEvent.target.result.split('\n');
          for(let line = 0; line < lines.length; line++){
            //  console.log(line + ">>>" + lines[line]);
          }
          curFile = file
      };
      fileReader.readAsText(file, "UTF-8");
      curFilename = evt.target.files[0].name;
      $("#curfilename").text(curFilename);
      $('#myModal').foundation('reveal', 'open');
    })

        $("#btn_ok_run").click(function(event) {
          //console.log(curFilename);
          $('#myModal').foundation('reveal', 'close');
          fabmo.clearJobQueue(function (err, data) {
            if (err) {
              cosole.log(err);
            } else {
              fabmo.submitJob({
                file: curFile,
                name: curFilename,
                description: '... called from Sb4'
              }, { stayHere: true },
                function () {
                  fabmo.runNext();
                }
              );
            }
          });
        });
        $("#btn_cmd_quit").click(function(event) {      // QUIT
          console.log("Not Run");
          $('#myModal').foundation('reveal', 'close');
          curFile = "";
          curFilename="";
          $("#curfilename").text("");
        });
        $("#btn_prev_file").click(function(event) {    // ADVANCED
          console.log("Advanced - curFilename");
          $('#myModal').foundation('reveal', 'close');
          fabmo.clearJobQueue(function (err, data) {
            if (err) {
              cosole.log(err);
            } else {
              job = curFilename.replace('.sbp', '');
              fabmo.submitJob({
                file: curFile,
                filename: curFilename,
                name: job,
                description: '... called from Sb4'
              });
            }
          });
        });
  
    // ** STATUS: Report Ongoing and Clear Command Line after a status report is recieved    ## Need a clear after esc too
    fabmo.on('status', function(status) {
        console.log(status.state);
console.log(status.nb_lines)
        const dispLen = 50;
        let lineDisplay = "";
        if (status.nb_lines > 1) {           // If we're running a file ... greater than 1 to cover 2 commands in MS
            lineDisplay ="=======Running:  " + curFilename + '\n'
            lineDisplay += "  " + (status.line - 2) + "  " + lines[status.line - 2].substring(0, dispLen) + '\n' 
            lineDisplay += "  " + (status.line - 1) + "  " + lines[status.line - 1].substring(0, dispLen) + '\n' 
            lineDisplay += "> " + status.line  + "  " + lines[status.line].substring(0, dispLen) + '\n' 
            lineDisplay += "  " + (status.line + 1) + "  " + lines[status.line + 1].substring(0, dispLen) + '\n' 
            lineDisplay += "  " + (status.line + 2) + "  " + lines[status.line + 2].substring(0, dispLen) + '\n' 
            $("#txt_area").text(lineDisplay);
            $('#cmd-input').val('>');
        }
        if (status.state === "running") {
            $('#cmd-input').val(' ');
        }    
        if (status.state != "running") {
            $('#cmd-input').val("");
            $("#txt_area").text("");
            updateSpeedsFromEngineConfig();
            $(".top-bar").click();               // ... and click to clear any dropdowns
            $("#cmd-input").focus();             // ... and reset focus
        }

        // Didn't figure out how to make this work ...
        //fabmo.getWifiNetworks(function(err, networks) {
        //  console.log("net: " + networks)});
      });
      
    // ** Try to restore CMD focus when there is a shift back to app
    $(document).click(function(e){
      // Check if click was triggered on or within #menu_content
        if( $(e.target).closest("#speed-panel").length > 0 ) {
            return false;
        } else if($(e.target).closest("#speed-panel").length > 0) {
            return false;
        }
        $("#cmd-input").focus();               // ... and reset focus
    });
  
    //... this only helps a little with focus
    $(document).mouseenter(function(e){
      // Check if click was triggered on or within #menu_content
console.log("MOUSE-ENTER")
      // if( $(e.target).closest("#speed-panel").length > 0 ) {
      //       return false;
      //   } else if($(e.target).closest("#speed-panel").length > 0) {
      //       return false;
      //   }
      $("#cmd-input").focus();               // ... and reset focus
    });
  
    // ** Process Macro Box Keys
    $("#cut_part_call").click(function(event) {
      curFile="";                           // ... clear out after running
      curFilename = "";
      $("#curfilename").text("");
      $('#file').val('');
      $('#file').trigger('click');
    });

    $("#first_macro_button").click(function(event) {
      console.log('got firstMacro');
      sendCmd("C3");
    });

    $("#second_macro_button").click(function(event) {
      console.log('got secondMacro');
      sendCmd("C2");
    });
    
    // Just for testing stuff ... 
    $("#other").click(function() {
      console.log('got change');
      sendCmd("Command from Button Click");
      event.preventDefault();
    });
  
    fabmo.requestStatus(function(err,status) {		// first call to get us started
      console.log('G2_first_state>' + status.state);
    });
    
    $(document).on('open.fndtn.reveal', '[data-reveal]', function () {    // #th Is it possible to miss opening and closing?
      if ($(this).context.id==="wheelPad") {
        JOg_pad_open = true;
console.log('got wheelPad opening')
      }; 
    })

    $(document).on('close.fndtn.reveal', '[data-reveal]', function () {
      if ($(this).context.id==="wheelPad") {
        JOg_pad_open = false;
console.log('got wheelPad closing')
      }; 
    })


});
