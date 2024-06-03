const API_URL = 'http://127.0.0.1:5000/tasks';

document.getElementById('taskForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const httpMethod = event.target.httpMethod.value;
    const taskId = event.target.task_id.value;
    const nome = event.target.name.value;
    const description = event.target.description.value;
    const importance = event.target.importance.value;
    const category = event.target.category.value;
    const deadline = event.target.deadline.value;
    const task = {
        name: event.target.name.value,
        description: event.target.description.value,
        importance: event.target.importance.value,
        category: event.target.category.value,
        deadline: event.target.deadline.value
    };

    switch (httpMethod) {
        case 'GET':
            getTasks();
            break;
        case 'POST':
            if (nome && description && importance && category && deadline) {
                createTask(task);
            } else {
                alert('There are missing required filds');
            }
            break;
        case 'PUT':
            if (taskId) {
                updateTask(taskId, task);
            } else {
                alert('Task ID is required for PUT method.');
            }
            break;
        case 'DELETE':
            if (taskId) {
                deleteTask(taskId);
            } else {
                alert('Task ID is required for DELETE method.');
            }
            break;
        default:
            alert('Invalid HTTP method selected.');
    }
    return false
});

function getTasks() {
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            alert("Successfully retrieved table info!")
            displayTasks(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function createTask(task) {
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(task)
    })
    .then(response => response.json())
    .then(data => {
        alert("Successfully created new task!")
        displayResult(data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function updateTask(taskId, task) {
    fetch(`${API_URL}/${taskId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(task)
    })
    .then(response => response.json())
    .then(data => {
        alert("Successfully updated task!")
        displayResult(data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function deleteTask(taskId) {
    fetch(`${API_URL}/${taskId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        alert("Successfully deleted task!")
        displayResult(data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function displayTasks(tasks) {
    const taskResult = document.getElementById('taskResult');
    taskResult.innerHTML = '';

    if (tasks.length > 0) {
        const table = document.createElement('table');
        table.className = 'table table-striped';

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headers = ['ID', 'Name', 'Description', 'Importance', 'Category', 'Deadline'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        tasks.forEach(task => {
            const row = document.createElement('tr');
            const taskValues = [task.id, task.name, task.description, task.importance, task.category, task.deadline];
            taskValues.forEach(value => {
                const td = document.createElement('td');
                td.textContent = value;
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        taskResult.appendChild(table);
    } else {
        taskResult.textContent = 'No tasks found.';
    }
}

function displayResult(result) {
    const taskResult = document.getElementById('taskResult');
    taskResult.innerHTML = `<pre>${JSON.stringify(result, null, 2)}</pre>`;
}

function updateForm() {
    const httpMethod = document.getElementById('httpMethod').value;
    const taskIdField = document.getElementById('taskIdField');
    const taskFields = document.getElementById('taskFields');

    if (httpMethod === 'GET') {
        taskIdField.classList.add('hidden');
        taskFields.classList.add('hidden');
    } else if (httpMethod === 'POST') {
        taskIdField.classList.add('hidden');
        taskFields.classList.remove('hidden');
    } else if (httpMethod === 'PUT') {
        taskIdField.classList.remove('hidden');
        taskFields.classList.remove('hidden');
    } else if (httpMethod === 'DELETE') {
        taskIdField.classList.remove('hidden');
        taskFields.classList.add('hidden');
    }
}

function initializeSSE() {
    const eventSource = new EventSource('http://127.0.0.1:5000/stream');

    eventSource.addEventListener('show', function(event) {
        const message = JSON.parse(event.data);
        console.log("teste");
        console.log('Show event received:', message);
        //displayNotification(message);
        //getTasks();
    });

    eventSource.addEventListener('create', function(event) {
        const message = JSON.parse(event.data);
        console.log('Create event received:', message);
        //displayNotification(message);
    });

    eventSource.addEventListener('update', function(event) {
        const message = JSON.parse(event.data);
        console.log('Update event received:', message);
        //displayNotification(message);
    });

    eventSource.addEventListener('delete', function(event) {
        const message = JSON.parse(event.data);
        console.log('Delete event received:', message);
        //displayNotification(message);
    });

}

function displayNotification(message) {
    const notificationList = document.getElementById('notificationList');
    const listItem = document.createElement('li');
    listItem.className = 'list-group-item';
    listItem.textContent = `Event: ${message.event}, Data: ${JSON.stringify(message.data)}`;
    notificationList.appendChild(listItem);
}

updateForm();
initializeSSE();
