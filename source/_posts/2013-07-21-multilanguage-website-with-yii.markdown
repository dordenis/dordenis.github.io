---
layout: post
title: Мультиязычный сайт с помощью Yii
date: 2013-07-21 15:33
comments: true
categories: yii
tags: [yii, gettext]
footer: false
---

Для одного из проекта, возникла необходимость в организации поддержки мультиязычности на сайте. Причем URL должны быть в определенном виде:

http://site.ru/ru/contacts для русского языка    
http://site.ru/en/contacts для английского языка 

<!-- more -->

# 1. Расширяем CUrlManager.

Создаем файл **protected/components/UrlManager.php**

{% codeblock lang:php %}
<?php

class UrlManager extends CUrlManager {

    public function createUrl($route,$params=array(),$ampersand='&')
    {
        if (!isset($params['language'])) {
            if (Yii::app()->user->hasState('language'))
                Yii::app()->language = Yii::app()->user->getState('language');
            else if(isset(Yii::app()->request->cookies['language']))
                Yii::app()->language = Yii::app()->request->cookies['language']->value;
            $params['language']=Yii::app()->language;
        }
        return parent::createUrl($route, $params, $ampersand);
    }

}
{% endcodeblock %}

Согласно нашему условию, выбранный язык должен быть частью URL. Это значит, что $_GET['language'] должен быть определен. Для реализации этого мы переопределяем функцию createUrl() класса CUrlManager. Если язык в строке не указан, тогда мы его ищем в переменной сессии, затем в куках, и если до этого пользователь не менял язык то устанавливаем язык приложения по умолчанию. И затем формируем правильную строку URL уже с языком как параметр. 

# 2. Редактируем наш Controller

Добавляем следующий код в **protected/components/Controller.php**

{% codeblock lang:php %}
public function __construct($id, $module = null) {
    parent::__construct($id, $module);

    // If there is a post-request, redirect the application to the provided url of the selected language
    if (isset($_POST['language'])) {
        $language = $_POST['language'];
        $MultilangReturnUrl = $_POST[$language];
        $this->redirect($MultilangReturnUrl);
    }

    // Set the application language if provided by GET, session or cookie
    if (isset($_GET['language'])) {
        Yii::app()->language = $_GET['language'];
        Yii::app()->user->setState('language', $_GET['language']);
        $cookie = new CHttpCookie('language', $_GET['language']);
        $cookie->expire = time() + (60 * 60 * 24 * 365); // (1 year)
        Yii::app()->request->cookies['language'] = $cookie;
    } else if (Yii::app()->user->hasState('language')) {
        Yii::app()->language = Yii::app()->user->getState('language');
    } else if (isset(Yii::app()->request->cookies['language'])) {
        Yii::app()->language = Yii::app()->request->cookies['language']->value;
    }

    Yii::app()->gettext->setLocale();
}
{% endcodeblock %}

Мы расширяем конструктор класса и добавляем язык для приложения. Так как все контроллеры будут наследоваться с этого контроллера, язык приложения будет установлен явно на каждый запрос.
Если не установленYii::app()->language явно для каждого запроса в URL, он будет браться из конфигурационного файла приложения. Если же он не указан в конфигурационном фале, он будет идентичен Yii::app()->sourceLanguage, который по умолчанию 'en_us'. 

# 3. Редактируем конфиг файл

Вносим изменения в **protected/config/main.php**

{% codeblock lang:sh %}
return array(
    ...
    'sourceLanguage'=>'en',
    'language' => 'ru',
    ...
    
    // application components
    'components' => array(
        'gettext' => array(
            'class' => 'ext.gettext.components.GetText',
            
            // следующие параметры не обезательны
            'domain' => 'имя домена', // defualt messages
            'locale_dir' => 'путь до папки с переводами', // defualt Yii::app()->basePath.DIRECTORY_SEPARATOR.'messages';
            'locale' => array(
                // установленные на компьютере локале
                // locale -a
                'ru' =>'ru_RU',
                'en' => 'en_US',
             ) 
        ),        
        ...
    );
);
{% endcodeblock %}

# 4. Добавляем расширение

Создаем файл **protected/extensions/gettext/components/GetText.php**

{% codeblock lang:php %}
<?php

class GetText extends CApplicationComponent
{
    /**
     * @var GetText domain.
     */
    public $domain = 'messages';

    /**
     * @var Language in yii.
     */
    public $language;

    /**
     * @var Directory containing gettext messages.
     */
    public $locale_dir;

    /**
     * @var array locale (locale -a)
     */
    public $locale = array(
        'ru' => 'ru_RU',
        'en' => 'en_US',
    );

    /**
     * Initialize php's gettext.
     */
    public function init()
    {
        $this->setLocale();
    }

    /**
     * Bind the gettext domain and make it the default
     */
    public function bindDomain()
    {
        if (!bindtextdomain($this->domain, $this->locale_dir)) {
            throw new Exception("Found folder to translations {$this->locale_dir}");
        }
        bind_textdomain_codeset($this->domain, 'utf-8');
        textdomain($this->domain);
    }

    /**
     * Get canonical locale to the format required for gettext
     */
    public function getLocale($id)
    {
        $locale = isset($this->locale[$id]) ? $this->locale[$id] : $id;
        $locale = explode('_', $locale);
        if (isset($locale[1])) $locale[1] = strtoupper($locale[1]);
        return implode('_', $locale);
    }

    /**
     * Set locale
     */
    public function setLocale()
    {
        $this->language = $this->language ? $this->language : Yii::app()->language;
        $locale = $this->getLocale($this->language);

        $this->locale_dir = $this->locale_dir ? $this->locale_dir : Yii::app()->basePath . DIRECTORY_SEPARATOR . 'messages';

        if (!setlocale(LC_ALL, $locale . '.utf8', $locale . '.utf-8', $locale . '.UTF8', $locale . '.UTF-8')) {
            throw new Exception("Not installed in the system locale {$locale}");
        }

        header('Content-Language: ' . str_replace('_', '-', $this->language));
        $this->bindDomain();
    }

}
{% endcodeblock %}

# 5. Размешаем переводы

Создаем в папке **protected/messages**, следующию структуру каталогов. Где и размещаем наши переводы.

{% codeblock lang:sh %}
messages
        en_US
             LC_MESSAGES
                      messages.mo
                      messages.po  
        ru_RU
             LC_MESSAGES
                      messages.mo
                      messages.po  
{% endcodeblock %}

# 6. Что делать если не работает

1. Проверить установлена в систему нужная локаль (locale -a)
2. Проверить работу setlocale(), должно вернуться имя локале
3. Проверить работу bindtextdomain(), должно вернуться путь до файлов перевода
