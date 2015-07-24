// first js for sb4
function sendCmd(cmdLine) {
		fabmoDashboard.runSBP(cmdLine);
		document.getElementById("cmd-input").value = ""; // remove after sent or called
}

$(document).ready(function() {
	var xTriggered = 0;
	var thisKey = 0;
	$("#cmd-input").keyup(function( event ) {
		xTriggered++;
		thisKey = event.which;
		var msg = "Handler for .keyup() called " + xTriggered + " time(s). " + event.which;
		console.log( msg, "html" );
		console.log( event );
		if (thisKey == 13 ) {
			var msg = document.getElementById("cmd-input").value;
			$("#txt_area").text("Running > " + msg);
			sendCmd(msg);
		}
		}).keydown(function( event ) {
		if ( event.which == 13 ) {
			event.preventDefault();
		}
				//event.preventDefault();

	});
	 
	$( "#other").click(function() {
		$( "#cmd-input" ).keyup();
			sendCmd("Command from Button Click");
			event.preventDefault();
	});
});	

