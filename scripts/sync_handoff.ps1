param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Args
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir
$pythonScript = Join-Path $repoRoot "scripts/sync_handoff.py"

if (-not (Test-Path -LiteralPath $pythonScript)) {
    throw "Expected Python sync script at $pythonScript"
}

$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) {
    $python = Get-Command py -ErrorAction SilentlyContinue
}

if (-not $python) {
    throw "Python is not available on PATH. Install Python or invoke scripts/sync_handoff.py directly."
}

& $python.Source $pythonScript @Args
exit $LASTEXITCODE

