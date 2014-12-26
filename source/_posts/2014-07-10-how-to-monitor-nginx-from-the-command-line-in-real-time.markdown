---
layout: post
title: Как в реальном времени мониторить работы Ngnix
date: 2014-07-10 20:21
comments: true
categories: ngnix
tags: [мониторинг]
---

После того, как веб-сервер Nginx запущен, вы хотите мониторить его работу в режиме реального времени. 
На данный момент, средств выполняющих данную функцию довольно много. Например, Nagios, Zabbix, Munin и другие.

Однако, если вам не нужно простое средство не требующий сложной настройки, предлагаю обратить на ngxtop. 

Вы сразу же сказать, что ngxtop (как его имя и интерфейса) основывается на команде знаменитого началу. 
Ngxtop парсит журнал логов Nginx (он также может работать с логами Apache2), и красиво выводить результаты в консоле в режиме реального времени. 
<!-- more -->

### Установка

Ставим ngxtop

{% codeblock lang:sh %}
sudo apt-get install ngxtop
{% endcodeblock %}

### Использование

Базовое использование ngxtop выглядит следующим образом.

{% codeblock lang:sh %}
ngxtop [options]
ngxtop [options] (print|top|avg|sum) <var>
ngxtop info
{% endcodeblock %}

Вот некоторые из распространенных вариантов.

- **-l <file>**: полный путь к файлу журнала доступа (Nginx или Apache2) 
- **-f <format>**: формат журнала доступа 
- **--no-follow**: обработки текущего файла журнала снимок, вместо новых линий, как они написаны в файл журнала в режиме реального времени 
- **-t <seconds>**: интервал обновления 
- **-n <number>**: число строк в дисплее 
- **-o <var>**: критерии заказа (по умолчанию: count) 
- **-a <ехр> ..., --a <ехр> ...**: агрегации sum, avg, min, max, и т.д.
- **-v**: подробный вывод 
- **-i <filter-expression>**: обрабатывать только записи сочетается с фильтром 

Вот встроенные переменные (представленные как <var> в выше). 

- body_bytes_send 
- HTTP_REFERER 
- HTTP_USER_AGENT 
- remote_addr 
- remote_user 
- request
- status
- time_local

### Мониторинг Nginx с помощью ngxtop

По умолчанию, ngxtop попытается определить местоположение журнала доступа Nginx с его конфигурационном файле (/etc/nginx/nginx.conf). 
Таким образом, для мониторинга Nginx, просто запустите:

{% codeblock lang:sh %}
ngxtop
{% endcodeblock %}

Он будет отображать 10 запросов, обслуживаемых Nginx, отсортированные по количеству запросов. 
Для отображения топ-20 самых частых запросов:

{% codeblock lang:sh %}
ngxtop -n 20
{% endcodeblock %}

{% img /images/post/ngxtop/ngxtop_1.jpg %}

Чтобы получить информацию о Nginx (включая имеющиеся переменной информации):

{% codeblock lang:sh %}
ngxtop info
{% endcodeblock %}

{% img /images/post/ngxtop/ngxtop_2.jpg %}

Можно настроить переменные просмотров. Для этого, просто перечислить переменные интересующие Вас. Команда "print" будет отображать индивидуальные запросы.

{% codeblock lang:sh %}
ngxtop print request http_user_agent remote_addr
{% endcodeblock %}

{% img /images/post/ngxtop/ngxtop_3.jpg %}

Для отображения топ IP-адреса клиентов:

{% codeblock lang:sh %}
ngxtop top remote_addr
{% endcodeblock %}

{% img /images/post/ngxtop/ngxtop_4.jpg %}

Для отображения запросов со статусом 404:

{% codeblock lang:sh %}
ngxtop -i 'status == 404' print request status
{% endcodeblock %}

{% img /images/post/ngxtop/ngxtop_5.jpg %}

Кроме Nginx, ngxtop способна обрабатывать другие файлы журналов, таких как журналы доступа Apache. Для мониторинга веб-сервер Apache, используйте следующую команду:

{% codeblock lang:sh %}
tail -f /var/log/apache2/access.log | ngxtop -f common
{% endcodeblock %}



