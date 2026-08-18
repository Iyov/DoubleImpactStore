# AGENTS.md — DoubleImpactStore v0.3

## MISIÓN ACTUAL

Implementar **únicamente los cambios pendientes de la iteración v0.3** de DoubleImpactStore.

Repositorio:

https://github.com/Iyov/DoubleImpactStore

Especificación:

`.kiro/specs/double-impact-store/`

Archivos fuente de verdad:

- `.kiro/specs/double-impact-store/requirements.md`
- `.kiro/specs/double-impact-store/design.md`
- `.kiro/specs/double-impact-store/tasks.md`

---

# REGLA CRÍTICA — NO REIMPLEMENTAR EL PROYECTO

**NO reconstruyas DoubleImpactStore desde cero.**

El proyecto ya tiene implementadas las tareas **1 a 27**.

En `tasks.md` estas tareas están marcadas `[x]`.

Por tanto:

- NO rehacer las tareas 1–27.
- NO reemplazar módulos funcionales existentes.
- NO reconstruir `index.html`.
- NO reconstruir `ui.js`.
- NO reconstruir `style.css`.
- NO reconstruir el catálogo.
- NO reconstruir Instagram.
- NO reconstruir PWA.
- NO reconstruir SEO.
- NO reconstruir analytics.
- NO reconstruir navegación existente.
- NO reconstruir contacto existente.

Solo puedes modificar funcionalidades ya completadas cuando una tarea pendiente de v0.3 requiera explícitamente una modificación para integrarse.

En ese caso realiza **el cambio mínimo necesario**.

---

# ESTADO ACTUAL

Según el `tasks.md` publicado actualmente:

```text
[x] 1–27
[ ] 28
[ ] 29
[ ] 30
[ ] 31
[ ] 32
```

El trabajo de esta iteración comienza directamente en:

**Tarea 28**

y termina en:

**Tarea 32**.

No vuelvas a comenzar desde la tarea 1.

Las tareas 28–32 son las únicas tareas nuevas pendientes de esta iteración.

---

# PROCEDIMIENTO OBLIGATORIO

Antes de modificar cualquier archivo:

1. Leer `tasks.md`.
2. Confirmar cuáles tareas están `[x]`.
3. Confirmar cuáles tareas están `[ ]`.
4. Inspeccionar el código actual.
5. Comparar el código existente con la tarea pendiente.
6. Modificar únicamente lo necesario.
7. Ejecutar los tests.
8. Comprobar que no existen regresiones.
9. Continuar con la siguiente tarea pendiente.

**No marques una tarea como `[x]` hasta haberla implementado y verificado.**

---

# TAREA 28 — REFACTORIZAR MENÚ A SOLO ÍCONOS

## 28.1 Eliminar texto DoubleImpactStore del header

En `index.html`:

- Localiza el texto `DoubleImpactStore` que aparece junto al logo.
- Elimina únicamente ese texto/span.
- Conserva la imagen del logo.
- Utiliza:

```html
<img src="img/LogoDoubleImpactStore_50%.png" alt="DoubleImpactStore">
```

El enlace que envuelve el logo debe tener:

```html
aria-label="DoubleImpactStore — Volver al inicio"
```

No eliminar el logo.

No modificar otras partes del header innecesariamente.

---

## 28.2 Convertir navegación desktop a solo íconos

Modificar los enlaces existentes del menú para utilizar:

```html
<a ... class="nav-link" aria-label="Nombre de sección">
    <i ...></i>
    <span class="nav-text" data-i18n="nav.X">Texto</span>
</a>
```

En desktop:

```text
> 1024px
```

debe mostrarse:

**solo el ícono**.

En móvil:

```text
<= 1024px
```

debe mostrarse:

**ícono + texto**.

Utilizar exactamente estos íconos:

```text
Inicio        fa-house
Nosotros      fa-users
Productos     fa-gamepad
Instagram     fa-brands fa-instagram
Efemérides    fa-calendar-day
Blog          fa-newspaper
Testimonios   fa-star
FAQ           fa-circle-question
Servicios     fa-screwdriver-wrench
Contacto      fa-envelope
```

Cada enlace debe conservar su destino actual.

No cambiar el orden de los 10 elementos.

No eliminar ningún elemento.

---

## 28.3 Tooltip desktop

Modificar `css/style.css`.

En desktop:

```css
.nav-text {
    display: none;
}
```

En móvil:

```css
.nav-text {
    display: inline;
}
```

Implementar tooltip mediante CSS utilizando `aria-label`.

Debe aparecer en:

- `:hover`
- `:focus`

El tooltip no debe interferir con la navegación ni con la accesibilidad.

Utilizar la estructura definida en `tasks.md`.

Reducir el espacio ocupado por el logo/header únicamente en lo necesario para la nueva navegación.

No romper el menú hamburguesa existente.

---

# TAREA 29 — CORREGIR EFEMÉRIDES

Esta tarea es un **FIX CRÍTICO**.

Actualmente la sección de Efemérides no está mostrando correctamente su contenido.

## 29.1 HTML

En `index.html`, asegurar que exista:

```html
<section id="efemerides">
    <h2 data-i18n="efemerides.title">Efemérides Gaming</h2>
    <p id="efemerides-date"></p>

    <div id="efemerides-content">
        <p data-i18n="efemerides.loading">Cargando...</p>
    </div>
</section>
```

No duplicar la sección si ya existe.

Modificar la existente.

---

## 29.2 `efemerides.js`

Corregir únicamente lo necesario en:

```text
js/modules/efemerides.js
```

### Carga

Debe utilizar:

```javascript
fetch('./js/efemerides.json')
```

La ruta debe ser correcta respecto de `index.html`.

### Fecha

La clave del JSON utiliza:

```text
DD/MM
```

No utilizar:

```text
MM-DD
```

Construir correctamente día/mes utilizando `padStart(2, '0')`.

### Renderizado

`renderEfemeride()` debe mostrar:

- título
- texto
- detalle mediante `<details>` expandible

Debe utilizar el idioma activo.

### Sin efeméride

Si no existe efeméride:

```javascript
container.closest('section').style.display = 'none';
```

No mostrar errores al usuario.

---

## 29.3 Integración con `index.js`

Verificar que `index.js` realmente ejecute el flujo de Efemérides.

Debe existir una integración equivalente a:

```javascript
const data = await loadEfemerides();
const ef = getTodayEfemeride(data);
renderEfemeride(
    ef,
    document.getElementById('efemerides-content'),
    getLang()
);
```

Adaptar esta integración a la arquitectura actual sin superar el límite de responsabilidades de `index.js`.

**No reescribir `index.js` completo.**

Modificar solamente lo necesario.

---

## 29.4 Menú

Verificar que exista:

```html
<a href="#efemerides">
```

con:

```text
fa-calendar-day
```

No agregar un segundo enlace si ya existe.

---

# TAREA 30 — ACTUALIZAR CONTACTO

## 30.1 Eliminar información de envíos

En:

```text
index.html
```

dentro de:

```text
#contacto
```

eliminar cualquier texto relacionado con:

- "Envíos: Enviamos a todo Chile por encomienda"
- "Entrega presencial"
- "puntos de metro de Santiago"
- equivalentes

No eliminar:

- redes sociales
- WhatsApp
- enlaces de contacto

---

## 30.2 Aplicar `.contact-card`

Todos los canales de contacto deben utilizar:

```html
<a href="URL"
   target="_blank"
   rel="noopener noreferrer"
   class="contact-card">
    <i class="fab fa-ICON"></i>
    <span data-translate="contact-NOMBRE">Nombre</span>
</a>
```

Mantener estos siete canales:

1. Instagram @DoubleImpactStore
2. Instagram @Ropavejero.Retro
3. Instagram @NekketsuStore
4. Threads
5. Twitter/X
6. WhatsApp
7. YouTube

Utilizar las URLs reales ya definidas en la especificación.

No inventar URLs.

No cambiar las cuentas existentes.

---

## 30.3 CSS

En `css/style.css` implementar:

```css
.contact-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1.5rem;
}

.contact-card i {
    font-size: 3rem;
}

.contact-card span {
    font-size: 0.9rem;
    text-align: center;
}
```

El grid debe utilizar:

```css
display: grid;
grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
gap: 1.5rem;
```

No eliminar los estilos existentes que sigan siendo necesarios.

---

# TAREA 31 — PRODUCTOS DESTACADOS

Actualizar únicamente:

```html
<section id="productos-destacados">
```

Debe contener exactamente **5 categorías**:

### Nintendo

Plataformas:

```text
NES
SNES
N64
GameCube
GameBoy / Color / Advance
Wii / U
DS
3DS
```

### PlayStation

```text
PS1
PS2
PSP
PS3
PS4
```

### Sega

```text
Genesis
GameGear
Dreamcast
```

### Xbox

```text
OG Classic
360
One
```

### Atari y más

Crear la quinta categoría correspondiente.

---

## Tarjetas

Cada categoría debe utilizar:

```html
<a href="/productos" class="featured-card">
```

Debe contener:

- ícono
- nombre del fabricante
- lista de plataformas
- traducción ES/EN para el nombre

Agregar las claves de traducción necesarias a `ui.js`.

No reemplazar el sistema de internacionalización existente.

---

## CSS

Implementar grid responsive:

```css
grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
```

Las tarjetas deben tener:

- diseño coherente con el sitio
- hover effect
- accesibilidad
- navegación mediante teclado

No introducir un framework CSS.

---

# TAREA 32 — CHECKPOINT FINAL v0.3

Después de implementar 28–31:

## Header

Comprobar:

- no aparece el texto `DoubleImpactStore` junto al logo
- solo aparece el logo
- logo conserva `alt`
- logo tiene `aria-label`
- desktop muestra solo íconos
- desktop muestra tooltip en hover/focus
- móvil muestra ícono + texto
- menú hamburguesa continúa funcionando

## Efemérides

Comprobar:

- sección visible
- título
- fecha
- contenido real
- detalle expandible
- idioma correcto
- no hay error de consola
- fecha utiliza `DD/MM`

## Contacto

Comprobar:

- no existe información de envíos
- no existe información de entrega presencial
- existen los 7 canales
- todos utilizan `.contact-card`
- íconos >= 3rem
- enlaces externos tienen:
  - `target="_blank"`
  - `rel="noopener noreferrer"`

## Productos destacados

Comprobar exactamente:

```text
Nintendo
PlayStation
Sega
Xbox
Atari
```

Cada tarjeta debe apuntar a:

```text
/productos
```

## Tests

Ejecutar:

```bash
npm test
```

Después comprobar que no existen errores de JavaScript ni regresiones.

Si existen Playwright tests disponibles:

```bash
npx playwright test
```

Ejecutarlos también.

---

# REGLAS DE REGRESIÓN

Las nuevas tareas pueden modificar:

```text
index.html
css/style.css
js/modules/ui.js
js/modules/efemerides.js
js/index.js
```

pero solamente cuando sea necesario.

No realizar reemplazos globales.

No regenerar el proyecto.

No cambiar:

- catálogo
- Instagram
- PWA
- analytics
- SEO
- Service Worker
- GitHub Actions
- sistema de caché
- sistema de siglas

salvo que una tarea 28–32 lo requiera directamente.

---

# REGLA SOBRE `tasks.md`

No cambies artificialmente el estado de las tareas.

Una tarea solo puede pasar de:

```text
[ ]
```

a:

```text
[x]
```

después de:

1. implementación real;
2. revisión del código;
3. tests;
4. verificación funcional.

Las tareas opcionales ya completadas no deben tocarse.

---

# CRITERIO DE FINALIZACIÓN

La iteración v0.3 está terminada cuando:

```text
[x] 28
[x] 29
[x] 30
[x] 31
[x] 32
```

y todas las pruebas pasan.

**No vuelvas a implementar las tareas 1–27.**

El objetivo de esta sesión es implementar exclusivamente el **delta v0.3 pendiente**.