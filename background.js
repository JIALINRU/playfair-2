chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('playfair.html', {
    'width': 400,
    'height': 500,
    'maxWidth': 400,
    'maxHeight': 500,
    'type': 'panel'
  });
});

