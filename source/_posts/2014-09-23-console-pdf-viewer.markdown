---
layout: post
title: Как прочитать pdf файл в консоле
date: 2014-09-23 14:21
comments: true
categories: linux
tags: [pdf, просмотр в консоле]
---

Как то нужно было быстро посмотреть pdf файл в консоле. Быстрое гугление показало, что нет готовых читалок под консоль. Но можно использовать хитрый трюк.

{% img /images/post/console-pdf-viewer/1.png %}

**pdftohtml** - инструмент командной строки для преобразования PDF-файлов в HTML и другие форматы.
<!-- more -->

### **Устанавливаем**

{% codeblock lang:sh %}
sudo apt-get install pdftohtml
{% endcodeblock %}

### **Используем**

{% codeblock lang:sh %}
pdftohtml some_file.pdf
{% endcodeblock %}

а дальше уже смотрим в каким-то текстовом браузере

{% codeblock lang:sh %}
lynx some_file.pdf
// or
elinks some_file.pdf
{% endcodeblock %}

если не установлен не один из них, не беда, конвертируем в простой текст

{% codeblock lang:sh %}
pdftotext some_file.pdf
{% endcodeblock %}

