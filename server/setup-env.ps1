# PowerShell script to create .env file
$envContent = @"
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=smartcal_db
JWT_SECRET=smartcal-secret-key-change-in-production-$(Get-Random -Minimum 1000 -Maximum 9999)
JWT_EXPIRES_IN=7d
PORT=3001
FRONTEND_URL=http://localhost:5173
"@

$envContent | Out-File -FilePath ".env" -Encoding utf8 -NoNewline
Write-Host ".env file created! Please edit it and add your MySQL password." -ForegroundColor Green

