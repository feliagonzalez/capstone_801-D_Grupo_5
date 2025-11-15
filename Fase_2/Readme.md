# Proyecto (Fase 2): Aplicación de Monitoreo de Pozos

Este documento contiene las instrucciones para instalar y ejecutar el proyecto de la aplicación móvil (Ionic/Angular) correspondiente a la Fase 2.

# Primer Paso:

cd Fase_2

cd Evidencias_Proyecto

cd "Evidencias de Sistema"

cd Aplicación

cd APP_POZOS

cd AppPozos

# Paso 2: Luego de hacer el paso 1, y estar en la carpeta correcta, haremos lo siguiente:

npm install (si no funciona, hacer el siguiente)

npm install --legacy-peer-deps (si npm install funciono de manera correcta, no hace falta este codigo, sigue con el siguiente)

npm install -g @ionic/cli

npm install -g @angular/cli

# FireBase

npm i @angular/fire firebase (si no funciona, hacer el siguiente)

npm i @angular/fire firebase --legacy-peer-deps (si npm i @angular/fire firebase funciono de manera correcta, no hace falta este codigo, sigue con el siguiente)

# Para Leaflet (api mapa)
npm install leaflet --legacy-peer-deps

# Para los tipos de Leaflet
npm install @types/leaflet --save-dev --legacy-peer-deps

# Para el adaptador de Angular
npm install @asymmetrik/ngx-leaflet --legacy-peer-deps

# PDF

npm install jspdf jspdf-autotable --legacy-peer-deps 

# Iniciar Proyecto

ionic serve





Tecnologías Clave (Resumen)

Este proyecto utiliza:

Ionic 8

Angular 20 (Standalone Components)

Firebase 19 (@angular/fire) para autenticación y base de datos.

jsPDF y jspdf-autotable para la generación de reportes en PDF.

Leaflet(Api Mapa)