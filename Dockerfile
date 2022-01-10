FROM nginx
# Just copy everything not excluded by the docker ignore file.
COPY . /usr/share/nginx/html