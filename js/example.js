if (!window.Haptics)
	alert("The haptics.js library is not loaded.");



$("#activate-fade-in").click(function(evt) {
		var dur = validateInput($('#pattern-duration'));
		console.log("A " + dur + " Vibrate Called!");
    Haptics.vibrate(dur);
});

$("#call-c3").click(function(evt) {
    console.log("BUTTON Called!");
	//  fabmo.runSBP('C#,3');
});

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
