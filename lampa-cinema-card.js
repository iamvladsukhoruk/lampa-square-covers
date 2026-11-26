// Lampa TV — предзагрузка карточки фильма или сериала при выделении.
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

// Native card events are dispatched without bubbling.
document.addEventListener('hover:focus', prepareFocusedCard, true);
document.addEventListener('hover:hover', prepareFocusedCard, true);
document.addEventListener('hover:enter', function () { clearTimeout(focusTimer); }, true);
if (typeof nativeFull === 'function') api.full = openPreparedCard;

Lampa.CinemaPreload = {
assetsFor: function (params, card) {
var entry = preparedFor(params || (card && catalogParams(card)));
return entry ? { preview: entry.preview, logo: entry.logo } : null;
}
};

function setting(name) {
return Lampa.Storage && Lampa.Storage.field && Lampa.Storage.field(name);
}

function catalogParams(card) {
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
return assetUrl(card.backdrop_path, 'w1280') || assetUrl(card.background_image, 'w1280');
}

function startPreview(url) {
if (!url) return null;
var image = new Image();
image.src = url;
return image;
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
preview: recent && recent.preview || startPreview(previewUrl(card))
};
warmCardData(prepared);
}, 260);
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
if (prepared === entry) {
if (!entry.preview) entry.preview = startPreview(previewUrl(movie));
var cinema = Lampa.CinemaCard;
if (cinema) entry.logo = startPreview(cinema.preferredLogoUrl(movie));
}
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
var deadline = setTimeout(function () { entry.open(ready); }, ready ? 0 : 180);
entry.open = function (data) {
clearTimeout(deadline);
entry.open = null;
entry.data = null;
if (data && entry.key === cardKey(params)) oncomplete(data);
else nativeFull.apply(receiver, args);
};
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

