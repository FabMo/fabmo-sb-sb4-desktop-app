/**
 * Update UI elements on the page from the engine's opensbp configuration.
 * Takes any element with an id of the form branchname-configitem_name that corresponds to a configuration item:
 * eg: opensbp-movexy_speed, opensbp-jogxy_speed
 * and populates it from the corresponding value in the opensbp configuration, read from the engine.
 */

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

/**
 * Work out how many axes to display in menu drop-downs by what to exclude (allow linear and rotary)
 */
function getExcludedAxes(callback) {
    fabmo.getConfig(function(err, data) {
      console.log("getConf-");
      console.log(err);
      console.log(data);
      var excluded_axes_str="";
      if(err) {
        console.error(err);
      } else {
        var num_axes_str = "";
        if (data.driver.aam == 0) {
          excluded_axes_str = excluded_axes_str + "A";
          num_axes_str = num_axes_str + "4";
        }
        if (data.driver.bam == 0) {
          excluded_axes_str = excluded_axes_str + "B";
          num_axes_str = num_axes_str + "5";
        }
        if (data.driver.cam == 0) {
          excluded_axes_str = excluded_axes_str + "C";
          num_axes_str = num_axes_str + "6";
        }
        excluded_axes_str = excluded_axes_str + num_axes_str;
        //console.log(data);
        //console.log("axes - " + excluded_axes_str);
        callback(excluded_axes_str);
      }
    });
}

/**
 * Update formatted Speeds for UI Speed Box display.
 */
function updateSpeedsFromEngineConfig() {
    var temp = 0;
    fabmo.getConfig(function(err, data) {
      $('#formatted_movexy_speed').val(data.opensbp.movexy_speed.toFixed(2));
      $('#formatted_movez_speed').val(data.opensbp.movez_speed.toFixed(2));
    // note that jog speeds are handled differently than move speeds (they are from G2 velocity max)
      temp = data.driver.xvm / 60;
      $('#formatted_jogxy_speed').val(temp.toFixed(2));
      temp = data.driver.zvm / 60;
      $('#formatted_jogz_speed').val(temp.toFixed(2));
    });
}

/**
 * Set the specified value in the engine's configuration.
 * id is of the form opensbp-configitem_name such as opensbp-movexy_speed, etc.
 * This will only work for configuration items on the first branch of the tree - 
 * deeper items need more consideration. (???)
 */
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
