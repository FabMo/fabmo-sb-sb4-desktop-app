// JS for Sb4 ...

// Validate the input of the provided form (just checks for a valid number, no range check)
// Mark the input as invalid if it contains bad data
// Return the value if it's valid, null otherwise
function validateInput(target) {
  var f = parseFloat(target.val());
  if(isNaN(f) || f === undefined) {
      target.parent().removeClass('has-success');
      target.parent().addClass('has-error');
      return null;
  } else {
      target.parent().removeClass('has-error');
      target.parent().addClass('has-success');
      return f;
  }
}


function sendCmd() {
		var thisCmd = document.getElementById("cmd-input").value;
		$("#txt_area").text("Running > " + thisCmd);
		fabmoDashboard.runSBP(thisCmd);					 // SEND IT >>>
		document.getElementById("cmd-input").value = ""; // remove after sent or called
		//var curSpeed = document.getElementById("opensbp_movexy_speed").value;
		//document.getElementById("opensbp_movexy_speed").value = curSpeed.toFixed(1);
}
function updSpeed(speed) {
		
		//var curSpeed = validateInput($("#opensbp_movexy_speed"));
		//var curSpeed = ($("#opensbp_movexy_speed"));
		//var curSpeed = parseFloat(speed.val());
		//var curSpeed = parseFloat(speed.val());
		//var curSpeed = document.getElementById("opensbp_movexy_speed").value;
		//var curSpeed = 1.26;
		//var newspeed = curSpeed;
		//var newspeed = curSpeed.toFixed(1);
		//$("#opensbp_movexy_speed_f").val(newspeed);
		console.log('got speed ... ' + speed);
		return speed;

		//var curSpeed = document.getElementById("opensbp_movexy_speed").value;
		//curSpeed.toFixed(1);
		//document.getElementById("opensbp_movexy_speed").value = curSpeed;
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
			console.log(data)
			table = ["<table style='border-collapse: collapse'>"];
			for(key in data) {
				switch(key.substring(0,1)) {
					case "F":
						$("#menu_files").append('<li class="menuDD" id="' + key + '"><a >' + key + ' - ' + data[key]["name"] || "Unnamed" + '</a></li>');
						//table.push('<tr>');
						//table.push('<td class="tablecell">' + key + '</td>');
						//table.push('<td class="tablecell">' + data[key]['name'] || 'Unnamed' + '</td>');
						//table.push('</tr>');
						break;
					case "M":
						$("#menu_moves").append('<li class="menuDD" id="' + key + '"><a >' + key + ' - ' + data[key]["name"] || "Unnamed" + '</a></li>');
						//table.push('<tr>');
						//table.push('<td class="tablecell">' + key + '</td>');
						//table.push('<td class="tablecell">' + data[key]['name'] || 'Unnamed' + '</td>');
						//table.push('</tr>');
						break;
					case "J":
						$("#menu_jogs").append('<li class="menuDD" id="' + key + '"><a >' + key + ' - ' + data[key]["name"] || "Unnamed" + '</a></li>');
						//table.push('<tr>');
						//table.push('<td class="tablecell">' + key + '</td>');
						//table.push('<td class="tablecell">' + data[key]['name'] || 'Unnamed' + '</td>');
						//table.push('</tr>');
						break;
					case "C":
						$("#menu_cuts").append('<li class="menuDD" id="' + key + '"><a >' + key + ' - ' + data[key]["name"] || "Unnamed" + '</a></li>');
						//table.push('<tr>');
						//table.push('<td class="tablecell">' + key + '</td>');
						//table.push('<td class="tablecell">' + data[key]['name'] || 'Unnamed' + '</td>');
						//table.push('</tr>');
						break;
					case "Z":
						$("#menu_zero").append('<li class="menuDD" id="' + key + '"><a >' + key + ' - ' + data[key]["name"] || "Unnamed" + '</a></li>');
						//table.push('<tr>');
						//table.push('<td class="tablecell">' + key + '</td>');
						//table.push('<td class="tablecell">' + data[key]['name'] || 'Unnamed' + '</td>');
						//table.push('</tr>');
						break;
					case "S":
						$("#menu_settings").append('<li class="menuDD" id="' + key + '"><a >' + key + ' - ' + data[key]["name"] || "Unnamed" + '</a></li>');
						//table.push('<tr>');
						//table.push('<td class="tablecell">' + key + '</td>');
						//table.push('<td class="tablecell">' + data[key]['name'] || 'Unnamed' + '</td>');
						//table.push('</tr>');
						break;
				}
			}
			//table.push('</table>');
			//$('#sb3content').html(table.join('\n'));

			$(document).foundation();
			$(document).foundation('dropdown', 'reflow');

			// ** Initialize Default Appearance
			fabmoDashboard.showDRO(); 

			var speed_XY = $("#opensbp_movexy_speed").val();
			//var newspeed = speed_XY;
			console.log('got speedXY ... ' + speed_XY);


			//$("#opensbp_movexy_speed_f").val.updSpeed(speed_XY);
			//$("#opensbp_movexy_speed_f").val(updSpeed($("#opensbp_movexy_speed")));
	

			// ** Set Up Response to Menu Click/Selection (paste in 2 Letter Command ***
			// ... had to do this within the load and after the menu created, otherwise no binding to individual elements
			$(".menuDD").bind( 'click', function() {
				var thisCmd = this.id;
				$("#cmd-input").val(thisCmd + ", ");
				$("#cmd-input").focus();
				console.log('got change ... ' + thisCmd);
			});

	});

	// *** Respond to Command Entry
	var xTriggered = 0;
	var thisKey = 0;
	$("#cmd-input").keyup(function( event ) {
		xTriggered++;
		thisKey = event.which;
		var msg = "Handler for .keyup() called " + xTriggered + " time(s). " + event.which;
		console.log( msg, "html" );
		console.log( event );
        var curLine = document.getElementById("cmd-input").value;
		curLine = curLine.toUpperCase();
		switch(thisKey) {
			case 13:
				sendCmd();										// On ENTER ... SEND the command
				break;
			case 27:
				event.preventDefault();
				curLine = ""; 									// Remove after sent or called
                $(".top-bar").click(); 							// ... and click to clear any dropdowns
				$("#txt_area").text("");
				$("#cmd-input").focus();
				break;
			case 70: //F
				if ( curLine ==="F" ) {
				$("#menu_files").click();
				}		
				break;
			case 77: //M
				if ( curLine ==="M" ) {
				$("#menu_moves").click();
				}		
				break;
			case 74: //J
				if ( curLine ==="J" ) {
				$("#menu_jogs").click();
				}		
				break;
			case 67: //C
				if ( curLine ==="C" ) {
				$("#menu_cuts").click();
				}		
				break;
			case 90: //Z
				if ( curLine ==="Z" ) {
				$("#menu_zero").click();
				}		
				break;
			case 83: //S
				if ( curLine ==="S" ) {
				$("#menu_settings").click();
				}		
				break;
		}	
		// ** Handle 2-letter Commands (Uppercase)
        document.getElementById("cmd-input").value = curLine; 
		if ( curLine.length === 2 ) {
            curLine = "#" + curLine;		
			$( curLine ).click();
				// * Special Case Items to act on second key
				if (curLine === "#JH") {
				sendCmd();
				}	
				if (curLine === "#FP") {
				jQuery('#file').trigger('click');
				}	
		}	
		}).keydown(function( event ) {
		switch (event.which) {
			case 13:
//			document.getElementById("cmd-input").value = ""; // remove after sent or called
			event.preventDefault();
//			fabmoDashboard.requestStatus(function(err, data) {
//				console.log(data);
//			});
		}	
	});


	// Just for testing stuff ... 

	$('#file').change(function(evt) {
		fabmoDashboard.submitJob($('#fileform'), {}, function(err, data) {
			resetFormElement($('#file'));
		});
	});


	$("#other").click(function() {
		console.log('got change');
		sendCmd("Command from Button Click");
		event.preventDefault();
	});
	
});	

