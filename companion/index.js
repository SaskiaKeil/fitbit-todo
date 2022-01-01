import * as messaging from 'messaging';

import { settingsStorage } from "settings";

// If no list ID is taken use the default list, otherwise the configured one
let listId;
if (JSON.parse(settingsStorage.getItem("listId")) === null) {
    listId = 'Tasks';
} else {
    listId = JSON.parse(settingsStorage.getItem("listId"))['name'];
}

const clientId = JSON.parse(settingsStorage.getItem("clientId"))["name"];
const clientSecret = JSON.parse(settingsStorage.getItem("clientSecret"))["name"];
const refreshToken = JSON.parse(settingsStorage.getItem("refreshToken"))["name"];


// Listen for the onopen event and then pull the list of tasks
messaging.peerSocket.onopen = function() {

    // Make sure all required fields are set
    if (clientId === '' | clientSecret === '' | refreshToken === '') {
      messaging.peerSocket.send({'status': 'error', 'message': 'Missing auth tokens, please set all required fields in the settings'});
      return;
    }

  getToken().then(function(token) {
    const requestOptions = {
      method: 'GET',
      headers: {'authorization': token},
    };

    const url = getURL(listId);

    fetch(url, requestOptions)
        .then(function(response) {
          return response.json();
        })
        .then(function(response) {
          // Check length of response
          if (response.value.length == 0) {
              messaging.peerSocket.send({'status': 'error', 'message': 'No tasks found'});
          } else {

              for (const entry_index in response.value) {
                const entry = response.value[entry_index];

                // Send each task individually to not exceed the message size limit
                let task = {'title': entry.title, 'id': entry.id, 'index': entry_index, 'status': 'ok'};
                if (messaging.peerSocket.readyState == messaging.peerSocket.OPEN) {
                  messaging.peerSocket.send(task);
                } else {
                  console.error('PeerSocket not open');
                }

              messaging.peerSocket.send({'status': 'done'});
          }
        }
    })
    .catch((error) => console.log('error', error));
  })
};

// Mark task as completed
messaging.peerSocket.addEventListener('message', (evt) => {
  if (evt.data.type == 'complete') {
    getToken().then(function(token) {
      const url = 'https://graph.microsoft.com/v1.0/me/todo/lists/' + listId + '/tasks/' + evt.data.taskId;

      const options = {
        method: 'PATCH',
        headers: {'Authorization': token, 'Content-Type': 'application/json'},
        body: JSON.stringify({
          'status': 'completed',
        }),
      };

      fetch(url, options)
          .then(function(response) {
            return response.json();
          });
    });
  }
});

function getToken() {
  // Prepare the token request
  const formdata = new FormData();
  formdata.append('client_id', clientId);
  formdata.append('client_secret', clientSecret);
  formdata.append('refresh_token', refreshToken);
  formdata.append('grant_type', 'refresh_token');

  const requestOptions = {
    method: 'POST',
    body: formdata,
  };

  // Setup a promise to be able to use it in a chained function call
  return new Promise((resolve) => {
    fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token?', requestOptions)
        .then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              throw('Error getting auth token, check your settings');
            }
        })
        .then((response) => {
          resolve(response.access_token);
        })
        // TODO suboptimal mix of concerns here, need to learn more about exception handling in JS
        .catch((error) => messaging.peerSocket.send({'status': 'error', 'message': error}));
  });
}

function getURL(listId) {
  let url = 'https://graph.microsoft.com/v1.0/me/todo/lists/' + listId + '/tasks?';

  const params = {
    '$filter': 'status%20eq%20%27notStarted%27',
  };

  // Construct URL based on the base URL and parameters
  Object.keys(params).forEach(function(key) {
    url += '&' + key + '=' + params[key];
  });

  return url;
}

