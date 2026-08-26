$env:PATH += ";C:\Program Files\Git\cmd;C:\Program Files\GitHub CLI"

Write-Host "=== Criando repositorio no GitHub ===" -ForegroundColor Green

# Try to create repo - if auth needed, do device flow
$result = gh repo create sauna-espaco-janice --public --source=. --remote=origin --push 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Precisa autenticar. Iniciando login..." -ForegroundColor Yellow
    Start-Process "https://github.com/login/device"
    gh auth login -h github.com -p https -w
    $result = gh repo create sauna-espaco-janice --public --source=. --remote=origin --push 2>&1
}

Write-Host $result
Write-Host ""
Write-Host "=== Agora va para o Vercel ===" -ForegroundColor Green
Write-Host "1. Acesse https://vercel.com"
Write-Host "2. Clique em 'Add New... > Project'"
Write-Host "3. Selecione o repositorio 'sauna-espaco-janice'"
Write-Host "4. Configure as environment variables:"
Write-Host "   DATABASE_URL=libsql://seu-banco.turso.io"
Write-Host "   TURSO_AUTH_TOKEN=seu-token"
Write-Host "   NEXTAUTH_SECRET=$(New-Guid)"
Write-Host "   NEXTAUTH_URL=https://seu-dominio.vercel.app"
Write-Host "5. Clique em 'Deploy'"
