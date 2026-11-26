// Lampa TV — полноэкранное оформление карточек фильмов и сериалов.
(function () {
    'use strict';

    var Lampa = window.Lampa;
    var styleId = 'lampa-cinema-card-style';
    var stateKey = '__lampaCinemaCard';
    if (!Lampa || !Lampa.Listener || document.getElementById(styleId)) return;

    var style = document.createElement('style');
    style.id = styleId;
    style.textContent = [
        '.lampa-cinema-page { position: relative; z-index: 0; }',
        '.lampa-cinema-page > .lampa-cinema-art {',
        '    position: absolute; z-index: -1; top: -4em; right: 0; bottom: auto; left: 0;',
        '    width: 100%; height: 100vh; height: 100dvh; overflow: hidden; opacity: 1;',
        '    background: #111821 center 42% / cover no-repeat;',
        '    -webkit-mask-image: none; mask-image: none; pointer-events: none;',
        '    transition: opacity .22s ease-out;',
        '}',
        '.lampa-cinema-page > .lampa-cinema-art.dim { opacity: .18; }',
        '.lampa-cinema-art:after {',
        '    content: ""; position: absolute; top: 0; right: 0; bottom: 0; left: 0;',
        '    background: linear-gradient(180deg, rgba(12,17,25,.52), transparent 23%, transparent 41%, rgba(12,17,25,.56) 68%, #0c1119 100%),',
        '                linear-gradient(90deg, rgba(12,17,25,.72), rgba(12,17,25,.23) 43%, transparent 75%);',
        '}',
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
        var state = root[stateKey] = { card: card, hero: hero, title: title, art: art };
        if (!backdrops.length) return;

        var background = new Image();
        loadFirstImage(background, backdrops, function (index) {
            if (index === -1 || root[stateKey] !== state || !root.contains(hero)) return;

            // Reuse the native background's scroll-dimming hook.
            var stockBackground = root.querySelector('.full-start__background');
            if (stockBackground && stockBackground.classList.contains('dim')) art.classList.add('dim');
            art.style.backgroundImage = 'url(' + JSON.stringify(background.src) + ')';
            root.insertBefore(art, root.firstChild);
            root.classList.add('lampa-cinema-page');
            hero.classList.add('lampa-cinema-hero');
            title.classList.add('lampa-cinema-title');
            title.setAttribute('data-cinema-type', titleType(card));
            if (title.textContent.trim().length > 38) title.classList.add('lampa-cinema-title-long');

            var language = languageCode(Lampa.Storage && Lampa.Storage.field && Lampa.Storage.field('tmdb_lang')) ||
                languageCode(card.original_language) || 'en';
            var logos = logoChoices(card, language);
            if (!logos.length) return;

            var logo = new Image();
            logo.className = 'lampa-cinema-logo';
            logo.alt = '';
            state.logo = logo;
            loadFirstImage(logo, logos.map(function (item) { return item.url; }), function (selected) {
                if (selected === -1 || root[stateKey] !== state || !hero.contains(title)) return;
                title.parentNode.insertBefore(logo, title);
                var originalTitle = card.original_title || card.original_name;
                var showTranslation = logos[selected].language !== language && title.textContent.trim() !== originalTitle;
                title.classList.add(showTranslation ? 'lampa-cinema-title-translation' : 'lampa-cinema-title-accessible');
            });
        });
    }
}());
