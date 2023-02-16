let cmds = [];

// Initialize and Set Actions for Full App; BOTH the Regular Sb4 stuff and the MOtion-Pad stuff

// *th Experimenting with using first 2 CAps on my significant GLOBALS ==========================================
window.globals = {
    TOol_x: 0,                                     // REAL LOCATIONS OF TOOL from G2
    TOol_y: 0,                                     // ... had to set as windows.globals to get to paperjs canvas
    TOol_z: 0,
    TOol_a: 0,
    TOol_b: 0,
    TOol_c: 0,
    FAbMo_state: "",
    G2_stat: 0,
//    G2_killed: false,
//    SEtToKillState: false,
    DOne_first_status_ck: false,
    MO_Pad_Open: false,
    MO_Dir: 0,
    MO_Axis: "X",
    JOg_Axis: "X",                                
    INject_inputbox_open: false,
    ORigin: ""
}

let AXis = ["", "X", "Y", "Z", "A", "B", "C", "U", "V", "W"]
let LIm_up = new Array(10);                       // x=1
let LIm_dn = new Array(10);
let excluded_axes_str = "";

if (!window.Haptics)
    alert("The haptics.js library is not loaded.");

$(document).ready(function () {
    $(document).foundation({              // Start and customize foundation
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
    let url = window.location.href;     // Returns full URL (https://example.com/path/example.html)
    window.globals.ORigin = window.location.origin;   // Returns base URL (https://example.com)
    $("#copyright").append("   [" + window.globals.ORigin + "]");

    // *** Get MENUs Items from JSON file @initial load ***
    $.getJSON(     
        'assets/sb3_commands.json',       // Originally from 'https://raw.githubusercontent.com/FabMo/FabMo-Engine/master/runtime/opensbp/sb3_commands.json'
        function (data) {                  // ... now using local copy with lots of mods and updates
            getExcludedAxes(function (excluded_axes_str) {
                for (key in data) {
                    switch (key.substring(0, 1)) {
                        case "F":
                            $("#menu_files").append('<li class="menuDD" id="' + key + '"><a >' + key + ' - ' + data[key]["name"] || "Unnamed" + '</a></li>');
                            break;
                        case "M":
                            if (excluded_axes_str.indexOf(key.substring(1, 2)) == -1) {
                                $("#menu_moves").append('<li class="menuDD" id="' + key + '"><a >' + key + ' - ' + data[key]["name"] || "Unnamed" + '</a></li>');
                            }
                            break;
                        case "J":
                            if (excluded_axes_str.indexOf(key.substring(1, 2)) == -1) {
                                $("#menu_jogs").append('<li class="menuDD" id="' + key + '"><a >' + key + ' - ' + data[key]["name"] || "Unnamed" + '</a></li>');
                            }
                            break;
                        case "C":
                            $("#menu_cuts").append('<li class="menuDD" id="' + key + '"><a >' + key + ' - ' + data[key]["name"] || "Unnamed" + '</a></li>');
                            cmds[key] = data[key];
                            break;
                        case "Z":
                            if (excluded_axes_str.indexOf(key.substring(1, 2)) == -1) {
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
                $(".menuDD").bind('click', function (event) {
                    var commandText = this.id;
                    $(document).foundation('dropdown', 'reflow');
                    processCommandInput(commandText);
                });
            });
        });

    updateUIFromEngineConfig();

    updateSpeedsFromEngineConfig();

    getAxisLimits();

    $('.opensbp_input').change(function () {                  // Handle and Bind generic UI textboxes
        setConfig(this.id, this.value);
    });

    $('.opensbp_input_formattedspeeds').change(function () {  // Handle and Bind updates from formatted SPEED textboxes
        switch (this.id) {
            case 'formatted_movexy_speed':
                var mult_cmds = [
                    'VS,' + this.value,
                    'SV'
                ].join("\n");
                //console.log("Commands are: \n" + mult_cmds);
                fabmo.runSBP(mult_cmds);
                break;
            case 'formatted_movez_speed':
                var mult_cmds = [
                    'VS,,' + this.value,
                    'SV'
                ].join("\n");
                fabmo.runSBP(mult_cmds);
                break;
            case 'formatted_jogxy_speed':
                var mult_cmds = [
                    'VS,,,,,,' + this.value,
                    'SV'
                ].join("\n");
                fabmo.runSBP(mult_cmds);
                break;
            case 'formatted_jogz_speed':
                var mult_cmds = [
                    'VS,,,,,,,' + this.value,
                    'SV'
                ].join("\n");
                fabmo.runSBP(mult_cmds);
                break;
        }
        console.log("changed speeds ...");
        updateSpeedsFromEngineConfig();
        setSafeCmdFocus(1);
    });

    // ** Set-Up Response to Command Entry; first key management 
    $("#cmd-input").keyup(function (event) {
        var commandInputText = $("#cmd-input").val();
        switch (event.which) {
            case 75:          // "K" key for keypad
                fabmo.manualEnter({ hideKeypad: false, mode: 'data' });
                $("#cmd-input").val("");
                break                
            case 13:
                sendCmd();    // On ENTER ... SEND the command
                break;
            case 27:          // ESC as a general clear and update tool
                event.preventDefault();
                curLine = ""; // Remove after sent or called
                $(".top-bar").click(); // ... and click to clear any dropdowns
                $("#txt_area").text("");
                setSafeCmdFocus(2);
                updateUIFromEngineConfig();
                updateSpeedsFromEngineConfig();
                break;
            case 8:           // backspace
            case 46:          // delete
                break;
            default:
                var ok = processCommandInput(commandInputText);
                if (ok) {
                    $(".top-bar").click();
                    setSafeCmdFocus(3);
                }
                break;
        }
    });

    $("#cmd-input").keydown(function (event) {
        switch (event.which) {
            case 13:
                event.preventDefault();
                break;
            default:
                break;
        }
    });

    // ** Final run CALL for FP command; first clears anything in JobQueue then Runs and puts file in JobManager history then clears file remnants
    let curFilename, curFile
    let lines = new Array()
    let lastLn = 0;
    let upDating = false;

    $('#file').change(function (evt) {
        //document.getElementById('file').addEventListener('input', function(evt) {
        evt.preventDefault();
        $("#cmd-input").val("");

        lastLn = 0;
        upDating = false;
    
        console.log("got entry");
        console.log(evt);
        console.log("file- " + curFile);
        lastLn = 0;
        let file = document.getElementById("file").files[0];
        let fileReader = new FileReader();
        fileReader.onload = function (fileLoadedEvent) {
            lines = fileLoadedEvent.target.result.split('\n');
            for (let line = 0; line < lines.length; line++) {
                //  console.log(line + ">>>" + lines[line]);
            }
            curFile = file
        };
        fileReader.readAsText(file, "UTF-8");
        curFilename = evt.target.files[0].name;
        $("#curfilename").text(curFilename);
        $('#myModal').foundation('reveal', 'open');
    })

    $("#btn_ok_run").click(function (event) {
        console.log(curFilename, curFile);
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

    $("#btn_cmd_quit").click(function (event) {      // QUIT
        console.log("Not Run");
        $('#myModal').foundation('reveal', 'close');
        curFile = "";
        curFilename = "";
        $("#curfilename").text("");
    });

    $("#btn_prev_file").click(function (event) {    // ADVANCED
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
    fabmo.on('status', function (status) {
        globals.TOol_x = status.posx;                                            // get LOCATION GLOBALS
        globals.TOol_y = status.posy;
        globals.TOol_z = status.posz;
        globals.TOol_a = status.posa;
        globals.TOol_b = status.posb;
        globals.TOol_c = status.posc;
        globals.FAbMo_state = status.state;
        globals.G2_stat = status.stat;                                           // 5 means "in motion"

        if (globals.DOne_first_status_ck === "false") {
            globals.DOne_first_status_ck = "true";
            if (globals.FAbMo_state === "manual") { fabmo.manualExit() }         // #??? making sure we aren't stuck ??
        } else {
            if (!globals.INject_inputbox_open) {
                  $("#cmd-input").blur();
                parent.focus();
            }                                                                    // this allows focus to work right when manual start
            //$("body",parent.document).focus();
            //setTimeout(function(){$("body").focus()}, 100);
        }

        if (globals.MO_pad_open) {
            globals.UPdateMoPadState();
        }

        if (status.nb_lines > 2 && status.line > 19 ) {                          // ... only if we're running a file (e.g. greater than 1 or 2 commands)
            const dispLen = 50;
            let computedLn = 0;
            computedLn = status.line - 19;
            lastLn = status.nb_lines;
            let startLn = computedLn;
            if (computedLn > 3) {startLn = computedLn - 2};
            let endLn = computedLn + 12; 
            if (computedLn + 12 > lastLn) {endLn = lastLn};
            let lineDisplay = "";

            // update the fileline display
            for (let i = startLn; i < endLn; i++) {
                if (i === computedLn) {
                    lineDisplay += "> " + (i) + "  " + lines[i - 1].substring(0, dispLen) + '\n';
                } else {
                    lineDisplay += "  " + (i) + "  " + lines[i - 1].substring(0, dispLen) + '\n';
                }
            }
            $("#txt_area").text(lineDisplay);   ////## could make line number and width adjustable
        }

        if (globals.FAbMo_state === "running") {
            $('#cmd-input').val("");
        }
        if (globals.FAbMo_state != "running" && globals.FAbMo_state != "paused") {
            $("#txt_area").text("");
            updateSpeedsFromEngineConfig();
            $(".top-bar").click();    // click to clear any dropdowns
            setSafeCmdFocus(4);
        }

    });

    //** Try to restore CMD focus when there is a shift back to app
    $(document).click(function (e) {
        // Check if click was triggered on or within #menu_content
        if ($(e.target).closest("#speed-panel").length > 0) {
            return false;
        } else if ($(e.target).closest("#insert-input").length > 0) {    //experimental to keep cursor in insert box
            return false;
        }
        setSafeCmdFocus(5);
    });

    //... this only helps a little with focus
    $(document).mouseenter(function (e) {
        // Check if click was triggered on or within #menu_content
        if ($(e.target).closest("#speed-panel").length > 0) {
            return false;
        } else if ($(e.target).closest("#speed-panel").length > 0) {
            return false;
        }
        setSafeCmdFocus(6);
    });

    //** Try to restore CMD focus when there is a shift back to app
    $(document).keydown(function (e) {
        switch (event.which) {
            case 27:
                $('#cmd-input').val("");
            //event.preventDefault();
                break;
            default:
                break;
        }
    });

    // ** Process Macro Box Keys
    $("#cut_part_call").click(function () {
        curFile = "";                           // ... clear out after running
        curFilename = "";
        $("#curfilename").text("");
        $('#file').val('');
        $('#file').trigger('click');
    });

    $("#first_macro_button").click(function () {
        console.log('got firstMacro');
        sendCmd("C3");
    });

    $("#second_macro_button").click(function () {
        console.log('got secondMacro');
        sendCmd("C2");
    });

    $("#third_macro_button").click(function () {
        console.log('got thirdMacro');
        sendCmd("C10");
    });

    $("#fourth_macro_button").click(function () {
        console.log('got fourthMacro');
        sendCmd("C210");
    });

    $("#fifth_macro_button").click(function () {
        console.log('got fifthMacro');
        sendCmd("C211");
    });

    document.onmousewheel = function () { stopWheel(); } /* IE7, IE8 */  // BLOCK regular mouse wheel
    if (document.addEventListener) { /* Chrome, Safari, Firefox */
        document.addEventListener('DOMMouseScroll', stopWheel, false);
    }

////## removed because it was being hit twice at startups
// window.addEventListener("unload", function (e) {
//     console.log("Unloaded WINDOW! Leave Manual if active!")
//     if (globals.FAbMo_state === 'manual') {
//         fabmo.manualExit();
//     }
// }, false);

    // $(window).focusout(function () {
    //     console.log("Lost FOCUS! Leave Manual if pad not open!")
    //     if (!globals.MO_Pad_Open && globals.FAbMo_state === 'manual') {
    //         fabmo.manualExit();
    //     }
    // });

    // $(window).focusin(function () {
    //     console.log("Got focus back!")
    //     if (globals.MO_Pad_Open && globals.FAbMo_state != 'manual') {
    //         console.log("in pad so restarting manual")    
    //         fabmo.manualEnter({ hideKeypad: true, mode: 'raw' });
    //     }
    // });

    function stopWheel(e) {
        //        if(!e){ e = window.event; } /* IE7, IE8, Chrome, Safari */
        //        if(e.preventDefault) { e.preventDefault(); } /* Chrome, Safari, Firefox */
        //        e.returnValue = false; /* IE7, IE8 */


        // Touch Events
        //    rmanCanvas.addEventListener('touchstart', touchStart);
        //    canvas.addEventListener('touchend', this.onTouchEnd.bind(this));
        //    canvas.addEventListener('touchmove', this.onTouchMove.bind(this));

    };

    // Just for testing stuff ... 
    $("#other").click(function () {
        console.log('got change');
        sendCmd("Command from Button Click");
        event.preventDefault();
    });

    $("#insert-input").change(function () {                                 // Inserted Message Direct to G2 Stream
        sendG2message(this.value)
        this.value = "";
    });

    fabmo.requestStatus(function (err, status) {		                    // a first call to get us started
        console.log('FabMo_first_state>' + globals.FAbMo_state);
    });

    $(document).on('open.fndtn.reveal', '[data-reveal]', function () {      // ------------------- ON OPENING JOG PAD
        if ($(this).context.id === "moPad") {
            let axis_start_str = "TOol_" + (globals.JOg_Axis.toLowerCase());
            //        $('#jog_dial_loc_trgt').val(globals[axis_start_str].toFixed(3));  //... set loc display
            globals.MO_pad_open = true;
            fabmo.manualEnter({ hideKeypad: true, mode: 'raw' });
            beep(20, 1800, 1);
            fabmo.requestStatus();                                                      // another update when we open pad
            globals.UPdateMoPadState();
            
            //fabmo.hideDRO();  **if needed?

            //   $("#jog_dial_sel_char").click(function(e) {                       //... toggle through AXES with click on selector
            //     //  console.log("got click",($('#jog_dial_sel_char')));           //... ## could make this a little more concise
            //       axis = $('#jog_dial_sel_char').text();
            //       beep(30,3000, 30);
            //       switch (axis) {
            //         case "X":
            //           if (excluded_axes_str.indexOf("Y") == -1) {
            //             $("#jog_dial_sel_char").text("Y");
            //             globals.JOg_Axis = "Y"
            //             break;
            //           }
            //         case "Y":
            //           if (excluded_axes_str.indexOf("Z") == -1) {
            //             $("#jog_dial_sel_char").text("Z");
            //             globals.JOg_Axis = "Z"
            //             break;
            //           }
            //         case "Z":
            //           if (excluded_axes_str.indexOf("A") == -1) {
            //             $("#jog_dial_sel_char").text("A");
            //             globals.JOg_Axis = "A"
            //             break;
            //           }
            //         case "A":
            //           if (excluded_axes_str.indexOf("B") == -1) {
            //             $("#jog_dial_sel_char").text("B");
            //             globals.JOg_Axis = "B"
            //             break;
            //           }
            //         case "B":
            //           if (excluded_axes_str.indexOf("C") == -1) {
            //             $("#jog_dial_sel_char").text("C");
            //             globals.JOg_Axis = "C"
            //             break;
            //           }
            //         case "C":
            //           if (excluded_axes_str.indexOf("X") == -1) {
            //             $("#jog_dial_sel_char").text("X");
            //             globals.JOg_Axis = "X"
            //             break;
            //           }
            //         default:
            //           $("#jog_dial_sel_char").text("X");
            //           globals.JOg_Axis = "X"
            //       }
            //       let axis_start_str = "TOol_" +  (globals.JOg_Axis.toLowerCase());
            //       $('#jog_dial_loc_trgt').val(globals[axis_start_str].toFixed(3));           //... set loc display
            //   });

        }

        if ($(this).context.id === "insertStream") {                                            // Open G2-Stream Box
            fabmo.manualEnter({ hideKeypad: true, mode: 'raw' });
            globals.INject_inputbox_open = true;
            beep(20, 1800, 1);
            beep(20, 1800, 1);
            fabmo.requestStatus();
        }    

        $('#padCloseX').click(function (event) {
            console.log('got close click')
            $('#modal').foundation('reveal', 'close');
        });

    })

    $(document).on('close.fndtn.reveal', '[data-reveal]', function () {   // -------------------- ON CLOSING JOG PAD    
        if ($(this).context.id === "moPad") {
            globals.MO_pad_open = false;
            gotOnce = false;
            fabmo.manualExit();
            console.log('got moPad closing; did Exit from manual')
        };
        if ($(this).context.id === "insertStream") {
            globals.INject_inputbox_open = false;
            fabmo.manualExit();
            console.log('got insertStream closing; did Exit from manual')
        };
    })

    window.addEventListener("unload", function (event) {
        if (globals.FAbMo_state === "manual") {
            fabmo.manualExit()
        }
        console.log("unloaded WINDOW!");
    }, false)

})

//--------------------------------------------------------------------------------------------------SOUNDS
// const a = new AudioContext()
// //console.log(a.baseLatency)
// function beep(vol, freq, duration) {
//     v = a.createOscillator()
//     u = a.createGain()
//     v.connect(u)
//     v.frequency.value = freq
//     v.type = "square"
//     u.connect(a.destination)
//     u.gain.value = vol * 0.01
//     v.start(a.currentTime)
//     v.stop(a.currentTime + duration * 0.001)
// }
