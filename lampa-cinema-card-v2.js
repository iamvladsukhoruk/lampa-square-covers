// Lampa TV — киноэкран с цветовым градиентом и затемнением последних двух секций.
(function () {
    'use strict';

    var Lampa = window.Lampa;
    var styleId = 'lampa-cinema-card-style';
    var stateKey = '__lampaCinemaCard';
    var openingKey = '__lampaCinemaOpening';
    var scrollCleanupKey = '__lampaCinemaScrollCleanup';
    var backgroundSetting = 'lampa_cinema_background';
    var backgroundAttribute = 'data-lampa-cinema-background';
    if (!Lampa || !Lampa.Listener || document.getElementById(styleId)) return;

    var style = document.createElement('style');
    style.id = styleId;
    style.textContent = [
        '.lampa-cinema-page, .lampa-cinema-opening { background: #000; }',
        '.lampa-cinema-page { position: relative; z-index: 0; }',
        '.lampa-cinema-surface > .lampa-cinema-art, .lampa-cinema-surface > .lampa-cinema-ambient {',
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
        '    background: linear-gradient(to bottom, rgba(0,0,0,.60), rgba(0,0,0,.27)),',
        '                radial-gradient(ellipse at 74% 40%, transparent 16%, rgba(0,0,0,.30) 100%);',
        '}',
        '.lampa-cinema-section-shade {',
        '    position: absolute; z-index: 1; top: 0; left: 0; right: 0; visibility: hidden;',
        '    background: linear-gradient(to bottom, transparent, rgba(0,0,0,.30) 36%, rgba(0,0,0,.78) 74%, #000);',
        '}',
        '.lampa-cinema-section-shade:after {',
        '    content: ""; position: absolute; top: 100%; right: 0; left: 0; height: 100vh; height: 100dvh; background: #000;',
        '}',
        '.lampa-cinema-section-shade--tv { transition: transform .3s ease; }',
        '.lampa-cinema-surface > .lampa-cinema-art {',
        '    z-index: -1; opacity: 1;',
        '    -webkit-mask-image: linear-gradient(to bottom, #000 63%, transparent 100%);',
        '    mask-image: linear-gradient(to bottom, #000 63%, transparent 100%);',
        '    transition: opacity .3s ease;',
        '}',
        '.lampa-cinema-photo {',
        '    position: absolute; top: 0; right: 0; bottom: 0; left: 0; background: center 42% / cover no-repeat;',
        '}',
        '.lampa-cinema-photo--appear { animation: lampa-cinema-reveal .38s ease-out both; }',
        '@keyframes lampa-cinema-reveal { from { opacity: 0; } to { opacity: 1; } }',
        '.lampa-cinema-art:after {',
        '    background: linear-gradient(to bottom, transparent 40%, rgba(0,0,0,.22) 59%, rgba(0,0,0,.68) 85%, #000 100%),',
        '                linear-gradient(to right, rgba(0,0,0,.58), rgba(0,0,0,.15) 43%, transparent 74%);',
        '}',
        '.lampa-cinema-surface > .lampa-cinema-art:not(.lampa-cinema-art-ready),',
        '[data-lampa-cinema-background="gradient"] .lampa-cinema-surface > .lampa-cinema-art,',
        '[data-lampa-cinema-background="black"] .lampa-cinema-surface > .lampa-cinema-art { visibility: hidden; }',
        '[data-lampa-cinema-background="black"] .lampa-cinema-surface > .lampa-cinema-ambient { background: #000; }',
        '[data-lampa-cinema-background="black"] .lampa-cinema-ambient canvas,',
        '[data-lampa-cinema-background="black"] .lampa-cinema-ambient:after { display: none; }',
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
        '.lampa-cinema-page .full-start__background,',
        '.lampa-cinema-page .full-start-new__background { visibility: hidden; }',
        '.lampa-cinema-page > .scroll.scroll--mask { -webkit-mask-image: none; mask-image: none; }',
        '.lampa-cinema-page .lampa-cinema-hero {',
        '    box-sizing: border-box; position: relative; display: flex; flex-direction: column;',
        '    justify-content: flex-end; min-height: 78vh;',
        '    min-height: calc(100vh - 6em); min-height: calc(100dvh - 6em);',
        '    width: 100%; padding: 2em 4.2vw 2.6em; color: #f9f4ec;',
        '}',
        '.lampa-cinema-hero .full-start-new__body, .lampa-cinema-hero .full-start__body {',
        '    display: block; width: 100%; height: auto; min-height: 0;',
        '}',
        '.lampa-cinema-hero .full-start-new__left, .lampa-cinema-hero .full-start__left { display: none; }',
        '.lampa-cinema-hero .full-start-new__right, .lampa-cinema-hero .full-start__right {',
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
        '.lampa-cinema-hero .full-start-new__reactions { margin-bottom: .7em; }',
        '@media (max-width: 790px) {',
        '    .lampa-cinema-page .lampa-cinema-hero {',
        '        min-height: calc(100vh - 9em); min-height: calc(100dvh - 9em); padding: 2em 1.3em 1.6em;',
        '    }',
        '    .lampa-cinema-hero .full-start-new__title, .lampa-cinema-hero .full-start__title { font-size: 2.65em; }',
        '    .lampa-cinema-hero .lampa-cinema-title-long { font-size: 2.2em; }',
        '    .lampa-cinema-title-slot { min-height: 6.5em; }',
        '    .lampa-cinema-logo { max-height: 6.3em; }',
        '    .lampa-cinema-brand--translated .lampa-cinema-logo { max-height: 4.5em; }',
        '}',
        '@media (prefers-reduced-motion: reduce) {',
        '    .lampa-cinema-surface > .lampa-cinema-art, .lampa-cinema-section-shade--tv,',
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

    updateBackgroundMode(setting(backgroundSetting));
    if (window.appready) addBackgroundSetting();
    else Lampa.Listener.follow('app', function (event) {
        if (event.type === 'ready') addBackgroundSetting();
    });

    function setting(name) {
        return Lampa.Storage && Lampa.Storage.field && Lampa.Storage.field(name);
    }

    function updateBackgroundMode(mode) {
        document.documentElement.setAttribute(backgroundAttribute,
            mode === 'black' || mode === 'gradient' ? mode : 'picture');
    }

    function addBackgroundSetting() {
        if (!Lampa.SettingsApi || !Lampa.SettingsApi.addParam) return;
        var translations = {
            ru: ['Фон карточки', 'Чёрный', 'Кадр', 'Градиент'],
            uk: ['Тло картки', 'Чорний', 'Кадр', 'Градієнт'],
            en: ['Card background', 'Black', 'Backdrop', 'Gradient']
        };
        var text = translations[languageCode(setting('language'))] || translations.ru;
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: backgroundSetting, type: 'select', default: 'picture',
                values: { black: text[1], picture: text[2], gradient: text[3] }
            },
            field: { name: text[0] },
            onChange: updateBackgroundMode
        });
        updateBackgroundMode(setting(backgroundSetting));
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

    function bestBackdropPaths(card) {
        var pictures = card.images && card.images.backdrops;
        var paths = [card.backdrop_path, card.background_image];
        if (Array.isArray(pictures)) {
            var wide = pictures.filter(function (picture) {
                return picture && picture.file_path && Number(picture.aspect_ratio) >= 1.5;
            }).sort(function (a, b) {
                return Number(b.vote_average || 0) - Number(a.vote_average || 0) || b.width - a.width;
            });
            var clean = wide.filter(function (picture) {
                return !picture.iso_639_1 && Number(picture.width) >= 1600;
            });
            paths = clean.slice(0, 2).map(function (picture) { return picture.file_path; }).concat(paths);
            if (wide.length) paths.push(wide[0].file_path);
        }
        return paths.filter(function (path, index) { return path && paths.indexOf(path) === index; });
    }

    function backdropChoices(card) {
        var choices = [];
        var size = window.innerWidth >= 1000 ? 'original' : 'w1280';
        bestBackdropPaths(card).forEach(function (path) {
            [size, 'w1280', 'w780'].forEach(function (width) {
                var url = assetUrl(path, width);
                if (url && choices.indexOf(url) === -1) choices.push(url);
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
        var shade = document.createElement('div');
        shade.className = 'lampa-cinema-section-shade';
        ambient.appendChild(shade);
        return { art: art, ambient: ambient, canvas: canvas, shade: shade };
    }

    function mountSurface(root, surface) {
        root.classList.add('lampa-cinema-surface');
        root.insertBefore(surface.ambient, root.firstChild);
        root.insertBefore(surface.art, root.firstChild);
    }

    function followCardScroll(root, surface, component, hero) {
        var controller = component && component.scroll;
        var viewport = controller && typeof controller.render === 'function' && nodeOf(controller.render(true));
        if (!viewport || !root.contains(viewport)) viewport = root.querySelector('.scroll');
        if (!viewport) return;

        var content = viewport.querySelector('.scroll__content');
        var body = viewport.querySelector('.scroll__body');
        var movement;
        var layout;
        var fadeTop = null;

        function measureSections() {
            fadeTop = null;
            var moreRows = component && Array.isArray(component.items) && Array.isArray(component.rows) &&
                component.items.length < component.rows.length;
            var sections = body && !moreRows ? Array.prototype.filter.call(body.children, function (section) {
                return section.offsetHeight && section !== hero && !section.contains(hero);
            }) : [];
            if (sections.length) {
                var first = sections[Math.max(0, sections.length - 2)].getBoundingClientRect();
                var last = sections[sections.length - 1].getBoundingClientRect();
                var padding = content ? parseFloat(window.getComputedStyle(content).paddingTop) || 0 : 0;
                var viewportTop = viewport.getBoundingClientRect().top - surface.ambient.getBoundingClientRect().top;
                fadeTop = viewportTop + padding + first.top - body.getBoundingClientRect().top;
                surface.shade.style.height = Math.max(1, last.top + last.height * .92 - first.top) + 'px';
            }
            update();
        }

        function update() {
            var height = viewport.clientHeight;
            if (!height) return;
            var position = viewport.scrollTop || 0;
            var scroll = controller || viewport.Scroll;
            var transform = body && (body.style.transform || body.style.webkitTransform);
            if (transform && scroll && typeof scroll.position === 'function') {
                position = Math.abs(scroll.position());
            } else if (transform) {
                var translated = /translate3d\([^,]+,\s*(-?[\d.]+)px,/.exec(transform);
                if (translated) position = -Number(translated[1]);
            }
            var range = (content ? content.offsetHeight : viewport.scrollHeight) - height;
            var artworkDistance = Math.min(height * .84, range * .48);
            surface.art.style.opacity = artworkDistance > 0 ?
                1 - Math.min(1, Math.max(0, position / artworkDistance)) : 1;
            var showShade = fadeTop !== null && range > 0;
            surface.shade.style.visibility = showShade ? 'visible' : 'hidden';
            if (showShade) {
                surface.shade.classList[transform ? 'add' : 'remove']('lampa-cinema-section-shade--tv');
                surface.shade.style.transform = 'translate3d(0,' + (fadeTop - position) + 'px,0)';
            }
        }

        viewport.addEventListener('scroll', update);
        // Lampa translates the scroll body on TVs and scrolls natively on touch devices.
        if (body && typeof MutationObserver === 'function') {
            movement = new MutationObserver(function (changes) {
                if (Array.prototype.some.call(changes, function (change) { return change.type === 'childList'; })) {
                    measureSections();
                } else update();
            });
            movement.observe(body, { attributes: true, attributeFilter: ['style'], childList: true });
        }
        if (typeof ResizeObserver === 'function') {
            layout = new ResizeObserver(measureSections);
            layout.observe(viewport);
            if (content) layout.observe(content);
        }
        measureSections();

        return function () {
            viewport.removeEventListener('scroll', update);
            if (movement) movement.disconnect();
            if (layout) layout.disconnect();
        };
    }

    function removeElement(element) {
        if (element && element.parentNode) element.parentNode.removeChild(element);
    }

    function paintBackdrop(surface, image, animate) {
        if (surface.url === image.src) return;
        var previous = surface.photo;
        var photo = document.createElement('div');
        photo.className = animate ? 'lampa-cinema-photo lampa-cinema-photo--appear' : 'lampa-cinema-photo';
        photo.style.backgroundImage = 'url(' + JSON.stringify(image.src) + ')';
        surface.art.appendChild(photo);
        surface.art.classList.add('lampa-cinema-art-ready');
        surface.photo = photo;
        surface.url = image.src;
        if (previous) {
            if (animate) setTimeout(function () { removeElement(previous); }, 400);
            else removeElement(previous);
        }

        if (surface.ambient.classList.contains('lampa-cinema-ambient--ready')) return;
        // Interpolate four swatches into a soft field, even for images whose pixels cannot be read.
        try {
            var canvas = surface.canvas;
            var context = canvas.getContext('2d');
            var swatches = document.createElement('canvas');
            swatches.width = 2;
            swatches.height = 2;
            var sampler = swatches.getContext('2d');
            if (!context || !sampler) return;
            var width = image.naturalWidth;
            var height = image.naturalHeight;
            sampler.imageSmoothingQuality = 'high';
            sampler.drawImage(image, 0, 0, width * .72, height * .70, 0, 0, 1, 1);
            sampler.drawImage(image, width * .28, 0, width * .72, height * .70, 1, 0, 1, 1);
            sampler.drawImage(image, 0, height * .30, width * .72, height * .70, 0, 1, 1, 1);
            sampler.drawImage(image, width * .28, height * .30, width * .72, height * .70, 1, 1, 1, 1);
            context.imageSmoothingEnabled = true;
            // Place the four sample centers at the canvas corners so the blend spans the full field.
            context.drawImage(swatches, -canvas.width / 2, -canvas.height / 2, canvas.width * 2, canvas.height * 2);
            surface.ambient.classList.add('lampa-cinema-ambient--ready');
        } catch (error) {
            // The CSS gradient is the fallback on devices without canvas support.
        }
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
        if (!event || event.component !== 'full') return;
        var object = event.object;
        var slide = activityNode(object);
        if (!slide || !slide.querySelector('.activity__body')) return;

        var existing = slide[openingKey];
        if (event.type === 'destroy' || event.type === 'archive') {
            if (existing) closeOpening(slide, existing);
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
        if (state.stopFollowingScroll) state.stopFollowingScroll();
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

        var root = nodeOf(event.body);
        var hero = root && (root.querySelector('.full-start-new') || root.querySelector('.full-start'));
        var title = hero && hero.querySelector('.full-start-new__title, .full-start__title');
        if (!title) return;

        var previous = root[stateKey];
        if (previous && previous.hero === hero && previous.card === card) return;
        if (previous) removePreviousCard(previous);

        var surface = createSurface();
        var state = root[stateKey] = { card: card, hero: hero, title: title, surface: surface };
        mountSurface(root, surface);
        root.classList.add('lampa-cinema-page');
        hero.classList.add('lampa-cinema-hero');
        title.classList.add('lampa-cinema-title');
        title.setAttribute('data-cinema-type', titleType(card));
        if (title.textContent.trim().length > 38) title.classList.add('lampa-cinema-title-long');
        if (slide && slide[scrollCleanupKey]) slide[scrollCleanupKey]();
        state.stopFollowingScroll = followCardScroll(root, surface, event.link, hero);
        if (slide) slide[scrollCleanupKey] = state.stopFollowingScroll;

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
            return root[stateKey] === state && root.contains(hero) && hero.contains(title);
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
