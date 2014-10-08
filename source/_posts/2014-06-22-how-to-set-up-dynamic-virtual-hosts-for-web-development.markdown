---
layout: post
title: Как настроить динамические виртуальные хосты для веб-разработки
date: 2014-06-22 20:21
comments: true
categories: linux
tags: [виртуальные хосты, разработка]
---

После того как умер мой винчестер на ноутбуки и встала проблема заново поднять рабочее окружение, я задумался о том, чтобы использовать в качестве такого, образ на виртуальной машины.  Данная тема, довольно старая, все не как не доходили руки. Но коль делать все правильно, решил заодно решить проблему автоматически создания виртуальных хостов под проекты.

Что это дает, мы создаем папку с названием проекта myproject  и сразу имеем доступ к нему по адресу http:// myproject.dev, не плохо правда.
<!-- more -->

#  1. Настройка домена *.dev

Ставим dnsmasq

{% codeblock lang:sh %}
sudo apt-get install dnsmasq
{% endcodeblock %}

в /etc/dnsmasq.d/devtld.conf

{% codeblock lang:sh %}
listen-address=127.0.0.1
address=/.dev/192.168.0.10 ;192.168.0.10 – ip вашей виртуальной машины
{% endcodeblock %}

Перезапускаем сервис

{% codeblock lang:sh %}
service dnsmasq restart
{% endcodeblock %}

Проверяем работу

{% codeblock lang:sh %}
ping test.dev

PING test.dev (192.168.0.10) 56(84) bytes of data.
64 bytes from localhost.localdomain (192.168.0.10): icmp_req=1 ttl=64 time=0.019 ms
64 bytes from localhost.localdomain (192.168.0.10): icmp_req=2 ttl=64 time=0.034 ms
64 bytes from localhost.localdomain (192.168.0.10): icmp_req=3 ttl=64 time=0.035 ms
{% endcodeblock %}



#  2. Настройка веб-сервера

Настроим наш веб сервер, в качестве такого у меня выступает ngnix. Данный конфиг является отправной точкой создания вашего собственного.

{% codeblock lang:sh %}
server {
    listen 80;
    server_name .dev;
 
    # dynamic vhosts for development
    set $basepath "/path/to/your/workspace";
 
    set $domain $host;
    if ($domain ~ "^(.*)\.dev$") {
        set $domain $1;
    }
    set $rootpath "${domain}";
    if (-d $basepath/$domain/public) {
        set $rootpath "${domain}/public";
    }
    if (-d $basepath/$domain/httpdocs) {
        set $rootpath "${domain}/httpdocs";
    }
    if (-d $basepath/$domain/web) {
        set $rootpath "${domain}/web";
    }
    if (-f $basepath/$domain/index.php) {
        set $rootpath $domain;
    }
    if (-f $basepath/$domain/index.html) {
        set $rootpath $domain;
    }
 
    root $basepath/$rootpath;
 
    # enable PHP
    index index.php app.php index.html;
    location / {
        index index.php;
        error_page 404 = @indexphp;
    }
    location @indexphp {
        rewrite ^(.*)$ /index.php$1;
    }
    location ~ ^(.+\.php)(?:/.+)?$ {
        expires off;
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_split_path_info ^(.+\.php)(/.*)$;
        include fastcgi_params;
    }
    # rewrite to index.php for pretty URL's
    try_files $uri $uri/ /index.php?$args;
 
    # block .ht* access
    location ~ /\.ht {
        deny all;
    }
}
{% endcodeblock %}

Для Apache

{% codeblock lang:sh %}
<Virtualhost *:80>
    VirtualDocumentRoot "/path/to/your/workspace/%1/public"
    ServerName vhosts.dev
    ServerAlias *.dev
    UseCanonicalName Off
    <Directory "/path/to/your/workspace/*">
        Options Indexes FollowSymLinks MultiViews
        AllowOverride All
        Order allow,deny
        Allow from all
    </Directory>
</Virtualhost>
{% endcodeblock %}


