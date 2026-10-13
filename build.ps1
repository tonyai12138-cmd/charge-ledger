param([string]$JavaHome = '', [string]$PlatformJar = '', [string]$BuildTools = '', [string]$KeyFile = '', [string]$KeyAlias = 'chargeledger')
$ErrorActionPreference = 'Stop'
$taskRoot = $PSScriptRoot
Set-Location -LiteralPath $taskRoot
if (-not $JavaHome) { $JavaHome = (Get-ChildItem -LiteralPath (Join-Path $taskRoot '.tools/jdk') -Directory | Select-Object -First 1).FullName }
if (-not $PlatformJar) { $PlatformJar = (Get-ChildItem -LiteralPath (Join-Path $taskRoot '.tools/platform') -Recurse -Filter 'android.jar' | Select-Object -First 1).FullName }
if (-not $BuildTools) { $BuildTools = (Get-ChildItem -LiteralPath (Join-Path $taskRoot '.tools/build-tools') -Recurse -Filter 'aapt2.exe' | Select-Object -First 1).DirectoryName }
foreach ($taskPath in @((Join-Path $JavaHome 'bin/javac.exe'), $PlatformJar, (Join-Path $BuildTools 'aapt2.exe'))) { if (-not (Test-Path -LiteralPath $taskPath)) { throw "Missing build tool: $taskPath. Run tools-bootstrap.py first or pass SDK paths." } }
$env:JAVA_HOME = $JavaHome
$env:PATH = (Join-Path $JavaHome 'bin') + ';' + $env:PATH
$buildRoot = '.tools/apk-build'
New-Item -ItemType Directory -Path $buildRoot,(Join-Path $buildRoot 'classes'),(Join-Path $buildRoot 'generated'),(Join-Path $buildRoot 'dex') -Force | Out-Null
function Invoke-Checked([string]$File,[string[]]$Arguments) { & $File @Arguments; if($LASTEXITCODE -ne 0){throw "Build command failed: $File ($LASTEXITCODE)"} }
$platformRelative = [System.IO.Path]::GetRelativePath($taskRoot, $PlatformJar)
$manifestText = Get-Content -LiteralPath 'android/app/src/main/AndroidManifest.xml' -Raw -Encoding UTF8
$manifestText = $manifestText.Replace('<manifest xmlns:android=', '<manifest package="cn.chargeledger.app" xmlns:android=')
[System.IO.File]::WriteAllText((Join-Path $taskRoot (Join-Path $buildRoot 'AndroidManifest.xml')), $manifestText, [System.Text.UTF8Encoding]::new($false))
Invoke-Checked (Join-Path $BuildTools 'aapt2.exe') @('compile','--dir','android/app/src/main/res','-o',(Join-Path $buildRoot 'resources.zip'))
$versionText = Get-Content -LiteralPath 'android/app/build.gradle' -Raw
$versionCode = [regex]::Match($versionText, 'versionCode\s+(\d+)').Groups[1].Value
$versionName = [regex]::Match($versionText, "versionName\s+'([^']+)'").Groups[1].Value
if (-not $versionCode -or -not $versionName) { throw 'Missing APK version configuration' }
Invoke-Checked (Join-Path $BuildTools 'aapt2.exe') @('link','-o',(Join-Path $buildRoot 'unsigned.apk'),'--manifest',(Join-Path $buildRoot 'AndroidManifest.xml'),'-I',$platformRelative,'--min-sdk-version','26','--target-sdk-version','35','--version-code',$versionCode,'--version-name',$versionName,'--java',(Join-Path $buildRoot 'generated'),'-A','web',(Join-Path $buildRoot 'resources.zip'))
$sources = @(Get-ChildItem -LiteralPath (Join-Path $taskRoot 'android/app/src/main/java') -Recurse -Filter '*.java' | ForEach-Object FullName) + @(Get-ChildItem -LiteralPath (Join-Path $buildRoot 'generated') -Recurse -Filter '*.java' | ForEach-Object FullName)
$javacArgs = @('-encoding','UTF-8','-source','8','-target','8','-classpath',$PlatformJar,'-d',(Join-Path $buildRoot 'classes')) + $sources
Invoke-Checked (Join-Path $JavaHome 'bin/javac.exe') $javacArgs
$classes = @(Get-ChildItem -LiteralPath (Join-Path $buildRoot 'classes') -Recurse -Filter '*.class' | ForEach-Object FullName)
$d8args = @('--lib',$PlatformJar,'--min-api','26','--output',(Join-Path $buildRoot 'dex')) + $classes
Invoke-Checked (Join-Path $BuildTools 'd8.bat') $d8args
Invoke-Checked (Join-Path $JavaHome 'bin/jar.exe') @('uf',(Join-Path $buildRoot 'unsigned.apk'),'-C',(Join-Path $buildRoot 'dex'),'classes.dex')
Invoke-Checked (Join-Path $BuildTools 'zipalign.exe') @('-f','-p','4',(Join-Path $buildRoot 'unsigned.apk'),(Join-Path $buildRoot 'aligned.apk'))
if (-not $KeyFile) { $KeyFile = Join-Path $taskRoot '.tools/charge-ledger-local.jks' }
if (-not (Test-Path -LiteralPath $KeyFile)) { throw 'Signing key missing. Original release upgrades require the original private key; forks must supply their own key via -KeyFile.' }
if (-not $env:CHARGE_LEDGER_STORE_PASSWORD -or -not $env:CHARGE_LEDGER_KEY_PASSWORD) { throw 'Set CHARGE_LEDGER_STORE_PASSWORD and CHARGE_LEDGER_KEY_PASSWORD in your local environment before signing.' }
New-Item -ItemType Directory -Path (Join-Path $taskRoot 'deliverables') -Force | Out-Null
$outputApk = 'deliverables/ChargeLedger.apk'
$signedApk = Join-Path $buildRoot 'signed.apk'
$signer = Join-Path $BuildTools 'apksigner.bat'
Invoke-Checked $signer @('sign','--ks',$KeyFile,'--ks-key-alias',$KeyAlias,'--ks-pass','env:CHARGE_LEDGER_STORE_PASSWORD','--key-pass','env:CHARGE_LEDGER_KEY_PASSWORD','--out',$signedApk,(Join-Path $buildRoot 'aligned.apk'))
Invoke-Checked $signer @('verify','--verbose',$signedApk)
$previousApk = @($outputApk,'deliverables/ChargeLedger-v1.0.0.apk','.tools/upgrade-baseline.apk') | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if ($previousApk) {
    $oldCert = & $signer verify --print-certs $previousApk
    if ($LASTEXITCODE -ne 0) { throw 'Original APK certificate verification failed' }
    $newCert = & $signer verify --print-certs $signedApk
    if ($LASTEXITCODE -ne 0) { throw 'New APK certificate verification failed' }
    $oldDigest = ($oldCert | Where-Object { $_ -match 'certificate SHA-256 digest:' }) -join ''
    $newDigest = ($newCert | Where-Object { $_ -match 'certificate SHA-256 digest:' }) -join ''
    if (-not $oldDigest -or $oldDigest -ne $newDigest) { throw 'Signing certificates differ. The previous deliverable has not been replaced.' }
    Write-Output $newDigest
}
Copy-Item -LiteralPath $signedApk -Destination $outputApk -Force
Get-FileHash -LiteralPath $outputApk -Algorithm SHA256 | Format-List
Write-Output "Built: $outputApk"
