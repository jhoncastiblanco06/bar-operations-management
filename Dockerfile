# Usamos Node.js en su versión ligera
FROM node:20-alpine

# Respetamos tu ruta de trabajo
WORKDIR /var/www/html

# Como aún no hay proyectos creados, quitamos el npm install.
# Este comando mantiene el contenedor encendido y esperando tus instrucciones.
CMD ["tail", "-f", "/dev/null"]