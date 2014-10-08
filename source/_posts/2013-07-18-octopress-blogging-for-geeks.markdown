---
layout: post
title:  Octopress - блоггинг для гиков
date: 2013-07-18 20:20
comments: true
categories: octopress
tags: [блог]
---
Меня всем устраивал мой маленький блог на Rasberry Pi, пока жестокая реальность не напомнила мне в какой стране я живу. После аварийных выключений света, у меня убился раздел на флешки с установленной ОС. Переустанавливать было лень, и я прекрасно понимал, что это не последняя переустановка. Нужно искать другой вариант... на горизонте появился Octopress.

<!-- more -->

Octopress - генератор статических сайтов. Мы берем шаблоны статей, созданные нами и переводим в статические html страницы.

Плюсы:

* **Скорость.** Мы разгружаем сервак, так как на нем только html+js+css+images. 
* **Дешевизна.** Нам не нужно устанавливать php, базы данных, кеш сервера и т.д. Соответственно мы можем арендовать самый дешевый сервер.
* **Удобство.** Все посты хранятса в формате [маркдаун](http://ru.wikipedia.org/wiki/Markdown). Набирать текст в нем одно удовольствие. Ты тратишь время над содержимое статьи, а не ее внешний вид.

Минусы:

* Главный и единственный минус, проистекает от его плюсов. У нас нет динамического контента. Если мы хотим добавить динамику нашему сайту. то нужно использовать js. Благо уровень текущего js вырос. Да и сторонних сервисов которые предоставляют API для нашего js, предостаточно.

# 1. Устанавливаем Octopress

1\. Устанавливаем [rvm](https://rvm.beginrescueend.com/rvm/install/)

2\. Устанавливаем Ruby
{% codeblock lang:sh %}
rvm install x.x.x
rvm use x.x.x
{% endcodeblock %}

3\. [Устанавливаем Octopress](http://octopress.org/docs/setup/)
{% codeblock lang:sh %}
apt-get install python-dev # для плагина подсветки синтаксиса
git clone git://github.com/imathis/octopress.git octopress
cd octopress 
ruby --version # report Ruby 1.9.3
gem install bundler
bundle install
{% endcodeblock %}

4\. [Выбираем тему](https://github.com/imathis/octopress/wiki/3rd-Party-Octopress-Themes) по душе
{% codeblock lang:sh %}
git clone GIT_URL .themes/THEME_NAME
rake install['THEME_NAME']
rake generate
{% endcodeblock %}

5\. Редактируем [конфигурационный файл](http://octopress.org/docs/configuring/) **_config.yml**
{% codeblock lang:sh %}
root: /
permalink: /:categories/:title/
source: source
destination: public
plugins: plugins
code_dir: downloads/code
category_dir: categories
{% endcodeblock %}

6\. [Правим файлы](http://octopress.org/docs/theme/template/) под свои предпочтения в директориях
{% codeblock lang:sh %}
sass 						# цветовая гамма и стили
source/ 					# папка с исходными файлами. 
		_includes/    		# шаблоны частей сайта
		_layouts/     		# основные шаблоны для страниц, постов и архивов
				asides/		# шаблоны боковой панели
				custom/		# пользовательские шаблоны
				post/		# шаблоны страницы post (metadata, sharing & comment)
		_posts/    			# все посты в markdown
{% endcodeblock %}


7\. [Русифицируем даты](http://maxmikheev.ru/blog/2012/07/13/russian-dates-in-octopress/) в Octopress 

8\. Ставим [сторонние плагины](https://github.com/imathis/octopress/wiki/3rd-party-plugins). Некоторые интересные плагины:

* [octopress-calendar-aside](https://github.com/neerajcse/octopress-calendar-aside) - календарик как в WordPress
* [jekyll_category_tree](https://github.com/matthiasbeyer/jekyll_category_tree) - категории деревом
* [Tag Cloud for Octopress](https://github.com/alswl/octopress-category-list) - категории списком и облако тегов
* [Tag Cloud for Octopress](https://github.com/tokkonopapa/octopress-tagcloud) - альтернатива вышестоящего плагина
* [Octopress Popular Posts Plugin](https://github.com/octopress-themes/popular-posts) - список популярных постов на основе Google page rank
* [Related posts for Octopress](https://github.com/jcftang/octopress-relatedposts) - список похожих постов
* [Plugin for Octopress to generate tag pages](https://github.com/robbyedwards/octopress-tag-pages) - плагин создает страницы тегов

# 2. Размещение на Github Pages
Создаем на Github репозиторий с именем [ваш_логин.github.io](http://octopress.org/docs/deploying/github/)
{% codeblock lang:sh %}
rake setup_github_pages
{% endcodeblock %}

Вводим свой урл до репозитория.
{% codeblock lang:sh %}
rake generate
rake deploy
{% endcodeblock %}

{% codeblock lang:sh %}
git add .
git commit -m 'your message'
git push origin source
{% endcodeblock %}

# 3. Персональный домен
Создаем файл с именем CNAME содержащий ваше доменное имя.
{% codeblock lang:sh %}
echo 'your-domain.com' >> source/CNAME
{% endcodeblock %}

На вашем DNS сервере [прописываем А запись](https://help.github.com/articles/setting-up-a-custom-domain-with-pages)
{% codeblock lang:sh %}
example.com.  3259    IN      A       204.232.175.78
{% endcodeblock %}

# 4. Автоматизация
Octopress поддерживает автоматизацию типовых задач пользователя.

Список все задач можно посмотреть командой
{% codeblock lang:sh %}
$ rake --task
rake clean                     # Clean out caches: .pygments-cache, .gist-cache, .sass-cache
rake copydot[source,dest]      # copy dot files for deployment
rake deploy                    # Default deploy task
rake gen_deploy                # Generate website and deploy
rake generate                  # Generate jekyll site
rake install[theme]            # Initial setup for Octopress: copies the default theme into the path of J...
rake integrate                 # Move all stashed posts back into the posts directory, ready for site gen...
rake isolate[filename]         # Move all other posts than the one currently being worked on to a tempora...
rake list                      # list tasks
rake new_page[filename]        # Create a new page in source/(filename)/index.markdown
rake new_post[title]           # Begin a new post in source/_posts
rake preview                   # preview the site in a web browser
rake push                      # deploy public directory to github pages
rake rsync                     # Deploy website via rsync
rake set_root_dir[dir]         # Update configurations to support publishing to root or sub directory
rake setup_github_pages[repo]  # Set up _deploy folder and deploy branch for Github Pages deployment
rake update_source[theme]      # Move source to source.old, install source theme updates, replace source/...
rake update_style[theme]       # Move sass to sass.old, install sass theme updates, replace sass/custom w...
rake watch                     # Watch the site and regenerate when it changes
{% endcodeblock %}



