using Microsoft.AspNetCore.Authentication.JwtBearer; // <-- Thêm
using Microsoft.EntityFrameworkCore; // Thêm
using Microsoft.IdentityModel.Tokens; // <-- Thêm
using Microsoft.OpenApi.Models;
using Pharmacity.Models;
using System.Text; // <-- Thêm
using Neo4j.Driver; // Thêm dòng này

var builder = WebApplication.CreateBuilder(args);

// === 1. ĐỊNH NGHĨA CHÍNH SÁCH CORS ===
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      policy =>
                      {
                          // Cho phép React app (chạy ở port 5173) được gọi API
                          policy.WithOrigins("http://localhost:5173")
                                .AllowAnyHeader()
                                .AllowAnyMethod();
                      });
});

// Cấu hình JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });
// === KẾT THÚC THÊM DỊCH VỤ ===

// === THÊM CODE TỪ ĐÂY ===

// 1. Lấy chuỗi kết nối từ appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// 2. Đăng ký DbContext
builder.Services.AddDbContext<DB_QuanLyNhaThuoc2Context>(options =>
    options.UseSqlServer(connectionString));

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Pharmacity API", Version = "v1" });

    // Cấu hình để Swagger hiển thị file upload
    c.OperationFilter<FileUploadOperationFilter>();

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhập token theo dạng: Bearer {token}"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// Redis:
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = "localhost:6379"; // Chuỗi kết nối Redis
    options.InstanceName = "Pharmacity_";
});

// 1. Cấu hình Neo4j (Singleton)
builder.Services.AddSingleton(GraphDatabase.Driver(
    "bolt://localhost:7687",
    AuthTokens.Basic("neo4j", "12345678")
));


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// === 2. SỬ DỤNG CORS ===
app.UseCors(MyAllowSpecificOrigins); // <-- Thêm dòng này

// === 3. KÍCH HOẠT XÁC THỰC VÀ ỦY QUYỀN ===
// (Phải nằm TRƯỚC app.UseAuthorization)
app.UseAuthentication(); // <-- Thêm dòng này

app.UseAuthorization();

app.MapControllers();

app.Run();
