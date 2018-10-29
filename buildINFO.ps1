# Compress-Archive -literal package.json -path c:\Dropbox\github\fabmo-sb4-app\*.html build\test_VER000.zip
Compress-Archive -path *.html,*.png,js\*.js -DestinationPath build\test_VER000.zip -U
# Rename-Item build\test_VER000.zip test_VER000.fma

# "*.html","assets/*.*","assets/docs/*.*","js/*.js","js/lib/*.js","js/foundation/*.js","js/vendor/*.js","css/*.css","fonts/*","img/*.png","icon.png","package.json"