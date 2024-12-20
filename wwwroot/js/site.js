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
                const [title, description, assignedTo, status, dueDate] = Array.from(task.cells).map(cell => cell.textContent);
                return `
                    <a href="#" class="list-group-item list-group-item-action">
                        <div class="d-flex w-100 justify-content-between">
                            <h5 class="mb-1">${title}</h5>
                            <small class="text-muted">Due: ${dueDate}</small>
                        </div>
                        <p class="mb-1">${description}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">Assigned to: ${assignedTo}</small>
                            <span class="badge bg-${status === 'Completed' ? 'success' : 'warning'}">${status}</span>
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
