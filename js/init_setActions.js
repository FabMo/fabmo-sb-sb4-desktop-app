let cmds = [];
//let fI_dispArray = [];

// Initialize and Set Up Actions for Full App; BOTH the Regular Sb4 stuff and the beta MOtion-Pad and INSERT stuff

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
    DOne_first_status_ck: false,
    FIll_In_Open: false,
    MO_Pad_Open: false,
    MO_Dir: 0,
    MO_Axis: "X",
    JOg_Axis: "X",                                
    INject_inputbox_open: false,
    ORigin: "",
    LIcmds: [],
    VI_display: 0,
    COnt_Height: "200px",
    COnt_Width: "400px"
}
let g = window.globals;                            // ... and a short cut to it

let AXis = ["", "X", "Y", "Z", "A", "B", "C", "U", "V", "W"]
let LIm_up = new Array(10);                       // x=1
let LIm_dn = new Array(10);
let excluded_axes_str = "";
let lastStatus = {};                            // ... to hold the last status for display purposes

const displayState = {
    areaWidth: 0,
    areaHeight: 0,
    dispLineLen: 0,
    dispHeight: 0,
    computedLn: 0,
    startLn: 0,
    endLn: 0
};

const sbpContainer = document.getElementById('sbp-container');

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
        },
        dropdown: {
            auto_focus: false,
            auto_size: false,
            timeout: 0                    // Disable auto-timeout
        }
    });

    // Prevent dropdown auto-close
    Foundation.libs.dropdown.settings.hover_timeout = 0;
    Foundation.libs.dropdown.settings.closing_time = 0;

    restoreUIConfig();

    // Attemp to load line display if Sb4 is started with the status of a file currently running (started elsewhere)
    if (status.nb_lines > 2 && status.line > 19 )

    // Just testing the positioning of this ...
    $(".spindle-display").css("visibility", "hidden");

    // *** Make a quick LIst of all the commands in the JSON file to use for validations later ***
    $.getJSON( 
        'assets/sb3_commands.json', 
        function (data) {
            for (key in data) {
                globals.LIcmds.push(key);
            }
            //console.log("LIcmds: " + globals.LIcmds);
        }
    );     

    // *** Let' Figure out where we are URL wise ***
    let pathname = window.location.pathname;          // Returns path only (/path/example.html)
    let url = window.location.href;                   // Returns full URL (https://example.com/path/example.html)
    window.globals.ORigin = window.location.origin;   // Returns base URL (https://example.com)
    $("#copyright").append("   [" + window.globals.ORigin + "]");

    // *** Get MENUs Items from JSON file @initial load ***
    // ... note that additional line is required to capture details for fill-ins, currently for C, S, V, T
    $.getJSON(     
        'assets/sb3_commands.json',       // Originally from 'https://raw.githubusercontent.com/FabMo/FabMo-Engine/master/runtime/opensbp/sb3_commands.json'
        function (data) {                  // ... now using local copy with lots of mods and updates
            getExcludedAxes(function (excluded_axes_str) {
                for (key in data) {
                    switch (key.substring(0, 1)) {
                        case "F":
                            $("#menu_files").append('<li class="menuDD" id="' + key + '"><a >' + key + ' - ' + data[key]["name"] || "Unnamed" + '</a></li>');
                            cmds[key] = data[key]; // only getting descriptive details for fill-ins for C, S, V, T, F
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
                            cmds[key] = data[key]; // only getting descriptive details for fill-ins for C, S, V, T, F
                            break;
                        case "Z":
                            if (excluded_axes_str.indexOf(key.substring(1, 2)) == -1) {
                                $("#menu_zero").append('<li class="menuDD" id="' + key + '"><a >' + key + ' - ' + data[key]["name"] || "Unnamed" + '</a></li>');
                            }
                            break;
                        case "S":
                            $("#menu_settings").append('<li class="menuDD" id="' + key + '"><a >' + key + ' - ' + data[key]["name"] || "Unnamed" + '</a></li>');
                            cmds[key] = data[key]; // only getting descriptive details for fill-ins for C, S, V, T, F
                            break;
                        case "V":
                            $("#menu_values").append('<li class="menuDD" id="' + key + '"><a >' + key + ' - ' + data[key]["name"] || "Unnamed" + '</a></li>');
                            cmds[key] = data[key]; // only getting descriptive details for fill-ins for C, S, V, T, F
                            break;

                        case "T":
                            $("#menu_tools").append('<li class="menuDD" id="' + key + '"><a >' + key + ' - ' + data[key]["name"] || "Unnamed" + '</a></li>');
                            cmds[key] = data[key]; // only getting descriptive details for fill-ins for C, S, V, T
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
    
    initVideo();


    function handleResize() {                                           // FabMo Resize Event Handler
        const maxWidth = document.getElementById('cmd-panel').clientWidth * 0.95;
        if (sbpContainer.clientWidth !== maxWidth) {
            sbpContainer.style.width = `${maxWidth}px`;
        }
        g.COnt_Width = sbpContainer.clientWidth;
        g.COnt_Height = sbpContainer.clientHeight;
        calculateDisplayParams();
//        updateFileLineDisplay(lastStatus, lines);
        saveUIConfig();
        console.log("Resize event#1  handled. Width: " + g.COnt_Width + ", Height: " + g.COnt_Height);
        //resetAppConfig();
    }

    const sbpContainer = document.getElementById('sbp-container');      // Sb4 File Text Area Resize Observer
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            const maxWidth = document.getElementById('cmd-panel').clientWidth * 0.95;
            if (sbpContainer.clientWidth !== maxWidth) {
                sbpContainer.style.width = `${maxWidth}px`;
            }
            g.COnt_Width = sbpContainer.clientWidth;
            g.COnt_Height = sbpContainer.clientHeight;
            calculateDisplayParams(lastStatus, lines);
            saveUIConfig();
            console.log("Resize event#2 handled. Width: " + g.COnt_Width + ", Height: " + g.COnt_Height);
            //resetAppConfig();
        }
    });

        function calculateDisplayParams() {
        const $txtArea = $("#file_txt_area");
        displayState.areaWidth = $txtArea.width();
        displayState.areaHeight = $txtArea.height();
        displayState.dispLineLen = Math.floor(displayState.areaWidth / 8.5);
        displayState.dispHeight = Math.floor(displayState.areaHeight / 19);
        updateFileLineDisplay(lastStatus, lines);
        // Do not reset computedLn/startLn/endLn here; those are set during display
    }

    resizeObserver.observe(sbpContainer);
    window.addEventListener('resize', handleResize);


    // ** Set-Up Response to Command Entry; first key management **

    // Key handler for triggering special "key" (shortcut) events in the dashboard
    // ... here we add a case for handing spindle speed increments and decrements
    // ... this is not necessary for feedrate override because fabmo main window already has that during file running
    window.addEventListener('keydown', function(event) {
        var commandInputText = $("#cmd-input").val();
        console.log("FIRST EVENT in Sb4: " + event.key);
        if (commandInputText.length < 1) {  // ... only if we have not started a line
            // If the key is either the + or the - , then send the key code to the parent window
            if (event.key === "+" || event.key === "_") {  // increment or decrement spindle speed
                if (!event.repeat) {  // Check if the key is not repeating
                    window.parent.postMessage({ key: event.key }, '*');
                }
                event.stopPropagation();
                event.preventDefault();
            }
        }
    });
    
    window.addEventListener('keyup', function(event) {
        var commandInputText = $("#cmd-input").val();
        console.log("FIRST EVENT in Sb4: " + event.key);
        if (commandInputText.length < 1) {  // ... only if we have not started a line
            if (event.key === "k" || event.key === "K") {  // toggle keypad AND get focus on it for data entry
                event.stopPropagation();
                event.preventDefault();
                window.parent.postMessage({ key: event.key }, '*');
                window.parent.focus();
            } else {
                // pass any other key events to the command input
                console.log("GOT SOME EVENT in Sb4: " + event.key);
            }
        }
    });
        
    $('.opensbp_input_formattedspeeds').change(function (event) {  // Handle and Bind updates from formatted SPEED textboxes
        event.preventDefault();  // Prevent the default action
        event.stopPropagation(); // Stop the event from propagating
        switch (this.id) {
            case 'formatted_movexy_speed':
                var thisSpeedCmd = 'VS,' + this.value;
                break;
            case 'formatted_movez_speed':
                var thisSpeedCmd = 'VS,,' + this.value;
                break;
            case 'formatted_jogxy_speed':
                var thisSpeedCmd = 'VS,,,,,,' + this.value;
                break;    
            case 'formatted_jogz_speed':
                var thisSpeedCmd = 'VS,,,,,,,' + this.value;
                break;    
        }
        var mult_cmds = [thisSpeedCmd, 'SV'].join("\n");
        fabmo.runSBP(mult_cmds);
        console.log("changed speeds ...");
        updateSpeedsFromEngineConfig();
    });

    // ** Set-Up Response to Command Entry; first key management 
    $("#cmd-input").keyup(function (event) {
        var commandInputText = $("#cmd-input").val();
        switch (event.which) {
            case 75:          // "K" key for keypad
                fabmo.manualEnter({ hideKeypad: false, mode: 'data' });
                $("#cmd-input").val("");
                break                
            case 13:          // ENTER key; Second part of ENTER-ENTER behavior for repeating as well
                // If the fill-in modal is open for FP or FL, then run the command 
                //console.log("got to ENTER key");
                if ($('#fi-modal').hasClass('open')) {
                    let ckFile = $('#fi_modal_title').text().substring(0,4);
                    if (ckFile === "File" || ckFile === "Reru") {
                        $('#btn_ok_run').click();
                    } else {
                        sendCmd(); // On ENTER ... SEND the command
                    }
                } else {
                    sendCmd(); // On ENTER ... SEND the command
                }       
                break;
            case 27:          // ESC as a general clear and update tool
                event.preventDefault();
                curLine = ""; // Remove after sent or called
                $(".top-bar").click(); // ... and click to clear any dropdowns
                $("#file_txt_area").text("");
                // if we are in insert stream mode, then close the insert stream box and exit manual mode 
                if (globals.INject_inputbox_open) {
                    $('#insertStream').foundation('reveal', 'close');
                    fabmo.manualExit();
                }
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

    
    // ** Final run CALL for FP command; first clears anything in JobQueue then Runs and puts file in JobManager history then clears file remnants
    let curFilename, curFile
    let lines = new Array()
    let upDating = false;

    $('#file').change(function (evt) {
        $("#cmd-input").val("... downloading file to tool ...");  // ... just a little message to show we're working
        $("#cmd-input").blur();

        lastLn = 0;
        upDating = false;
        let file = document.getElementById("file").files[0];
        let fileReader = new FileReader();
        fileReader.onload = function (fileLoadedEvent) {
            lines = fileLoadedEvent.target.result.split('\n');
            //for (let line = 0; line < lines.length; line++) {
                //console.log(line + ">>>" + lines[line]);
            //}
            curFile = file
        };
        fileReader.readAsText(file, "UTF-8");
        curFilename = evt.target.files[0].name;
        $("#cmd-input").val("FP");
        $('#fi_modal_title').append("File Ready to Run");
        displayFillIn("", "File Ready to Run", curFilename);
    })

    $("#btn_ok_run").click(function (event) {
        let ckFile = $('#fi_modal_title').text().substring(0,4);
        $('#fi-modal').foundation('reveal', 'close');
        if (ckFile === "File") {    // handle as file
            fabmo.clearJobQueue(function (err, data) {
                if (err) {
                    fabmo.notify('error', err);
                } else {
                    // Helper to fetch last job's file and run it
                    function fetchAndRun() {
                        fabmo.getJobHistory({ start: 0, count: 1 }, function(err, jobs) {
                            if (err || !jobs.data.length) {
                                fabmo.notify('error', 'Could not get job history');
                                return;
                            }
                            var lastJob = jobs.data[0];
                            var url = '/job/' + lastJob._id + '/file';
                            $.get(url, function(data, status) {
                                lines = data.split('\n');
                                // Now lines[] is ready for display as job runs
                                fabmo.runNext(function(runErr) {
                                    if(runErr) {
                                        fabmo.notify('error', runErr);
                                    }
                                });
                            });
                        });
                    }

                    if(window.curFilePath) { // USB file
                        fabmo.submitUSBFile(window.curFilePath, {
                            name: window.curFilename,
                            description: '... called from Sb4'
                        }, function(err, result) {
                            window.curFilePath = undefined;
                            window.curFilename = undefined;
                            if(err) {
                                fabmo.notify('error', err);
                            } else {
                                fetchPendingAndRun(function(runErr) {
                                    // done
                                });
                            }
                        });
                    } else { // Local file
                        fabmo.submitJob({
                            file: curFile,
                            name: curFilename,
                            description: '... called from Sb4'
                        }, { stayHere: true }, function () {
                            fetchAndRun();
                        });
                    }
                }
            });

        } else if (ckFile === "Reru") { // Rerun last
            fabmo.getJobHistory({ start: 0, count: 1 }, function(err, jobs) {
                if (err || !jobs.data.length) {
                    fabmo.notify('error', 'Could not get job history');
                    return;
                }
                var lastJob = jobs.data[0];
                var url = '/job/' + lastJob._id + '/file';
                $.get(url, function(data, status) {
                    lines = data.split('\n');
                    fabmo.runNext(function(runErr) {
                        if(runErr) {
                            fabmo.notify('error', runErr);
                        }
                    });
                });
            });
        } else {
            setSafeCmdFocus();
            sendCmd();
        }
    });

    function fetchPendingAndRun(callback) {
        fabmo.getJobsInQueue(function(err, jobs) {
            if (err || !jobs.pending.length) {
                fabmo.notify('error', 'No pending jobs found');
                if(callback) callback(err || new Error('No pending jobs'));
                return;
            }
            var pendingJob = jobs.pending[0];
            var url = '/job/' + pendingJob._id + '/file';
            $.get(url, function(data, status) {
                lines = data.split('\n');
                fabmo.runNext(function(runErr) {
                    if(runErr) fabmo.notify('error', runErr);
                    if(callback) callback(runErr);
                });
            }).fail(function(jqXHR, textStatus, errorThrown) {
                fabmo.notify('error', 'Failed to fetch pending job file: ' + errorThrown);
                if(callback) callback(new Error('Failed to fetch pending job file'));
            });
        });
    }

    $("#btn_cmd_quit").click(function (event) {           // QUIT
        //console.log("Not Run");
        $('#fi-modal').foundation('reveal', 'close');
        curFile = "";
        curFilename = "";
        $("#fi_cur_info").text("");
    });

    $("#btn_adv_file").click(function (event) {           // ADVANCED
        //console.log("Advanced - curFilename");  
        $('#fi-modal').foundation('reveal', 'close');
        if (!curFilename && !window.curFilePath) { // if no file then this is FL or recent file to run, already loaded from sb_app
            fabmo.launchApp('job-manager', { stayHere: true });
        } else { 
            fabmo.clearJobQueue(function (err, data) {
                if (err) {
                    cosole.log(err);
                } else {
                    if(window.curFilePath) {               // If we have a filePath from USB, use submitUSBFile
                        fabmo.submitUSBFile(window.curFilePath, {
                            name: window.curFilename,
                            description: '... called from Sb4'
                        }, function(err, result) {
                            window.curFilePath = undefined; // Clear after use
                            window.curFilename = undefined;
                            if(err) {
                                fabmo.notify('error', err);
                            } else {
                                fabmo.launchApp('job-manager', { stayHere: true }, function(runErr) {
                                    if(runErr) {
                                        fabmo.notify('error', runErr);
                                    }
                                });
                            }
                        });
                    } else {                             // Fallback for a regular client file: use submitJob for File/Blob
                        job = curFilename.replace('.sbp', '');
                        fabmo.submitJob({
                            file: curFile,
                            filename: curFilename,
                            name: job,
                            description: '... called from Sb4'
                        });
                    }
                }    
            });
        }    
    });

    // Tool Tips
    $("#cmd-ref").click(function(evt) {
        getUsrResource('docs/ComRef.pdf', 'docs/ComRef.pdf');      // Open the local ComRef.pdf in the dashboard docs folder for the moment 
    });
    $("#cmd-ref2").click(function(evt) {
        getUsrResource('https://shopbottools.com/wp-content/uploads/2025/07/ComRef.pdf', 'docs/ComRef.pdf');      // Testing the online ComRef.pdf
    });
    $("#ck-list").click(function(evt) {
        getUsrResource('docs/ShopBot_checklist.pdf', 'docs/ShopBot_checklist.pdf');      // Open the local ComRef.pdf in the dashboard docs folder for the moment 
    });


    // ** STATUS: Report Ongoing and  Clear Command Line after a status report is recieved **   ## Need a clear after esc too???
    fabmo.on('status', function (status) {
        lastStatus = status;                                                     // ... save the last status for display purposes
        globals.TOol_x = status.posx;                                            // get LOCATION GLOBALS
        globals.TOol_y = status.posy;
        globals.TOol_z = status.posz;
        globals.TOol_a = status.posa;
        globals.TOol_b = status.posb;
        globals.TOol_c = status.posc;
        globals.FAbMo_state = status.state;
        globals.G2_stat = status.stat;                                           // 5 means "in motion"
        globals.usbDrive = status.usbDrive;                                      // ... get the USB drive state

        if (globals.DOne_first_status_ck === "false") {
            globals.DOne_first_status_ck = "true";
            if (globals.FAbMo_state === "manual") { fabmo.manualExit() }         // #??? making sure we aren't stuck ??
        } else {
            if (!globals.INject_inputbox_open) {
            //    $("#cmd-input").blur();            ////## lines may be required to for focus on leaving INSERT box; but they disrupt display in MACROs
            //    parent.focus();
            } else {
                $("#insert-input").focus();
            }                                                                    // this allows focus to work right when manual start
            //$("body",parent.document).focus();
            //setTimeout(function(){$("body").focus()}, 100);
        }

        if (globals.MO_pad_open) {
            globals.UPdateMoPadState();
        }

        // FILE LINE DISPLAY
        if (status.nb_lines > 2 && status.line > 19 ) {                          // ... only if we're running a file (e.g. greater than 1 or 2 commands)
            // In case we started somewhere else,
            // ... try to load values for display from the job or job history
            if (lines.length < 1 && status.job && !upDating) {
                upDating = true;  // ... set a flag to prevent multiple calls
                var runningJob = status.job._id;
                var url = '/job/' + runningJob + '/file';
                $.get(url, function(data, status) {
                    lines = data.split('\n');
                    upDating = false; // Clear flag when done
                }).fail(function() {
                    upDating = false; // Also clear flag on failure
                });
            }
        }    

        updateFileLineDisplay(status, lines);                                    // ... NOW, update the file line display if we have a file running
        
        if (globals.FAbMo_state === "running") {
            $('#cmd-input').val("");
            $("#cmd-help").css("visibility","hidden");
        }

        // Check the DOM to see if the FabMo DRO is visible and update the spindle speed if it is visible and the spindle is on or commanded on 
        // NOT CURRENTLY USING; Pulling out DRO seems best if user wants full info!
        // var droClosed = localStorage.getItem('pinRight');
            // if (droClosed === 'true') {
            //     //console.log("The DRO pane is not visible");
            //     $(".spindle-display").css("visibility", "visible");
            //     if (status.spindle) {
            //         if (status.spindle.vfdAchvFreq > 0) {
            //             $("#spindle-speed").css("color", "rgb(113, 233, 241)");
            //             $("#spindle-speed").val(status.spindle.vfdAchvFreq.toFixed(0));
            //         } else {
            //             $("#spindle-speed").val(status.spindle.vfdDesgFreq.toFixed(0));
            //             $("#spindle-speed").css("color", "rgb(90, 90, 90)");
            //         }
            //     }
            // } else {
            //     //console.log("The DRO pane is visible");
            //     $(".spindle-display").css("visibility", "hidden");
            // }

        // Show spindle-speed if DRO is visible and spindle is present in status object and is on (vfdAchvFreq > 0) or is commanded on (vfdDesgFreq > 0) 
        if (globals.FAbMo_state != "running" && globals.FAbMo_state != "paused") {
            $("#file_txt_area").text("");
            updateSpeedsFromEngineConfig();

            // Prevent an ENTER that starting an FL if issues too soon ... //# Not exactly sure why this is needed, but it creates a problem of closing the dropdowns early
            // ... Insert a 3/4 second delay before click and setSafeCmdFocus (ultimately needed to clear dropdowns and set focus)
            // setTimeout(function () {
            //     $(".top-bar").click();
            //     setSafeCmdFocus(1);
            // }, 750);
        }
    });

    function updateFileLineDisplay(status, lines) {
        if (status.nb_lines > 2 && status.line > 19) {
            displayState.computedLn = status.line - 19;
            let lastLn = status.nb_lines;
            displayState.startLn = displayState.computedLn;
            if (displayState.computedLn > 3) { displayState.startLn = displayState.computedLn - 2; }
            displayState.endLn = displayState.computedLn + displayState.dispHeight;
            if (displayState.computedLn + displayState.dispHeight > lastLn) { displayState.endLn = lastLn; }

            let lineDisplay = "";
            if (status.job) {
                for (let i = displayState.startLn; i < displayState.endLn; i++) {
                    if (i === displayState.computedLn) {
                        lineDisplay += "> " + (i) + "  " + (typeof lines[i - 1] === 'string' ? lines[i - 1].substring(0, displayState.dispLineLen) : '') + '\n';
                    } else {
                        lineDisplay += "  " + (i) + "  " + (typeof lines[i - 1] === 'string' ? lines[i - 1].substring(0, displayState.dispLineLen) : '') + '\n';
                    }
                }
                $("#file_txt_area").text(lineDisplay);
            }
        }
    }

    $("#vid-button").click(function () {      // Toggle video
        // Check for toggle state and change if video present
        if ($("#vid-button").hasClass("vid-button-on")) {
            $("#vid-button").removeClass("vid-button-on");
            $("#vid-button").addClass("vid-button-off");
            if (localStorage.getItem("fabmo_sb4_has_video") === "true") {
                $("#video").css("visibility", "visible");
                $("#file_txt_area").css("background", "#327c7e");
                localStorage.setItem("fabmo_sb4_video_button", 1); // 1 video present, but not playing; 
            } else {
                $("#video").css("visibility", "hidden");
                $("#file_txt_area").css("background", "#327c7e");
                localStorage.setItem("fabmo_sb4_video_button", 0); // 0 video disabled
            }
        } else {
            $("#vid-button").removeClass("vid-button-off");
            $("#vid-button").addClass("vid-button-on");
            $("#video").css("visibility", "visible");
            $("#file_txt_area").css("background", "transparent");
            localStorage.setItem("fabmo_sb4_video_button", 2); // 2 video present and playing
            localStorage.setItem("fabmo_sb4_has_video", "true");
        }
        saveUIConfig();
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
                if (globals.FIll_In_Open === true) {$('#fi-modal').foundation('reveal', 'close')}
                $('#cmd-input').val("");
                $("#cmd-help").css("visibility","hidden");
                //event.preventDefault();
                break;
            default:
                break;
        }
    });

    // ** Process Macro Box Keys
    $("#cut_part_call").click(function () {
        window.getaFile("FP");
        // curFile = "";                           // ... clear out after running
        // curFilename = "";
        // $("#fi_cur_info").text("");
        // $('#file').val('');
        // $('#file').trigger('click');
    });

    $("#to_job_manager").click(function () {
        // launch the fabmo job manager app
        fabmo.launchApp('job-manager', {});
    });

    $("#cmd_button1").click(function () {
        console.log('got first cmd');
        sendCmd("JH");
    });

    $("#cmd_button2").click(function () {
        console.log('got second cmd');
        sendCmd("ZZ");
    });

    $("#cmd_button3").click(function () {
        console.log('got second cmd');
        sendCmd("C79");
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

    function stopWheel(e) {
        //        if(!e){ e = window.event; } /* IE7, IE8, Chrome, Safari */
        //        if(e.preventDefault) { e.preventDefault(); } /* Chrome, Safari, Firefox */
        //        e.returnValue = false; /* IE7, IE8 */


        // Touch Events
        //    rmanCanvas.addEventListener('touchstart', touchStart);
        //    canvas.addEventListener('touchend', this.onTouchEnd.bind(this));
        //    canvas.addEventListener('touchmove', this.onTouchMove.bind(this));

    };

    // ** Help for Command
    $("#cmd-help").click(function () {
        console.log('got cmd-help');
        let thisCmd = $("#cmd-input").val().substring(0, 2);
        let location = "docs/ComRef.pdf#" + thisCmd;          // for now, just use the ComRef.pdf in the dashboard docs folder
        fabmo.navigate(location, { target: '_blank' });
    });

    // // ** If enter key hit in #fi-params, then click the Run button 
    // $('#fi-params').keypress(function (e) {
    //     if (e.which == 13) {
    //         $('#btn_ok_run').click();
    //         return false;    //<---- Add this line ?
    //     }
    // });

    // ////## this system for entry not working!
    // let enterKeyPressed = false;
    // // ** Listen for the keydown event on the input fields
    // $('#fi_container').on('keydown', '.fi_val', function(event) {
    //     if (event.key === "Enter") {
    //     //    enterKeyPressed = true;
    //     }
    // });

    // ** Allow editing of Fill-In parameters and paste usably into Command Line ready to run
    $('#fi_container').on('change', '.fi_val', function () { // re-enter on each change in fill-in box
        let thisCurCmd = ($("#cmd-input").val()).substring(0,2);
        let thisFullCmd = "";

        for (let index = 1; index < cmds[thisCurCmd].params.length; index++) {   //try to fix extra cmd
            let thisValue = "";
            let theFieldName = ("fi_" + index) ;  // can also get from id
            if ($("#" + theFieldName).val()) {thisValue = $("#" + theFieldName).val()};     
            thisFullCmd += thisValue + ", ";
        };

        //console.log(thisCurCmd + ", " + thisFullCmd);
        $("#cmd-input").val(thisCurCmd + ", " + thisFullCmd);  // updated command line
        ////## per above, this is not working as expected
        // Check if the change was triggered by the Enter key
        if (enterKeyPressed) {
            $("#cmd-input").focus();  // Set focus to #cmd-input
            enterKeyPressed = false;  // Reset the flag
        }

    });

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

    // Set up response to changes in the localStorage state (this updates the spindle-RPM display as apporpriate)
    window.addEventListener('storage', function (e) {
        if (e.key === 'pinRight') {
            fabmo.requestStatus()
        }
    });


    // MANAGING MODALS

    $(document).on('open.fndtn.reveal', '[data-reveal]', function () {                 // ------------------- ON OPENING A MODAL

        if ($(this).context.id === "fi-modal") {
            globals.FIll_In_Open = true;
        }

        if ($(this).context.id === "moPad") {
            let axis_start_str = "TOol_" + (globals.JOg_Axis.toLowerCase());
            //        $('#jog_dial_loc_trgt').val(globals[axis_start_str].toFixed(3));  //... set loc display
            globals.MO_pad_open = true;
            fabmo.manualEnter({ hideKeypad: true, mode: 'raw' });
            // beep(20, 1800, 1);
            fabmo.requestStatus();                                                      // another update when we open pad
            globals.UPdateMoPadState();

        }

        if ($(this).context.id === "insertStream") {                                    // Open G2-Stream Box
            fabmo.manualEnter({ hideKeypad: true, mode: 'raw' });
            globals.INject_inputbox_open = true;
            // beep(20, 1800, 1);
            // beep(20, 1800, 1);
            setTimeout(function () { fabmo.requestStatus(); }, 1000); // ... delay to allow for manual mode to start before status request and focus
        }    

        $('#padCloseX').click(function (event) {
            //console.log('got close click')
            $('#modal').foundation('reveal', 'close');
        });

    })

    $(document).on('opened.fndtn.reveal', '[data-reveal]', function () {   // NOW "OPENED"
        if ($(this).context.id === "fi-modal") {
            $("#fi_1").focus();
        }
      });

    $(document).on('close.fndtn.reveal', '[data-reveal]', function () {   // -------------------- ON CLOSING JOG PAD    
        if ($(this).context.id === "fi-modal") {
            globals.FIll_In_Open = false;
            $('#fi-params').value = "";
            //console.log('got Fill-In closing; did Exit from manual')
        };
        if ($(this).context.id === "moPad") {
            globals.MO_pad_open = false;
            gotOnce = false;
            fabmo.manualExit();
            //console.log('got moPad closing; did Exit from manual')
        };
        if ($(this).context.id === "insertStream") {
            globals.INject_inputbox_open = false;
            fabmo.manualExit();
            //console.log('got insertStream closing; did Exit from manual')
        };
    })

    // There is also a document close event that can be used to do something when the modal closes
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
