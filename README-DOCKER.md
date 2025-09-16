# 🐳 Deploy em Produção - Quiz Mahhtla

Este guia explica como fazer o deploy da aplicação Quiz Mahhtla em produção usando Docker.

## 📋 Pré-requisitos

- Docker instalado (versão 20.10 ou superior)
- Docker Compose instalado (versão 2.0 ou superior)
- Servidor com pelo menos 1GB de RAM
- Porta 80 disponível

## 🚀 Deploy Rápido

### 1. Clone o repositório
```bash
git clone https://github.com/lucaslopesss123s/quiz-mahhtla.git
cd quiz-mahhtla
```

### 2. Execute com Docker Compose
```bash
docker-compose up -d
```

A aplicação estará disponível em `http://localhost:80`

## 🔧 Configuração Avançada

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
NODE_ENV=production
PORT=80
```

### Build Manual
```bash
# Build da imagem
docker build -t quiz-mahhtla .

# Executar container
docker run -d -p 80:80 --name quiz-mahhtla-app quiz-mahhtla
```

## 📊 Monitoramento

### Verificar status do container
```bash
docker ps
```

### Ver logs
```bash
docker logs quiz-mahhtla-app
```

### Healthcheck
```bash
curl -f http://localhost:80/
```

## 🔄 Atualizações

Para atualizar a aplicação:

```bash
# Parar containers
docker-compose down

# Atualizar código
git pull origin main

# Rebuild e restart
docker-compose up -d --build
```

## 🌐 Proxy Reverso (Opcional)

O `docker-compose.yml` já inclui labels para Traefik. Para usar com Nginx:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🛡️ Segurança

- A aplicação roda com usuário não-root
- Nginx configurado com headers de segurança
- Healthcheck automático configurado
- Logs estruturados para monitoramento

## 📝 Estrutura dos Arquivos

- `Dockerfile` - Configuração da imagem Docker
- `docker-compose.yml` - Orquestração dos serviços
- `nginx.conf` - Configuração do servidor web
- `.dockerignore` - Arquivos excluídos do build

## 🆘 Troubleshooting

### Container não inicia
```bash
docker logs quiz-mahhtla-app
```

### Porta já em uso
```bash
# Alterar porta no docker-compose.yml
ports:
  - "8080:80"  # Usar porta 8080 ao invés de 80
```

### Rebuild completo
```bash
docker-compose down
docker system prune -f
docker-compose up -d --build
```

---

**Desenvolvido para Mahhtla** 🚀