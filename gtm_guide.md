#GTM 
#контейнер — супертег, который позволяет GTM работать с сайтом.
#триггер — при конфликте триггеров активации и блокировки, приоритет отдается блокиратору

#dataLayer пример пустого слоя данных:
```
<script type="text/javascript">
dataLayer = [{}];
</script>
```

Пример слоя данных с переменными:
```
<script type="text/javascript">
dataLayer = [{
    'pageCategory': 'Purchase',
    'product': 'Socks',
    'color': 'red',
    'amount' : 2,
    'price': 550
}];
</script>
```

GTM увидит этот слой данных и передаст его в ГА.

Можно после инициализации добавлять данные. Пример метода _push_:
```
dataLayer.push({'variable_name': 'variable_value'});
```

### Event в dataLayer

Это особая переменная, которая используется с обработчиками событий в JavaScript. Она нужна для запуска тега, когда пользователь взаимодействует с разными элементами на странице: формами, кнопками, ссылками.
```
dataLayer.push({'event': 'event_name'});
```
Или
```
<a href="https://www.optimizesmart.com/download" onclick="dataLayer.push({'event': 'pdf-download'});">PDF download</a>
```

**dataLayer всегда выше GTM**

ин дженерал надо один раз понять, какую инфу с сайта забирать в dataLayer и больше не менять (это страница, ее атрибуты, девайс, пол, и тд и тп)
