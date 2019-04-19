/**
 * Initialize App on Document-Ready
 */

$(document).ready(function() {
    // Set and try to maintain focus in Command Input box
    $("#cmd-input").focus();
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
      var xTriggered = 0; // ## used?
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
  
      /**
      * Final run CALL for FP command; first clears anything in JogQueue then Runs and puts file in JobManager history then clears file remnants
      */
     $("#ok_run").click(function(event) {
      console.log(curFilename);
      $('#myModal').foundation('reveal', 'close');
          fabmo.clearJobQueue(function(err,data){
            if (err){
            cosole.log(err);
          } else {
              fabmo.submitJob({
                file: curFile,
                name: curFilename,
                description: '... called from Sb4'
              }, {stayHere: true},
                  function() { 
                    fabmo.runNext();
              });
          }
      });
      // clear out ....
  //    curFilename="";
  //    $("#curfilename").text("");
  //    $('#file').val('');
    });
  
    $("#cmd_quit").click(function(event) {
      console.log("Not Run");
      $('#myModal').foundation('reveal', 'close');
      curFilename="";
      $("#curfilename").text("");
    });
  
  
          let curFilename, curFile 
        $('#file').change(function(evt) {
                  var filename = $('#file').val().split('\\').pop();
                  curFilename = filename;
                  curFile = file;
              //console.log(join(file,"\n"))
  
                  $("#curfilename").text(curFilename);
             $('#myModal').foundation('reveal', 'open');
             console.log(filename);
             console.log(file);
             console.log(curFile);
         
      //     fabmo.clearJobQueue(function(err,data){
      //       if (err){
      //       cosole.log(err);
      //     } else {
  
      //         var filename = $('#file').val().split('\\').pop();
      //         fabmo.submitJob({
      //           file: file,
      //           name: filename,
      //           description: '... called from Sb4'
      //         }, {stayHere: true},
      //             function() { 
      //               fabmo.runNext();
      //         });
      //         console.log(file);
      //         console.log('filename= ' + filename);
      //         curFile = filename;
      //         $('#file').val('');
      //     }
      //     });
        })
  
  
    // ** Clear Command Line after a status report is recieved            ##### Need a clear after esc too
    fabmo.on('status', function(status) {
      console.log("status-" + status.state + "  ln-" + status.curline);
      $('#cmd-input').val("");
      //if (status.state==="idle") {
      if (status.state != "running") {
            $("#txt_area").text("");
            updateSpeedsFromEngineConfig();
            $(".top-bar").click(); // ... and click to clear any dropdowns
        }
    });
  
    // ** Try to restore CMD focus when there is a shift back to app
    $(document).click(function(e){
      // Check if click was triggered on or within #menu_content
        if( $(e.target).closest("#speedPanel").length > 0 ) {
            return false;
        }
        $("#cmd-input").focus();               // ... and reset focus
    });
  
    // ** Process Macro Box Keys
    $("#cut_part_call").click(function(event) {
      console.log('got CutPart');
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
  
    //console.log("Speed is: " + speed_XY.toFixed(2));
    //console.log("Twice the speed is: " + (2*speed_XY).toFixed(2));
  });
  