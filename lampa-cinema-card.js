// Lampa TV — полноэкранное оформление карточек фильмов и сериалов.
(function () {
    'use strict';

    var Lampa = window.Lampa;
    var styleId = 'lampa-cinema-card-style';
    var stateKey = '__lampaCinemaCard';
    var backgroundSetting = 'lampa_cinema_background';
    var backgroundAttribute = 'data-lampa-cinema-background';
    if (!Lampa || !Lampa.Listener || document.getElementById(styleId)) return;

    var style = document.createElement('style');
    style.id = styleId;
    style.textContent = [
        '.lampa-cinema-page { position: relative; z-index: 0; }',
        '.lampa-cinema-page > .lampa-cinema-art, .lampa-cinema-page > .lampa-cinema-ambient {',
        '    position: absolute; top: -4em; right: 0; bottom: auto; left: 0;',
        '    width: 100%; height: 100vh; height: 100dvh; overflow: hidden; pointer-events: none;',
        '}',
        '.lampa-cinema-page > .lampa-cinema-ambient {',
        '    z-index: -2; background: linear-gradient(145deg, #202d3b, #0c1119 68%, #080c12);',
        '}',
        '.lampa-cinema-ambient canvas { width: 100%; height: 100%; display: block; image-rendering: auto; }',
        '.lampa-cinema-ambient:after, .lampa-cinema-art:after {',
        '    content: ""; position: absolute; top: 0; right: 0; bottom: 0; left: 0;',
        '}',
        '.lampa-cinema-ambient:after {',
        '    background: linear-gradient(148deg, rgba(8,12,18,.55), rgba(8,12,18,.72) 62%, rgba(8,12,18,.95));',
        '}',
        '.lampa-cinema-page > .lampa-cinema-art {',
        '    z-index: -1; opacity: 1; background: center 42% / cover no-repeat;',
        '    -webkit-mask-image: linear-gradient(#000 72%, transparent 100%);',
        '    mask-image: linear-gradient(#000 72%, transparent 100%);',
        '    transition: opacity .28s ease-out;',
        '}',
        '.lampa-cinema-page > .lampa-cinema-art.dim { opacity: 0; }',
        '.lampa-cinema-art:after {',
        '    background: linear-gradient(180deg, rgba(12,17,25,.52), transparent 23%, transparent 41%, rgba(12,17,25,.56) 68%, rgba(12,17,25,.84) 100%),',
        '                linear-gradient(90deg, rgba(12,17,25,.72), rgba(12,17,25,.23) 43%, transparent 75%);',
        '}',
        '.lampa-cinema-page > .lampa-cinema-art:not(.lampa-cinema-art-ready),',
        '[data-lampa-cinema-background="gradient"] .lampa-cinema-page > .lampa-cinema-art,',
        '[data-lampa-cinema-background="black"] .lampa-cinema-page > .lampa-cinema-art { visibility: hidden; }',
        '[data-lampa-cinema-background="black"] .lampa-cinema-page > .lampa-cinema-ambient { background: #000; }',
        '[data-lampa-cinema-background="black"] .lampa-cinema-ambient canvas,',
        '[data-lampa-cinema-background="black"] .lampa-cinema-ambient:after { display: none; }',
        '.lampa-cinema-page > .full-start__background:not(.lampa-cinema-art) { visibility: hidden; }',
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
        '.lampa-cinema-hero .lampa-cinema-title-translation {',
        '    font-family: inherit; font-size: 1.23em; font-weight: 600; line-height: 1.25;',
        '    letter-spacing: 0; color: #dce2e9; margin-bottom: .7em;',
        '}',
        '.lampa-cinema-hero .lampa-cinema-title-accessible {',
        '    position: absolute; width: 1px; height: 1px; overflow: hidden;',
        '    clip: rect(0, 0, 0, 0); white-space: nowrap;',
        '}',
        '.lampa-cinema-logo {',
        '    display: block; width: auto; height: auto; max-width: 90%; max-height: 8.5em;',
        '    margin: 0 0 .65em; object-fit: contain; object-position: left center;',
        '    filter: drop-shadow(0 .22em .56em rgba(12,17,25,.7)); pointer-events: none;',
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
        '    .lampa-cinema-hero .lampa-cinema-title-translation { font-size: 1.14em; }',
        '    .lampa-cinema-logo { max-height: 6.8em; }',
        '}',
        '@media (prefers-reduced-motion: reduce) { .lampa-cinema-page > .lampa-cinema-art { transition: none; } }'
    ].join('\n');
    document.head.appendChild(style);

    // The full-card event runs after Lampa has built its native details and controls.
    Lampa.Listener.follow('full', renderCinemaCard);
    Lampa.CinemaCard = {
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

    function previewUrl(card) {
        return assetUrl(card.backdrop_path, 'w1280') || assetUrl(card.background_image, 'w1280');
    }

    function startPreview(url) {
        if (!url) return null;
        var image = new Image();
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
            done(index - 1);
        };
        next();
    }

    function removePreviousCard(state) {
        if (state.art.parentNode) state.art.parentNode.removeChild(state.art);
        if (state.ambient.parentNode) state.ambient.parentNode.removeChild(state.ambient);
        if (state.logo && state.logo.parentNode) state.logo.parentNode.removeChild(state.logo);
        state.hero.classList.remove('lampa-cinema-hero');
        state.title.classList.remove('lampa-cinema-title', 'lampa-cinema-title-long',
            'lampa-cinema-title-accessible', 'lampa-cinema-title-translation');
        state.title.removeAttribute('data-cinema-type');
    }

    function renderCinemaCard(event) {
        if (!event || (event.type !== 'complite' && event.type !== 'complete')) return;
        var root = event.body && (event.body.nodeType === 1 ? event.body : event.body[0]);
        var card = (event.data && event.data.movie) || (event.object && event.object.card);
        if (!root || !card) return;

        var hero = root.querySelector('.full-start-new') || root.querySelector('.full-start');
        var title = hero && hero.querySelector('.full-start-new__title, .full-start__title');
        if (!title) return;

        var previous = root[stateKey];
        if (previous && previous.hero === hero && previous.card === card) return;
        if (previous) removePreviousCard(previous);
        root.classList.remove('lampa-cinema-page');

        var backdrops = backdropChoices(card);
        var art = document.createElement('div');
        art.className = 'lampa-cinema-art full-start__background';
        art.setAttribute('aria-hidden', 'true');
        var ambient = document.createElement('div');
        ambient.className = 'lampa-cinema-ambient';
        ambient.setAttribute('aria-hidden', 'true');
        var colorMap = document.createElement('canvas');
        colorMap.width = 4;
        colorMap.height = 3;
        ambient.appendChild(colorMap);
        var state = root[stateKey] = { card: card, hero: hero, title: title, art: art, ambient: ambient };

        var prefetched = Lampa.CinemaPreload && Lampa.CinemaPreload.assetsFor(event.object, card);
        var preview = prefetched && prefetched.preview;
        var firstUrl = previewUrl(card);
        var language = mediaLanguage(card);
        var logos = logoChoices(card, language);

        function currentCard() {
            return root[stateKey] === state && root.contains(hero) && hero.contains(title);
        }

        function mountLogo() {
            if (!art.parentNode || !state.logo || !state.logoInfo || state.logo.parentNode) return;
            title.parentNode.insertBefore(state.logo, title);
            var originalTitle = card.original_title || card.original_name;
            var showTranslation = state.logoInfo.language !== language && title.textContent.trim() !== originalTitle;
            title.classList.add(showTranslation ? 'lampa-cinema-title-translation' : 'lampa-cinema-title-accessible');
        }

        function showBackdrop(image) {
            art.style.backgroundImage = 'url(' + JSON.stringify(image.src) + ')';
            art.classList.add('lampa-cinema-art-ready');
            // Stretch a tiny canvas to blend the colors. Drawing requires no pixel readback or CORS.
            try {
                var context = colorMap.getContext('2d');
                if (context) context.drawImage(image, 0, 0, colorMap.width, colorMap.height);
            } catch (error) {
                // The ambient CSS remains visible on devices without canvas support.
            }
        }

        function mountScene() {
            // Reuse the native background's scroll-dimming hook.
            var stockBackground = root.querySelector('.full-start__background');
            if (stockBackground && stockBackground.classList.contains('dim')) art.classList.add('dim');
            root.insertBefore(ambient, root.firstChild);
            root.insertBefore(art, root.firstChild);
            root.classList.add('lampa-cinema-page');
            hero.classList.add('lampa-cinema-hero');
            title.classList.add('lampa-cinema-title');
            title.setAttribute('data-cinema-type', titleType(card));
            if (title.textContent.trim().length > 38) title.classList.add('lampa-cinema-title-long');
            mountLogo();
        }

        function loadFinalBackdrop(displayed) {
            var position = backdrops.indexOf(displayed);
            var choices = position < 0 ? backdrops : backdrops.slice(0, position);
            if (!choices.length) return;
            var background = new Image();
            loadFirstImage(background, choices, function (index) {
                if (index !== -1 && currentCard()) showBackdrop(background);
            });
        }

        if (logos.length) {
            var warmLogo = prefetched && prefetched.logo;
            var readyLogo = warmLogo && warmLogo.complete && warmLogo.naturalWidth && warmLogo.src === logos[0].url;
            var logo = readyLogo ? warmLogo.cloneNode(false) : new Image();
            logo.className = 'lampa-cinema-logo';
            logo.alt = '';
            state.logo = logo;
            if (readyLogo) state.logoInfo = logos[0];
            else loadFirstImage(logo, logos.map(function (item) { return item.url; }), function (selected) {
                if (selected !== -1 && currentCard()) {
                    state.logoInfo = logos[selected];
                    mountLogo();
                }
            });
        }

        mountScene();
        if (!backdrops.length) return;
        if (!preview && firstUrl !== backdrops[0]) preview = startPreview(firstUrl);
        if (!preview) return loadFinalBackdrop('');

        function previewFinished() {
            preview.removeEventListener('load', previewFinished);
            preview.removeEventListener('error', previewFinished);
            if (!currentCard()) return;
            var displayed = preview.naturalWidth ? preview.src : '';
            if (displayed) showBackdrop(preview);
            loadFinalBackdrop(displayed);
        }

        if (preview.complete) previewFinished();
        else {
            preview.addEventListener('load', previewFinished);
            preview.addEventListener('error', previewFinished);
        }
    }
}());
