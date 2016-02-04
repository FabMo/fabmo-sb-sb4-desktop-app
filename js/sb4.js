/**
 * Main js file for SB4
 * This is where the SB4 application starts.  
 * Includes the document ready event
 */

function sendCmd(command) {
		var thisCmd = command || $('#cmd-input').val();
		$("#txt_area").text("Running > " + thisCmd);
		fabmoDashboard.runSBP(thisCmd);					 	// SEND IT >>>
		$('#cmd-input').val(''); 							// remove after sent or called
}

function processCommandInput(command) {
		var command = command.trim().toUpperCase();

		if(command.length == 1) {
			switch(command) {
				case "F":
					$("#menu_files").click();
					break;
				case "M":
					$("#menu_moves").click();
					break;
				case "J":
					$("#menu_jogs").click();
					break;
				case "C":
					$("#menu_cuts").click();
					break;
				case "Z":
					$("#menu_zero").click();
					break;
				case "S":
					$("#menu_settings").click();
					break;
				case "V":
					$("#menu_values").click();
					break;						
			}
		} else if(command.length == 2) {
			switch(command) {
				case "JH" :
				case "MH" :
				case "ZX" :
				case "ZY" :
				case "ZZ" :
				case "Z2" :
				case "Z3" :
					sendCmd(command);
					break;
				case "FP":
					jQuery('#file').trigger('click');
					break;
				case "SI" :	
				case "FN" :
					fabmoDashboard.launchApp('editor', {'new' : true, 'content' : "' Create an OpenSBP job here ...", 'language' : 'sbp'});
					break;
				default :
					var newCommandString = command + ", ";
					$("#cmd-input").val(newCommandString);
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
	  reveal : {
		animation_speed: 500
	  },
	  tooltip : {
		disable_for_touch: true
	  },
	  abide : {
		live_validate: false,
		validate_on_blur: false,
		},
	  topbar : {
		custom_back_text: false,
		is_hover: false,
		mobile_show_parent_link: true
	  }
	});


	// *** Get MENUs Items from JSON file @initial load; now using local copy**
	$.getJSON(
		'assets/sb3_commands.json',
		// 'https://raw.githubusercontent.com/FabMo/FabMo-Engine/master/runtime/opensbp/sb3_commands.json', 
		function(data) {
			// Comment in for DEBUG; Print the JSON data object to the console just for debug and inspection
			// console.log(data)
			table = ["<table style='border-collapse: collapse'>"];
			for(key in data) {
				switch(key.substring(0,1)) {
					case "F":
						$("#menu_files").append('<li class="menuDD" id="' + key + '"><a >' + key + ' - ' + data[key]["name"] || "Unnamed" + '</a></li>');
						break;
					case "M":
						$("#menu_moves").append('<li class="menuDD" id="' + key + '"><a >' + key + ' - ' + data[key]["name"] || "Unnamed" + '</a></li>');
						break;
					case "J":
						$("#menu_jogs").append('<li class="menuDD" id="' + key + '"><a >' + key + ' - ' + data[key]["name"] || "Unnamed" + '</a></li>');
						break;
					case "C":
						$("#menu_cuts").append('<li class="menuDD" id="' + key + '"><a >' + key + ' - ' + data[key]["name"] || "Unnamed" + '</a></li>');
						break;
					case "Z":
						$("#menu_zero").append('<li class="menuDD" id="' + key + '"><a >' + key + ' - ' + data[key]["name"] || "Unnamed" + '</a></li>');
						break;
					case "S":
						$("#menu_settings").append('<li class="menuDD" id="' + key + '"><a >' + key + ' - ' + data[key]["name"] || "Unnamed" + '</a></li>');
						break;
					case "V":
						$("#menu_values").append('<li class="menuDD" id="' + key + '"><a >' + key + ' - ' + data[key]["name"] || "Unnamed" + '</a></li>');
						break;
				}
			}

			$(document).foundation('dropdown', 'reflow');

			// ** Set Up Response to Menu Click/Selection (paste in 2 Letter Command ***
			// ... had to do this within the load and after the menu created, otherwise no binding to individual elements
			// $(".menuDD").bind( 'click', function() {
			// 	var thisCmd = this.id;
			// 	$("#cmd-input").val(thisCmd + ", ");
			// 	$("#cmd-input").focus();
			// 	//console.log('got change ... ' + thisCmd);
			// });

			$(".menuDD").bind( 'click', function(event) {
			 	var commandText = this.id;
			 	$(document).foundation('dropdown', 'reflow');
			 	processCommandInput(commandText);
			});

	});

	// ** Initialize Default Appearance
	fabmoDashboard.showDRO(); 

	// Update the generic UI textboxes with config data from the engine
	updateUIFromEngineConfig();

	// Update the speed UI textboxes with config data from the engine (speeds are formatted)
	updateSpeedsFromEngineConfig();
	
	// Handle and Bind generic UI textboxes that directly change opensbp configs
	$('.opensbp_input').change( function() {
		setConfig(this.id, this.value);
	});

	// Handle and Bind updates from formatted SPEED textboxes
	$('.opensbp_input_formattedspeeds').change( function() {
		switch(this.id){
			case 'formatted_movexy_speed':
			    fabmoDashboard.runSBP('VS,' + this.value);
				//setConfig('opensbp-movexy_speed', this.value);
				break;
			case 'formatted_movez_speed':
			    fabmoDashboard.runSBP('VS,,' + this.value);
				//setConfig('opensbp-movez_speed', this.value);
				break;
			case 'formatted_jogxy_speed':
			    fabmoDashboard.runSBP('VS,,,,,,' + this.value);
				//setConfig('opensbp-jogxy_speed', this.value);
				break;
			case 'formatted_jogz_speed':
			    fabmoDashboard.runSBP('VS,,,,,,,' + this.value);
				//setConfig('opensbp-jogz_speed', this.value);
				break;
		}
		console.log("changed speeds ...");
		updateSpeedsFromEngineConfig();
		$("#cmd-input").focus();
	});

	// *** Respond to Command Entry
	var xTriggered = 0;

	$("#cmd-input").keyup(function( event ) {

		// For Debug
		var msg = "Handler for .keyup() called " + xTriggered + " time(s). (Key = " + event.which + ")";
		var commandInputText = $("#cmd-input").val();
		xTriggered++;
		console.log( msg, "html" );
		console.log( event );

		switch(event.which) {
			case 13:
				sendCmd();										// On ENTER ... SEND the command
				break;
			case 27:
				event.preventDefault();							// ESC as a general clear and update tool
				curLine = ""; 									// Remove after sent or called
                $(".top-bar").click(); 							// ... and click to clear any dropdowns
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
				if(ok) {
					$(".top-bar").click();
					$("#cmd-input").focus();
				}
				break;
		}

	}); // $("#cmd-input").keyup()

	$("#cmd-input").keydown(function( event ) {		
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

//old
//		fabmoDashboard.submitJob($('#fileform'), {}, function(err, data) {
//			resetFormElement($('#file'));
//		});

//new format
//	    fabmo.submitJob({
//	      file : makeCircle(cx,cy,d,zpullup,depth,seg_size,feedrate, passdepth),
//	      filename : 'example-circle.nc',
//	      name : d + '" Diameter Circle',
//	      description : d + '" diameter circle centered at ' + cx + ',' + cy + ' at a depth of ' + depth + '"' 
//	    });

//my shot at it
	    fabmo.submitJob({
	      file : $('#fileform'),
	      filename : $('#file'),
	      name : "FP-called file",
	      description :  
	    });


	});

	// Clear Command Line after a status report is recieved
	fabmoDashboard.on('status', function(status) {
  	  $('#cmd-input').val("");
  	  console.log('got status report ...');
  	  if (!status.job){
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

