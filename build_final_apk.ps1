$ErrorActionPreference = "Continue"
$ProjectDir = "C:\Users\Joshan\.gemini\antigravity\scratch\task-flow"
$FinalBuildDir = "$ProjectDir\SomaUlipo_Builds"

# Ensure FinalBuildDir exists
if (-not (Test-Path $FinalBuildDir)) { New-Item -ItemType Directory -Path $FinalBuildDir | Out-Null }

$IconSrc = "C:\Users\Joshan\.gemini\antigravity\brain\9edf9de5-db70-4dfb-8198-4b85cc693557\somaulipo_premium_logo_final_1776373254938.png"

# --- Step 0: Copy + resize icon to all mipmap densities ---
Write-Host "`n[0/4] Placing app icon into mipmap directories..." -ForegroundColor Cyan

Add-Type -AssemblyName System.Drawing

function Resize-Image($src, $dst, $size) {
    if (-not (Test-Path $src)) { return }
    $orig = [System.Drawing.Image]::FromFile($src)
    $bmp  = New-Object System.Drawing.Bitmap($size, $size)
    $g    = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($orig, 0, 0, $size, $size)
    $g.Dispose()
    $orig.Dispose()
    $bmp.Save($dst, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "  -> $dst ($size x $size)"
}

$ResDir = "$ProjectDir\android\app\src\main\res"
$densities = @{
    "mipmap-mdpi"    = 48
    "mipmap-hdpi"    = 72
    "mipmap-xhdpi"   = 96
    "mipmap-xxhdpi"  = 144
    "mipmap-xxxhdpi" = 192
}

foreach ($d in $densities.GetEnumerator()) {
    $folder = "$ResDir\$($d.Key)"
    if (-not (Test-Path $folder)) { New-Item -ItemType Directory -Path $folder | Out-Null }
    Resize-Image $IconSrc "$folder\ic_launcher.png" $d.Value
    Resize-Image $IconSrc "$folder\ic_launcher_round.png" $d.Value
}
# Adaptive icon foreground
Resize-Image $IconSrc "$ResDir\mipmap-xxxhdpi\ic_launcher_foreground.png" 192

Write-Host "`n[0/4] Icons generated." -ForegroundColor Green


Write-Host "`n[1/4] Building web app (Vite)..." -ForegroundColor Cyan
Set-Location $ProjectDir
npm run build
Write-Host "[1/4] Web build done." -ForegroundColor Green

Write-Host "`n[2/4] Syncing Capacitor..." -ForegroundColor Cyan
npx cap sync android
Write-Host "[2/4] Sync done." -ForegroundColor Green

Write-Host "`n[3/4] Building APK with Gradle..." -ForegroundColor Cyan
Set-Location "$ProjectDir\android"

$LocalJdk = "C:\Users\Joshan\.gemini\antigravity\scratch\jdk17\jdk17.0.18_9"
if (Test-Path $LocalJdk) {
    Write-Host "  Applying FIXED JAVA_HOME: $LocalJdk" -ForegroundColor Gray
    $env:JAVA_HOME = $LocalJdk
    $env:Path = "$LocalJdk\bin;" + $env:Path
}

Write-Host "  Running gradle clean to remove old data..." -ForegroundColor Gray
.\gradlew.bat clean

# Run assembleDebug and capture output
try {
    .\gradlew.bat assembleDebug --no-daemon 2>&1 | Tee-Object -FilePath "$ProjectDir\build_apk_output.txt"
} catch {
    Write-Warning "Gradle build gave warnings, continuing."
}

# --- Step 4: Copy APK to final_build and open ---
Write-Host "`n[4/4] Finalizing NEW APK..." -ForegroundColor Cyan
$ApkSrc = "$ProjectDir\android\app\build\outputs\apk\debug\app-debug.apk"
$ApkDst = "$FinalBuildDir\SomaUlipo_Latest.apk"

if (Test-Path $ApkSrc) {
    Copy-Item $ApkSrc $ApkDst -Force
    Write-Host "`n✅ SUCCESS! NEW APK is in the folder:" -ForegroundColor Green
    Write-Host "   $ApkDst" -ForegroundColor Yellow
    # Open folder in explorer
    Start-Process explorer.exe -ArgumentList "`"$FinalBuildDir`""
} else {
    Write-Host "`n❌ APK build failed. Check build_apk_output.txt for details." -ForegroundColor Red
    # Output last few lines if failed
    Get-Content "$ProjectDir\build_apk_output.txt" -Tail 20
}
