using Microsoft.AspNetCore.Mvc;
using TaskManagementApp.Models;
using Microsoft.Azure.Cosmos;
namespace TaskManagementApp.Controllers
{
    public class TaskController : Controller
    {
        private readonly IConfiguration _configuration;
        private readonly CosmosClient _cosmosClient;
        private readonly Container _container;

        public TaskController(IConfiguration configuration, CosmosClient cosmosClient)
        {
            _configuration = configuration;
            _cosmosClient = cosmosClient;
            _container = _cosmosClient.GetContainer("TaskManagementDB", "Tasks");
        }

        // GET: Task
        public async Task<IActionResult> Index()
        {
            var query = "SELECT * FROM c";
            var iterator = _container.GetItemQueryIterator<TaskItem>(query);
            List<TaskItem> tasks = new List<TaskItem>();

            while (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                tasks.AddRange(response);
            }

            return View(tasks);
        }

        // GET: Task/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST: Task/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(TaskItem task)
        {
            var id = Guid.NewGuid().ToString();
            task.Id = id;
            task.TaskId = id;
            task.CreatedAt = DateTime.UtcNow;
            task.UpdatedAt = DateTime.UtcNow;

            await _container.CreateItemAsync(task, new PartitionKey(task.TaskId));
            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        public async Task<IActionResult> Delete(string id)
        {
            await _container.DeleteItemAsync<TaskItem>(id, new PartitionKey(id));
            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        public async Task<IActionResult> UpdateStatus(string id, string status)
        {
            try 
            {
                var task = await _container.ReadItemAsync<TaskItem>(id, new PartitionKey(id));
                var updatedTask = task.Resource;
                updatedTask.Status = status;
                updatedTask.UpdatedAt = DateTime.UtcNow;
                
                await _container.ReplaceItemAsync(updatedTask, id, new PartitionKey(id));
                return Json(new { success = true });
            }
            catch
            {
                return Json(new { success = false });
            }
        }

        // GET: Task/Edit/5
        public async Task<IActionResult> Edit(string id)
        {
            var task = await _container.ReadItemAsync<TaskItem>(id, new PartitionKey(id));
            return View(task.Resource);
        }

        // POST: Task/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(TaskItem task)
        {
            task.UpdatedAt = DateTime.UtcNow;
            await _container.ReplaceItemAsync(task, task.Id, new PartitionKey(task.TaskId));
            return RedirectToAction(nameof(Index));
        }

    }
}

