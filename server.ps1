param(
  [int]$Port = $(if ($env:PORT) { [int]$env:PORT } else { 3000 })
)

$ErrorActionPreference = "Stop"
$SteamApiKey = $env:STEAM_API_KEY
$PublicDir = Join-Path $PSScriptRoot "public"

function Write-HttpResponse {
  param(
    [System.IO.Stream]$Stream,
    [int]$Status,
    [string]$ContentType,
    [byte[]]$Body
  )

  $reason = switch ($Status) {
    200 { "OK" }
    400 { "Bad Request" }
    403 { "Forbidden" }
    404 { "Not Found" }
    405 { "Method Not Allowed" }
    500 { "Internal Server Error" }
    502 { "Bad Gateway" }
    default { "OK" }
  }

  $headers = "HTTP/1.1 $Status $reason`r`nContent-Type: $ContentType`r`nContent-Length: $($Body.Length)`r`nConnection: close`r`n`r`n"
  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headers)
  $Stream.Write($headerBytes, 0, $headerBytes.Length)
  if ($Body.Length -gt 0) {
    $Stream.Write($Body, 0, $Body.Length)
  }
}

function Send-Json {
  param(
    [System.IO.Stream]$Stream,
    [int]$Status,
    [object]$Payload
  )

  $json = $Payload | ConvertTo-Json -Depth 20
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
  Write-HttpResponse $Stream $Status "application/json; charset=utf-8" $bytes
}

function Send-ErrorJson {
  param(
    [System.IO.Stream]$Stream,
    [int]$Status,
    [string]$Code,
    [string]$Message
  )

  Send-Json $Stream $Status @{
    error = @{
      code = $Code
      message = $Message
    }
  }
}

function Get-NormalizedSteamInput {
  param([string]$InputValue)

  $value = ($InputValue + "").Trim()
  if ($value -match "^\d{17}$") {
    return @{ type = "steamid"; value = $value }
  }

  $urlValue = if ($value.Contains("://")) { $value } else { "https://$value" }
  try {
    $uri = [System.Uri]$urlValue
  } catch {
    return $null
  }

  $hostName = $uri.Host.ToLowerInvariant()
  if ($hostName.StartsWith("www.")) {
    $hostName = $hostName.Substring(4)
  }
  if ($hostName -ne "steamcommunity.com") {
    return $null
  }

  $parts = $uri.AbsolutePath.Split("/", [System.StringSplitOptions]::RemoveEmptyEntries)
  if ($parts.Length -ge 2 -and $parts[0] -eq "profiles" -and $parts[1] -match "^\d{17}$") {
    return @{ type = "steamid"; value = $parts[1] }
  }
  if ($parts.Length -ge 2 -and $parts[0] -eq "id") {
    return @{ type = "vanity"; value = [System.Uri]::UnescapeDataString($parts[1]) }
  }

  return $null
}

function ConvertTo-QueryString {
  param([hashtable]$Params)

  $pairs = @()
  foreach ($key in $Params.Keys) {
    $encodedKey = [System.Uri]::EscapeDataString([string]$key)
    $encodedValue = [System.Uri]::EscapeDataString([string]$Params[$key])
    $pairs += "$encodedKey=$encodedValue"
  }
  $pairs += "format=json"
  return ($pairs -join "&")
}

function Invoke-SteamApi {
  param(
    [string]$Method,
    [hashtable]$Params
  )

  $query = ConvertTo-QueryString $Params
  $url = "https://api.steampowered.com/$Method/v0001/?$query"
  Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 20
}

function Resolve-SteamId {
  param([string]$InputValue)

  $parsed = Get-NormalizedSteamInput $InputValue
  if ($null -eq $parsed) {
    throw [System.ArgumentException]::new("Enter a valid Steam profile URL, custom URL, or SteamID64.")
  }

  if ($parsed.type -eq "steamid") {
    return $parsed.value
  }

  $data = Invoke-SteamApi "ISteamUser/ResolveVanityURL" @{
    key = $SteamApiKey
    vanityurl = $parsed.value
  }

  if ($data.response.success -ne 1 -or -not $data.response.steamid) {
    throw [System.Management.Automation.ItemNotFoundException]::new("This Steam profile could not be found.")
  }

  return $data.response.steamid
}

function Get-NormalizedGame {
  param([object]$Game)

  @{
    appid = $Game.appid
    name = if ($Game.name) { $Game.name } else { "App $($Game.appid)" }
    img_icon_url = if ($Game.img_icon_url) { $Game.img_icon_url } else { "" }
    playtime_forever = if ($Game.playtime_forever) { $Game.playtime_forever } else { 0 }
  }
}

function Get-SteamLibrary {
  param([string]$InputValue)

  $steamId = Resolve-SteamId $InputValue
  $data = Invoke-SteamApi "IPlayerService/GetOwnedGames" @{
    key = $SteamApiKey
    steamid = $steamId
    include_appinfo = 1
    include_played_free_games = 1
  }

  if ($null -eq $data.response.games) {
    throw [System.UnauthorizedAccessException]::new("This user's game library is private or unavailable.")
  }

  $games = @($data.response.games | ForEach-Object { Get-NormalizedGame $_ } | Sort-Object name)
  @{
    steamid = $steamId
    game_count = if ($data.response.game_count) { $data.response.game_count } else { $games.Count }
    games = $games
  }
}

function Get-ContentType {
  param([string]$Path)

  switch ([System.IO.Path]::GetExtension($Path).ToLowerInvariant()) {
    ".html" { "text/html; charset=utf-8" }
    ".css" { "text/css; charset=utf-8" }
    ".js" { "text/javascript; charset=utf-8" }
    ".json" { "application/json; charset=utf-8" }
    ".svg" { "image/svg+xml" }
    ".png" { "image/png" }
    default { "application/octet-stream" }
  }
}

function Send-StaticFile {
  param(
    [System.IO.Stream]$Stream,
    [string]$RequestPath
  )

  if ($RequestPath -eq "/") {
    $RequestPath = "/index.html"
  }

  $decodedPath = [System.Uri]::UnescapeDataString($RequestPath)
  $relativePath = $decodedPath.TrimStart("/").Replace("/", [System.IO.Path]::DirectorySeparatorChar)
  $filePath = [System.IO.Path]::GetFullPath((Join-Path $PublicDir $relativePath))
  $publicRoot = [System.IO.Path]::GetFullPath($PublicDir)

  if (-not $filePath.StartsWith($publicRoot, [System.StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path $filePath -PathType Leaf)) {
    Write-HttpResponse $Stream 404 "text/plain; charset=utf-8" ([System.Text.Encoding]::UTF8.GetBytes("Not found"))
    return
  }

  $bytes = [System.IO.File]::ReadAllBytes($filePath)
  Write-HttpResponse $Stream 200 (Get-ContentType $filePath) $bytes
}

function Handle-Compare {
  param(
    [System.IO.Stream]$Stream,
    [string]$Body
  )

  if (-not $SteamApiKey) {
    Send-ErrorJson $Stream 500 "missing_api_key" "Missing Steam API key. Set STEAM_API_KEY and restart the app."
    return
  }

  try {
    $payload = $Body | ConvertFrom-Json
    $player1 = ($payload.player1 + "").Trim()
    $player2 = ($payload.player2 + "").Trim()

    if (-not $player1 -or -not $player2) {
      Send-ErrorJson $Stream 400 "missing_input" "Enter both Steam profiles before comparing."
      return
    }

    Send-Json $Stream 200 @{
      player1 = Get-SteamLibrary $player1
      player2 = Get-SteamLibrary $player2
    }
  } catch [System.ArgumentException] {
    Send-ErrorJson $Stream 400 "steam_error" $_.Exception.Message
  } catch [System.Management.Automation.ItemNotFoundException] {
    Send-ErrorJson $Stream 404 "steam_error" $_.Exception.Message
  } catch [System.UnauthorizedAccessException] {
    Send-ErrorJson $Stream 403 "steam_error" $_.Exception.Message
  } catch {
    Send-ErrorJson $Stream 502 "steam_error" "Steam API error. Try again in a minute."
  }
}

function Read-HttpRequest {
  param([System.IO.Stream]$Stream)

  $reader = [System.IO.StreamReader]::new($Stream, [System.Text.Encoding]::UTF8, $false, 8192, $true)
  $requestLine = $reader.ReadLine()
  if (-not $requestLine) {
    return $null
  }

  $headers = @{}
  while ($true) {
    $line = $reader.ReadLine()
    if ($line -eq $null -or $line -eq "") {
      break
    }
    $separator = $line.IndexOf(":")
    if ($separator -gt 0) {
      $headers[$line.Substring(0, $separator).Trim().ToLowerInvariant()] = $line.Substring($separator + 1).Trim()
    }
  }

  $body = ""
  $contentLength = if ($headers.ContainsKey("content-length")) { [int]$headers["content-length"] } else { 0 }
  if ($contentLength -gt 0) {
    $buffer = New-Object char[] $contentLength
    $read = $reader.ReadBlock($buffer, 0, $contentLength)
    if ($read -gt 0) {
      $body = -join $buffer[0..($read - 1)]
    }
  }

  $parts = $requestLine.Split(" ")
  @{
    method = $parts[0]
    path = ($parts[1] -split "\?")[0]
    body = $body
  }
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Parse("127.0.0.1"), $Port)
$listener.Start()

Write-Host "Steam Family Comparison Prototype running at http://localhost:$Port"

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $stream = $client.GetStream()
      $request = Read-HttpRequest $stream
      if ($null -eq $request) {
        continue
      }

      if ($request.method -eq "POST" -and $request.path -eq "/api/compare") {
        Handle-Compare $stream $request.body
      } elseif ($request.method -eq "GET") {
        Send-StaticFile $stream $request.path
      } else {
        Write-HttpResponse $stream 405 "text/plain; charset=utf-8" ([System.Text.Encoding]::UTF8.GetBytes("Method not allowed"))
      }
    } finally {
      $client.Close()
    }
  }
} finally {
  $listener.Stop()
}
