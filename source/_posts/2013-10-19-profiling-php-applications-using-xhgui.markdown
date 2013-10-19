---
layout: post
title: Профайлинг приложения PHP с помощью XHGui
date: 2013-10-19 21:53
comments: true
categories: php
tags: [php, xhgui]
---

Профайлинг - средство, редко используется в обычной практике разработки приложения. 
Потребность в нем возникает, когда наше приложения находиться под нагрузкой, и мы хотим понять какое место в коде тормозит работы его.

На данный момент у нас есть два отличный инструмента для профайлинга. Одно от Derick Rethans - Xdebug, другое от  Facebook - XHProf.

Мы остановимся на XHProf, отличный инструмент, но с неудобным интерфейсом. 
XHGui призван улучшить интерфейс для доступа к данным, сделать его приятным для использования.
<!-- more -->

# Установка XHProf

Давайте установим XHGui и все необходимые для его работы компоненты.
Вам нужно MongoDB, PHP, и PECL.

Прежде всего, давайте установим MongoDB.

{% codeblock lang:sh %}
sudo apt-get install mongodb
{% endcodeblock %}

Нам также понадобится библиотека PHP для MongoDB - в репозиториях, как правило устаревшие версии, лучше взять из Pecl. 
Если вы еще не установили pecl, сделайте это с помощью команды:

{% codeblock lang:sh %}
sudo apt-get install php-pear
{% endcodeblock %}

Установим библиотеку PHP для работы с MongoDB:

{% codeblock lang:sh %}
sudo pecl install mongo
{% endcodeblock %} 

Не забудем создать файл со следующим содержанием /etc/php5/mods-available/mongo.ini:

{% codeblock lang:sh %}
extension = mongo.so
{% endcodeblock %}

Устанавливаем сам xhprof

{% codeblock lang:sh %}
sudo pecl install xhprof-beta
{% endcodeblock %}

Создаем файл /etc/php5/mods-available/xhprof.ini:

{% codeblock lang:sh %}
extension = xhprof.so
{% endcodeblock %}

Не забудем перезапустить веб сервер.

+ Настройка XHGui

XHGui можно скачать с [GitHub](link https://github.com/preinheimer/xhgui).

Устанавливаем для директории cache доступ для записи и запускаем скрипт установки:

{% codeblock lang:sh %}
php install.php
{% endcodeblock %}
  
Если вы сделали все правильно то должны увидеть следующею картинку.
  
{% img /images/post/xhprof/xhprof-1.png %}
  
# Включение XHGui для вашего хоста
  
Для того чтобы XHGui начал профайлинг вашего сайта, настроим добавим следующие настройки

{% codeblock lang:sh %}
<VirtualHost *:80>
    ServerName example.local
 
    DocumentRoot /var/www/example/htdocs/
    php_admin_value auto_prepend_file /var/www/xhgui/external/header.php
 
    <Directory /var/www/example/htdocs/>
        Options FollowSymLinks Indexes
        AllowOverride All
     </Directory> 
</VirtualHost>
{% endcodeblock %}

С этого момента можно посылать запросы на ваш сайт, или запустить нагрузочное тестирование с помощью Apache Bench.

# Получения ваших данных

{% img /images/post/xhprof/xhprof-2.png %}

XHGui отобразит список запросов, которые были обращены к сайту. Столбцы указаны:
* URL  - адрес запроса
* Time  - когда был сделан запрос
* Wall Time - сколько времени занял запрос
* CPU - нагрузка процессора
* Memory used - память использовано
* Peak memory usage - пиковое использование памяти

Вы можете всегда получить боле подробную информацию о каждом запросе.

{% img /images/post/xhprof/xhprof-3.png %}

{% img /images/post/xhprof/xhprof-4.png %}

Другим информативным (и невероятно симпатичный) XHGui особенностью является CallGraph, он показывает вам, затраты времени в виде графа:

{% img /images/post/xhprof/xhprof-5.png %}

# Интерпретации данных

Имея много статистических данных легко в них запутаться, трудно понять, с чего начать. 

Попробовать следующий подход: 
* Отсортировать функции по использование CPU (по убыванию), и посмотреть на самые ресурсозатратные запросы. 
* Проанализировать затратные запросы и попытаться оптимизировать их.

После того как вы внесли некоторые изменения, заново провести профайлинг и посмотреть на получившиеся улучшения. 
XHGui имеет встроенные способы очень элегантно сравнить работает, просто нажмите на кнопку "Compare this run". 

{% img /images/post/xhprof/xhprof-6.png %}

Повторяя этот процесс раз за разом, вы сможете добиться того что отклик вашего приложения на запрос пользователя будет минимальным.  Что вызовет комфорт работы пользователя с ним.

