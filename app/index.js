import document from 'document';
import * as messaging from 'messaging';

messaging.peerSocket.onmessage = function(evt) {

    // Display the task if no error occured
    if (evt.data.status == 'ok'){
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
    // If all tasks are sent enable the display of the whole list
    } else if (evt.data.status == 'done'){
        var todoList = document.getElementById('todo_list');
        todoList.style.display = 'inline';
    // In case of an error display the error message
    } else if (evt.data.status == 'error'){
        var messageElement = document.getElementById('message');
        messageElement.text = evt.data.message;
        messageElement.style.display = 'inline';
    }

};

// Listen for the onopen event and trigger the companion to wake up
messaging.peerSocket.onopen = function() {
    messaging.peerSocket.send('Hi!');
};

