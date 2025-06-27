# Deployment Guide - Arma tu Parche

## GitHub Pages Deployment Strategy

### 🌟 **Production Branch Workflow**

Este proyecto usa una rama `production` separada para controlar cuándo se publica en GitHub Pages.

### 📋 **Workflow de Deployment**

1. **Desarrollo en `main`**:
   ```bash
   git checkout main
   # ... hacer cambios, commits, etc.
   ```

2. **Cuando estés listo para publicar**:
   ```bash
   # Asegúrate de que main esté actualizado
   git checkout main
   git pull origin main
   
   # Cambiar a production y mergear main
   git checkout production
   git merge main
   
   # Push a production (esto triggerea el deployment)
   git push origin production
   ```

3. **Deployment automático**:
   - GitHub Actions detecta el push a `production`
   - Hace build de la aplicación
   - Publica en GitHub Pages automáticamente

### 🔗 **URLs**

- **Desarrollo local**: `http://localhost:5173`
- **GitHub Pages**: `https://edwin-ortizp.github.io/arma-tu-parche/`

### ⚡ **Deployment Manual (Opcional)**

También puedes triggerar deployment manualmente desde cualquier rama:
1. Ve a: `https://github.com/edwin-ortizp/arma-tu-parche/actions`
2. Selecciona "Deploy to GitHub Pages"
3. Click "Run workflow"

### 🛠 **Configuración**

- **Base path**: `/arma-tu-parche/` (configurado automáticamente en producción)
- **SPA Routing**: Configurado con 404.html para rutas client-side
- **Build chunks**: Optimizado para carga rápida
- **GitHub Pages**: Configurado para usar rama `gh-pages` (solo contenido de /dist)

### 📝 **Notas**

- Los cambios en `main` NO se publican automáticamente
- Solo los cambios en `production` se publican
- GitHub Actions crea automáticamente rama `gh-pages` con solo contenido compilado
- NO se publica código fuente, solo archivos optimizados de /dist
- Esto te da control total sobre qué versiones van a producción
- Ideal para testing antes de publicar

### 🔧 **Configuración de GitHub Pages**

Después del primer deployment, configura en GitHub:
1. Ve a: Settings → Pages
2. Source: "Deploy from a branch"
3. Branch: "gh-pages" / (root)