window.onerror = function(msg, url, lineNo, columnNo, error) {
  var div = document.createElement('div');
  div.style.position = 'fixed';
  div.style.top = '0';
  div.style.left = '0';
  div.style.width = '100%';
  div.style.height = '100%';
  div.style.background = 'white';
  div.style.color = 'red';
  div.style.padding = '20px';
  div.style.zIndex = '9999';
  div.style.overflow = 'auto';
  div.innerHTML = '<h1>FATAL ERROR</h1>' +
    '<p><b>Message:</b> ' + msg + '</p>' +
    '<p><b>URL:</b> ' + url + '</p>' +
    '<p><b>Line:</b> ' + lineNo + '</p>' +
    '<p><b>Column:</b> ' + columnNo + '</p>' +
    '<pre>' + (error && error.stack ? error.stack : 'No stack trace') + '</pre>';
  document.body.appendChild(div);
  return false;
};
console.log("Debug error catcher initialized.");
