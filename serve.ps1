$port = 5000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "PowerShell Dev-Server started on http://localhost:$port/"

$root = "C:\Users\bhush\.gemini\antigravity\scratch\shopify-storefront"

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $rawUrl = $request.RawUrl
        # Strip query string
        $path = $rawUrl.Split('?')[0]
        
        # Decode URL path (handling %20, etc.)
        $path = [System.Uri]::UnescapeDataString($path)
        
        # Determine actual file path
        $filePath = Join-Path $root $path
        
        # If it's a directory, look for index.html
        if (Test-Path $filePath -PathType Container) {
            $filePath = Join-Path $filePath "index.html"
        }

        # If file doesn't exist, fall back to index.html (SPA Fallback)
        if (-not (Test-Path $filePath -PathType Leaf)) {
            $filePath = Join-Path $root "index.html"
        }

        # Determine Content Type
        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
        $contentType = "application/octet-stream"
        switch ($ext) {
            ".html" { $contentType = "text/html; charset=utf-8" }
            ".css" { $contentType = "text/css; charset=utf-8" }
            ".js" { $contentType = "application/javascript; charset=utf-8" }
            ".json" { $contentType = "application/json; charset=utf-8" }
            ".png" { $contentType = "image/png" }
            ".jpg" { $contentType = "image/jpeg" }
            ".jpeg" { $contentType = "image/jpeg" }
            ".gif" { $contentType = "image/gif" }
            ".svg" { $contentType = "image/svg+xml" }
            ".ico" { $contentType = "image/x-icon" }
        }

        try {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } catch {
            $response.StatusCode = 500
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("Error loading page: $_")
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        } finally {
            $response.Close()
        }
    }
} catch {
    Write-Host "Listener error: $_"
} finally {
    $listener.Stop()
    Write-Host "Server stopped."
}
