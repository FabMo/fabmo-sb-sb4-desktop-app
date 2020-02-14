/**
 * Initialize App on Document-Ready
 * Most Event Handling except KeyPad Stuff
 */

let cmds = [];

// *th Experimenting with using first 2 CAps on my significant GLOBALS ==========================================
window.globals = {
  TOol_x: 0,                                     // REAL LOCATIONS OF TOOL from G2
  TOol_y: 0,                                     // ... had to set as windows.globals to get to paperjs canvas
  TOol_z: 0,
  TOol_a: 0,
  TOol_b: 0,
  TOol_c: 0,
  G2_state: "",
  DOne_first_status_ck: "false",
  JOg_Pad_Open: "false",
  JOg_Axis: "X",
  ORigin: "" 
}

let AXis = ["", "X", "Y", "Z", "A", "B", "C", "U", "V", "W" ]
let LIm_up = new Array(10);                       // x=1
let LIm_dn = new Array(10);
let excluded_axes_str = "";

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
    window.globals.ORigin = window.location.origin;   // Returns base URL (https://example.com)
    $("#copyright").append("   [" + window.globals.ORigin + "]");

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

              case "T":
                $("#menu_tools").append('<li class="menuDD" id="' + key + '"><a >' + key + ' - ' + data[key]["name"] || "Unnamed" + '</a></li>');
                break;
  
              case "D":
                $("#menu_design").append('<li class="menuDD" id="' + key + '"><a >' + key + ' - ' + data[key]["name"] || "Unnamed" + '</a></li>');
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

    getAxisLimits();
  
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
      setSafeFocus();
    });
  
    // ** Set-Up Response to Command Entry
      //var xTriggered = 0;       //^
    $("#cmd-input").keyup(function(event) {
      // For Debug ^
      //var msg = "Handler for .keyup() called " + xTriggered + " time(s). (Key = " + event.which + ")";  //^
      var commandInputText = $("#cmd-input").val();
      //xTriggered++;    //^
      switch (event.which) {
        case 13:
          sendCmd(); // On ENTER ... SEND the command
          break;
        case 27:
          event.preventDefault(); // ESC as a general clear and update tool
          curLine = ""; // Remove after sent or called
          $(".top-bar").click(); // ... and click to clear any dropdowns
          $("#txt_area").text("");
          setSafeFocus();
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
            setSafeFocus();
          }
          break;
      }
    });
  
    $("#cmd-input").keydown(function(event) {
      switch (event.which) {
        case 13:
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
      globals.TOol_x = status.posx;                                            // get LOCATION GLOBALS
      globals.TOol_y = status.posy;
      globals.TOol_z = status.posz;
      globals.TOol_a = status.posa;
      globals.TOol_b = status.posb;
      globals.TOol_c = status.posc;
      globals.G2_state = status.state;
      globals.G2_stat = status.stat;                                           // 5 means "in motion"

      if (globals.DOne_first_status_ck === "false") {
        globals.DOne_first_status_ck = "true";
        if (globals.G2_state === "manual") {fabmo.manualExit()}                // #??? making sure we aren't stuck ??
      } else {
        $("#cmd-input").blur();
        parent.focus();                                                        // this allows focus to work right when manual start
        //$("body",parent.document).focus();
        //setTimeout(function(){$("body").focus()}, 100);
      }

        JogDial.utils.update_loc();                                            // ##?? only if using update Jog-Pad position

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

        if (globals.G2_state === "running") {
            $('#cmd-input').val(' ');
        }    
        if (globals.G2_state != "running") {
            $('#cmd-input').val("");
            $("#txt_area").text("");
            updateSpeedsFromEngineConfig();
            $(".top-bar").click();               // ... and click to clear any dropdowns
            setSafeFocus();
        }

    });
    
    // ** Try to restore CMD focus when there is a shift back to app
    $(document).click(function(e){
        // Check if click was triggered on or within #menu_content
        if( $(e.target).closest("#speed-panel").length > 0 ) {
            return false;
        } else if($(e.target).closest("#speed-panel").length > 0) {
            return false;
        }
        setSafeFocus();
    });
    //... this only helps a little with focus
    $(document).mouseenter(function(e){
      // Check if click was triggered on or within #menu_content
      if( $(e.target).closest("#speed-panel").length > 0 ) {
            return false;
        } else if($(e.target).closest("#speed-panel").length > 0) {
            return false;
        }
        setSafeFocus();
    });
  
    // ** Process Macro Box Keys
    $("#cut_part_call").click(function() {
      curFile="";                           // ... clear out after running
      curFilename = "";
      $("#curfilename").text("");
      $('#file').val('');
      $('#file').trigger('click');
    });

    $("#first_macro_button").click(function() {
      console.log('got firstMacro');
      sendCmd("C3");
    });

    $("#second_macro_button").click(function() {
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
      console.log('G2_first_state>' + globals.G2_state);
    });
    
    $(document).on('open.fndtn.reveal', '[data-reveal]', function () {    // ------------------- ON OPENING JOG PAD
      if ($(this).context.id==="wheelPad") {
        let axis_start_str = "TOol_" +  (globals.JOg_Axis.toLowerCase());
        let mod_loc = (globals[axis_start_str]/ .016666) %360;            //... get current knob position ##UPDATE to live
        dialOne.angle(mod_loc);                                           //... set now (follower should already be set)
        $('#jog_dial_loc_trgt').val(globals[axis_start_str].toFixed(3));  //... set loc display
        globals.JOg_pad_open = true;
        fabmo.manualEnter({hideKeypad:true, mode:'raw'});
        beep(20, 1800, 1);
        console.log('got wheelPad opening')
      }; 
     
      $("#jog_dial_sel_char").click(function(e) {                       //... toggle through AXES with click on selector
        //  console.log("got click",($('#jog_dial_sel_char')));           //... ## could make this a little more concise
          axis = $('#jog_dial_sel_char').text();
          beep(30,3000, 30);
          switch (axis) {
            case "X":
              if (excluded_axes_str.indexOf("Y") == -1) {
                $("#jog_dial_sel_char").text("Y");
                globals.JOg_Axis = "Y"
                break;
              }
            case "Y":
              if (excluded_axes_str.indexOf("Z") == -1) {
                $("#jog_dial_sel_char").text("Z");
                globals.JOg_Axis = "Z"
                break;
              }
            case "Z":
              if (excluded_axes_str.indexOf("A") == -1) {
                $("#jog_dial_sel_char").text("A");
                globals.JOg_Axis = "A"
                break;
              }
            case "A":
              if (excluded_axes_str.indexOf("B") == -1) {
                $("#jog_dial_sel_char").text("B");
                globals.JOg_Axis = "B"
                break;
              }
            case "B":
              if (excluded_axes_str.indexOf("C") == -1) {
                $("#jog_dial_sel_char").text("C");
                globals.JOg_Axis = "C"
                break;
              }
            case "C":
              if (excluded_axes_str.indexOf("X") == -1) {
                $("#jog_dial_sel_char").text("X");
                globals.JOg_Axis = "X"
                break;
              }
            default:
              $("#jog_dial_sel_char").text("X");
              globals.JOg_Axis = "X"
          }
          let axis_start_str = "TOol_" +  (globals.JOg_Axis.toLowerCase());
          $('#jog_dial_loc_trgt').val(globals[axis_start_str].toFixed(3));           //... set loc display
      });
    })

    $(document).on('close.fndtn.reveal', '[data-reveal]', function () {   // -------------------- ON CLOSING JOG PAD    
      if ($(this).context.id==="wheelPad") {
        globals.JOg_pad_open = false;
        fabmo.manualExit();
        console.log('got wheelPad closing')
      }; 
    })

    $('#wheel_pad_close').click(function(event) {      //##testing close button
console.log('got close click')
      $('#modal').foundation('reveal', 'close');
    });

    window.addEventListener("unload", function(event){
      fabmo.manualExit();
      console.log("unloaded!");        
    }, false);

});
