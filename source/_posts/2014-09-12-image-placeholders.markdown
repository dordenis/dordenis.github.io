---
layout: post
title: Изображения для заполнения пространства при верстке
date: 2014-09-12 20:21
comments: true
categories: fronted
tags: [placeholders, верстка]
---

Каждый верстальшик использовал lorem ipsum для заполнения «рыбы» при верстки проекта.

А что делать, когда нужно использовать картинки, которых у нас еще нет. На помощь приходят сервисы,  которые создают  фейковые картинки для нас.

#### **placephant.com** - изображения phpstyle

{% codeblock lang:html %}
<img src="http://placephant.com/300/200">
<img src="http://placephant.com/100">
<img src="http://placephant.com/g/100/200">
<img src="http://placephant.com/100/200?filter=bw">
<img src="http://placephant.com/v/100/200">
{% endcodeblock %}

{% img http://placephant.com/300/200 %}
{% img http://placephant.com/100 %}
{% img http://placephant.com/g/100/200 %}
{% img http://placephant.com/100/200?filter=bw %}
{% img http://placephant.com/v/100/200 %}
<!-- more -->

#### **fakeimg.pl** - изображения с текстом

{% codeblock lang:html %}
<img src="http://fakeimg.pl/300/">
<img src="http://fakeimg.pl/250x100/">
<img src="http://fakeimg.pl/250x100/ff0000/">
<img src="http://fakeimg.pl/350x200/?text=Hello">
{% endcodeblock %}

{% img http://fakeimg.pl/300/ %}
{% img http://fakeimg.pl/250x100/ %}
{% img http://fakeimg.pl/250x100/ff0000/ %}
{% img http://fakeimg.pl/350x200/?text=Hello %}

#### **lorempixel.com** - изображения по тематикам 

{% codeblock lang:html %}
<img src="http://lorempixel.com/250/200"> 
<img src="http://lorempixel.com/g/220/235"> 
<img src="http://lorempixel.com/180/200/sports"> 
<img src="http://lorempixel.com/180/200/technics"> 
<img src="http://lorempixel.com/280/220/people/some-text">
{% endcodeblock %}

{% img http://lorempixel.com/250/200 %} 
{% img http://lorempixel.com/g/220/235 %} 
{% img http://lorempixel.com/180/200/sports %} 
{% img http://lorempixel.com/180/200/technics %} 
{% img http://lorempixel.com/280/220/people/some-text %}

#### **placehold.it** - разноцветные прямоугольники 

{% codeblock lang:html %}
<img src="http://placehold.it/150x100">
<img src="http://placehold.it/180x135/2ecc71/ecf0f1">
<img src="http://placehold.it/280x100/2c3e50/3498db&text=html5.by+Rocks!">
{% endcodeblock %}

{% img http://placehold.it/150x100 %}
{% img http://placehold.it/180x135/2ecc71/ecf0f1 %}
{% img http://placehold.it/280x100/2c3e50/3498db&text=html5.by+Rocks! %}

#### **placepuppy.it** - для любителей собак 

{% codeblock lang:html %}
<img src="http://placepuppy.it/150/100">
<img src="http://placepuppy.it/120/135">
<img src="http://placepuppy.it/80/100">
{% endcodeblock %}

{% img http://placepuppy.it/150/100 %}
{% img http://placepuppy.it/120/135 %}
{% img http://placepuppy.it/80/100 %}

#### **placekitten.com** - для любителей котят

{% codeblock lang:html %}
<img src="http://placekitten.com/g/160/120">
<img src="http://placekitten.com/g/120/135">
<img src="http://placekitten.com/g/180/100">
{% endcodeblock %}

{% img http://placekitten.com/g/160/120 %}
{% img http://placekitten.com/g/120/135 %}
{% img http://placekitten.com/g/180/100 %}

#### **placekitten.com** - для больших любителей 

{% codeblock lang:html %}
<img src="http://beerhold.it/225/280">
<img src="http://beerhold.it/280/235">
<img src="http://beerhold.it/280/300">
<img src="http://beerhold.it/400/300">
<img src="http://beerhold.it/270/260">
<img src="http://beerhold.it/280/200/s"><!-- sepia -->
{% endcodeblock %}

{% img http://beerhold.it/225/280 %}
{% img http://beerhold.it/280/235 %}
{% img http://beerhold.it/280/300 %}
{% img http://beerhold.it/400/300 %}
{% img http://beerhold.it/270/260 %}
{% img http://beerhold.it/280/200/s %}<!-- sepia -->

#### если пропал интернет

Тогда обратите вниманиие на [holder.js](http://imsky.github.io/holder/).
