window.onload = function() {
  var img = document.getElementById('video');
  var img1 = document.getElementById('video1');

  function resize() {
    var width = window.innerWidth / 4;
    var height = window.innerHeight;
    var aspect = img.naturalHeight / img.naturalWidth;
    var aspect1 = img1.naturalHeight / img1.naturalWidth;

    if (!width) return;

    if (aspect > aspect1) { 
        aspect = aspect1; 
    }

    img.width = Math.min(width, height / aspect);
    img.height = Math.min(height, width * aspect);
    img1.width = Math.min(width, height / aspect);
    img1.height = Math.min(height, width * aspect1);
  }


  function reload() {
    img.onload = resize;
    img.src = 'http://' + location.hostname + ':3141?' + Math.random()
    img1.onload = resize;
    img1.src = 'http://' + location.hostname + ':3142?' + Math.random()
  }


  window.addEventListener('resize', resize, false);
  img.onclick = reload;
  img1.onclick = reload;  
  reload();
}
