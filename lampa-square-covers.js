// Lampa TV — обложки с прямыми углами.
(function () {
    'use strict';

    var styleId = 'lampa-square-covers';
    if (document.getElementById(styleId)) return;

    var style = document.createElement('style');
    style.id = styleId;
    style.type = 'text/css';
    style.textContent = [
        '.card__view,',
        '.card__view:after,',
        '.card__img,',
        '.card__filter,',
        '.card__promo,',
        '.card__textbox,',
        '.full-start__img,',
        '.full-start-new__poster,',
        '.full-start-new__img {',
        '    -webkit-border-radius: 0 !important;',
        '    border-radius: 0 !important;',
        '}'
    ].join('\n');

    document.head.appendChild(style);
}());
