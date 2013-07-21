---
layout: post
title: Превращаем Raspberry Pi в домашний web-server
date: 2013-07-15 20:21
comments: true
categories: linux
tags: [linux, Raspberry Pi, test]
---

Не так давно приобрел забавную игрушку Raspberry Pi. Я планирую использовать ее в качестве «мозгов» для робота на базе Arduino, но об этом в другой раз. Что бы «малина» не валялась без дела. пока я проектирую робота, решил на базе нее поднять домашний web-server.
И так приступим…
<!-- more -->

#  1. Устанавливаем образ “wheezy”

Скачиваем образ с [официального сайта](http://www.raspberrypi.org/downloads)
Распаковываем, на данный момент это 2013-05-29-wheezy-armel.img
Подключаем карточку флешь память к компьютеру
Копируем образ на флеш-карту **dd if=/home/user/Download/2013-05-29-wheezy-armel.img of=/dev/sdN**, где sdN — имя вашей флешь-карточки
После того как создали образ, заходим в **/etc/network/interfaces** и прописываем сетевые настройки

{% codeblock lang:sh %}
auto lo
iface lo inet loopback

auto eth0
iface eth0 inet static

address 192.168.1.10
netmask 255.255.255.0
gateway 192.168.1.1
{% endcodeblock %}

#  2. Настройка операционной системы

В консоле набираем
{% codeblock lang:sh %}
sudo raspi-config
{% endcodeblock %}
И получаем графическое меню

{% img /images/post/rasbbery_1-627x412.png %}


+ **expand_rootfs** — здесь вы можете увеличить root размер на весь размер карты памяти
+ **change_pass** — смена пароля пользователя «pi». При вводе пароль не отображается. Обязательно нужно сделать
+ **change_locate** — установка языка системы
+ **memory_split** — распределение памяти Raspberry Pi ставим 256
+ **overclock** — разгон процессора Raspberry Pi, ставим Turbo тем более разработчики официально разрешили

Остальные настройки по вашему желанию. После этого перегружаемся.
Не забудем обновить систему, командами
{% codeblock lang:sh %}
sudo apt-get update sudo apt-get upgrade
{% endcodeblock %}

# 3. Установка web-server

Устанавливаем все необходимое
{% codeblock lang:sh %}
sudo apt-get install nginx
sudo apt-get install php5-fpm php5-common php5-mysql php5-gd
sudo apt-get install mysql-server php5-mysql
{% endcodeblock %}

Запускаем
{% codeblock lang:sh %}
/etc/init.d/nginx nginx restart /etc/init.d/nginx php5-fpm restart
{% endcodeblock %}

Проверяем, набираем в браузере http://192.168.1.10, если все сделали правильно, то должны увидеть надпись **Welcome to nginx!**

# 4. Настройка web-server

Создаем файл /etc/nginx/sites-enabled/ajaxblog
{% codeblock lang:sh %}
server {
    listen 8080;

    index index.php index.html;

    server_name 192.168.1.10 ajaxblog.ru, www.ajaxblog.ru;
    root /var/www/html/ajaxblog;

    # Делаем красивые урлы location / {
        try_files $uri $uri/ /index.php?q=$uri&$args;
    }

    # Статичный контент отдаем напрямую с диска location ~* \.(xml|ogg|ogv|svg|svgz|eot|otf|woff|mp4|ttf|css|rss|atom|js|jpg|jpeg|gif|png|ico|zip|tgz|gz|rar|bz2|doc|xls|exe|ppt|tar|mid|midi|wav|bmp|rtf)$ {
        try_files $uri =404; access_log off; expires 7d;
    }

    # И наконец обработка php location ~ \.php$ {
        fastcgi_buffers 8 256k;
        fastcgi_buffer_size 128k;
        fastcgi_intercept_errors on;

        include fastcgi_params;
        fastcgi_pass unix:/var/run/php5-fpm.sock;
    }
}
{% endcodeblock %}

Создаем папку **/var/www/html/ajaxblog** куда заливаем wordpress

5. Настройка DNS

Наш сайт пока мы можем видеть только по локальному адресу http://192.168.1.10.
Для того чтобы мы могли видеть сайт по доменому имени http://ajaxblog.ru, нам нужно:

Прописать DNS запись у регистратора домена
{% codeblock lang:sh %}
@ A X.X.X.X www A X.X.X.X # X.X.X.X - IP адрес моего провайдера
{% endcodeblock %}

Теперь нужно чтобы запрос пришедший на X.X.X.X, был перенаправлен домашним роутером на Raspberry Pi.
Для этого в админки вашего роутера нужно настроить перенаправление.
Заходим на вкладку **NAT Setting — Virtual Server**

{% codeblock lang:sh %}
Port Range  80
Local IP    192.168.1.10 #локальный ip Raspberry Pi
Local Port  80
Protocol    TCP
Description HTTP Server
{% endcodeblock %}

Через какое-то время обновиться DNS запись у провайдера и можно смело смотреть свой блог по адресу http://ajaxblog.ru

