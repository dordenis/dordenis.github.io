---
layout: post
title: Intervention Image - простая библиотека для работы с изображениями
date: 2014-08-21 20:21
comments: true
categories: php
tags: [php, images, library]
---

У каждого программиста есть свой набор библиотек, для рутинных операций. Например, работа с изображениями. На ваш суд представлю еще одну  - Intervention Image.

Из плюсов следует отметить тесную интеграцию с модным ныне Фреймворком  Laravel.

Как пишут автору  этой библиотеке. Intervention Image  является PHP  библиотекой с открытым исходным кодом  для обработки изображений и манипуляции с ним. Обеспечивает более простой и выразительный способ создания, редактирования и комбинирования изображений и поддерживает в настоящее время два наиболее распространенных библиотек обработки изображений GD  и Imagick. 
<!-- more -->

### Чтение

{% codeblock lang:php %}
$img = Image::make('foo/bar/baz.jpg');
{% endcodeblock %}

### Создание

{% codeblock lang:php %}
$img = Image::canvas(800, 600, '#ccc');
{% endcodeblock %}

### Наложение изображения

{% codeblock lang:php %}
$img = Image::make('foo.jpg')->resize(320, 240)->insert('watermark.png');
{% endcodeblock %}

### Сохранение

{% codeblock lang:php %}
Image::make('foo.jpg')->resize(300, 200)->save('bar.jpg');
{% endcodeblock %}

### HTTP Responses

{% codeblock lang:php %}
$img = Image::canvas(800, 600, '#ff0000');
echo $img->response('jpg', 70);
{% endcodeblock %}

### Загрузка

{% codeblock lang:php %}
$img = Image::make($_FILES['image']['tmp_name']);
$img->fit(300, 200);
$img->save('foo/bar.jpg');
{% endcodeblock %}

### Применение фильтров

{% codeblock lang:php %}
$img->filter(new DemoFilter(45));
{% endcodeblock %}

{% codeblock lang:php %}
class DemoFilter implements FilterInterface
{
    /**
     * Default size of filter effects
     */
    const DEFAULT_SIZE = 10;

    /**
     * Size of filter effects
     *
     * @var integer
     */
    private $size;

    /**
     * Creates new instance of filter
     *
     * @param integer $size
     */
    public function __construct($size = null)
    {
        $this->size = is_numeric($size) ? intval($size) : self::DEFAULT_SIZE;
    }

    /**
     * Applies filter effects to given image
     *
     * @param  Intervention\Image\Image $image
     * @return Intervention\Image\Image
     */
    public function applyFilter(\Intervention\Image\Image $image)
    {
        $image->pixelate($this->size);
        $image->greyscale();

        return $image;
    }
}

{% endcodeblock %}

### Кеширование

{% codeblock lang:php %}
$img = Image::cache(function($image) {
    $image->make('public/foo.jpg')->resize(300, 200)->greyscale();
});
{% endcodeblock %}


