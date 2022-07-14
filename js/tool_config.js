/**
 * Update UI elements on the page from the engine's opensbp configuration.
 * Takes any element with an id of the form branchname-configitem_name that corresponds to a configuration item:
 * eg: opensbp-movexy_speed, opensbp-jogxy_speed
 * and populates it from the corresponding value in the opensbp configuration, read from the engine.
 **/

function updateUIFromEngineConfig() {
    // getting config values for OpenSBP and G2; note that move speeds is OpenSBP, but jogs are in G2
    fabmo.getConfig(function(err, data) {
      if(err) {
        console.error(err);
      } else {
        for(key in data.opensbp) {
          v = data.opensbp[key];
          input = $('#opensbp-' + key);
          if(input.length) {
            input.val(String(v));
          }
        }  
        for(key in data.driver) {
          v = data.driver[key];
          input = $('#g2-values' + key);
          if(input.length) {
            input.val(String(v));
          }  
        }
      }
    });
}

function updateSpeedsFromEngineConfig() {
  var temp = 0;
  fabmo.getConfig(function(err, data) {
    $('#formatted_movexy_speed').val(data.opensbp.movexy_speed.toFixed(2));
    $('#formatted_movez_speed').val(data.opensbp.movez_speed.toFixed(2));
    // Note that for g2, jog speeds are handled differently than move speeds (they are drived from G2 velocity max)
    $('#formatted_jogxy_speed').val(data.opensbp.jogxy_speed.toFixed(2));
    $('#formatted_jogz_speed').val(data.opensbp.jogz_speed.toFixed(2));
  });
}

// AXis = ["", "X", "Y", "Z", "A", "B", "C", "U", "V", "W" ]
function getAxisLimits() {
  let axis, temp
  fabmo.getConfig(function(err, data) {
    let i = 1
    do {
      temp = AXis[i].toLowerCase();
      LIm_up[i] = data.machine.envelope[(temp + "max")];
      LIm_dn[i] = data.machine.envelope[(temp + "min")];
      console.log("testAxis",temp,LIm_up[i],LIm_dn[i]);
    } while(i++ < 6);
  });  
}

function getExcludedAxes(callback) {         
    fabmo.getConfig(function(err, data) {
//      let excluded_axes_str="";
      let num_axes_str = "";
      let axes_in_use = 6;
        if(err) {
        console.error(err);
      } else {
        if (data.driver.xam == 0) {
          excluded_axes_str = excluded_axes_str + "X";
          num_axes_str = num_axes_str + "1";
          axes_in_use--;
        }
        if (data.driver.yam == 0) {
          excluded_axes_str = excluded_axes_str + "Y";
          num_axes_str = num_axes_str + "2";
          axes_in_use--;
        }
        if (data.driver.zam == 0) {
          excluded_axes_str = excluded_axes_str + "Z";
          num_axes_str = num_axes_str + "3";
          axes_in_use--;
        }
        if (data.driver.aam == 0) {
          excluded_axes_str = excluded_axes_str + "A";
          num_axes_str = num_axes_str + "4";
          axes_in_use--;
        }
        if (data.driver.bam == 0) {
          excluded_axes_str = excluded_axes_str + "B";
          num_axes_str = num_axes_str + "5";
          axes_in_use--;
        }
        if (data.driver.cam == 0) {
          excluded_axes_str = excluded_axes_str + "C";
          num_axes_str = num_axes_str + "6";
          axes_in_use--;
        }
        excluded_axes_str = excluded_axes_str + num_axes_str;
        console.log(data);
        console.log(axes_in_use);
        console.log("axes - " + excluded_axes_str);
        callback(excluded_axes_str);
      }
    });
}

/**
 * id is of the form opensbp-configitem_name such as opensbp-movexy_speed, etc.
 * This will only work for configuration items on the first branch of the tree - 
 * deeper items need more consideration. (???)
 **/
function setConfig(id, value) {
	var parts = id.split("-");
	var o = {};
	var co = o;
	var i=0;

	do {
	  co[parts[i]] = {};
	  if(i < parts.length-1) {
	    co = co[parts[i]];            
	  }
	} while(i++ < parts.length-1 );

	co[parts[parts.length-1]] = value;
	  console.log(o);
    fabmo.setConfig(o, function(err, data) {
	  updateUIFromEngineConfig();
	});
}
