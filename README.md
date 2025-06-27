# Arma tu Parche

Aplicación de ejemplo para coordinar planes y citas construida con React, Tailwind y Firebase.

## Instalación rápida

```bash
npm install
npm run dev
```

## Journey del usuario

1. **Explorar planes**. Al abrir la aplicación se muestran sugerencias básicas. Sin iniciar sesión solo se listan planes pensados para hacer en solitario.
2. **Crear o iniciar sesión**. Al intentar acceder a secciones como Perfil, Amigos o Matches se muestra la pantalla de inicio de sesión con Google.
3. **Conectar con amigos**. Tras autenticarse es posible añadir contactos mediante su PIN y definir el tipo de vínculo de la relación.
4. **Seleccionar preferencias**. Desde el perfil el usuario puede marcar intereses como _eventos_, _museos_ o _actividades al aire libre_.
5. **Elegir compañeros y planes**. En la pantalla de inicio se selecciona un contacto para ver todos los planes disponibles y guardar aquellos que interesen.
6. **Generar un match**. Si dos usuarios marcan el mismo plan se crea un match donde se puede indicar una fecha tentativa para realizarlo.

Los administradores cuentan además con una sección de configuración para crear y administrar planes de la base de datos.
