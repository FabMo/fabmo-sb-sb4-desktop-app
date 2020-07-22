//..................................... SEND DATA TO FABMO VIA Manual RUNTIME ##### PRIMARY Motion from Scrolling / Swiping
let last_speed
function doMotion (x, y, z, speed) {                                       
    var err                                                                // TODO: expand to all possible axes and create fast scan for those being used
    console.log("NEXT doMotion loc: " + x, y, z, speed);
    var code = ['G1']
    if(x != undefined) {code.push('X' + x.toFixed(4));}
    if(y != undefined) {code.push('Y' + y.toFixed(4));}
    if(z != undefined) {code.push('Z' + z.toFixed(4));}
    if(speed != undefined) {
        last_speed = speed;
        code.push('F' + speed.toFixed(0));
    } else if (last_speed != undefined) {
        code.push('F' + last_speed.toFixed(0));
    } else {
        code.push('F60')
    }
    //code.push('F240');
    //code.push('F60');
    fabmo.manualRunGCode(code.join(''))
    //PAnEvent = false;
}

function changeJerk (x, y, z) {

}

function killMotion () {                                                   // Send KILL if Moving ...
    if (globals.G2_stat === 5) {
        fabmo.manualRunGCode('\x04\n');
        globals.G2_killed = true;
        console.log('KILL-motion!');
    }
}
