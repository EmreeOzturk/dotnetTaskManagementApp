using Microsoft.Extensions.Configuration.AzureAppConfiguration;
using Azure.Identity;
using Microsoft.Azure.Cosmos;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddAzureAppConfiguration(options =>
{
    var token = new DefaultAzureCredential();
    var endpoint = builder.Configuration["AppConfig:Endpoint"] ?? 
                  Environment.GetEnvironmentVariable("APP_CONFIG_ENDPOINT");
    options.Connect(new Uri(endpoint), token);
    options.ConfigureKeyVault(kv => kv.SetCredential(token));
});


// Register CosmosClient as a Singleton
builder.Services.AddSingleton<CosmosClient>(sp =>
{
    string connectionString = sp.GetRequiredService<IConfiguration>()["CosmosDBConnectionString"] ?? 
                            Environment.GetEnvironmentVariable("COSMOS_DB_CONNECTION_STRING");
    return new CosmosClient(connectionString);
});

// Add services to the container.
builder.Services.AddControllersWithViews()
    .AddJsonOptions(options => {
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
    });

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}"
);

app.Run();
