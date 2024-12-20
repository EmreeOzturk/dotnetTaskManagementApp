// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

function loadTasks() {
    fetch('/Task/Index')
        .then(response => response.text())
        .then(html => {
            const taskList = document.querySelector('.list-group');
            const tasks = Array.from(new DOMParser().parseFromString(html, 'text/html').querySelectorAll('tr')).slice(1);
            
            taskList.innerHTML = tasks.map(task => {
                const cells = Array.from(task.cells);
                const [title, description, assignedTo, status, dueDate, priority] = cells.map(cell => cell.textContent.trim());
                const taskId = task.getAttribute('data-task-id');
                
                return `
                    <a href="#" class="list-group-item list-group-item-action">
                        <div class="d-flex w-100 justify-content-between">
                            <h5 class="mb-1">${title}</h5>
                            <small class="text-muted">Due: ${dueDate}</small>
                        </div>
                        <p class="mb-1">${description}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">Assigned to: ${assignedTo}</small>
                            <div>
                                <span class="badge bg-${status === 'Completed' ? 'success' : 'warning'}">${status}</span>
                                <span class="badge bg-info">${priority}</span>
                            </div>
                        </div>
                        <div class="mt-2">
                            <button onclick="deleteTask('${taskId}')" class="btn btn-sm btn-danger">Delete</button>
                            ${status !== 'Completed' ? `<button onclick="completeTask('${taskId}')" class="btn btn-sm btn-success">Complete</button>` : ''}
                            <a href="/Task/Edit/${taskId}" class="btn btn-sm btn-primary">Edit</a>
                        </div>
                    </a>
                `;
            }).join('');
        });
}

// Load tasks when page loads
document.addEventListener('DOMContentLoaded', loadTasks);

// Refresh tasks after form submission
document.querySelector('form').addEventListener('submit', function(e) {
    setTimeout(loadTasks, 1000); // Refresh after 1 second to allow for server processing
});

function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        fetch(`/Task/Delete?id=${taskId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(() => {
            loadTasks();
            // Remove from table if on task list page
            const row = document.querySelector(`tr[data-task-id="${taskId}"]`);
            if (row) row.remove();
        });
    }
}

function completeTask(taskId) {
    fetch(`/Task/UpdateStatus?id=${taskId}&status=Completed`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.json())
    .then(data => {
        if (data.success) {
            loadTasks();
            // Update status in table if on task list page
            const row = document.querySelector(`tr[data-task-id="${taskId}"]`);
            if (row) {
                const statusCell = row.querySelector('td:nth-child(4)');
                statusCell.innerHTML = '<span class="badge bg-success">Completed</span>';
                const completeButton = row.querySelector('.btn-success');
                if (completeButton) completeButton.remove();
            }
        }
    });
}
