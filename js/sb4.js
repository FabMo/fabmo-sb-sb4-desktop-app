// JS for Sb4 ...
function sendCmd() {
		var thisCmd = document.getElementById("cmd-input").value;
		$("#txt_area").text("Running > " + thisCmd);
		fabmoDashboard.runSBP(thisCmd);					 // SEND IT >>>
		document.getElementById("cmd-input").value = ""; // remove after sent or called
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

	// ** Get MENUs Items from JSON file **
	$.getJSON(
		'assets/sb3_commands.json',
		// 'https://raw.githubusercontent.com/FabMo/FabMo-Engine/master/runtime/opensbp/sb3_commands.json', 
		function(data) {
			// Print the JSON data object to the console just for debug and inspection
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
					case "B":
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

			// *** Initialize
				fabmoDashboard.showDRO();

			// *** Respond to Menu Click/Selection (paste in 2 Letter Command ***
			// ... had to do this within the load and after the menu created, otherwise there was no binding to individual elements
			$(".menuDD").bind( 'click', function() {
				var thisCmd = this.id;
				$("#cmd-input").val(thisCmd + ", ");
				$("#cmd-input").focus();
				console.log('got change ... ' + thisCmd);
			});

	});

	// Respond to Command Entry (do we need a rendundant "Go" Button for some systems?)
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
				sendCmd();													// On ENTER ... SEND the command
				break;
			case 27:
				event.preventDefault();
				curLine = ""; 												// Remove after sent or called
                $(".top-bar").click(); 										// ... and click to clear any dropdowns
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
        document.getElementById("cmd-input").value = curLine;    			// Uppercase if needed or clean up from ESC
		if ( curLine.length === 2 ) {
            curLine = "#" + curLine;		
			$( curLine ).click();
			if (curLine === "#JH") {
				sendCmd();
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
	$("#other").click(function() {
		console.log('got change');
		sendCmd("Command from Button Click");
		event.preventDefault();
	});
	
});	

