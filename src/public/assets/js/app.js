(function() {
  var installButtons = document.querySelectorAll(".installButton");

  if (installButtons) {
    getInstallLink().then(function(link) {
      [].slice.call(installButtons).forEach(wrapper => {
        wrapper.innerHTML =
          '<a href="' +
          link +
          '">' +
          '<img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" />' +
          "</a>";
      });
    });
  }

  function getInstallLink() {
    return new Promise((resolve, reject) => {
      var request = new XMLHttpRequest();
      request.open("GET", "./install-link", true);

      request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
          try {
            return resolve(request.responseText);
          } catch (e) {}
        }
        reject();
      };

      request.onerror = reject;

      request.send();
    });
  }
})();
