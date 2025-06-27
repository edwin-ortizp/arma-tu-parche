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

### 📝 **Notas**

- Los cambios en `main` NO se publican automáticamente
- Solo los cambios en `production` se publican
- Esto te da control total sobre qué versiones van a producción
- Ideal para testing antes de publicar