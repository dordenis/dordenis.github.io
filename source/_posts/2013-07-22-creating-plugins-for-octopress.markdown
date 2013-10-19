---
layout: post
title: Создание плагинов для Octopress
date: 2013-07-22 10:10
comments: true
categories: octopress
tags: [octopress, plugin]
---

Octopress идет с несколькими предустановленными плагинами. Которые охватывают практически все аспекты блоггерства, от категории до видео. Плагины можно легко создавать, расширяя базовый функционал Octopress. Создадим плагин который добавит новый тег для шаблонизатора Liquid.

В качестве примера, создадим новый тег, который позволит вставлять картинки размещенные на S3 Amazon.

Создадим файл s3_image_tag.rb.
<!-- more -->

+ Определим новый класс наследуемый от Liquid::Tag

{% codeblock lang:ruby %}
module Jekyll
  class S3ImageTag < Liquid::Tag
    # здесь будет наш код
  end
end
{% endcodeblock %}

Все теги шаблонизатора Liquid наследуютьса от класса Liquid::Tag. Liquid ожидает что класс имеет метод render который и реализует отрисовку тега.

+ Инициализация параметров

{% codeblock lang:ruby %}
def initialize(tag_name, text, token)
  super
  @text = text.strip
  @text =~ /(\w+\.\w+)(\sbucket:)?(\w*)/i
  @file_name = $1
  @bucket_name = $3.empty? ? Jekyll.configuration({})['aws_bucket'] : $3
end
{% endcodeblock %}

Обратите внимание, что Liquid вызовет наш метод инициализации с тремя параметрами: имя тега, текст в самом теге, и маркер.

Во первых, мы вызвали метод super, для инициализации родительского класса. Далее, мы очистили текст от начальных и конечных пробелов. С помощью регулярного выражения нашли необходимые значения для наших переменных. Для переменной @bucket_name, если она не найдена, берем значения из конфигфайла _config.yml.

+ Определим метод render

{% codeblock lang:ruby %}
def render(context)
  if @file_name && @bucket_name
    "<img src='https://s3.amazonaws.com/#{@bucket_name}/#{@file_name}'>"
  else
    "Error processing input."
  end
end
{% endcodeblock %}

Отдаем HTML тег для нужного изображения. Если один из параметров отсутствует, возвращаемся сообщением об ошибке.


+ Регистрируем новый тег

{% codeblock lang:ruby %}
Liquid::Template.register_tag('s3_image', Jekyll::S3ImageTag)
{% endcodeblock %}

Liquid::Template привязывает тег s3_image к нашему классу Jekyll::S3ImageTag, который и будет его обрабатывать.


+ Добавляем наш файл s3_image_tag.rb в папку plugins нашего блога. Octopress автоматически загружает все плагины из этой папки.

+ Зададим значение по умолчанию для переменой aws_bucket в конфиге _config.yml

{% codeblock lang:ruby %}
# ----------------------- #
#   3rd Party Settings    #
# ----------------------- #

# Amazon S3 Images
aws_bucket: thoughts_on_rails
{% endcodeblock %}

+ Пример использование нового тега в наших постах

{% codeblock lang:ruby %}
Here is an image:   {% raw %}{% s3_image foo.jpeg bucket:bar %}{% endraw %}
{% endcodeblock %}

P.S. Оригинальный источник http://www.thoughtsonrails.com/creating-plugins-for-octopress/

