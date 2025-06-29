#Requires -Version 5.1

[CmdletBinding()]
param (
    [Switch]$Clean
)

# --- Configuration ---
$TargetFile = "bow.html"
$HtmlTemplate = "Battle Of Wits.html"
$CssSource = "style.css"
$JsSources = @(
    "deck.js",
    "attributes.js",
    "characters.js",
    "chat.js",
    "goblet.js",
    "riddles.js",
    "game.js",
    "main.js"
)

$CssPlaceholder = "<!-- CSS_PLACEHOLDER -->"
$JsPlaceholder = "<!-- JS_PLACEHOLDER -->"

# --- Functions ---
function Clean-BuildOutput {
    Write-Host "Cleaning up..."
    if (Test-Path -Path $TargetFile) {
        Remove-Item -Path $TargetFile -Force
        Write-Host "Removed: $TargetFile"
    } else {
        Write-Host "$TargetFile not found. Nothing to clean for the main target."
    }
    Write-Host "Cleanup complete."
}

function Build-Html {
    Write-Host "Assembling $TargetFile..."

    # --- Prepare CSS Block ---
    if (-not (Test-Path -Path $CssSource)) {
        Write-Error "CSS source file not found: $CssSource"
        exit 1
    }
    $cssContent = Get-Content -Path $CssSource -Raw -Encoding UTF8 # Ensure reading as UTF-8
    $cssBlock = "<style>`n$cssContent`n</style>"
    Write-Host "CSS block prepared."

    # --- Prepare JS Block ---
    $jsContentBuilder = New-Object System.Text.StringBuilder
    [void]$jsContentBuilder.AppendLine("<script>") # Changed from type="module"
    [void]$jsContentBuilder.AppendLine("// Combined JavaScript modules. Order of concatenation:")

    foreach ($jsFile in $JsSources) {
        if (-not (Test-Path -Path $jsFile)) {
            Write-Warning "JavaScript source file not found: $jsFile. Skipping."
            continue
        }
        Write-Host "  Concatenating: $jsFile"
        [void]$jsContentBuilder.AppendLine("// --- Start of $jsFile ---")
        
        $rawJsContent = Get-Content -Path $jsFile -Raw -Encoding UTF8 # Ensure reading as UTF-8
        $lines = $rawJsContent -split [System.Environment]::NewLine
        $processedLines = @()
        foreach ($line in $lines) {
            # Skip import lines
            if ($line -match "^\s*import\s+.*from\s+.*['""]\s*;" -or $line -match "^\s*import\s*\{.*\}\s*from\s+.*['""]\s*;") {
                continue
            }
            # Remove export keywords (order matters: 'export default' before 'export')
            $processedLine = $line -replace '^\s*export\s+default\s+', ''
            $processedLine = $processedLine -replace '^\s*export\s+', ''
            $processedLines += $processedLine
        }
        $processedJsContent = $processedLines -join [System.Environment]::NewLine
        [void]$jsContentBuilder.AppendLine($processedJsContent)
        [void]$jsContentBuilder.AppendLine("`n// --- End of $jsFile ---`n")
    }
    [void]$jsContentBuilder.AppendLine("</script>")
    $jsBlock = $jsContentBuilder.ToString()
    Write-Host "JavaScript block prepared."

    # --- Assemble HTML ---
    if (-not (Test-Path -Path $HtmlTemplate)) {
        Write-Error "HTML template file not found: $HtmlTemplate"
        exit 1
    }
    $htmlContent = Get-Content -Path $HtmlTemplate -Raw -Encoding UTF8 # Ensure reading as UTF-8

    if ($htmlContent -notmatch [regex]::Escape($CssPlaceholder)) {
        Write-Warning "CSS Placeholder '$CssPlaceholder' not found in '$HtmlTemplate'."
    }
    if ($htmlContent -notmatch [regex]::Escape($JsPlaceholder)) {
        Write-Warning "JavaScript Placeholder '$JsPlaceholder' not found in '$HtmlTemplate'."
    }

    $htmlContent = $htmlContent -replace [regex]::Escape($CssPlaceholder), $cssBlock
    $htmlContent = $htmlContent -replace [regex]::Escape($JsPlaceholder), $jsBlock

    try {
        Set-Content -Path $TargetFile -Value $htmlContent -Encoding UTF8
        Write-Host "$TargetFile assembled successfully." -ForegroundColor Green
    }
    catch {
        Write-Error "Failed to write ${TargetFile}: $_"
        exit 1
    }

    # --- Post-build Information and Warnings ---
    Write-Host "`nINFO: This script assumes '$HtmlTemplate' contains placeholders:"
    Write-Host "      '$CssPlaceholder' (ideally in <head>)"
    Write-Host "      '$JsPlaceholder' (ideally before </body>)"
    Write-Host "INFO: JavaScript 'import' and 'export' statements are being removed."
    Write-Host "      The combined script is now a standard script, not a module."
    Write-Warning "This approach relies on global scope and correct concatenation order for dependencies."
    Write-Warning "If classes/variables are defined in multiple files with the same name, it may lead to 'already declared' errors or unexpected behavior."
}

# --- Main Script Logic ---
if ($Clean) {
    Clean-BuildOutput
} else {
    # Check if HTML template exists before attempting to build
    if (-not (Test-Path -Path $HtmlTemplate)) {
        Write-Error "HTML Template '$HtmlTemplate' not found. Build cannot proceed."
        exit 1
    }
    # Check if CSS source exists
    if (-not (Test-Path -Path $CssSource)) {
        Write-Error "CSS Source '$CssSource' not found. Build cannot proceed."
        exit 1
    }
    # Optionally, check for all JS files or let the build function handle warnings
    
    Build-Html
}
