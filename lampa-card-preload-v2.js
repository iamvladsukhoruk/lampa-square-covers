// Lampa TV — предзагрузка карточки фильма или сериала + плавный первый фон без рывков.
(function () {
    'use strict';

    var Lampa = window.Lampa;
    if (!Lampa || Lampa.CinemaPreload) return;

    var api = Lampa.Api;
    var nativeFull = api && api.full;
    var focusTimer;
    var warming;
    var prepared;
    var preloadLifetime = 30000;
    var activeCurtain = null;

    injectStyles();

    // Native card events are dispatched without bubbling.
    document.addEventListener('hover:focus', prepareFocusedCard, true);
    document.addEventListener('hover:hover', prepareFocusedCard, true);
    document.addEventListener('hover:enter', function () { clearTimeout(focusTimer); }, true);
    if (typeof nativeFull === 'function') api.full = openPreparedCard;

    if (Lampa.Listener && typeof Lampa.Listener.follow === 'function') {
        Lampa.Listener.follow('activity', onActivityEvent);
        Lampa.Listener.follow('full', onFullEvent);
    }

    Lampa.CinemaPreload = {
        assetsFor: function (params, card) {
            var entry = preparedFor(params || (card && catalogParams(card)));
            return entry ? { preview: entry.preview, logo: entry.logo } : null;
        }
    };

    function injectStyles() {
        if (document.getElementById('cinema-preload-smooth-style')) return;
        var style = document.createElement('style');
        style.id = 'cinema-preload-smooth-style';
        style.textContent = [
            '.cp-has-curtain { position: relative; }',
            '.cp-has-curtain .activity__loader {',
            '  z-index: 25 !important;',
            '  opacity: 0;',
            '  animation: cp-loader-fade 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.45s forwards;',
            '}',
            '@keyframes cp-loader-fade {',
            '  from { opacity: 0; }',
            '  to { opacity: 0.75; }',
            '}',
            '.cp-backdrop-curtain {',
            '  position: absolute;',
            '  top: 0; left: 0; right: 0; bottom: 0;',
            '  z-index: 20;',
            '  pointer-events: none;',
            '  overflow: hidden;',
            '  background: #000;',
            '  opacity: 0;',
            '  transition: opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1);',
            '  will-change: opacity;',
            '}',
            '.cp-backdrop-curtain.cp-visible {',
            '  opacity: 1;',
            '}',
            '.cp-backdrop-curtain.cp-leaving {',
            '  opacity: 0;',
            '  transition: opacity 0.48s cubic-bezier(0.4, 0, 0.2, 1);',
            '}',
            '.cp-backdrop-img {',
            '  position: absolute;',
            '  top: 0; left: 0; width: 100%; height: 100%;',
            '  object-fit: cover;',
            '  opacity: 0;',
            '  transform: scale(1.045) translateZ(0);',
            '  transition: opacity 0.62s cubic-bezier(0.22, 1, 0.36, 1), transform 0.95s cubic-bezier(0.22, 1, 0.36, 1);',
            '  will-change: opacity, transform;',
            '}',
            '.cp-backdrop-img.cp-ready {',
            '  opacity: 0.75;',
            '  transform: scale(1) translateZ(0);',
            '}',
            '.cp-backdrop-vignette {',
            '  position: absolute;',
            '  top: 0; left: 0; right: 0; bottom: 0;',
            '  background: linear-gradient(to bottom, transparent 40%, rgba(0,0,0,.22) 59%, rgba(0,0,0,.68) 85%, #000 100%),',
            '              linear-gradient(to right, rgba(0,0,0,.58), rgba(0,0,0,.15) 43%, transparent 74%);',
            '}',
            '.cp-has-curtain .full-start__background, .cp-has-curtain .full-start-new__background {',
            '  transition: opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1) !important;',
            '  will-change: opacity;',
            '}',
            '@media (prefers-reduced-motion: reduce) {',
            '  .cp-has-curtain .activity__loader { animation-duration: 0s; }',
            '  .cp-backdrop-curtain, .cp-backdrop-curtain.cp-leaving, .cp-backdrop-img { transition: none; }',
            '  .cp-backdrop-img { transform: none; }',
            '}'
        ].join('\n');
        (document.head || document.documentElement).appendChild(style);
    }

    function setting(name) {
        return Lampa.Storage && Lampa.Storage.field && Lampa.Storage.field(name);
    }

    function catalogParams(card) {
        if (!card) return null;
        var type = card.media_type || card.type;
        if (card.profile_path || type === 'person' || type === 'collection') return null;
        if (type !== 'movie' && type !== 'tv') {
            type = card.first_air_date || card.original_name || card.number_of_seasons || (!card.title && card.name) ? 'tv' : 'movie';
        }
        return {
            id: card.id,
            method: type,
            source: card.source || 'tmdb',
            component: 'full',
            card: card
        };
    }

    function cardKey(params) {
        var permit = Lampa.Account && Lampa.Account.Permit;
        if (!params || permit && permit.child || !/^[1-9]\d*$/.test(String(params.id))) return '';
        var source = params.source || 'tmdb';
        if ((source !== 'tmdb' && source !== 'cub') ||
            (params.method !== 'movie' && params.method !== 'tv')) return '';
        return [source, params.method, params.id, setting('tmdb_lang'), setting('language'),
            permit && permit.profile && permit.profile.id].join('|');
    }

    function preparedFor(params) {
        return prepared && Date.now() - prepared.started < preloadLifetime &&
            prepared.key === cardKey(params) ? prepared : null;
    }

    function previewUrl(card) {
        if (!card) return '';
        return assetUrl(card.backdrop_path, 'w1280') || assetUrl(card.background_image, 'w1280');
    }

    function decodeImage(image, callback) {
        if (!image) {
            if (callback) callback();
            return;
        }
        function done() {
            image._cpDecoded = true;
            if (callback) callback();
        }
        if (image._cpDecoded) {
            done();
            return;
        }
        if (typeof image.decode === 'function') {
            image.decode().then(done, done);
        } else if (image.complete) {
            done();
        } else {
            image.addEventListener('load', done, { once: true });
            image.addEventListener('error', done, { once: true });
        }
    }

    function startPreview(url) {
        if (!url) return null;
        var image = new Image();
        image.decoding = 'async';
        image.src = url;
        decodeImage(image);
        return image;
    }

    function warmAssets(entry, card) {
        if (!entry.preview) entry.preview = startPreview(previewUrl(card));
        var cinema = Lampa.CinemaCard;
        var url = cinema && typeof cinema.preferredLogoUrl === 'function' && cinema.preferredLogoUrl(card);
        if (url && (!entry.logo || entry.logo.src !== url)) entry.logo = startPreview(url);
    }

    function stillFocused(target, card) {
        return document.documentElement.contains(target) && target.card_data === card &&
            (target.classList.contains('focus') || target.classList.contains('hover'));
    }

    function prepareFocusedCard(event) {
        clearTimeout(focusTimer);
        var target = event.target;
        var card = target && target.card_data;
        if (!card || !target.classList || target.classList.contains('card--disabled') ||
            target.classList.contains('card--collection') || card.adult || card.blocked || card.lgbt) return;
        var params = catalogParams(card);
        var key = cardKey(params);
        if (!key) return;

        focusTimer = setTimeout(function () {
            if (!stillFocused(target, card) || key !== cardKey(params)) return;
            var recent = preparedFor(params);
            if (recent && !recent.used) return;

            prepared = {
                key: key, params: params, target: target, started: Date.now(),
                preview: recent && recent.preview, logo: recent && recent.logo
            };
            warmAssets(prepared, card);
            warmCardData(prepared);
        }, 120);
    }

    function warmCardData(entry) {
        if (typeof nativeFull !== 'function' || warming || entry.used) return;
        warming = entry;

        function finish(data) {
            if (warming !== entry) return;
            warming = null;
            var movie = data && data.movie;
            if (movie && !movie.blocked && !movie.adult && !movie.lgbt && entry.key === cardKey(entry.params)) {
                entry.data = data;
                if (prepared === entry) warmAssets(entry, movie);
            }
            if (entry.open) entry.open(entry.data);
            if (prepared && prepared !== entry && preparedFor(prepared.params) &&
                stillFocused(prepared.target, prepared.params.card)) {
                warmCardData(prepared);
            }
        }

        try {
            nativeFull.call(api, entry.params, finish, function () { finish(); });
        } catch (error) {
            finish();
        }
    }

    function openPreparedCard(params, oncomplete) {
        var entry = params && params.component === 'full' && !params.langs &&
            !params.query && !(params.page > 1) && preparedFor(params);
        if (!entry || entry.used || typeof oncomplete !== 'function') return nativeFull.apply(this, arguments);
        entry.used = true;
        if (!entry.data && warming !== entry) return nativeFull.apply(this, arguments);

        var receiver = this;
        var args = arguments;
        var ready = entry.data;
        // Wait for the already in-flight request instead of firing a duplicate one.
        var deadline = setTimeout(function () {
            if (entry.open) entry.open(entry.data);
        }, ready ? 0 : 2500);

        entry.open = function (data) {
            clearTimeout(deadline);
            entry.open = null;
            entry.data = null;
            if (data && entry.key === cardKey(params)) oncomplete(data);
            else nativeFull.apply(receiver, args);
        };
    }

    function unwrapElement(el) {
        if (!el) return null;
        if (el.nodeType === 1) return el;
        if (el[0] && el[0].nodeType === 1) return el[0];
        return null;
    }

    function nextFrames(fn) {
        requestAnimationFrame(function () {
            requestAnimationFrame(fn);
        });
    }

    function showBackdropCurtain(activityEl, card, params) {
        if (!activityEl || (activeCurtain && activeCurtain.activityEl === activityEl)) return;
        var permit = Lampa.Account && Lampa.Account.Permit;
        if (!card || card.adult || card.blocked || card.lgbt || (permit && permit.child)) return;
        var entry = preparedFor(params || catalogParams(card));
        var url = (entry && entry.preview && entry.preview.src) || previewUrl(card);
        if (!url) return;

        removeCurtain(activeCurtain);
        activityEl.classList.add('cp-has-curtain');

        var curtain = document.createElement('div');
        curtain.className = 'cp-backdrop-curtain';
        curtain.setAttribute('aria-hidden', 'true');

        var img = entry && entry.preview && !entry.preview.parentNode ? entry.preview : new Image();
        img.className = 'cp-backdrop-img';
        img.decoding = 'async';
        img.alt = '';

        var vignette = document.createElement('div');
        vignette.className = 'cp-backdrop-vignette';

        curtain.appendChild(img);
        curtain.appendChild(vignette);
        activityEl.appendChild(curtain);

        var state = {
            activityEl: activityEl,
            el: curtain,
            leaving: false,
            timer: setTimeout(function () { fadeOutCurtain(state); }, 4500)
        };
        activeCurtain = state;

        nextFrames(function () {
            if (state.leaving) return;
            curtain.classList.add('cp-visible');
        });

        function revealImage() {
            if (state.leaving || !img.naturalWidth) return;
            nextFrames(function () {
                if (!state.leaving) img.classList.add('cp-ready');
            });
        }

        if (!img.src) img.src = url;
        decodeImage(img, revealImage);
    }

    function fadeOutCurtain(state) {
        if (!state || state.leaving) return;
        state.leaving = true;
        clearTimeout(state.timer);

        state.el.classList.add('cp-leaving');
        if (state.activityEl) state.activityEl.classList.remove('cp-has-curtain');

        state.timer = setTimeout(function () { removeCurtain(state); }, 520);
    }

    function removeCurtain(state) {
        if (!state) return;
        clearTimeout(state.timer);
        state.leaving = true;
        if (state.activityEl) state.activityEl.classList.remove('cp-has-curtain');
        if (state.el && state.el.parentNode) state.el.parentNode.removeChild(state.el);
        if (activeCurtain === state) activeCurtain = null;
    }

    function onActivityEvent(event) {
        if (!event) return;
        var obj = event.object || {};
        var act = obj.activity || obj;
        var el = unwrapElement(act && typeof act.render === 'function' ? act.render(true) : null);

        if (Lampa.CinemaCard && Lampa.CinemaCard.handlesOpening) return;
        if ((event.type === 'init' || event.type === 'start') &&
            (event.component === 'full' || obj.component === 'full')) {
            var card = obj.card || obj.movie || (act && act.card);
            showBackdropCurtain(el, card, obj);
        } else if (event.type === 'destroy' || event.type === 'archive' || event.type === 'backward') {
            if (activeCurtain && (!el || activeCurtain.activityEl === el)) {
                removeCurtain(activeCurtain);
            }
        }
    }

    function onFullEvent(event) {
        if (!event || (event.type !== 'complite' && event.type !== 'complete') || !activeCurtain) return;
        var state = activeCurtain;
        var act = event.object && event.object.activity;
        var el = unwrapElement(act && typeof act.render === 'function' ? act.render(true) : null);
        if (el && state.activityEl !== el) return;

        var bg = state.activityEl && state.activityEl.querySelector('.full-start__background, .full-start-new__background, img[src*="backdrop"]');
        if (bg && bg.tagName === 'IMG' && !bg.complete) {
            var settled = false;
            var fallback = setTimeout(function () {
                if (!settled) { settled = true; fadeOutCurtain(state); }
            }, 350);
            decodeImage(bg, function () {
                if (!settled) {
                    settled = true;
                    clearTimeout(fallback);
                    fadeOutCurtain(state);
                }
            });
        } else {
            nextFrames(function () { fadeOutCurtain(state); });
        }
    }

    function assetUrl(path, size) {
        if (typeof path !== 'string' || !path) return '';
        if (/^(https?:)?\/\//i.test(path)) return path;
        if (/^\/[\w-]+\.(jpe?g|png|webp|svg)$/i.test(path) && Lampa.Api && Lampa.Api.img) {
            return Lampa.Api.img(path, size);
        }
        return '';
    }

}());
