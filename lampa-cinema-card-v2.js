// Lampa TV — полноэкранный кадр, слайды, трейлеры и оценки в карточке.
(function () {
    'use strict';

    var Lampa = window.Lampa;
    var styleId = 'lampa-cinema-card-style';
    var stateKey = '__lampaCinemaCard';
    var openingKey = '__lampaCinemaOpening';
    var scrollCleanupKey = '__lampaCinemaScrollCleanup';
    var mediaKey = '__lampaCinemaMedia';
    var backgroundSetting = 'lampa_cinema_background';
    var backgroundAttribute = 'data-lampa-cinema-background';
    var shadeSetting = 'lampa_cinema_bottom_shade';
    var activeMedia;
    if (!Lampa || !Lampa.Listener || document.getElementById(styleId)) return;

    var style = document.createElement('style');
    style.id = styleId;
    style.textContent = [
        '.lampa-cinema-page, .lampa-cinema-opening { background: #000; }',
        '.lampa-cinema-page { position: relative; z-index: 0; }',
        '.lampa-cinema-art, .lampa-cinema-surface > .lampa-cinema-ambient {',
        '    position: absolute; top: -4em; right: 0; bottom: auto; left: 0;',
        '    width: 100%; height: 100vh; height: 100dvh; overflow: hidden; pointer-events: none;',
        '}',
        '.lampa-cinema-surface > .lampa-cinema-ambient {',
        '    z-index: -2; background: linear-gradient(145deg, #202d3b, #0c1119 68%, #080c12);',
        '}',
        '.lampa-cinema-ambient canvas {',
        '    width: 100%; height: 100%; display: block; image-rendering: auto; opacity: 0; transition: opacity .36s ease;',
        '}',
        '.lampa-cinema-ambient--ready canvas { opacity: 1; }',
        '.lampa-cinema-ambient:after, .lampa-cinema-art:after {',
        '    content: ""; position: absolute; top: 0; right: 0; bottom: 0; left: 0;',
        '}',
        '.lampa-cinema-ambient:after {',
        '    background: linear-gradient(to bottom, rgba(0,0,0,.48), rgba(0,0,0,.22)),',
        '                radial-gradient(ellipse at 74% 40%, transparent 16%, rgba(0,0,0,.21) 100%);',
        '}',
        '.lampa-cinema-scroll-body { position: relative; z-index: 0; }',
        '.lampa-cinema-section-shade {',
        '    position: absolute; z-index: -1; right: 0; bottom: 0; left: 0;',
        '    visibility: hidden; pointer-events: none;',
        '}',
        '[data-lampa-cinema-shade="off"] .lampa-cinema-section-shade { display: none; }',
        '.lampa-cinema-art {',
        '    z-index: -1; opacity: 1;',
        '    -webkit-mask-image: linear-gradient(to bottom, #000 48%, transparent 98%);',
        '    mask-image: linear-gradient(to bottom, #000 48%, transparent 98%);',
        '    transition: opacity .3s ease;',
        '}',
        '.lampa-cinema-hero > .lampa-cinema-art {',
        '    bottom: 0; height: auto; max-height: 100vh; max-height: 100dvh;',
        '}',
        '.lampa-cinema-photo {',
        '    position: absolute; top: 0; right: 0; bottom: 0; left: 0; background: center / cover no-repeat;',
        '}',
        '.lampa-cinema-photo--appear { animation: lampa-cinema-reveal .38s ease-out both; }',
        '.lampa-cinema-slides { position: absolute; z-index: 1; top: 0; right: 0; bottom: 0; left: 0; }',
        '.lampa-cinema-slides .lampa-cinema-photo--appear { animation-duration: .65s; }',
        '@keyframes lampa-cinema-reveal { from { opacity: 0; } to { opacity: 1; } }',
        '.lampa-cinema-art:after {',
        '    z-index: 2; background: linear-gradient(90deg, rgba(0,0,0,.42), rgba(0,0,0,.14) 44%, transparent 76%);',
        '}',
        '.lampa-cinema-art:not(.lampa-cinema-art-ready),',
        '[data-lampa-cinema-background="gradient"] .lampa-cinema-art:not(.lampa-cinema-media-selected),',
        '[data-lampa-cinema-background="black"] .lampa-cinema-art:not(.lampa-cinema-media-selected) { visibility: hidden; }',
        '[data-lampa-cinema-base="native"] .lampa-cinema-page,',
        '[data-lampa-cinema-base="native"] .lampa-cinema-opening { background: transparent; }',
        '[data-lampa-cinema-base="black"] .lampa-cinema-ambient,',
        '[data-lampa-cinema-base="native"] .lampa-cinema-ambient { visibility: hidden; }',
        '.lampa-cinema-opening {',
        '    position: absolute; z-index: 0; top: 0; right: 0; left: 0; height: calc(100vh - 4em);',
        '    height: calc(100dvh - 4em); opacity: 0; pointer-events: none; transition: opacity .28s ease;',
        '}',
        '.activity--load > .lampa-cinema-opening, .lampa-cinema-opening--handoff { opacity: 1; }',
        '.lampa-cinema-activity > .activity__body { z-index: 1; }',
        '.lampa-cinema-activity.activity--load > .activity__loader { background-image: none; }',
        '.lampa-cinema-progress {',
        '    position: absolute; left: 4.2vw; bottom: 3.25em; width: 6.5em; height: .16em; overflow: hidden;',
        '    border-radius: .16em; background: rgba(249,244,236,.2); visibility: hidden;',
        '}',
        '.activity--load > .lampa-cinema-opening > .lampa-cinema-progress {',
        '    visibility: visible; animation: lampa-cinema-reveal .25s .14s both;',
        '}',
        '.lampa-cinema-progress:after {',
        '    content: ""; display: block; width: 48%; height: 100%; background: #f9f4ec;',
        '    animation: lampa-cinema-progress 1.25s cubic-bezier(.45,0,.55,1) infinite;',
        '}',
        '@keyframes lampa-cinema-progress { from { transform: translateX(-105%); } to { transform: translateX(215%); } }',
        '.lampa-cinema-managed-background .full-start__background,',
        '.lampa-cinema-managed-background .full-start-new__background,',
        '.lampa-cinema-managed-background .cardify__background { visibility: hidden !important; }',
        '.lampa-cinema-page > .scroll.scroll--mask { -webkit-mask-image: none; mask-image: none; }',
        '.lampa-cinema-page .lampa-cinema-hero {',
        '    box-sizing: border-box; position: relative; z-index: 0; display: flex; flex-direction: column;',
        '    justify-content: flex-end; min-height: 78vh;',
        '    min-height: calc(100vh - 6.5em); min-height: calc(100dvh - 6.5em);',
        '    width: 100%; padding: 2em 4.2vw 4em; color: #f9f4ec;',
        '}',
        '.lampa-cinema-page .full-start-new.lampa-cinema-hero > .full-start-new__body,',
        '.lampa-cinema-page .full-start.lampa-cinema-hero > .full-start__body {',
        '    display: block; width: 100%; height: auto; min-height: 0; padding-bottom: 0;',
        '}',
        '.lampa-cinema-hero .full-start-new__left, .lampa-cinema-hero .full-start__right { display: none; }',
        '.lampa-cinema-hero .full-start-new__right, .lampa-cinema-hero .full-start__left {',
        '    width: 100%; max-width: 47em; margin: 0; padding: 0; overflow: visible; background: none;',
        '}',
        '.lampa-cinema-hero .full-start-new__head, .lampa-cinema-hero .full-start__head {',
        '    margin: 0 0 .8em; color: #dce2e9; text-shadow: 0 1px 5px #0c1119;',
        '}',
        '.lampa-cinema-hero .full-start-new__title, .lampa-cinema-hero .full-start__title {',
        '    display: block; max-width: 100%; max-height: none; margin: 0 0 .25em;',
        '    overflow: visible; -webkit-line-clamp: unset; line-clamp: unset;',
        '    white-space: normal; word-wrap: break-word; overflow-wrap: break-word;',
        '    color: #f9f4ec; font-size: 3.65em; font-weight: 700; line-height: 1.03;',
        '    letter-spacing: -.028em; text-shadow: 0 .06em .28em rgba(12,17,25,.65);',
        '}',
        '.lampa-cinema-title[data-cinema-type="future"] {',
        '    font-family: "Trebuchet MS", Verdana, sans-serif; font-weight: 700; letter-spacing: .045em;',
        '}',
        '.lampa-cinema-title[data-cinema-type="classic"] {',
        '    font-family: Georgia, "Times New Roman", serif; font-weight: 400; letter-spacing: -.025em;',
        '}',
        '.lampa-cinema-title[data-cinema-type="suspense"] {',
        '    font-family: "Arial Narrow", "Roboto Condensed", Arial, sans-serif; font-weight: 800; letter-spacing: -.037em;',
        '}',
        '.lampa-cinema-title[data-cinema-type="horror"] {',
        '    font-family: Georgia, "Times New Roman", serif; font-weight: 700; letter-spacing: .034em;',
        '}',
        '.lampa-cinema-title[data-cinema-type="family"] {',
        '    font-family: Verdana, "Trebuchet MS", sans-serif; font-weight: 700; letter-spacing: -.047em;',
        '}',
        '.lampa-cinema-hero .lampa-cinema-title-long { font-size: 3em; }',
        '.lampa-cinema-title-slot {',
        '    position: relative; display: flex; flex-direction: column; justify-content: flex-end;',
        '    min-height: 7.8em; margin: 0 0 .7em;',
        '}',
        '.lampa-cinema-hero .lampa-cinema-title-slot > .lampa-cinema-title { margin: 0; transition: opacity .32s ease; }',
        '.lampa-cinema-title-slot--branded > .lampa-cinema-title { opacity: 0; }',
        '.lampa-cinema-brand {',
        '    position: absolute; right: 0; bottom: 0; left: 0; display: flex; flex-direction: column;',
        '    align-items: flex-start; animation: lampa-cinema-reveal .32s ease both;',
        '}',
        '.lampa-cinema-logo {',
        '    display: block; width: auto; height: auto; max-width: 90%; max-height: 7.5em;',
        '    object-fit: contain; object-position: left center;',
        '    filter: drop-shadow(0 .22em .56em rgba(12,17,25,.7)); pointer-events: none;',
        '}',
        '.lampa-cinema-brand--translated .lampa-cinema-logo { max-height: 5.3em; }',
        '.lampa-cinema-title-caption {',
        '    margin-top: .42em; max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;',
        '    color: #dce2e9; font-size: 1.2em; font-weight: 600; line-height: 1.25;',
        '}',
        '.lampa-cinema-hero .full-start-new__tagline { color: #dce2e9; margin-bottom: .65em; }',
        '.lampa-cinema-hero .full-start-new__rate-line { margin-bottom: .65em; }',
        '.lampa-cinema-hero .full-start-new__details { line-height: 1.35; margin-bottom: .55em; }',
        '.lampa-cinema-hero .lampa-cinema-reactions-hidden,',
        '.lampa-cinema-ratings .tv-new-rating__icon { display: none !important; }',
        '.lampa-cinema-ratings { display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-start;',
        '    margin: 0 0 .7em; text-shadow: 0 1px 6px rgba(0,0,0,.55); }',
        '.lampa-cinema-ratings:empty, .lampa-cinema-ratings[hidden], .lampa-cinema-reaction-summary[hidden] { display: none; }',
        '.lampa-cinema-ratings > .full-start-new__rate-line, .lampa-cinema-ratings > .full-start__rate-line,',
        '.lampa-cinema-ratings > .tv-main-rate, .lampa-cinema-ratings > .tv-new-rating {',
        '    position: static; justify-content: flex-start; margin: .14em .7em .14em 0; }',
        '.lampa-cinema-score { margin: .14em .7em .14em 0; padding: .35em .55em; border: 1px solid rgba(255,255,255,.32);',
        '    border-radius: .32em; background: rgba(0,0,0,.3); font-size: .85em; font-weight: 650; }',
        '.lampa-cinema-reaction-summary { display: flex; align-items: center; max-width: 100%; padding: .25em 0;',
        '    font-size: .82em; font-weight: 650; }',
        '.lampa-cinema-reaction-track { width: 7em; height: .42em; border-radius: .22em; background: rgba(255,255,255,.25);',
        '    overflow: hidden; margin: 0 .5em; }',
        '.lampa-cinema-reaction-fill { display: block; height: 100%; border-radius: inherit; background: #f9f4ec; }',
        '.lampa-cinema-reaction-count { opacity: .7; margin-left: .65em; }',
        '.lampa-cinema-media-button { white-space: nowrap; }',
        '.lampa-cinema-media-icon { display: inline-block; width: 1.1em; height: .74em; flex: none; margin-right: .45em;',
        '    border: .09em solid currentColor; border-radius: .13em; }',
        '.lampa-cinema-native-actions-hidden, .lampa-cinema-watch-row[hidden],',
        '.lampa-cinema-watch-active .full-start__buttons-scroll { display: none !important; }',
        '.lampa-cinema-watch-row { order: 1; display: flex; justify-content: flex-end; margin-top: .65em; }',
        '.lampa-cinema-watch-row > .lampa-cinema-watch {',
        '    box-sizing: border-box; display: flex; justify-content: center; align-items: center;',
        '    min-width: 8.5em; min-height: 3em; height: auto; margin: 0; padding: .55em 1.2em;',
        '    font-size: 1.45em; line-height: 1.15; font-weight: 650; white-space: nowrap;',
        '}',
        '@media (max-width: 790px), (max-height: 600px) {',
        '    .lampa-cinema-page .lampa-cinema-hero {',
        '        min-height: calc(100vh - 9em); min-height: calc(100dvh - 9em); padding: 1.3em 1.3em 1.8em;',
        '    }',
        '    .lampa-cinema-hero .full-start-new__title, .lampa-cinema-hero .full-start__title { font-size: 2.65em; }',
        '    .lampa-cinema-hero .lampa-cinema-title-long { font-size: 2.2em; }',
        '    .lampa-cinema-title-slot { min-height: 6.5em; }',
        '    .lampa-cinema-logo { max-height: 6.3em; }',
        '    .lampa-cinema-brand--translated .lampa-cinema-logo { max-height: 4.5em; }',
        '}',
        '@media (prefers-reduced-motion: reduce) {',
        '    .lampa-cinema-art,',
        '    .lampa-cinema-opening, .lampa-cinema-ambient canvas,',
        '    .lampa-cinema-hero .lampa-cinema-title-slot > .lampa-cinema-title { transition: none; }',
        '    .lampa-cinema-photo--appear, .lampa-cinema-brand, .lampa-cinema-progress:after,',
        '    .activity--load > .lampa-cinema-opening > .lampa-cinema-progress { animation: none; }',
        '}'
    ].join('\n');
    document.head.appendChild(style);

    // The full-card event runs after Lampa has built its native details and controls.
    Lampa.Listener.follow('full', renderCinemaCard);
    Lampa.Listener.follow('activity', handleCinemaActivity);
    Lampa.CinemaCard = {
        handlesOpening: true,
        preferredLogoUrl: function (card) {
            var choices = logoChoices(card, mediaLanguage(card));
            return choices.length ? choices[0].url : '';
        }
    };

    var storageListener = Lampa.Storage && Lampa.Storage.listener;
    if (storageListener && typeof storageListener.follow === 'function') {
        storageListener.follow('change', function (event) {
            if (event.name === shadeSetting) updateShade(event.value);
            if ([backgroundSetting, 'background', 'background_type', 'light_version'].indexOf(event.name) !== -1) {
                updateBackgroundMode(setting(backgroundSetting));
            }
        });
    }

    if (window.appready) addInterfaceSettings();
    else {
        updateBackgroundMode(setting(backgroundSetting));
        updateShade(setting(shadeSetting));
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') addInterfaceSettings();
        });
    }

    function setting(name) {
        return Lampa.Storage && Lampa.Storage.field && Lampa.Storage.field(name);
    }

    function settingIsOff(value) {
        return value === false || value === 'false';
    }

    function homeBackgroundMode() {
        var type = setting('background_type');
        var light = setting('light_version');
        if (settingIsOff(setting('background')) || type === 'black' || light === true || light === 'true') return 'black';
        // In poster mode the native layer can show a sharp copy of the hero behind the lower sections.
        if (type === 'poster') return 'palette';
        var background = Lampa.Background;
        var layer = background && typeof background.render === 'function' && nodeOf(background.render());
        return layer && document.documentElement.contains(layer) ? 'native' : 'palette';
    }

    function updateBackgroundMode(mode) {
        mode = mode === 'black' || mode === 'gradient' ? mode : 'picture';
        var base = mode === 'picture' ? homeBackgroundMode() : mode === 'black' ? 'black' : 'palette';
        document.documentElement.setAttribute(backgroundAttribute, mode);
        document.documentElement.setAttribute('data-lampa-cinema-base', base);
    }

    function updateShade(value) {
        document.documentElement.setAttribute('data-lampa-cinema-shade', settingIsOff(value) ? 'off' : 'on');
    }

    function addInterfaceSettings() {
        var translations = {
            ru: ['Фон карточки', 'Чёрный', 'Как на главной', 'Градиент', 'Затемнение внизу карточки'],
            uk: ['Тло картки', 'Чорний', 'Як на головній', 'Градієнт', 'Затемнення внизу картки'],
            en: ['Card background', 'Black', 'Same as home', 'Gradient', 'Darken the bottom of the card']
        };
        var text = translations[languageCode(setting('language'))] || translations.ru;
        if (Lampa.SettingsApi && Lampa.SettingsApi.addParam) {
            Lampa.SettingsApi.addParam({
                component: 'interface',
                param: {
                    name: backgroundSetting, type: 'select', default: 'picture',
                    values: { black: text[1], picture: text[2], gradient: text[3] }
                },
                field: { name: text[0] },
                onChange: updateBackgroundMode
            });
            Lampa.SettingsApi.addParam({
                component: 'interface',
                param: { name: shadeSetting, type: 'trigger', default: true },
                field: { name: text[4] },
                onChange: updateShade
            });
        }
        updateBackgroundMode(setting(backgroundSetting));
        updateShade(setting(shadeSetting));
    }

    function previewUrl(card, size) {
        size = size || 'w1280';
        return assetUrl(card.backdrop_path, size) || assetUrl(card.background_image, size);
    }

    function startPreview(url) {
        if (!url) return null;
        var image = new Image();
        image.decoding = 'async';
        image.src = url;
        return image;
    }

    function assetUrl(path, size) {
        if (typeof path !== 'string' || !path) return '';
        if (/^(https?:)?\/\//i.test(path)) return path;
        if (/^\/[\w-]+\.(jpe?g|png|webp|svg)$/i.test(path) && Lampa.Api && Lampa.Api.img) {
            return Lampa.Api.img(path, size);
        }
        return '';
    }

    function wideBackdrops(pictures) {
        if (!Array.isArray(pictures)) return [];
        return pictures.filter(function (picture) {
            return picture && picture.file_path && (Number(picture.aspect_ratio) || picture.width / picture.height) >= 1.5;
        }).sort(function (a, b) {
            return Number(b.vote_average || 0) - Number(a.vote_average || 0) || b.width - a.width;
        });
    }

    function bestBackdropPaths(card) {
        var wide = wideBackdrops(card.images && card.images.backdrops);
        var clean = wide.filter(function (picture) {
            return !picture.iso_639_1 && Number(picture.width) >= 1600;
        });
        var paths = clean.slice(0, 2).map(function (picture) { return picture.file_path; });
        paths.push(card.backdrop_path, card.background_image, wide.length && wide[0].file_path);
        return paths.filter(function (path, index) { return path && paths.indexOf(path) === index; });
    }

    function backdropSizes(path) {
        var size = window.innerWidth >= 1000 ? 'original' : 'w1280';
        return [size, 'w1280', 'w780'].map(function (width) { return assetUrl(path, width); })
            .filter(function (url, index, urls) { return url && urls.indexOf(url) === index; });
    }

    function backdropChoices(card) {
        var choices = [];
        bestBackdropPaths(card).forEach(function (path) {
            backdropSizes(path).forEach(function (url) {
                if (choices.indexOf(url) === -1) choices.push(url);
            });
        });
        return choices;
    }

    function languageCode(value) {
        return String(value || '').toLowerCase().split(/[-_]/)[0];
    }

    function logoChoices(card, language) {
        var logos = card.images && card.images.logos;
        if (!Array.isArray(logos)) return [];

        var original = languageCode(card.original_language);
        var languages = [language, original, 'en'].filter(function (code, index, list) {
            return code && list.indexOf(code) === index;
        });
        return logos.filter(function (logo) {
            return logo && logo.file_path && languages.indexOf(languageCode(logo.iso_639_1)) !== -1;
        }).sort(function (a, b) {
            return languages.indexOf(languageCode(a.iso_639_1)) - languages.indexOf(languageCode(b.iso_639_1)) ||
                Number(b.vote_average || 0) - Number(a.vote_average || 0) ||
                Number(b.width || 0) - Number(a.width || 0);
        }).slice(0, 4).map(function (logo) {
            return { url: assetUrl(logo.file_path, 'original'), language: languageCode(logo.iso_639_1) };
        });
    }

    function mediaLanguage(card) {
        return languageCode(setting('tmdb_lang')) || languageCode(card.original_language) || 'en';
    }

    function titleType(card) {
        // TMDB uses separate IDs for some film and television genres.
        var types = {
            878: 'future', 10765: 'future', 14: 'future',
            27: 'horror', 53: 'suspense', 9648: 'suspense', 80: 'suspense',
            28: 'suspense', 10759: 'suspense',
            36: 'classic', 18: 'classic', 10749: 'classic', 37: 'classic',
            16: 'family', 35: 'family', 10751: 'family', 10762: 'family'
        };
        var genres = Array.isArray(card.genres) && card.genres.length ? card.genres : card.genre_ids;
        if (!Array.isArray(genres)) return 'default';
        var choices = genres.map(function (genre) { return genre && types[Number(genre.id || genre)]; });
        return choices.indexOf('horror') !== -1 ? 'horror' :
            choices.indexOf('future') !== -1 ? 'future' :
            choices.filter(Boolean)[0] || 'default';
    }

    function loadFirstImage(image, choices, done) {
        var index = 0;
        function next() {
            var url;
            while (index < choices.length && !url) url = choices[index++];
            if (!url) {
                image.onerror = image.onload = null;
                done(-1);
                return;
            }
            image.src = url;
        }
        image.onerror = next;
        image.onload = function () {
            image.onerror = image.onload = null;
            useDecodedImage(image, function (ready) {
                if (ready) done(index - 1);
                else done(-1);
            });
        };
        next();
    }

    function nodeOf(value) {
        return value && (value.nodeType === 1 ? value : value[0]);
    }

    function activityNode(object) {
        var activity = object && object.activity;
        return activity && typeof activity.render === 'function' ? nodeOf(activity.render(true)) : null;
    }

    function preloadedAssets(object, card) {
        var preload = Lampa.CinemaPreload;
        return preload && typeof preload.assetsFor === 'function' && preload.assetsFor(object, card);
    }

    function useDecodedImage(image, callback) {
        if (!image.naturalWidth) return callback(null);
        if (typeof image.decode !== 'function') return callback(image);
        var decoding = image.__lampaCinemaDecoding || (image.__lampaCinemaDecoding = image.decode());
        function ready() {
            callback(image.naturalWidth ? image : null);
        }
        decoding.then(ready, ready);
    }

    function watchImage(image, callback) {
        if (!image) return callback(null);
        function detach() {
            image.removeEventListener('load', ready);
            image.removeEventListener('error', ready);
        }
        function ready() {
            detach();
            useDecodedImage(image, callback);
        }
        if (image.complete) ready();
        else {
            image.addEventListener('load', ready);
            image.addEventListener('error', ready);
        }
        return detach;
    }

    function createSurface() {
        var art = document.createElement('div');
        art.className = 'lampa-cinema-art';
        art.setAttribute('aria-hidden', 'true');
        var ambient = document.createElement('div');
        ambient.className = 'lampa-cinema-ambient';
        ambient.setAttribute('aria-hidden', 'true');
        var canvas = document.createElement('canvas');
        canvas.width = 96;
        canvas.height = 54;
        ambient.appendChild(canvas);
        return { art: art, ambient: ambient, canvas: canvas };
    }

    function mountSurface(root, surface, hero) {
        updateBackgroundMode(setting(backgroundSetting));
        root.classList.add('lampa-cinema-surface');
        root.insertBefore(surface.ambient, root.firstChild);
        var artRoot = hero || root;
        artRoot.insertBefore(surface.art, artRoot.firstChild);
        if (hero) {
            // Align with the loading backdrop, then let the movie image scroll with the hero.
            var top = surface.ambient.getBoundingClientRect().top - hero.getBoundingClientRect().top;
            surface.art.style.top = Math.min(0, top) + 'px';
        }
    }

    function followCardScroll(root, surface, component, hero, media) {
        var controller = component && component.scroll;
        var viewport = controller && typeof controller.render === 'function' && nodeOf(controller.render(true));
        if (!viewport || !root.contains(viewport) || !viewport.contains(hero)) {
            viewport = typeof hero.closest === 'function' && hero.closest('.scroll');
            if (!viewport || !root.contains(viewport)) viewport = root.querySelector('.scroll');
        }
        if (!viewport) return;

        var content = viewport.querySelector('.scroll__content');
        var body = viewport.querySelector('.scroll__body');
        var shade;
        var movement;
        var layout;
        var measured = false;
        var padding = 0;
        var originalMinHeight = hero.style.minHeight || '';
        if (body) {
            shade = document.createElement('span');
            shade.className = 'lampa-cinema-section-shade';
            shade.setAttribute('aria-hidden', 'true');
            body.classList.add('lampa-cinema-scroll-body');
            body.appendChild(shade);
        }

        function measureLayout() {
            if (!shade) return;
            var height = viewport.clientHeight;
            var box = body.getBoundingClientRect();
            var contentStyle = content && window.getComputedStyle(content);
            padding = contentStyle ? parseFloat(contentStyle.paddingTop) || 0 : 0;
            var bottomPadding = contentStyle ? parseFloat(contentStyle.paddingBottom) || 0 : 0;
            measured = height > 0 && box.height > 0;
            if (measured) {
                // Lampa's scroll area already excludes the header and navigation bar.
                var inset = padding + hero.getBoundingClientRect().top - box.top;
                var heightForHero = Math.floor(height - Math.max(0, inset));
                if (heightForHero > 0 && hero.style.minHeight !== heightForHero + 'px') {
                    hero.style.minHeight = heightForHero + 'px';
                    box = body.getBoundingClientRect();
                }
            }
            var moreRows = component && Array.isArray(component.items) && Array.isArray(component.rows) &&
                component.items.length < component.rows.length;
            if (!measured || moreRows || box.height + padding + bottomPadding <= height) {
                shade.style.visibility = 'hidden';
                return;
            }
            var sections = Array.prototype.filter.call(body.children, function (section) {
                return section !== shade && section.offsetHeight && !section.contains(hero);
            });
            if (!sections.length) {
                shade.style.visibility = 'hidden';
                return;
            }

            var lastTop = sections[sections.length - 1].getBoundingClientRect().top - box.top;
            var heroEnd = hero.getBoundingClientRect().bottom - box.top;
            // Short cards can start fading near the end of the preceding section.
            var preferredStart = sections.length > 3 ?
                sections[sections.length - 2].getBoundingClientRect().top - box.top : lastTop - height * .55;
            var fadeTop = Math.max(heroEnd, preferredStart);
            var room = box.height - fadeTop;
            if (room <= 0) {
                shade.style.visibility = 'hidden';
                return;
            }
            var fadeLength = Math.min(room, Math.max(lastTop - fadeTop, Math.min(height * .45, room * .72)));
            shade.style.top = fadeTop + 'px';
            shade.style.backgroundImage = 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.24) ' +
                (fadeLength * .35) + 'px, rgba(0,0,0,.67) ' + (fadeLength * .72) + 'px, #000 ' + fadeLength + 'px)';
            // Continue the black into the bottom padding without extending the scroll range.
            shade.style.boxShadow = bottomPadding ? '0 ' + bottomPadding + 'px #000' : '';
            shade.style.visibility = 'visible';
        }

        function refreshLayout() {
            measureLayout();
            update();
        }

        function update() {
            var height = viewport.clientHeight;
            if (!height) return;
            if (shade && !measured) measureLayout();
            var position = viewport.scrollTop || 0;
            var scroll = controller || viewport.Scroll;
            var transform = body && (body.style.transform || body.style.webkitTransform) ||
                content && (content.style.transform || content.style.webkitTransform);
            if (scroll && typeof scroll.position === 'function') {
                position = Math.max(position, Math.abs(Number(scroll.position())) || 0);
            }
            if (!position && body) {
                var translated = transform && /translate3d\([^,]+,\s*(-?[\d.]+)px,/.exec(transform);
                position = translated ? -Number(translated[1]) :
                    Math.max(0, viewport.getBoundingClientRect().top + padding - body.getBoundingClientRect().top);
            }
            var range = (content ? content.offsetHeight : viewport.scrollHeight) - height;
            var artworkDistance = Math.min(height * .84, range * .48);
            surface.art.style.opacity = artworkDistance > 0 ?
                1 - Math.min(1, Math.max(0, position / artworkDistance)) : 1;
            if (media) media.setAtTop(position <= 12);
        }

        function onScrollTransition(event) {
            if (event.target === body || event.target === content) update();
        }

        viewport.addEventListener('scroll', update);
        viewport.addEventListener('transitionend', onScrollTransition);
        viewport.addEventListener('webkitTransitionEnd', onScrollTransition);
        // Lampa translates the scroll body on TVs and scrolls natively on touch devices.
        if (body && typeof MutationObserver === 'function') {
            movement = new MutationObserver(function (changes) {
                if (Array.prototype.some.call(changes, function (change) { return change.type === 'childList'; })) {
                    refreshLayout();
                } else update();
            });
            movement.observe(body, { attributes: true, attributeFilter: ['style'], childList: true });
            if (content) movement.observe(content, { attributes: true, attributeFilter: ['style'] });
        }
        if (typeof ResizeObserver === 'function') {
            layout = new ResizeObserver(refreshLayout);
            layout.observe(viewport);
            if (content) layout.observe(content);
            if (body) layout.observe(body);
        } else window.addEventListener('resize', refreshLayout);
        refreshLayout();

        return function () {
            viewport.removeEventListener('scroll', update);
            viewport.removeEventListener('transitionend', onScrollTransition);
            viewport.removeEventListener('webkitTransitionEnd', onScrollTransition);
            if (movement) movement.disconnect();
            if (layout) layout.disconnect();
            else window.removeEventListener('resize', refreshLayout);
            hero.style.minHeight = originalMinHeight;
            if (shade) {
                removeElement(shade);
                body.classList.remove('lampa-cinema-scroll-body');
            }
        };
    }

    function removeElement(element) {
        if (element && element.parentNode) element.parentNode.removeChild(element);
    }

    function appendPhoto(layer, image, animate, previous, duration) {
        var photo = document.createElement('div');
        photo.className = animate ? 'lampa-cinema-photo lampa-cinema-photo--appear' : 'lampa-cinema-photo';
        photo.style.backgroundImage = 'url(' + JSON.stringify(image.src) + ')';
        layer.appendChild(photo);
        if (previous) {
            if (animate) setTimeout(function () { removeElement(previous); }, duration);
            else removeElement(previous);
        }
        return photo;
    }

    function paintBackdrop(surface, image, animate) {
        if (surface.url === image.src) return;
        surface.photo = appendPhoto(surface.art, image, animate, surface.photo, 400);
        surface.art.classList.add('lampa-cinema-art-ready');
        surface.url = image.src;

        if (surface.ambient.classList.contains('lampa-cinema-ambient--ready')) return;
        // Only a small map of the frame's colors is used beyond the hero.
        try {
            var canvas = surface.canvas;
            var context = canvas.getContext('2d');
            var swatches = document.createElement('canvas');
            swatches.width = 4;
            swatches.height = 3;
            var sampler = swatches.getContext('2d');
            if (!context || !sampler) return;
            sampler.imageSmoothingQuality = 'high';
            sampler.drawImage(image, 0, 0, swatches.width, swatches.height);
            context.imageSmoothingEnabled = true;
            // Place the outer sample centers at the edges of the finished gradient.
            var stepX = canvas.width / (swatches.width - 1);
            var stepY = canvas.height / (swatches.height - 1);
            context.drawImage(swatches, -stepX / 2, -stepY / 2, stepX * swatches.width, stepY * swatches.height);
            surface.ambient.classList.add('lampa-cinema-ambient--ready');
        } catch (error) {
            // The CSS gradient is the fallback on devices without canvas support.
        }
    }

    function mediaStrings() {
        var options = {
            ru: ['Медиа', 'Фото', 'Видео', 'Слайды', 'Трейлер не найден', 'Для слайдов нужен ещё один кадр'],
            uk: ['Медіа', 'Фото', 'Відео', 'Слайди', 'Трейлер не знайдено', 'Для слайдів потрібен ще один кадр'],
            en: ['Media', 'Photo', 'Video', 'Slides', 'No trailer is available', 'No other stills are available']
        };
        return options[languageCode(setting('language'))] || options.ru;
    }

    function requestTitleMedia(card, object, part, params, done) {
        var api = Lampa.Api && Lampa.Api.sources && Lampa.Api.sources.tmdb;
        if (!api || typeof api.get !== 'function' || !/^[1-9]\d*$/.test(String(card.id || ''))) return done(null);
        var method = object && object.method;
        if (method !== 'movie' && method !== 'tv') {
            method = card.media_type === 'tv' || card.first_air_date || (card.name && !card.title) ? 'tv' : 'movie';
        }
        try {
            api.get(method + '/' + card.id + '/' + part, params, done, function () { done(null); }, { life: 1440 });
        } catch (problem) {
            done(null);
        }
    }

    function trailerFor(videos, card) {
        var list = videos && videos.results;
        if (!Array.isArray(list)) return null;
        var language = mediaLanguage(card);
        var best = null;
        var bestScore = -1;
        list.forEach(function (clip) {
            if (!clip) return;
            var youtube = clip.youtube !== false && (!clip.site || /^youtube$/i.test(clip.site)) &&
                typeof clip.key === 'string' && /^[A-Za-z0-9_-]{11}$/.test(clip.key);
            var direct = typeof clip.url === 'string' && /^https?:\/\/[^\s]+\.(mp4|m3u8|webm)(?:[?#].*)?$/i.test(clip.url);
            if (!youtube && !direct) return;
            var score = /^trailer$/i.test(clip.type) ? 100 : /^teaser$/i.test(clip.type) ? 50 : 0;
            var locale = languageCode(clip.iso_639_1);
            score += locale === language ? 30 : locale === 'en' ? 20 : 0;
            if (clip.official) score += 5;
            if (score <= bestScore) return;
            bestScore = score;
            best = {
                id: clip.key,
                title: card.title || card.name || (typeof clip.name === 'string' ? clip.name : ''),
                youtube: youtube,
                url: youtube ? 'https://www.youtube.com/watch?v=' + clip.key : clip.url
            };
        });
        return best;
    }

    function setActiveMedia(media) {
        if (activeMedia === media) return;
        if (activeMedia) activeMedia.setActive(false);
        activeMedia = media;
        if (media) media.setActive(true);
    }

    function mountWatchActions(hero, buttons, canUse) {
        if (window.lampa_settings && window.lampa_settings.read_only) return;
        var language = languageCode(setting('language'));
        var words = {
            ru: ['Смотреть', 'Действия', 'Все источники', 'Закладки', 'Реакции', 'Подписка', 'Ещё'],
            uk: ['Дивитися', 'Дії', 'Усі джерела', 'Закладки', 'Реакції', 'Підписка', 'Ще'],
            en: ['Watch', 'Actions', 'All sources', 'Bookmarks', 'Reactions', 'Subscribe', 'More']
        };
        var labels = words[language] || words.ru;
        var controller = Lampa.Controller;
        var row = document.createElement('div');
        row.className = 'lampa-cinema-watch-row';
        row.hidden = true;
        var watch = document.createElement('div');
        watch.className = 'full-start__button selector lampa-cinema-watch';
        watch.setAttribute('role', 'button');
        watch.textContent = labels[0];
        row.appendChild(watch);
        // Keep the watch control first in Lampa's selector collection and last in the visual layout.
        hero.insertBefore(row, hero.firstChild);
        var shown = false;
        var focused = false;
        var rightDown = false;
        var holdTimer;
        var observer;

        function usableControl(control) {
            return control.classList.contains('selector') && !control.classList.contains('hide') &&
                !control.hidden && !control.disabled && control.getAttribute('aria-disabled') !== 'true';
        }

        function isBwa(control) {
            var name = [control.className, control.textContent, control.getAttribute('aria-label'),
                control.getAttribute('title')].join(' ');
            return /(?:^|[^a-z0-9])bwa(?:rc|js|online)?(?![a-z0-9])/i.test(name);
        }

        function findControls() {
            var primary = Array.prototype.filter.call(buttons.children, usableControl);
            var providerList = hero.querySelector('.buttons--container');
            var providers = providerList ? Array.prototype.filter.call(providerList.children, usableControl) : [];
            var nativeWatch = primary.filter(function (control) {
                return control.classList.contains('button--play') || control.classList.contains('button--tv-play');
            })[0];
            return {
                primary: primary,
                watch: nativeWatch,
                bwa: providers.concat(primary).filter(isBwa)[0]
            };
        }

        function syncWatch() {
            var found = findControls();
            var visible = Boolean(found.bwa || found.watch);
            if (visible === shown) return;
            shown = visible;
            row.hidden = !visible;
            if (visible) {
                hero.classList.add('lampa-cinema-watch-active');
                buttons.classList.add('lampa-cinema-native-actions-hidden');
            } else {
                hero.classList.remove('lampa-cinema-watch-active');
                buttons.classList.remove('lampa-cinema-native-actions-hidden');
            }
        }

        function trigger(control) {
            if (!control || !hero.contains(control) || !usableControl(control)) return;
            if (Lampa.Utils && typeof Lampa.Utils.trigger === 'function') {
                Lampa.Utils.trigger(control, 'hover:enter');
            } else {
                var event = document.createEvent('Event');
                event.initEvent('hover:enter', false, true);
                control.dispatchEvent(event);
            }
        }

        function openActions() {
            if (!shown || !canUse()) return;
            var active = controller.enabled && controller.enabled();
            var returnTo = active && active.name || 'full_start';
            if (returnTo !== 'full_start' && returnTo !== 'content') return;
            var controls = findControls();
            var items = [];
            controls.primary.forEach(function (control) {
                if (isBwa(control) || control.classList.contains('button--priority')) return;
                var name;
                if (control === controls.watch) {
                    if (!controls.bwa) return;
                    name = labels[2];
                } else {
                    name = (control.getAttribute('aria-label') || control.textContent || control.getAttribute('title') || '').trim();
                    if (!name && control.classList.contains('button--book')) name = labels[3];
                    if (!name && control.classList.contains('button--reaction')) name = labels[4];
                    if (!name && control.classList.contains('button--subscribe')) name = labels[5];
                    if (!name && control.classList.contains('button--options')) name = labels[6];
                }
                if (!name) return;
                var entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
                items.push({ title: name.replace(/[&<>]/g, function (character) { return entities[character]; }), control: control });
            });
            if (!items.length) return;

            function restoreFocus() {
                controller.toggle(returnTo);
                if (shown && typeof controller.collectionFocus === 'function') controller.collectionFocus(watch, hero);
            }
            Lampa.Select.show({
                title: labels[1],
                items: items,
                onBack: function () { if (canUse()) restoreFocus(); },
                onSelect: function (item) {
                    if (!canUse()) return;
                    restoreFocus();
                    trigger(item.control);
                }
            });
        }

        function play() {
            if (!canUse()) return;
            var controls = findControls();
            trigger(controls.bwa || controls.watch);
        }

        function trackFocus(event) {
            focused = event.target === watch;
        }

        function isRight(event) {
            return event.key === 'ArrowRight' || event.key === 'Right' || event.keyCode === 39 || event.keyCode === 5;
        }

        function releaseRight() {
            clearTimeout(holdTimer);
            rightDown = false;
        }

        function keydown(event) {
            if (!isRight(event)) return releaseRight();
            if (!shown || !canUse() || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
                !(focused || watch.classList.contains('focus'))) return;
            var active = controller.enabled && controller.enabled();
            if (active && active.name !== 'full_start' && active.name !== 'content') return;
            event.preventDefault();
            if (rightDown) return;
            rightDown = true;
            holdTimer = setTimeout(function () {
                if (focused || watch.classList.contains('focus')) openActions();
            }, 550);
        }

        function keyup(event) {
            if (isRight(event)) releaseRight();
        }

        watch.addEventListener('hover:enter', play);
        watch.addEventListener('hover:long', openActions);
        document.addEventListener('hover:focus', trackFocus, true);
        window.addEventListener('keydown', keydown, true);
        window.addEventListener('keyup', keyup, true);
        window.addEventListener('blur', releaseRight);
        if (typeof MutationObserver === 'function') {
            observer = new MutationObserver(syncWatch);
            observer.observe(hero, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden', 'aria-disabled'] });
        }
        syncWatch();

        return function () {
            releaseRight();
            if (observer) observer.disconnect();
            document.removeEventListener('hover:focus', trackFocus, true);
            window.removeEventListener('keydown', keydown, true);
            window.removeEventListener('keyup', keyup, true);
            window.removeEventListener('blur', releaseRight);
            hero.classList.remove('lampa-cinema-watch-active');
            buttons.classList.remove('lampa-cinema-native-actions-hidden');
            removeElement(row);
        };
    }

    function mountMediaControls(hero, surface, card, data, object, current) {
        var buttons = hero.querySelector('.full-start-new__buttons, .full-start__buttons');
        if (!buttons || !Lampa.Select || typeof Lampa.Select.show !== 'function' || !Lampa.Controller) return;
        var label = mediaStrings();
        var button = document.createElement('div');
        button.className = 'full-start__button selector lampa-cinema-media-button';
        button.setAttribute('aria-label', label[0]);
        button.setAttribute('title', label[0]);
        button.setAttribute('role', 'button');
        var icon = document.createElement('i');
        icon.className = 'lampa-cinema-media-icon';
        icon.setAttribute('aria-hidden', 'true');
        var caption = document.createElement('span');
        caption.textContent = label[0];
        button.appendChild(icon);
        button.appendChild(caption);
        buttons.appendChild(button);

        var mode = 'photo';
        var atTop = true;
        var active = false;
        var timer;
        var loadingImage;
        var slideLayer;
        var slidePhoto;
        var slideUrl;
        var slideIndex = -1;
        var misses = 0;
        var action = 0;
        var paths;
        var knownTrailer = trailerFor(data && data.videos, card);
        var cleanupWatch = mountWatchActions(hero, buttons, function () { return active && current(); });

        function note(message) {
            if (Lampa.Noty && Lampa.Noty.show) Lampa.Noty.show(message);
        }

        function updatePaths(pictures) {
            var extra = wideBackdrops(pictures);
            var clean = extra.filter(function (image) { return !image.iso_639_1; });
            paths = [card.backdrop_path || card.background_image].concat((clean.length > 1 ? clean : extra).map(function (image) {
                return image.file_path;
            })).filter(function (path, index, list) {
                return path && list.indexOf(path) === index && backdropSizes(path).length;
            }).slice(0, 12);
        }
        updatePaths((card.images || (data && data.images) || {}).backdrops);

        function stopRotation() {
            clearTimeout(timer);
            timer = null;
            if (loadingImage) loadingImage.onload = loadingImage.onerror = null;
            loadingImage = null;
        }

        function mayRotate() {
            return active && atTop && mode === 'slides' && current();
        }

        function queueFrame() {
            if (!mayRotate() || timer || loadingImage || paths.length < 2 || misses >= paths.length) return;
            if (document.hidden || (Lampa.Player && Lampa.Player.opened && Lampa.Player.opened())) {
                timer = setTimeout(function () { timer = null; queueFrame(); }, 1500);
                return;
            }
            var lastUrl = slideUrl || surface.url;
            var list;
            for (var i = 0; i < paths.length; i++) {
                slideIndex = (slideIndex + 1) % paths.length;
                list = backdropSizes(paths[slideIndex]);
                if (list.indexOf(lastUrl) === -1) break;
            }
            var began = Date.now();
            var image = loadingImage = new Image();
            image.decoding = 'async';
            loadFirstImage(image, list, function (result) {
                if (loadingImage !== image) return;
                loadingImage = null;
                if (!mayRotate()) return;
                if (result < 0) misses++;
                else misses = 0;
                timer = setTimeout(function () {
                    timer = null;
                    if (!mayRotate()) return;
                    if (result >= 0 && !document.hidden && !(Lampa.Player && Lampa.Player.opened && Lampa.Player.opened())) {
                        if (!slideLayer) {
                            slideLayer = document.createElement('div');
                            slideLayer.className = 'lampa-cinema-slides';
                            surface.art.appendChild(slideLayer);
                        }
                        slidePhoto = appendPhoto(slideLayer, image, true, slidePhoto, 680);
                        slideUrl = image.src;
                        surface.art.classList.add('lampa-cinema-art-ready');
                    }
                    queueFrame();
                }, result < 0 ? 1400 : Math.max(0, 5000 - (Date.now() - began)));
            });
        }

        function setMode(value) {
            stopRotation();
            mode = value;
            misses = 0;
            surface.art.classList.add('lampa-cinema-media-selected');
            if (value === 'photo') {
                removeElement(slideLayer);
                slideLayer = slidePhoto = slideUrl = null;
                slideIndex = -1;
                if (!surface.photo) surface.art.classList.remove('lampa-cinema-art-ready');
            } else queueFrame();
        }

        function openMenu() {
            var controller = Lampa.Controller.enabled && Lampa.Controller.enabled();
            var returnTo = controller && controller.name || 'full_start';
            var features = window.lampa_settings && window.lampa_settings.disable_features;
            var permit = Lampa.Account && Lampa.Account.Permit;
            var media = [
                { title: label[1], id: 'photo', selected: mode === 'photo' },
                { title: label[2], id: 'video', hide: Boolean((features && features.trailers) || (permit && permit.child)) },
                { title: label[3], id: 'slides', selected: mode === 'slides' }
            ];
            Lampa.Select.show({
                title: label[0],
                items: media,
                onBack: function () { Lampa.Controller.toggle(returnTo); },
                onSelect: function (item) {
                    if (!current() || item.hide) return;
                    if (Lampa.Activity && Lampa.Activity.mixState) Lampa.Activity.mixState();
                    Lampa.Controller.toggle(returnTo);
                    var ticket = ++action;
                    if (item.id === 'photo') return setMode('photo');
                    if (item.id === 'slides') {
                        setMode('slides');
                        if (paths.length > 1) return;
                        requestTitleMedia(card, object, 'images', { filter: { include_image_language: 'null,en' } }, function (images) {
                            if (!current() || ticket !== action || mode !== 'slides') return;
                            updatePaths(images && images.backdrops);
                            if (paths.length > 1) queueFrame();
                            else {
                                setMode('photo');
                                if (active) note(label[5]);
                            }
                        });
                        return;
                    }

                    function playTrailer(trailer) {
                        if (!current() || !active || ticket !== action) return;
                        if (!trailer || !Lampa.Player || typeof Lampa.Player.play !== 'function') return note(label[4]);
                        setMode('photo');
                        Lampa.Player.play(trailer);
                    }
                    if (knownTrailer) playTrailer(knownTrailer);
                    else requestTitleMedia(card, object, 'videos', { langs: 'en' }, function (clips) {
                        knownTrailer = trailerFor(clips, card);
                        playTrailer(knownTrailer);
                    });
                }
            });
        }

        button.addEventListener('hover:enter', openMenu);
        return {
            setActive: function (value) {
                active = value;
                if (active) queueFrame();
                else {
                    action++;
                    stopRotation();
                }
            },
            setAtTop: function (value) {
                if (atTop === value) return;
                atTop = value;
                if (atTop) queueFrame();
                else stopRotation();
            },
            destroy: function () {
                active = false;
                action++;
                stopRotation();
                if (cleanupWatch) cleanupWatch();
                removeElement(slideLayer);
                removeElement(button);
            }
        };
    }

    function mountRatings(hero, title, card, data) {
        var panel = document.createElement('div');
        panel.className = 'lampa-cinema-ratings';
        var stockReactions = hero.querySelector('.full-start-new__reactions, .full-start__reactions');
        var moved = [];
        var observer;

        function bringLeft(node) {
            if (!node || !node.parentNode) return;
            moved.push({ node: node, parent: node.parentNode, next: node.nextSibling });
            panel.appendChild(node);
        }

        var scores = hero.querySelector('.tv-main-rate') ||
            hero.querySelector('.full-start-new__rate-line, .full-start__rate-line');
        bringLeft(scores);
        if (!scores) {
            var imdb = parseFloat(String(card.imdb_rating || '').replace(',', '.'));
            var tmdb = parseFloat(card.vote_average);
            var score = imdb > 0 ? imdb : tmdb;
            if (isFinite(score) && score > 0) {
                var badge = document.createElement('span');
                badge.className = 'lampa-cinema-score';
                badge.textContent = (imdb > 0 ? 'IMDb ' : 'TMDB ') + Math.min(10, score).toFixed(1);
                panel.appendChild(badge);
            }
        }

        var referenceMeter = hero.querySelector('.tv-new-rating');
        bringLeft(referenceMeter);
        var features = window.lampa_settings && window.lampa_settings.disable_features;
        if (!referenceMeter && data && data.reactions && !(features && features.reactions) &&
                !settingIsOff(setting('card_interfice_reactions'))) {
            var summary = document.createElement('div');
            summary.className = 'lampa-cinema-reaction-summary';
            var positive = document.createElement('span');
            var track = document.createElement('span');
            track.className = 'lampa-cinema-reaction-track';
            track.setAttribute('aria-hidden', 'true');
            var fill = document.createElement('span');
            fill.className = 'lampa-cinema-reaction-fill';
            track.appendChild(fill);
            var negative = document.createElement('span');
            var count = document.createElement('span');
            count.className = 'lampa-cinema-reaction-count';
            summary.appendChild(positive);
            summary.appendChild(track);
            summary.appendChild(negative);
            summary.appendChild(count);
            panel.appendChild(summary);

            function syncReactions() {
                var list = data.reactions.result;
                var favor = 0;
                var against = 0;
                var total = 0;
                (Array.isArray(list) ? list : []).forEach(function (entry) {
                    if (!entry) return;
                    var quantity = Number(entry.counter);
                    if (!isFinite(quantity) || quantity <= 0) return;
                    switch (entry.type) {
                        case 'fire': favor += 2 * quantity; break;
                        case 'nice': favor += quantity; break;
                        case 'bore': against += quantity; break;
                        case 'shit': against += 2 * quantity; break;
                        case 'think': break;
                        default: return;
                    }
                    total += quantity;
                });
                summary.hidden = !total;
                panel.hidden = !total && panel.children.length === 1;
                if (!total) return;
                var percentage = favor + against ? Math.round(100 * favor / (favor + against)) : 50;
                positive.textContent = percentage + '%';
                negative.textContent = (100 - percentage) + '%';
                fill.style.width = percentage + '%';
                count.textContent = Lampa.Utils && Lampa.Utils.numberWithSpaces ? Lampa.Utils.numberWithSpaces(total) : String(total);
            }

            syncReactions();
            if (stockReactions && typeof MutationObserver === 'function') {
                observer = new MutationObserver(syncReactions);
                observer.observe(stockReactions, { childList: true, subtree: true, characterData: true });
            }
        }

        if (!panel.children.length && !stockReactions) return;
        if (stockReactions) stockReactions.classList.add('lampa-cinema-reactions-hidden');
        if (panel.children.length) {
            var column = title.parentNode;
            var slot = stockReactions && stockReactions.parentNode === column ? stockReactions : title.nextSibling;
            column.insertBefore(panel, slot || null);
        }
        return function () {
            if (observer) observer.disconnect();
            if (stockReactions) stockReactions.classList.remove('lampa-cinema-reactions-hidden');
            moved.forEach(function (item) {
                item.parent.insertBefore(item.node, item.next && item.next.parentNode === item.parent ? item.next : null);
            });
            removeElement(panel);
        };
    }

    function closeOpening(slide, opening) {
        if (slide[openingKey] !== opening) return;
        clearTimeout(opening.timer);
        if (opening.observer) opening.observer.disconnect();
        if (opening.detachPreview) opening.detachPreview();
        removeElement(opening.element);
        slide.classList.remove('lampa-cinema-activity');
        delete slide[openingKey];
    }

    function scheduleOpeningClose(slide, opening) {
        if (opening.timer) return;
        opening.timer = setTimeout(function () {
            opening.timer = null;
            if (!slide.classList.contains('activity--load')) closeOpening(slide, opening);
        }, 380);
    }

    function warmLogo(card, image) {
        var url = Lampa.CinemaCard.preferredLogoUrl(card);
        return image && image.src === url ? image : startPreview(url);
    }

    function handleCinemaActivity(event) {
        if (!event) return;
        if (event.component !== 'full') {
            if (event.type === 'start') setActiveMedia(null);
            return;
        }
        var object = event.object;
        var slide = activityNode(object);
        if (event.type === 'start') setActiveMedia(slide && slide[mediaKey] || null);
        if (!slide || !slide.querySelector('.activity__body')) return;

        var existing = slide[openingKey];
        if (event.type === 'destroy' || event.type === 'archive') {
            if (existing) closeOpening(slide, existing);
            if (event.type === 'destroy') slide.classList.remove('lampa-cinema-managed-background');
            if (event.type === 'destroy' && slide[scrollCleanupKey]) {
                slide[scrollCleanupKey]();
                delete slide[scrollCleanupKey];
            }
            return;
        }
        var startedLoading = (event.type === 'create' || event.type === 'start') &&
            slide.classList.contains('activity--load');
        if (existing || (event.type !== 'init' && !startedLoading)) return;

        var layer = document.createElement('div');
        layer.className = 'lampa-cinema-opening';
        var surface = createSurface();
        mountSurface(layer, surface);
        var progress = document.createElement('div');
        progress.className = 'lampa-cinema-progress';
        progress.setAttribute('role', 'progressbar');
        var labels = { ru: 'Открывается карточка', uk: 'Відкривається картка', en: 'Opening card' };
        progress.setAttribute('aria-label', labels[languageCode(setting('language'))] || labels.en);
        layer.appendChild(progress);
        var opening = slide[openingKey] = { element: layer, surface: surface };
        slide.insertBefore(layer, slide.firstChild);
        slide.classList.add('lampa-cinema-activity');

        if (typeof MutationObserver === 'function') {
            opening.observer = new MutationObserver(function () {
                if (!slide.classList.contains('activity--load') && slide.classList.contains('activity--active')) {
                    scheduleOpeningClose(slide, opening);
                }
            });
            opening.observer.observe(slide, { attributes: true, attributeFilter: ['class'] });
        }

        var card = object && (object.card || object.movie);
        var permit = Lampa.Account && Lampa.Account.Permit;
        if (!card || card.blocked || card.adult || card.lgbt || (permit && permit.child)) return;

        var assets = preloadedAssets(object, card);
        opening.paths = [card.backdrop_path, card.background_image];
        opening.preview = assets && assets.preview || startPreview(previewUrl(card, 'w780'));
        opening.logo = warmLogo(card, assets && assets.logo);
        opening.detachPreview = watchImage(opening.preview, function (image) {
            if (image && slide[openingKey] === opening) paintBackdrop(surface, image, true);
        });
    }

    function sameFrameUpgrades(paths, displayed) {
        // A sharp version of the same composition can replace the preview without a scene cut.
        for (var i = 0; i < paths.length; i++) {
            var path = paths[i];
            var medium = assetUrl(path, 'w1280');
            if (displayed !== medium && displayed !== assetUrl(path, 'w780')) continue;
            var original = window.innerWidth >= 1000 ? assetUrl(path, 'original') : '';
            return [original, medium].filter(function (url, index, list) {
                return url && url !== displayed && list.indexOf(url) === index;
            });
        }
        return [];
    }

    function removePreviousCard(state) {
        if (state.cleanup) state.cleanup();
        removeElement(state.surface.art);
        removeElement(state.surface.ambient);
        if (state.titleSlot && state.titleSlot.parentNode) {
            state.titleSlot.parentNode.insertBefore(state.title, state.titleSlot);
            removeElement(state.titleSlot);
        }
        state.hero.classList.remove('lampa-cinema-hero');
        state.title.classList.remove('lampa-cinema-title', 'lampa-cinema-title-long');
        state.title.removeAttribute('data-cinema-type');
    }

    function renderCinemaCard(event) {
        if (!event) return;
        var object = event.object;
        var card = (event.data && event.data.movie) || (object && object.card);
        if (!card) return;

        var slide = activityNode(object);
        var opening = slide && slide[openingKey];
        if (event.type === 'start') {
            if (opening) {
                var logoAssets = preloadedAssets(object, card);
                opening.logo = warmLogo(card, (logoAssets && logoAssets.logo) || opening.logo);
            }
            return;
        }
        if (event.type !== 'complite' && event.type !== 'complete') return;

        var activity = object && object.activity;
        var component = event.link;
        if (!component && activity) {
            component = typeof activity.component === 'function' ? activity.component() : activity.component;
        }
        // Lampa 2 sends full:complite without body or link.
        var root = nodeOf(event.body) ||
            (component && typeof component.render === 'function' && nodeOf(component.render(true))) ||
            (slide && slide.querySelector('.activity__body'));
        var hero = root && (root.querySelector('.full-start-new') || root.querySelector('.full-start'));
        var title = hero && hero.querySelector('.full-start-new__title, .full-start__title');
        if (!title) return;

        var previous = root[stateKey];
        if (previous && previous.hero === hero && previous.card === card) return;
        if (previous) removePreviousCard(previous);

        if (slide && slide[scrollCleanupKey]) slide[scrollCleanupKey]();
        var surface = createSurface();
        var state = root[stateKey] = { card: card, hero: hero, title: title, surface: surface };
        root.classList.add('lampa-cinema-page');
        (slide || root).classList.add('lampa-cinema-managed-background');
        hero.classList.add('lampa-cinema-hero');
        mountSurface(root, surface, hero);
        title.classList.add('lampa-cinema-title');
        title.setAttribute('data-cinema-type', titleType(card));
        if (title.textContent.trim().length > 38) title.classList.add('lampa-cinema-title-long');
        var cleanupRatings = mountRatings(hero, title, card, event.data);
        var media = mountMediaControls(hero, surface, card, event.data, object, current);
        var cleanupScroll = followCardScroll(root, surface, component, hero, media);
        state.cleanup = function () {
            if (state.stopped) return;
            state.stopped = true;
            if (cleanupScroll) cleanupScroll();
            if (cleanupRatings) cleanupRatings();
            if (media) {
                if (activeMedia === media) setActiveMedia(null);
                media.destroy();
                if (slide && slide[mediaKey] === media) delete slide[mediaKey];
            }
        };
        if (slide) {
            slide[scrollCleanupKey] = state.cleanup;
            slide[mediaKey] = media;
        }
        if (media) {
            var visibleActivity = Lampa.Activity && Lampa.Activity.active && Lampa.Activity.active();
            if (!visibleActivity || (object && visibleActivity.activity === object.activity)) setActiveMedia(media);
        }

        if (opening) {
            // Keep the same backdrop under the native body's opacity transition.
            opening.element.classList.add('lampa-cinema-opening--handoff');
            scheduleOpeningClose(slide, opening);
        }

        var assets = preloadedAssets(object, card);
        var language = mediaLanguage(card);
        var logos = logoChoices(card, language);
        var preview = (opening && opening.preview) || (assets && assets.preview);
        if (!preview && opening) preview = startPreview(previewUrl(card, 'w780'));
        var backdrops = backdropChoices(card);
        if (!preview && previewUrl(card) !== backdrops[0]) preview = startPreview(previewUrl(card));

        function current() {
            return !state.stopped && root[stateKey] === state && root.contains(hero) && hero.contains(title);
        }

        if (logos.length) {
            var slot = state.titleSlot = document.createElement('div');
            slot.className = 'lampa-cinema-title-slot';
            title.parentNode.insertBefore(slot, title);
            slot.appendChild(title);
            var preferred = (opening && opening.logo) || (assets && assets.logo);

            function showLogo(image, info) {
                if (!current()) return;
                var brand = document.createElement('div');
                brand.className = 'lampa-cinema-brand';
                brand.setAttribute('aria-hidden', 'true');
                image.className = 'lampa-cinema-logo';
                image.alt = '';
                brand.appendChild(image);
                var text = title.textContent.trim();
                var originalTitle = card.original_title || card.original_name;
                if (info.language !== language && text !== originalTitle) {
                    var caption = document.createElement('div');
                    caption.className = 'lampa-cinema-title-caption';
                    caption.textContent = text;
                    brand.classList.add('lampa-cinema-brand--translated');
                    brand.appendChild(caption);
                }
                slot.appendChild(brand);
                slot.classList.add('lampa-cinema-title-slot--branded');
            }

            function loadLogo(from) {
                var logo = new Image();
                loadFirstImage(logo, logos.slice(from).map(function (item) { return item.url; }), function (index) {
                    if (index !== -1) showLogo(logo, logos[from + index]);
                });
            }

            if (preferred && preferred.src === logos[0].url) {
                watchImage(preferred, function (image) {
                    if (!current()) return;
                    if (image) showLogo(image.parentNode ? image.cloneNode(false) : image, logos[0]);
                    else loadLogo(1);
                });
            } else loadLogo(0);
        }

        watchImage(preview, function (image) {
            if (!current()) return;
            var choices = backdrops;
            if (image) {
                var alreadyVisible = opening && opening.surface.url === image.src;
                paintBackdrop(surface, image, !alreadyVisible);
                var paths = bestBackdropPaths(card).concat(opening && opening.paths || []);
                choices = sameFrameUpgrades(paths, image.src);
            }
            if (!choices.length) return;
            var backdrop = new Image();
            loadFirstImage(backdrop, choices, function (index) {
                if (index !== -1 && current()) paintBackdrop(surface, backdrop, true);
            });
        });
    }
}());
