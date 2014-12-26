---
layout: post
title: RabbitMQ для начинающих
date: 2014-12-20 11:23
comments: true
categories: php
tags: [сервер очередей, RabbitMQ]
---

### Введение

Иногда в веб-приложениях появляется необходимость выполнить сложные ресурсоемкие задачи, которые не могут быть умещены в коротком временном интервале HTTP запроса. В этом случае на помощь приходят очереди. Основная идея очередей - избежать выполнения ресурсоемких задач непосредственно после отправки запроса. Вместо этого задача ставится в очередь для последующего выполнения в асинхронном режиме. Т.е. при получении запроса от клиента мы инкапсулируем задачу как сообщение и отправляем его в очередь, а уже обработчик очереди достает сообщения в порядке их следования и обрабатывает надлежащим образом. Забегая вперед, скажу, что возможен режим работы очередей, когда при наличии нескольких копий обработчика, следующая задач будет поступать на свободный обработчик. Таким образом достигается распараллеливание выполнения задач.

В данном разделе рассматривается работа с очередями, использующими сервер сообщений RabbitMQ. Сервер RabbitMQ по сути является менеджером очередей, который имеет следующие преимущества: 

  - в случае некорректного завершения работы сервера, данные в очереди не теряются. И при последующем запуске обработка продолжается с того места, где был обрыв;
  - распределить задачи на несколько очередей, т.е. создать распараллеливание на уровне сообщений
  - если результат обработки не удовлетворяет, задачу можно послать в очередь повторно;
  - существует несколько режимов работы очереди: рассылка типа точка-точка(direct), рассылка сообщений по шаблону(topic), широковещательная рассылка сообщений(fanout);
  - возможность синхронизировать работу клиента и сервера, своего рода реализация RPC
  - количество хранимых в очереди сообщений неограничено
  - сервер сообщений может быть расположен удаленно как по отношению к продюсеру, так и по отношению к консьюмеру.

В туториалах будут приведены примеры для всех вышеперечисленных вариантов. За основу взяты туториалы с официального сайта, дополнены и реализованы на PHP для [RabbitMQ](http://www.rabbitmq.com/getstarted.html). 

RabbitMQ испозует протокол AMQP. Чтобы использовть RabbitMQ необходимо поставить клиентскую и серверную части.
<!-- more -->

#### Установка сервера

Для установки расширения AMQP для PHP необходимо сначала установить RabbitMQ Server

Добавим следующию строку в файл /etc/apt/sources.list

{% codeblock lang:sh %}
deb http://www.rabbitmq.com/debian/ testing main
{% endcodeblock %}

{% codeblock lang:sh %}
wget http://www.rabbitmq.com/rabbitmq-signing-key-public.asc
sudo apt-key add rabbitmq-signing-key-public.asc
sudo apt-get update
sudo apt-get install rabbitmq-server
{% endcodeblock %}

#### Установка клиента

Выбираем нужную библиотеку и устанавливаем http://www.rabbitmq.com/devtools.html.
Наиболее популярны [php-amqplib](https://github.com/videlalvaro/php-amqplib) и [PECL AMQP library](http://pecl.php.net/package/amqp)

### Базовые понятия

В RabbitMQ используются следующий обозначения. Продюсер - программа, которая посылает сообщения. Будем обозначать его так

{% img no-boreder center /images/post/rabbitmq-tutorial/p.png %}

Брокер(очередь) - собственно просто буфер в памяти без каких-либо ограничений на количество хранимых сообщений. В одну и ту же очередь могут отсылать сообщения несколько продюсеров, так же как несколько консьюмеров могут пытаться получить сообщения из одной и той же очереди. Очередь будет обозначена так(сверху указано имя очереди)

{% img no-boreder center /images/post/rabbitmq-tutorial/q.png %}

Консьюмер(получатель) - программа, которая принимает сообщения из очереди. Будем обозначать его так 

{% img no-boreder center /images/post/rabbitmq-tutorial/c.png %}

Здесь важно отметить, что продюсер, консьюмер и брокер могут быть расположены на различных машинах, более того, в большинстве случаев это именно так.

{% img no-boreder center /images/post/rabbitmq-tutorial/tut_01.png %}

Первый скрипт работы с очередью, своего рода "Hello world", будет отсылать текстовое сообщение с клиента, принимать его на сервере и выводить на экран. 

Т.е. схема работы следующая: Первое, что надо сделать, это установить соединение с сервером RabbitMQ. Соединение устанавливается командами

{% codeblock lang:php %}
$connection = new AMQPConnection($connection_params);
$connection->connect();
{% endcodeblock %}

где 

{% codeblock lang:php %}
$connection_params = array(
  'host' => 'localhost', 
  'port' => 5672, 
  'vhost' => '/', 
  'login' => 'guest', 
  'password' => 'guest' 
);
{% endcodeblock %}

это дефолтные значения. Если достаточно дефолтного значения любого из этих параметров, то его можно опустить. И, напротив, если, к примеру, нужно подключиться к другой машине, в параметре host необходимо указать ее имя или ip адрес.

Используя коннект можно получить объект для канала

{% codeblock lang:php %}
$channel = new AMQPChannel($connection);
{% endcodeblock %}

На основе полученного канала создаем обменник

{% codeblock lang:php %}
$exchange = new AMQPExchange($channel);
$exchange->setName('ex_hello');
$exchange->setType(AMQP_EX_TYPE_FANOUT);
$exchange->setFlags(AMQP_IFUNUSED | AMQP_AUTODELETE);
$exchange->declare();
{% endcodeblock %}

и, собственно, саму очередь 

{% codeblock lang:php %}
$queue = new AMQPQueue($channel);
$queue->setName('hello');
$queue->setFlags(AMQP_IFUNUSED | AMQP_AUTODELETE);
$queue->declare();
{% endcodeblock %}

Когда обменник и очередь готовы, их можно связать по ключу

{% codeblock lang:php %}
$queue->bind($exchange->getName(), 'foo_key');
{% endcodeblock %}

Объявлять очередь и связывать ее с обменником можно как на продюсере, так и на консьюмере. Все зависит от того, что первым будет запускаться. Если неизвестно, то, возможно следует объявить и там и там. При этом имена очередей должны совпадать. Если имена очередей совпадают, то количество объявлений не имеет значения. Очередь с определенным именем может быть только одна.
Стоит отметить, что сообщение не может быть опубликовано напрямую в очередь, оно должно проходить через обменник. Собственно посредством обменника оно и публикуется 
$result = $exchange->publish(json_encode("Hello world!"), "foo_key");

После того как сообщение отослано, коннект можно разорвать. 

{% codeblock lang:php %}
$connection->disconnect();
{% endcodeblock %}


Получатель также должен выполнить ту же последовательность 
- приконнектиться к серверу сообщений;
- создать канал;
- объявить обменник;
- объявить очередь;
- связать очередь с обменником по ключу
Последние два действия, как упоминалось выше, не обязательны. Теперь можно начать прослушивать очередь

{% codeblock lang:php %}
while (true) {
    if ($envelope = $queue->get(AMQP_AUTOACK)) {
        $message = json_decode($envelope->getBody());
        print($message);
    }
}
{% endcodeblock %}


Здесь методу get в качетсве параметра передается константа ARMQ_AUTOACK, которая оповещает сервер сообщений о том, что данное сообщение получено. Это самый простой способ удалить сообщение из очереди. Однако в данном случае в случае неудачной обработки сообщения, вернуть повторно его в очередь нельзя.

Таким образом, получаем два скрипта

send.php

{% codeblock lang:php %}
$connection = new AMQPConnection($connection_params);
$connection->connect();
$channel = new AMQPChannel($connection);
$exchange = new AMQPExchange($channel);
$exchange->setName('ex_hello');
$exchange->setType(AMQP_EX_TYPE_FANOUT);
$exchange->setFlags(AMQP_IFUNUSED | AMQP_AUTODELETE);
$exchange->declare(); $queue = new AMQPQueue($channel);
$queue->setName('hello');
$queue->setFlags(AMQP_IFUNUSED | AMQP_AUTODELETE);
$queue->declare();
$result = $exchange->publish(json_encode("Hello world!"), "foo_key");
$connection->disconnect();
{% endcodeblock %}


receiver.php

{% codeblock lang:php %}
$connection = new AMQPConnection($connection_params);
$connection->connect();
$channel = new AMQPChannel($connection);
$exchange = new AMQPExchange($channel);
$exchange->setName('ex_hello');
$exchange->setType(AMQP_EX_TYPE_FANOUT);
$exchange->setFlags(AMQP_IFUNUSED | AMQP_AUTODELETE);
$exchange->declare(); $queue = new AMQPQueue($channel);
$queue->setName('hello');
$queue->setFlags(AMQP_IFUNUSED | AMQP_AUTODELETE);
$queue->declare();
$queue->bind($exchange->getName(), 'foo_key');
while (true) {
    if ($envelope = $queue->get(AMQP_AUTOACK)) {
        $message = json_decode($envelope->getBody());
        print($message);
    }
}
$connection->disconnect();
{% endcodeblock %}

### Распределенные очереди

Основная идея заключается в следующем. Допустим нужно обработать видео файл, чтобы получить на выходе три сконвертированных файла в различные форматы, информацию о метаданных и создать иконки для этого видеофайла. Т.е. получаем 5 задач, три из которых довольно тяжеловесные(конвертация), одна легкая(получение метаданных) и одна средняя(создание иконок). При этом все эти задачи являются независимыми друг от друга. Таким образом, можно выполнять их одновременно, т.е. распараллелить обработку очереди на уровне сообщений(пункт 2). Для этого при объявлении обменника необходимо установить ему тип AMQP_EX_TYPE_FANOUT. Тогда все сообщения, посылаемые в указанный обменник, независимо от имени очереди и ключа роутера, будут прослушиваться всеми запущенными копиями консьюмера. Т.е. каждое следующее сообщение будет отсылаться на следующий свободный консьюмер. В нашем случае их должно быть пять. Такой способ обработки получил название round-robin dispathing. Обратите внимание, что при отправке продюсером и при получении консьюмером используется одна и та же очередь.

{% img no-boreder center /images/post/rabbitmq-tutorial/tut_02.png %}

#### Оповещение (acknowledgment)

Некоторые задачи могут выполняться довольно долго. И неизвестно, что может произойти с сервером в этот момент: сервер может перезагрузиться, либо задача может зависнуть или завершится фатальной ошибкой. В первом туториале оповещение было отключено путем передачи параметра AMQP_AUTOACK в метод get(). В этом случае сообщения удаляются из памяти сразу после выполнения метода get и в случае ошибки, случившейся во время обработки, не вернутся в очередь. Чтобы избежать этого, не будем передавать константу AMQP_AUTOACK в метод get. Вместо этого по завершению обработки вызовем метод ack(), который уведомит брокер о том, что сообщение успешно обработано и его можно удалить из памяти. В противном случае RabbitMQ понимает, что сообщение не обратботано и перенаправляет его другому свободному консьюмеру. Однако здесь стоит отметить один важный момент. Перенаправленные сообщения не будут обрабатываться до того пока консьюмер не отконнектится и приконнектится заново к брокеру. Если необходимо заново обработать сообщение в рамках того же коннекта к серверу сообщений, то необходимо вызвать метод nack() с флагом AMQP_REQUEUE, который поставит неудачно обработанную задачу обратно в очередь и уведомит брокер о том, что эта задача должна быть вновь обработана.

{% codeblock lang:php %}
while (true) {
    if ($evnelope = $queue->get()) {
        $message = $enevelope->getBody();
        if (doWork($message)) {
            $queue->ack($envelope->getDeliveryTag());
        } else {
            // этот фрагмент кода может быть опущен, если мы собираемся обработать 
            // передоставленный сообщения в рамках нового коннекта к сереверу сообщений
            $queue->nack($envelope->getDeliveryTag(), AMQP_REQUEUE);
        }	
    }
}
{% endcodeblock %}

Распростаненная ошибка - при включенном оповещении не подтверждать корректно обработанные задачи(сообщения). В этом случае при каждом новом коннекте, все уже обработанные задачи будут поступать заново на обработку. Процесс будет выглядеть как беспорядочная повторная отпарка сообщений, что в конечном итоге приведет к переполнению памяти. Отследить такую ситуацию можно путем использования нативного инструмента сервера сообщений rabbitmqctl

{% codeblock lang:sh %}
$ sudo rabbitmqctl list_queues name messages_ready messages_unacknowledged
Listing queues ...
hello 0 0
...done.
{% endcodeblock %}

#### Жизнеспособность сообщений(durability)

В предыдущем параграфе мы рассмотрели как не потерять сообщение в очереди путем повторной отправки его в очередь. Тем не менее сообщение может быть потеряно в случае если сервер сообщений был неожиданно остановлен. Чтобы этого избежать, очередь должна быть создана с флагом AMQP_DURABLE. 

{% codeblock lang:php %}
$queue = new AMQPQueue($channel);
$queue->setName('hello');
$queue->setFlags(AMQP_DURABLE);
$queue->declare();
{% endcodeblock %}

Если очередь 'hello' уже была объявлена, то данный код вызовет ошибку, поскольку один раз объявленную очередь нельзя объявить повторно с другими параметрами. Из этой ситуации есть два выхода, либо обнулить все очереди как сказано здесь, либо создать новую очередь с неиспользуемым именем. Посмотреть список очередей можно спопособом упомянутым в предыдущем параграфе.
Установка флага AMQP_DURABLE не гарантирует стопроцентную сохранность сообщений в очереди. Несмотря на то, что таким спопосбом мы указываем RabbitMQ сохранять сообщения на диске, существует мертвая зона после получения соощения, когда оно уже в памяти, но еще не сохранено на диске. В этот момент, в случае не предвиденной ситуации, оно может быть утеряно из памяти. Для нашего простого примера таких гарантий достаточно, но если необходимо добиться высоких гарантий получения сообщения, то следует использовать транзакции.

#### Все вместе

Для примера распределения сообщений между очередями нам понадобится функция, имитирующая загруженность системы. Для этого мы используем обычный таймер

{% codeblock lang:php %}
function doWork($message) { 
    $sleep_interval = rand(1, 5);
    sleep($sleep_interval);
    print($message.str_repeat('.', $sleep_interval).PHP_EOL);
    return true;
}
{% endcodeblock %}

Полный код продюсера (send.php) будет выглядеть так

{% codeblock lang:php %}
$params = array(
    'host' => 'localhost',
    'port' => 5672,
    'vhost' => '/',
    'login' => 'guest',
    'password' => 'guest'
);

$connection = new AMQPConnection();
$connection->connect();

$channel = new AMQPChannel($connection);

$exchange = new AMQPExchange($channel);
$exchange->setName('ex_hello');
$exchange->setType(AMQP_EX_TYPE_FANOUT);
$exchange->setFlags(AMQP_IFUNUSED | AMQP_AUTODELETE);
$exchange->declare();

$queue = new AMQPQueue($channel);
$queue->setName('hello');
$queue->setFlags(AMQP_IFUNUSED | AMQP_AUTODELETE | AMQP_DURABLE);
$queue->declare();
$queue->bind($exchange->getName(), 'foo_key');

$result = $exchange->publish(json_encode("Hello world!"), "foo_key");

if ($result)
    echo 'sent'.PHP_EOL;
else
    echo 'error'.PHP_EOL;

$connection->disconnect();

Консьюмер (receive.php)

$params = array(
    'host' => 'localhost',
    'port' => 5672,
    'vhost' => '/',
    'login' => 'guest',
    'password' => 'guest'
);

$connection = new AMQPConnection();
$connection->connect();

$channel = new AMQPChannel($connection);

$exchange = new AMQPExchange($channel);
$exchange->setName('ex_hello');
$exchange->setType(AMQP_EX_TYPE_FANOUT);
$exchange->setFlags(AMQP_IFUNUSED | AMQP_AUTODELETE);
$exchange->declare();

$queue = new AMQPQueue($channel);
$queue->setName('hello');
$queue->setFlags(AMQP_IFUNUSED | AMQP_AUTODELETE | AMQP_DURABLE);
$queue->declare();
$queue->bind($exchange->getName(), 'foo_key');

while (true) {
    if ($envelope = $queue->get()) {
        $message = json_decode($envelope->getBody());
        echo "delivery tag: ".$envelope->getDeliveryTag().PHP_EOL;
        if (doWork($message)) {
            $queue->ack($envelope->getDeliveryTag());
        } else {
            $queue->nack($envelope->getDelivaryTag(), AMQP_REQUEUE);
        }
    }
}

$connection->disconnect();
{% endcodeblock %}

Обратите внимание, что очереди создаются с абсолютно идентичными параметрами. Как уже было сказано, повторное создание очереди с иными параметрами вызовет исключение. Также стоит отметить, что если вы уверены, что консьюмер будет запускаться первым, то создание очереди в продюсере не обязательно.

Теперь, если запустить несколько копий консьюмера, то можно будет видеть как между ними распределяются сообщения. Предположим, что мы отправили 8 сообщений в очередь, т.е. запустили скрипт send.php 8 раз. После этого запускаем в двух разных терминалах по консьюмеру

Вывод в первом терминале

{% codeblock lang:sh %}
$ php receive.php
delivery tag: 1
Hello world!...
delivery tag: 2
Hello world!.....
delivery tag: 3
Hello world!....
{% endcodeblock %}

Вывод во втором терминале

{% codeblock lang:sh %}
$ php receive.php
delivery tag: 1
Hello world!.
delivery tag: 2
Hello world!..
delivery tag: 3
Hello world!...
delivery tag: 4
Hello world!..
delivery tag: 5
Hello world!.
{% endcodeblock %}

Как видно сообщения распределились по мере нагрузки консьюмера.

### Рассылка публикаций

В предыдущем уроке мы распределяли сообщения между всеми консьюмерами. В данном уроке, наоборот, будем отсылать все сообщения из очереди на все консьюмеры. Такой шаблон известен как "публичная рассылка"(publish subscribe). Такое поведение может быть полезно, к примеру, при создании логирования с одновременным выводом сообщения в терминал. Т.е. один консьюмер получает сообщение и сохраняет его на диска, в то время как другой выводит это сообщение на экране.

В предыдущих разделах мы не заостряли внимание на обменнике(exchanger). На самом деле продюсер никогда не отправляет сообщения непосредственно в очередь. Он размещает их в обменнике. Собственно говоря, продюсер и не знает было ли сообщение доставлено в очередь или нет. Обменник представляет собой простую вещь - он получает сообщения от продюсера и отправляет(публикует) их в очередь. При этом обменник четко знает по какому алгоритму он работает: 

- отправляет сообщение во все очереди с четко заданным именем на все консьюмеры, обрабатывающими эту очередь(direct)
- отправляет сообщение во все очереди и распределяет сообщение между консьюмерами,   обрабатывающими очередь с одинаковым именем(fanout)
- отправляет сообщение во все очереди с именем, удовлетворяющим шаблону(topic)
- отклоняет сообщение

В нашем примере будем использовть тип обменника fanout. 

{% codeblock lang:php %}
$exchange->setName('ex_hello');
$exchange->setType(AMQP_EX_TYPE_FANOUT);
$exchange->declare();
{% endcodeblock %}

{% img no-boreder center /images/post/rabbitmq-tutorial/tut_03.png %}

Для этой цели продюсер не создает именованную очередь. Консьюмер же, в свою очередь, создает анонимную очередь, в которую принимает сообщения продюсера. При таком подходе каждый консьюмер будет принимать все сообщения продюсера.

#### Анонимные очереди

В предыдущем уроке у нас была необходимость рассылки сообщений в очереди с одинаковыми именами для возможности распределения сообщений между продюсерами и консьюмерами. Для достижения же текущей цели нам нужны выполнить две вещи. Во-первых, нам нужны очереди с различными именами. Во-вторых, созданные очереди должны автоматически удаляться после окончания работы скрипта. 
Для создания рандомного имени, можно воспользоваться одной из функций генерации хеша, к примеру sha1 или md5. Или же оставить эту задачу серверу сообщений. Если при объявлении очереди не устанавливать ей имя, то RabbitMQ сам задаст рандомное имя очереди. 
Для возможности автоматического удаления очереди, при ее создании нужно задать флаги AMQP_IFUNUSED, AMQP_AUTODELETE.

{% codeblock lang:php %}
$queue->setFlags(AMQP_IFUNUSED | AMQP_AUTODELETE);
{% endcodeblock %}

#### Связывание (bindings)

Мы уже создали обменник с типо fanout и очередь. Теперь нужно сказать обменнику, что он должен публиковать сообщения имеено в эту очередь. Это отношение называется связыванием (binding)

{% codeblock lang:php %}
$queue->bind($exchange->getName(), '');
{% endcodeblock %}

Здесь второй параметр - ключ, по которому связывается обменник и очередь. В данном случае он может быть любой строкой, поскольку его значение игнорируется в случае, если обменник имеет тип fanout.

#### Все вместе

Поскольку в данном примере мы имеем дело с анонимными очередями, создаваться они должны на стороне консьюмера, и консьюмер, соответственно, должен быть запущен первым. Из продюсера создание очередей удаляется.

send.php

{% codeblock lang:php %}
$params = array(
    'host' => 'localhost',
    'port' => 5672,
    'vhost' => '/',
    'login' => 'guest',
    'password' => 'guest'
);

$message = isset($argv[1]) ? $argv[1] : 'default_message'; 

$connection = new AMQPConnection();
$connection->connect();

$channel = new AMQPChannel($connection);

$exchange = new AMQPExchange($channel);
$exchange->setName('ex_hello');
$exchange->setType(AMQP_EX_TYPE_FANOUT);
$exchange->setFlags();
$exchange->declare();

$result = $exchange->publish(json_encode($message), '');

if ($result)
    echo 'sent'.PHP_EOL;
else
    echo 'error'.PHP_EOL;

$connection->disconnect();

Консьюмер (receive.php)

$params = array(
    'host' => 'localhost',
    'port' => 5672,
    'vhost' => '/',
    'login' => 'guest',
    'password' => 'guest'
);

$connection = new AMQPConnection();
$connection->connect();

$channel = new AMQPChannel($connection);

$exchange = new AMQPExchange($channel);
$exchange->setName('ex_hello');
$exchange->setType(AMQP_EX_TYPE_FANOUT);
$exchange->setFlags();
$exchange->declare();

$queue = new AMQPQueue($channel);
$queue->setFlags(AMQP_IFUNUSED | AMQP_AUTODELETE | AMQP_DURABLE);
$queue->declare();

$queue->bind($exchange->getName(), '');

while (true) {
    if ($envelope = $queue->get()) {
        $message = json_decode($envelope->getBody());        
        echo "delivery tag: ".$envelope->getDeliveryTag().PHP_EOL;
        if (doWork($message)) {
            $queue->ack($envelope->getDeliveryTag());
        } else {
            $queue->nack($envelope->getDelivaryTag(), AMQP_REQUEUE);
        }
    }
}

$connection->disconnect();
{% endcodeblock %}

### Селективная рассылка

В предыдущем уроке была рассмотрена возможность отсылки сообщений нескольким получателям.В данном уроке мы рассмотрим как отсылать сообщения в четко определенные очереди. Такая возможность может понадобиться, к примеру, если мы не хотим сохранять все сообщения на диске, а только критический. В то время как на экран будут выводиться все сообщения.

##### Связывание (bindings)

Связываение уже упоминалось в предыдущем уроке

{% codeblock lang:php %}
$queue->bind($exchange->getName(), '');
{% endcodeblock %}

Повторимся, оно нужно, чтобы сказать обменнику, что он должен публиковать сообщения имеено в эту очередь. 
В методе bind() имеется второй параметр - ключ(routingKey), по которому связывается обменник и очередь. В данном уроке он будет играть основную роль. Стоит также напомнить, что ключ напрямую зависит от типа обменника. Так для обменника с типом fanout, он просто игнорируется.
К примеру, если нужно связать обменник и очередь по ключу 'failure_messages'

{% codeblock lang:php %}
$queue->bind($exchange->getName(), 'failure_messages');
{% endcodeblock %}

#### Прямое связывание (точка-точка)
В предыдущем уроке система логирования выполняла широковещательную рассылку всем консьюмерам. Теперь мы хотим расширить это поведение путем добавления фильтра сообщений по их важности. К примеру, критические ошибки писать на диск, а предупреждения только выводить на экран с целью экономии дискового пространтсва. Ранее мы использовали обменник с типом fanout, который не позволяет это сделать. Сейчас мы используем другой тип обменника - direct, который отправляет сообщения только тем очередям, routingKey которых совпадает с routingKey сообщения. Это поведение проиллюстрировано на изображении

{% img no-boreder center /images/post/rabbitmq-tutorial/tut_04.png %}

На изображении можно видеть обменник X с типом direct, который связан с очередью Q1 по ключу failure, и с очередью Q2 по ключам notice и warning. В данном случае все сообщения с ключем failure будут отсылаться только в очередь Q1, а все сообщения с ключами notice и warning будут отсылаться в очередь Q2. Сообщения, ключи которые не совпадают с выше указанными, будут игнорироваться всеми очередями.

#### Множественная связь

Вполне возможно несколько очередей связать с обменником по одному и тому же ключу. Т.е. для нашего примера мы вполне можем установить связь по ключу notice между обменником и очередью Q1 и между обменником и очередью Q2. В таком случае сообщения с ключем notice будут отсылаться на обе очереди, т.е. получаем поведение аналогичное обменнику с типом fanout.

{% img no-boreder center /images/post/rabbitmq-tutorial/tut_05.png %}

#### Отправка сообщений

Для отправки сообщений способом точка-точка обменник должен быть создан с типом direct, который сооветствует константе AMQP_EX_TYPE_DIRECT.

{% codeblock lang:php %}
$exchange = new AMQPExchange($channel);
$exchange->setName('logs');
$exchange->setType(AMQP_EX_TYPE_DIRECT);
$exchange->setFlags(AMQP_IFUNUSED | AMQP_AUTODELETE);
$exchange->declare();
{% endcodeblock %}

После чего возможна публикация сообщений по ключу

{% codeblock lang:php %}
$exchange->publish($message, 'notice');
{% endcodeblock %}

Получение сообщений
Получение сообщений ничем не отличается от предыдущего урока, за исключением того, что нам нужно связать обменник с очередью по каждому типу

{% codeblock lang:php %}
$queue = new AMQPQueue($channel);
$queue->declare();

foreach ($routingKeys as $routingKey) {
    $queue->bind($exchange->getName(), $routingKey');
}
{% endcodeblock %}

#### Все вместе
Как и в предыдущем уроке, поскольку в данном примере мы имеем дело с анонимными очередями, создаваться они должны на стороне консьюмера, и консьюмер, соответственно, должен быть запущен первым. Из продюсера создание очередей удаляется.

Продюсер (send.php)

{% codeblock lang:php %}
$params = array(
    'host' => 'localhost',
    'port' => 5672,
    'vhost' => '/',
    'login' => 'guest',
    'password' => 'guest'
);

$message = 'default_message';
$routingKey = isset($argv[1]) ? $argv[1] : 'default_key';

$connection = new AMQPConnection();
$connection->connect();

$channel = new AMQPChannel($connection);

$exchange = new AMQPExchange($channel);
$exchange->setName('logs');
$exchange->setType(AMQP_EX_TYPE_DIRECT);
$exchange->declare();


$result = $exchange->publish(json_encode($message), $routingKey);

if ($result)
    echo 'sent'.PHP_EOL;
else
    echo 'error'.PHP_EOL;

$connection->disconnect();

Консьюмер (receive.php)

$params = array(
    'host' => 'localhost',
    'port' => 5672,
    'vhost' => '/',
    'login' => 'guest',
    'password' => 'guest'
);

$routingKeys = array('notice', 'warning', 'failure');

$connection = new AMQPConnection();
$connection->connect();

$channel = new AMQPChannel($connection);

$exchange = new AMQPExchange($channel);
$exchange->setName('logs');
$exchange->setType(AMQP_EX_TYPE_DIRECT);
$exchange->declare();

$queue = new AMQPQueue($channel);
$queue->setFlags(AMQP_IFUNUSED | AMQP_AUTODELETE | AMQP_DURABLE);
$queue->declare();

foreach ($routingKeys as $routingKey) {
    $queue->bind($exchange->getName(), $routingKey');
} 

while (true) {
    if ($envelope = $queue->get()) {
        $message = json_decode($envelope->getBody());
        echo "delivery tag: ".$envelope->getDeliveryTag().PHP_EOL;
        echo "routing key: ".$envelope->getRoutingKey().PHP_EOL;
        if (doWork($message)) {
            $queue->ack($envelope->getDeliveryTag());
        } else {
            $queue->nack($envelope->getDelivaryTag(), AMQP_REQUEUE);
        }
    }
}

$connection->disconnect();
{% endcodeblock %}

### Рассылка по шаблону

В предыдущем уроке мы улучшили нашу систему логирования путем использования обменников с типом direct, создав возможность получать сообщения выборочно. Следующим этапом будет создание системы, позволяющей логировать по множеству критериев. Допустим мы хотим разделить обработаку логирования основываясь не только на важности сообщений, но и по устройствам, вызвавшим эту ошибку. Это предоставило бы нам большую гибкость - к примеру, можно было бы выделить обработку логов для критических ошибок, инициированных кроном, и отдельно выделить обработку логов всех сообщений от ядра системы. Для имплементации такой возможности нам неоходимо нечто большее, чем прямая рассылка сообщений (рассылка по методу точка-точка).
Связывание по шаблону

Для выполнения связи по шалбону обменник должен иметь тип topic, который определяется константой AMQP_EX_TYPE_TOPIC. Ключи routingKey составляются из слова, следующих через точку, например, "logs.devices.kernel.notice", "logs.devices.cron". Максимальная длина такого ключа может составлять 255 символов. Логика доставки сообщений по ключу схожа с логикой для обменников с типом direct - сообщения с определенным ключем будут доставлены в очереди с соответствующим ключем. Но есть одна большая разница. Ключи, используемые для связи по шаблону, могут содержать два специальных символа:

- \* , соответствует строго одному слову;
- \# , соответствует любому количеству слов, в том числе и отсутствию слов;

Например, имеем следующие связи   
\*.orange.\*   
\*.\*.rabbit   
lazy.\*.\*  

{% img no-boreder center /images/post/rabbitmq-tutorial/tut_06.png %}

Первое слово описывает скорость, второе - цвет и третье - вид животного, т.е. [speed][color][species]. Мы создали три связи: очередь Q1 связали по ключу "*.orange.*" и очередь Q2 - по ключам "*.*.rabbit" и "lazy.#". Таким образом, можно сказать, что очередь Q1 рассматривает всех оранжевых животных, а очередь Q2 - всех зайцев и всех медленных животных. 

Рассмотрим несколько примеров:

- "quick.orange.rabbit" - в обе очереди 
- "lazy.orange.elephant" - в обе очереди
- "quick.orange.fox" - только в 1-ую
- "lazy.brown.fox" - только во 2-ую
- "quick.brown.fox" - будет отброшена
- "quick.orange.male.fox" - будет отброшена
- "lazy.orange.male.fox" - только во 2-ую

Обменник с типом topic может повторять поведение обменника с типом fanout, если с ним связать очередь по ключу "#". Если в ключе не испльзовать специальных символов, то такой обменник будет соответствовать обменнику с типом direct.

#### Отправка сообщений

Для отправки сообщений по шаблону обменник должен быть создан с типом topic, который сооветствует константе AMQP_EX_TYPE_TOPIC.

{% codeblock lang:php %}
$exchange = new AMQPExchange($channel);
$exchange->setName('logs');
$exchange->setType(AMQP_EX_TYPE_TOPIC);
$exchange->setFlags(AMQP_IFUNUSED | AMQP_AUTODELETE);
$exchange->declare();
{% endcodeblock %}

После чего возможна публикация сообщений по ключу

{% codeblock lang:php %}
$exchange->publish($message, 'kern.notice');
{% endcodeblock %}

#### Получение сообщений

Получение сообщений ничем не отличается от предыдущего урока

{% codeblock lang:php %}
$queue = new AMQPQueue($channel);
$queue->declare();

foreach ($routingKeys as $routingKey) {
    $queue->bind($exchange->getName(), $routingKey');
}
{% endcodeblock %}

#### Все вместе

Как и в предыдущем уроке, поскольку в данном примере мы имеем дело с анонимными очередями, создаваться они должны на стороне консьюмера, и консьюмер, соответственно, должен быть запущен первым. Из продюсера создание очередей удаляется.

Продюсер(send.php)

{% codeblock lang:php %}
$params = array(
    'host' => 'localhost',
    'port' => 5672,
    'vhost' => '/',
    'login' => 'guest',
    'password' => 'guest'
);

$message = 'default_message';
$routingKey = isset($argv[1]) ? $argv[1] : 'default_key';

$connection = new AMQPConnection();
$connection->connect();

$channel = new AMQPChannel($connection);

$exchange = new AMQPExchange($channel);
$exchange->setName('logs');
$exchange->setType(AMQP_EX_TYPE_TOPIC);
$exchange->declare();

$result = $exchange->publish(json_encode($message), $routingKey);

if ($result)
echo 'sent'.PHP_EOL;
else
echo 'error'.PHP_EOL;

$connection->disconnect();

Консьюмер (receive.php)

$params = array(
'host' => 'localhost',
'port' => 5672,
'vhost' => '/',
'login' => 'guest',
'password' => 'guest'
);

$routingKeys = array('cron.notice', 'kern.*', '*.failure');

$connection = new AMQPConnection();
$connection->connect();

$channel = new AMQPChannel($connection);

$exchange = new AMQPExchange($channel);
$exchange->setName('logs');
$exchange->setType(AMQP_EX_TYPE_TOPIC);
$exchange->declare();

$queue = new AMQPQueue($channel);
$queue->setFlags(AMQP_IFUNUSED | AMQP_AUTODELETE | AMQP_DURABLE);
$queue->declare();

foreach ($routingKeys as $routingKey) {
    $queue->bind($exchange->getName(), $routingKey');
} 
while (true) {
    if ($envelope = $queue->get()) {
        $message = json_decode($envelope->getBody());
        echo "delivery tag: ".$envelope->getDeliveryTag().PHP_EOL;
        echo "routing key: ".$envelope->getRoutingKey().PHP_EOL;
        if (doWork($message)) {
            $queue->ack($envelope->getDeliveryTag());
        } else {
            $queue->nack($envelope->getDelivaryTag(), AMQP_REQUEUE);
    }
}
}

$connection->disconnect();
{% endcodeblock %}

### Реализация RPC шаблона

Во втором уроке была реализована очередь, которая распределяла нагрузку между всеми имеющимися консьюмерами. Но, что если нам нужно получить результат от обработчика очереди. Такой подход известен как вызов удаленных процедур или RPC(remote procedure call). В этом уроке будет реализована модель RPC с использованием очереди сообщений RabbitMQ. Конечно, такой подход предполагает, что обработка не должна занимать много времени. Для реализации примера наша функция обработчик будет изменять сообщение "message before" на "message after".

В целом, реализация RPC посредством RabbitMQ довольно проста. Клиент отправляет сообщение, а сервере отвечает. Для обработки ответа сервера, необходимо создать callback очередь. Чтобы узнать какая callback очередь ожидает ответа, мы должны в запросе послать ее имя. Для этого на продюсере создается анонимная очередь и ее имя добавляется в параметры запроса

{% codeblock lang:php %}
$replyQueue = new AMQPQueue($channel);
$replyQueue->setFlags(AMQP_IFUNUSED | AMQP_AUTODELETE | AMQP_EXCLUSIVE);
$replyQueue->declare();

$replyQueue->bind($exchange->getName(), $replyQueue->getName());

$correlationId = sha1($replyQueue->getName());
$attributes = array(
'reply_to' => $replyQueue->getName(),
'correlation_id' => $correlationId
);
$result = $exchange->publish(json_encode($message), '', AMQP_MANDATORY, $attributes);

// ... then code to read a response message from the callback_queue ...
{% endcodeblock %}

Обратите внимание, что callback очередь создается с флагом AMQP_EXCLUSIVE, что означает, что только один консьюмер может слушать эту очередь.


#### Correlation ID

В методе, представленном выше, мы предполагаем создавать callback очередь для каждого RPC запроса. Поскольку нельзя однозначно по имени очереди определить какому запросу принадлежит ответ, в запрос также добавляется параметр correlationId, который имеет уникальное значение для каждого запроса. Позже, когда мы получим ответ, мы сможем сравнить его correlationId со значением, переданным вместе с запросом. И в случае их несовпадения просто отбросить полученный ответ.

#### Итоговый план действий

- клиент создает анонимную эксклюзивную callback очередь
- клиент отсылает запрос с двумя параметрами: 
replyTo - имя callback очереди
corralationId - уникальное значение для каждого запроса
- запрос отправляется в именованную очередь, к примеру, с именем rpc_queue
- RPC воркер (RPC сервер) ждет запрос от этой очереди и когда запрос появляется, обрабатывает его и шлет ответ обратно клиенту, используя имя callback очереди в качестве роутер-ключа
- клиент слушает callback очередь и когда сообщение появляется, сверяет correlationId. Если значение этого свойства из полученного сообщения соответствует ранее сформированном значению, ответ обрабатывается приложением.

#### Все вместе

Функция обработки сообщения на стороне сервера выглядит следующим образом

{% codeblock lang:php %}
function doWork($message) 
{ 
    foreach ($message as &$m) { 
        echo $m; 
        $sleep_time = rand(0, 10); 
        $tmp = explode(' ', $m); 
        $m = $tmp[0].' after'; 
        echo str_repeat('.', floor($sleep_time)); 
        echo PHP_EOL; 
    } 
    sleep($sleep_time); 
    return $message; 
}
{% endcodeblock %}

Функция обработки сообщения на стороне клиента

{% codeblock lang:php %}
function getWork($message) 
{ 
    print_r($message); 
}
{% endcodeblock %}

Продюсер(send.php)

{% codeblock lang:php %}
$params = array(
    'host' => 'localhost',
    'port' => 5672,
    'vhost' => '/',
    'login' => 'guest',
    'password' => 'guest'
);

$message = 'message before';
$routingKey = isset($argv[1]) ? $argv[1] : 'default_key';

$connection = new AMQPConnection();
$connection->connect();

$channel = new AMQPChannel($connection);

$exchange = new AMQPExchange($channel);
$exchange->setName('logs');
$exchange->setType(AMQP_EX_TYPE_TOPIC);
$exchange->declare();


$replyQueue = new AMQPQueue($channel);
$replyQueue->setFlags(AMQP_IFUNUSED | AMQP_AUTODELETE | AMQP_EXCLUSIVE);
$replyQueue->declare();

$replyQueue->bind($exchange->getName(), $replyQueue->getName());

$correlationId = sha1($replyQueue->getName());
$attributes = array(
'reply_to' => $replyQueue->getName(),
'correlation_id' => $correlationId
);
$result = $exchange->publish(json_encode($message), $routing_key, AMQP_MANDATORY, $attributes);

if ($result)
echo 'sent'.PHP_EOL;
else
echo 'error'.PHP_EOL;

while (true) { 
    if ($envelope = $replyQueue->get()) { 
        if ($envelope->getCorrelationId() == $corrlationId) { 
            echo ($envelope->isRedelivery()) ? 'r: ' : 'n: '; 
            $message = json_decode($envelope->getBody()); 
            getWork($message); 
            echo PHP_EOL; 
            $replyQueue->ack($envelope->getDeliveryTag()); break; 
         } 
    }	
    // for avoid a hunging erlang	sleep(1); 
} 

$connection->disconnect();

Консьюмер (receive.php)

$params = array(
    'host' => 'localhost',
    'port' => 5672,
    'vhost' => '/',
    'login' => 'guest',
    'password' => 'guest'
);

$routingKey = isset($argv[1]) ? $argv[1] : 'default_key';

$connection = new AMQPConnection();
$connection->connect();

$channel = new AMQPChannel($connection);

$exchange = new AMQPExchange($channel);
$exchange->setName('logs');
$exchange->setType(AMQP_EX_TYPE_TOPIC);
$exchange->declare();

$queue = new AMQPQueue($channel);
$queue->setName('rpc_queue'); 
$queue->setFlags(AMQP_IFUNUSED | AMQP_AUTODELETE | AMQP_DURABLE);
$queue->declare();

$queue->bind($exchange->getName(), $routingKey);

while (true) {
    if ($envelope = $queue->get()) {
        $message = json_decode($envelope->getBody());
        echo "delivery tag: ".$envelope->getDeliveryTag().PHP_EOL;
        echo "routing key: ".$envelope->getRoutingKey().PHP_EOL;
        if (doWork($message)) {
            $queue->ack($envelope->getDeliveryTag());
        } else {
            $queue->nack($envelope->getDelivaryTag(), AMQP_REQUEUE);
        }
    }
}

$connection->disconnect();
{% endcodeblock %}
