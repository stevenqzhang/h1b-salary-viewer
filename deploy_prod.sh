#!/usr/bin/env bash

#This file deploys to prod

# update code
git pull

# copy over nginx changes, which are quick
sudo cp -r nginx /etc/

#  TODO add logging here if nginx restarts
#validate, then restart nginx if any changes
sudo nginx -t && sudo service nginx restart

# install go backend
pushd src/pi
go build
chmod +x pi
./pi &
popd

#install frontend, generate js files
sudo npm install
npm run build

#copy over to apache
sudo cp prod/index.html /var/www/html/
sudo cp prod/bundle* /var/www/html/
sudo cp prod/favicon.ico /var/www/html/
sudo cp analytics.js /var/www/html/
sudo cp hotjar.js /var/www/html/
