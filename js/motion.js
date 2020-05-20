//..................................... SEND DATA TO FABMO VIA Manual RUNTIME   ###==PRIMARY OUTPUT==### for FabMo
function doMotion (x, y, z) {                                              // ########################
    var err
    console.log("NEXT doMotion loc: " + x, y, z);
    var code = ['G1']
    if(x != undefined) {code.push('X' + x.toFixed(4));}
    if(y != undefined) {code.push('Y' + y.toFixed(4));}
    if(z != undefined) {code.push('Z' + z.toFixed(4));}
    code.push('F240');
    //code.push('F60');
    fabmo.manualRunGCode(code.join(''))
    //PAnEvent = false;
}

function killMotion () {                                                    // send KILL if running
    if (globals.G2_stat === 5) {
        fabmo.manualRunGCode('\x04\n');
        globals.G2_killed = true;
        console.log('KILL-motion!');
    }
}
