import document from 'document';
import * as messaging from 'messaging';

messaging.peerSocket.onmessage = function(evt) {
    const task = evt.data;
    var todoElement = document.getElementById('todo_' + task.index);
    const todoCheckbox = todoElement.getElementById('todo-checkbox');
    todoCheckbox.text = task.title;
    // Enable the display of the task
    todoElement.style.display = 'inline';

    // Configure check box to communicate completion with companion on click
    todoCheckbox.onclick = function(task) {
      messaging.peerSocket.send({'type': 'complete', 'taskId': task.id});
      todoCheckbox.style.display = 'none';
    }.bind(this, task);
};

// Listen for the onopen event and trigger the companion to wake up
messaging.peerSocket.onopen = function() {
    messaging.peerSocket.send('Hi!');
};

