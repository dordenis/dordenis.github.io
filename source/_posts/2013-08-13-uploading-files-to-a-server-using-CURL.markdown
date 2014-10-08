---
layout: post
title: Загрузка файлов на сервер с помощью CURL
comments: true
categories: php
tags: [curl, загрузка файлов]
---

Для одного из проектов нужно было загрузить файлы на сервер, с использованием CURL.

Делается это так:

{% codeblock lang:php %}
$ch = curl_init();

$data = array('image' => '@{$full_path_file}'); //полный путь до файла

curl_setopt($ch, CURLOPT_URL, 'http://localhost/upload.php');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);

curl_exec($ch);
{% endcodeblock %}

На локальном сервере работало на ура, но когда я залил на сервер клиента, все перестала работать.
<!-- more -->

Проблемы была в том, что переменная $_FILES отдавала

{% codeblock lang:php %}
Array
(
    [image] => Array
        (
            [name] => 1308074391.jpg
            [type] => image/jpeg
            [tmp_name] => /tmp/phpslor8l
            [error] => 0
            [size] => 33173
        )

)
{% endcodeblock %}

Причина такого странного поведения заключалось в том что у клиента на хостинге перед Apache стоял Nginx, вот он и портил все.

Долгое гугление привело меня к единственно верному решению

{% codeblock lang:php %}
$ch = curl_init();

$data = array('image' => '@{$full_path_file};type=image/jpeg'); //полный путь до файла

curl_setopt($ch, CURLOPT_URL, 'http://localhost/upload.php');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);

curl_exec($ch);
{% endcodeblock %}

