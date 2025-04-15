# PowerShell script to kill process on port 3000 and start NestJS
# Usage: .\start-nest-clean.ps1 [start|start:dev|start:debug]

param (
    [Parameter(Mandatory=$false)]
    [string]$Command = "start:dev"
)

$port = 3000
Write-Host "Checking port $port..." -ForegroundColor Cyan

# Find process using port 3000
$processInfo = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Where-Object State -eq Listen

if ($processInfo) {
    $processId = $processInfo.OwningProcess
    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
    
    if ($process) {
        Write-Host "Found process $($process.Name) (PID: $processId) using port $port. Killing it..." -ForegroundColor Yellow
        
        try {
            Stop-Process -Id $processId -Force
            Write-Host "Process killed successfully." -ForegroundColor Green
        } catch {
            Write-Host "Failed to kill process: $_" -ForegroundColor Red
        }
    }
} else {
    Write-Host "No process found using port $port." -ForegroundColor Cyan
}

# Wait a moment to ensure port is freed
Start-Sleep -Seconds 1

# Start NestJS application with the specified command
Write-Host "Starting NestJS application with 'npm run $Command'..." -ForegroundColor Cyan
npm run $Command