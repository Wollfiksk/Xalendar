param(
  [string]$Out = "digital_acid_trip_supabase_ready.zip"
)

if (Test-Path $Out) {
  Remove-Item $Out -Force
}

Compress-Archive -Path dist, database, README.md, package.json -DestinationPath $Out -Force
Write-Host "ZIP vytvořen:" $Out
