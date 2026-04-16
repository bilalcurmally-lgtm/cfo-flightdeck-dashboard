$port = 4173
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$url = "http://localhost:$port/"

try {
  Start-Process $url | Out-Null
} catch {
  Write-Warning "Could not open the browser automatically. Open $url manually."
}

if (Get-Command python -ErrorAction SilentlyContinue) {
  Set-Location $root
  python -m http.server $port
  exit
}

if (Get-Command py -ErrorAction SilentlyContinue) {
  Set-Location $root
  py -m http.server $port
  exit
}

Write-Error "Python was not found. Install Python or serve this folder with any static file server on http://localhost:$port."
