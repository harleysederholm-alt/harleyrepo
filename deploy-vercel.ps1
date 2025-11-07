# PienHankinta-Vahti - Vercel Deployment Automation Script
# ===========================================================
# This script automates environment variable setup for Vercel
#
# Prerequisites:
# 1. Create Vercel project manually first at: https://vercel.com/new
# 2. Have Vercel API token ready
# 3. Have .env.local file with all secrets

param(
    [Parameter(Mandatory=$false)]
    [string]$VercelToken = $env:VERCEL_TOKEN,

    [Parameter(Mandatory=$false)]
    [string]$ProjectName = "pienhankinta-vahti",

    [Parameter(Mandatory=$false)]
    [string]$TeamId = $null
)

# Colors for output
$ErrorColor = "Red"
$SuccessColor = "Green"
$InfoColor = "Cyan"
$WarningColor = "Yellow"

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput $InfoColor "=========================================="
Write-ColorOutput $InfoColor "PienHankinta-Vahti - Vercel Deployment"
Write-ColorOutput $InfoColor "=========================================="
Write-Output ""

# Step 1: Check Vercel Token
if (-not $VercelToken) {
    Write-ColorOutput $ErrorColor "❌ VIRHE: Vercel API token puuttuu!"
    Write-Output ""
    Write-Output "Hae token:"
    Write-Output "1. Avaa: https://vercel.com/account/tokens"
    Write-Output "2. Luo uusi token"
    Write-Output "3. Aja skripti uudelleen:"
    Write-Output ""
    Write-ColorOutput $InfoColor '   .\deploy-vercel.ps1 -VercelToken "your_token_here"'
    Write-Output ""
    exit 1
}

Write-ColorOutput $SuccessColor "✅ Vercel token löytyi"

# Step 2: Read .env.local
$envPath = Join-Path $PSScriptRoot ".env.local"
if (-not (Test-Path $envPath)) {
    Write-ColorOutput $ErrorColor "❌ VIRHE: .env.local-tiedostoa ei löydy!"
    Write-Output ""
    Write-Output "Varmista että .env.local on olemassa ja sisältää kaikki tarvittavat muuttujat."
    exit 1
}

Write-ColorOutput $SuccessColor "✅ .env.local löytyi"

# Parse .env.local
$envVars = @{}
Get-Content $envPath | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        # Remove quotes if present
        $value = $value -replace '^["'']|["'']$', ''
        $envVars[$key] = $value
    }
}

Write-ColorOutput $InfoColor "📝 Löydetyt muuttujat: $($envVars.Keys.Count)"

# Step 3: Verify project exists
Write-Output ""
Write-ColorOutput $InfoColor "🔍 Tarkistetaan Vercel-projekti..."

$headers = @{
    "Authorization" = "Bearer $VercelToken"
    "Content-Type" = "application/json"
}

$projectUrl = "https://api.vercel.com/v9/projects/$ProjectName"
if ($TeamId) {
    $projectUrl += "?teamId=$TeamId"
}

try {
    $projectResponse = Invoke-RestMethod -Uri $projectUrl -Headers $headers -Method Get -ErrorAction Stop
    Write-ColorOutput $SuccessColor "✅ Projekti löytyi: $($projectResponse.name)"
} catch {
    if ($_.Exception.Response.StatusCode.Value__ -eq 404) {
        Write-ColorOutput $ErrorColor "❌ VIRHE: Projektia '$ProjectName' ei löydy!"
        Write-Output ""
        Write-Output "Luo projekti ensin:"
        Write-Output "1. Avaa: https://vercel.com/new"
        Write-Output "2. Valitse: harleyrepo"
        Write-Output "3. Projektin nimi: pienhankinta-vahti"
        Write-Output "4. Klikkaa: Deploy (se failaa, mutta projekti luodaan)"
        Write-Output ""
        Write-Output "Aja skripti uudelleen kun projekti on luotu."
        exit 1
    } else {
        Write-ColorOutput $ErrorColor "❌ Virhe projektin tarkistuksessa: $($_.Exception.Message)"
        exit 1
    }
}

# Step 4: Environment variables to add
$requiredVars = @(
    @{
        key = "NEXT_PUBLIC_SUPABASE_URL"
        target = @("production", "preview", "development")
    },
    @{
        key = "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        target = @("production", "preview", "development")
    },
    @{
        key = "SUPABASE_SERVICE_ROLE_KEY"
        target = @("production", "preview", "development")
    },
    @{
        key = "GROQ_API_KEY"
        target = @("production", "preview", "development")
    },
    @{
        key = "NEXT_PUBLIC_APP_URL"
        value = "https://$ProjectName.vercel.app"
        target = @("production", "preview", "development")
    },
    @{
        key = "STRIPE_SECRET_KEY"
        value = "sk_test_placeholder_change_me_later"
        target = @("production", "preview", "development")
    },
    @{
        key = "STRIPE_WEBHOOK_SECRET"
        value = "whsec_placeholder_change_me_later"
        target = @("production", "preview", "development")
    },
    @{
        key = "STRIPE_PRICE_ID_PRO"
        value = "price_placeholder_change_me_later"
        target = @("production", "preview", "development")
    },
    @{
        key = "STRIPE_PRICE_ID_AGENT"
        value = "price_placeholder_change_me_later"
        target = @("production", "preview", "development")
    }
)

# Step 5: Add environment variables
Write-Output ""
Write-ColorOutput $InfoColor "🚀 Lisätään ympäristömuuttujat..."
Write-Output ""

$successCount = 0
$failCount = 0

foreach ($var in $requiredVars) {
    $key = $var.key
    $target = $var.target

    # Get value from .env.local or use provided value
    if ($var.value) {
        $value = $var.value
    } elseif ($envVars.ContainsKey($key)) {
        $value = $envVars[$key]
    } else {
        Write-ColorOutput $WarningColor "⚠️  $key - Ei löydy .env.local-tiedostosta, ohitetaan"
        continue
    }

    # Prepare request body
    $body = @{
        key = $key
        value = $value
        target = $target
        type = if ($var.type) { $var.type } else { "plain" }
    } | ConvertTo-Json -Depth 10 -Compress

    # Add environment variable
    $envUrl = "https://api.vercel.com/v10/projects/$ProjectName/env"
    if ($TeamId) {
        $envUrl += "?teamId=$TeamId"
    }

    try {
        $response = Invoke-RestMethod -Uri $envUrl -Headers $headers -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
        Write-ColorOutput $SuccessColor "✅ $key - Lisätty"
        $successCount++
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.Value__
        if ($statusCode -eq 409) {
            Write-ColorOutput $WarningColor "⚠️  $key - Jo olemassa (ohitetaan)"
        } elseif ($statusCode -eq 400) {
            # Try to get detailed error message
            $errorBody = $_.ErrorDetails.Message
            # Check if it's ENV_CONFLICT (already exists)
            if ($errorBody -match "ENV_CONFLICT") {
                Write-ColorOutput $WarningColor "⚠️  $key - Jo olemassa (ohitetaan)"
            } else {
                Write-ColorOutput $ErrorColor "❌ $key - Bad Request: $errorBody"
                $failCount++
            }
        } else {
            Write-ColorOutput $ErrorColor "❌ $key - Virhe ($statusCode): $($_.Exception.Message)"
            $failCount++
        }
    }

    Start-Sleep -Milliseconds 500  # Rate limiting
}

# Summary
Write-Output ""
Write-ColorOutput $InfoColor "=========================================="
Write-ColorOutput $SuccessColor "✅ Onnistui: $successCount"
if ($failCount -gt 0) {
    Write-ColorOutput $ErrorColor "❌ Epäonnistui: $failCount"
}
Write-ColorOutput $InfoColor "=========================================="
Write-Output ""

# Step 6: Trigger deployment
Write-ColorOutput $InfoColor "🔄 Haluatko triggeroida uuden deploymentin? (Y/N)"
$deploy = Read-Host

if ($deploy -eq "Y" -or $deploy -eq "y") {
    Write-ColorOutput $InfoColor "🚀 Triggeroidaan deployment..."

    $deployUrl = "https://api.vercel.com/v13/deployments"
    if ($TeamId) {
        $deployUrl += "?teamId=$TeamId"
    }

    $deployBody = @{
        name = $ProjectName
        project = $ProjectName
        target = "production"
        gitSource = @{
            type = "github"
            repo = "harleysederholm-alt/harleyrepo"
            ref = "main"
        }
    } | ConvertTo-Json

    try {
        $deployResponse = Invoke-RestMethod -Uri $deployUrl -Headers $headers -Method Post -Body $deployBody -ErrorAction Stop
        Write-ColorOutput $SuccessColor "✅ Deployment aloitettu!"
        Write-Output ""
        Write-Output "Seuraa deploymenttiä:"
        Write-ColorOutput $InfoColor "https://vercel.com/harleysederholm-alts-projects/$ProjectName/deployments"
    } catch {
        Write-ColorOutput $ErrorColor "❌ Deployment-virhe: $($_.Exception.Message)"
        Write-Output ""
        Write-Output "Voit triggeroida deploymentin manuaalisesti:"
        Write-Output "1. Mene: https://vercel.com/harleysederholm-alts-projects/$ProjectName/deployments"
        Write-Output "2. Klikkaa: Redeploy"
    }
} else {
    Write-Output ""
    Write-Output "Deployment ohitettu. Voit trigeroida sen manuaalisesti:"
    Write-ColorOutput $InfoColor "https://vercel.com/harleysederholm-alts-projects/$ProjectName/deployments"
}

Write-Output ""
Write-ColorOutput $SuccessColor "🎉 Valmis!"
Write-Output ""
Write-Output "Seuraavat vaiheet:"
Write-Output "1. Aja Supabase-migraatio (katso: SUPABASE_MIGRATION.md)"
Write-Output "2. Testaa sovellus: https://$ProjectName.vercel.app"
Write-Output "3. Päivitä Stripe-tuotteet kun valmis (katso: DEPLOYMENT_CHECKLIST.md)"
