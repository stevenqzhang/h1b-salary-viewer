# Mac setup
```
 brew install nginx
```

# what's checked into code?

`nginx.conf`- main conf file
everything else is referenced in `nginx.conf` by an `include`

# Debian server setup

Using https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-debian-8

1. Install
```
sudo service apache2 stop
sudo apt-get update
sudo apt-get install nginx
```

2. Modify the `sites-available` directory, and then run deploy script to autocopy it

3. use `sudo nginx -c /etc/nginx/nginx.conf -t` to check for errorssyntax

4. nginx restart

(note service nginx configtest  is equivalent https://devget.net/nginxapache/nginx-configtest-vs-nginx-t/)

# How to debug
Modify locally on mac, then
```
steven@Stevens-MacBook-Pro:~/dev_local/h1b_webapp  10:56:56
$ sudo scp -i gce_ssh nginx/nginx.conf roger.steven.pi@104.196.247.145:~/temp_nginx

 🐧 roger.steven.pi@instance-2:~/temp_nginx  17:57:47
$ sudo mv nginx.conf /etc/nginx/nginx.conf
```


## check version
root@instance-2:~# nginx -v
nginx version: nginx/1.6.2
