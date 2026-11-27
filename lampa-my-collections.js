// «Моя подборка» для Lampa TV. Папки хранятся на устройстве.
(function () {
    'use strict';

    var Lampa = window.Lampa;
    var $ = window.jQuery || window.$;
    var title = 'Моя подборка';
    var componentName = 'lampa_my_collections';
    var storageKey = 'lampa_my_collections_folders';
    var styleId = 'lampa-my-collections-style';
    var createLabel = 'Создать папку';
    var addLabel = 'В подборку';
    var emptyFolderText = 'Открой фильм или сериал и выбери «В подборку» в его карточке.';
    if (!Lampa || !$ || !Lampa.Listener || document.getElementById(styleId)) return;

    var style = document.createElement('style');
    style.id = styleId;
    style.textContent = [
        '.lampa-collections-page { padding: .7em 3.5vw 2em; }',
        '.lampa-collections-header { margin: 0 0 1.25em; }',
        '.lampa-collections-heading { margin: .15em 0 .45em; font-size: 2.05em;',
        '    font-weight: 700; line-height: 1.12; overflow-wrap: break-word; }',
        '.lampa-collections-action { display: inline-flex; align-items: center; min-height: 2.7em;',
        '    padding: .55em .9em; background: rgba(255,255,255,.12); border-radius: .35em; font-weight: 600; }',
        '.lampa-collections-grid { display: flex; flex-wrap: wrap; margin: 0 -.42em; }',
        '.lampa-collections-folder { box-sizing: border-box; display: flex; align-items: center; min-height: 4.8em;',
        '    width: calc(33.33% - .84em); margin: 0 .42em .84em; padding: .95em;',
        '    background: rgba(255,255,255,.10); border-radius: .4em; font-size: 1.15em; font-weight: 600; }',
        '.lampa-collections-action.focus, .lampa-collections-folder.focus { background: #f3efe8; color: #171719; }',
        '.lampa-collections-folder-name { min-width: 0; overflow-wrap: break-word; }',
        '.lampa-collections-folder-icon { display: inline-block; position: relative; box-sizing: border-box;',
        '    width: 1.28em; height: .87em; border: .095em solid currentColor; border-radius: .13em;',
        '    color: inherit; flex: none; margin-right: .65em; vertical-align: middle; }',
        '.lampa-collections-folder-icon:before { content: ""; position: absolute; top: -.32em; left: -.095em;',
        '    width: .55em; height: .25em; border: .095em solid currentColor; border-bottom: 0; border-radius: .12em .12em 0 0; }',
        '.menu__ico > .lampa-collections-folder-icon { margin: 0; }',
        '.lampa-collections-add > .lampa-collections-folder-icon { margin-right: .48em; }',
        '.lampa-collections-add { white-space: nowrap; }',
        '.lampa-collections-section { margin: 0 0 1.4em; }',
        '.lampa-collections-section h2 { margin: 0 0 .55em; font-size: 1.36em; font-weight: 650; }',
        '.lampa-collections-grid > .card { box-sizing: border-box; flex: 0 0 auto;',
        '    width: calc(16.66% - .84em); margin: 0 .42em 1.05em; }',
        '.lampa-collections-empty { margin-top: 1.2em; max-width: 31em; line-height: 1.5; opacity: .76; }',
        '@media (max-width: 800px) {',
        '    .lampa-collections-grid > .card { width: calc(25% - .84em); }',
        '    .lampa-collections-folder { width: calc(50% - .84em); }',
        '    .lampa-collections-heading { font-size: 1.6em; }',
        '}',
        '@media (max-width: 460px) {',
        '    .lampa-collections-grid > .card { width: calc(33.33% - .84em); }',
        '    .lampa-collections-folder { width: calc(100% - .84em); }',
        '}'
    ].join('\n');
    document.head.appendChild(style);

    function nodeOf(value) {
        return value && (value.nodeType === 1 ? value : value[0]);
    }

    function element(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (typeof text === 'string') node.textContent = text;
        return node;
    }

    function folderIcon() {
        var icon = element('i', 'lampa-collections-folder-icon');
        icon.setAttribute('aria-hidden', 'true');
        return icon;
    }

    function readFolders() {
        var folders = Lampa.Storage.get(storageKey, []);
        return Array.isArray(folders) ? folders.filter(function (folder) {
            return folder && typeof folder.id === 'string' && typeof folder.name === 'string' &&
                Array.isArray(folder.items);
        }) : [];
    }

    function findFolder(folders, id) {
        return folders.find(function (folder) { return folder.id === id; });
    }

    function entryKey(entry) {
        return [entry.source, entry.method, entry.id].join('/');
    }

    function matchesEntry(saved, entry) {
        return saved && entryKey(saved) === entryKey(entry);
    }

    function createFolder(done) {
        Lampa.Input.edit({ title: 'Название папки', value: '', free: true, nosave: true }, function (input) {
            var name = typeof input === 'string' ? input.trim().replace(/\s+/g, ' ') : '';
            if (!name) return done();
            var folders = readFolders();
            if (folders.some(function (folder) { return folder.name.toLowerCase() === name.toLowerCase(); })) {
                Lampa.Noty.show('Папка с таким названием уже есть');
                return done();
            }
            var folder = { id: Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9), name: name, items: [] };
            folders.push(folder);
            Lampa.Storage.set(storageKey, folders);
            done(folder);
        });
    }

    function setMembership(id, entry, add) {
        var folders = readFolders();
        var folder = findFolder(folders, id);
        if (!folder) return;
        var items = folder.items.filter(function (saved) { return !matchesEntry(saved, entry); });
        if (add) items.unshift(entry);
        if (!add && items.length === folder.items.length) return;
        folder.items = items;
        Lampa.Storage.set(storageKey, folders);
        Lampa.Noty.show((add ? 'Добавлено в «' : 'Убрано из «') + escapeText(folder.name) + '»');
    }

    function savedEntry(card, object) {
        var id = object.id || card.id;
        var label = card.title || card.name || card.original_title || card.original_name;
        if ((typeof id !== 'number' && typeof id !== 'string') || !id || typeof label !== 'string' || !label) return;
        var method = card.media_type;
        if (method !== 'tv' && method !== 'movie') method = object.method;
        if (method !== 'tv' && method !== 'movie') {
            method = card.first_air_date || card.number_of_seasons || (card.name && !card.title) ? 'tv' : 'movie';
        }
        var source = object.source || card.source || Lampa.Storage.field('source') || 'tmdb';
        var data = { id: card.id || id, title: label, source: source, media_type: method };
        ['name', 'original_title', 'original_name', 'release_date', 'first_air_date', 'vote_average',
            'poster_path', 'poster', 'img', 'backdrop_path', 'background_image'].forEach(function (name) {
            if (typeof card[name] === 'string' || typeof card[name] === 'number') data[name] = card[name];
        });
        if (method === 'tv' && !data.name) data.name = label;
        return { id: id, method: method, source: source, url: object.url || '', card: data };
    }

    function escapeText(text) {
        var escaped = element('span', '', text);
        return escaped.innerHTML;
    }

    function chooseFolders(entry) {
        var enabled = Lampa.Controller.enabled();
        var previous = enabled && enabled.name || 'content';
        function back() {
            Lampa.Controller.toggle(previous);
        }
        var folders = readFolders();
        var items = [{ title: createLabel, create: true }].concat(folders.map(function (folder) {
            return {
                title: escapeText(folder.name),
                folderId: folder.id,
                checkbox: true,
                checked: folder.items.some(function (saved) { return matchesEntry(saved, entry); })
            };
        }));
        Lampa.Select.show({
            title: 'Добавить в подборку',
            items: items,
            onCheck: function (item) { setMembership(item.folderId, entry, item.checked); },
            onSelect: function (item) {
                if (!item.create) return;
                if (Lampa.Activity.mixState) Lampa.Activity.mixState();
                createFolder(function (folder) {
                    if (folder) setMembership(folder.id, entry, true);
                    back();
                });
            },
            onBack: back
        });
    }

    function addFullCardButton(event) {
        if (event.type !== 'complite' && event.type !== 'complete') return;
        var object = event.object || {};
        var card = event.data && event.data.movie || object.card;
        if (!card) return;
        var activity = object.activity;
        var root = nodeOf(event.body) || (activity && typeof activity.render === 'function' && nodeOf(activity.render(true)));
        var buttons = root && root.querySelector('.full-start-new__buttons, .full-start__buttons');
        if (!buttons || buttons.querySelector('.lampa-collections-add')) return;
        var entry = savedEntry(card, object);
        if (!entry) return;

        var button = element('div', 'full-start__button selector lampa-collections-add');
        button.setAttribute('title', addLabel);
        button.setAttribute('aria-label', addLabel);
        button.appendChild(folderIcon());
        button.appendChild(element('span', '', addLabel));
        $(button).on('hover:enter', function () { chooseFolders(entry); });
        buttons.appendChild(button);
    }

    function openCollections(folder) {
        Lampa.Activity.push({ component: componentName, url: '', title: title, folderId: folder && folder.id });
    }

    function openEntry(entry) {
        Lampa.Activity.push({
            component: 'full', url: entry.url, id: entry.id, method: entry.method, source: entry.source,
            card: Object.assign({}, entry.card)
        });
    }

    function Collections(object) {
        var self = this;
        var scroll = new Lampa.Scroll({ over: true, step: 240 });
        var viewport = nodeOf(scroll.render(true));
        var page = element('div', 'lampa-collections-page');
        var cards = [];
        var controls = Object.create(null);
        var focusKey;
        var snapshot;

        function focus(node, key) {
            controls[key] = node;
            $(node).on('hover:focus', function () {
                focusKey = key;
                var bounds = node.getBoundingClientRect();
                var view = viewport.getBoundingClientRect();
                if (bounds.top < view.top || bounds.bottom > view.bottom) scroll.update(node);
            });
        }

        function addAction(parent, text, key, action, folder) {
            var button = element('div', 'selector ' + (folder ? 'lampa-collections-folder' : 'lampa-collections-action'));
            if (folder) button.appendChild(folderIcon());
            button.appendChild(element('span', folder ? 'lampa-collections-folder-name' : '', text));
            $(button).on('hover:enter', action);
            focus(button, key);
            parent.appendChild(button);
        }

        function clearCards() {
            cards.forEach(function (card) { card.destroy(); });
            cards = [];
        }

        function addSection(label, entries) {
            if (!entries.length) return;
            var section = element('section', 'lampa-collections-section');
            var grid = element('div', 'lampa-collections-grid');
            section.appendChild(element('h2', '', label));
            section.appendChild(grid);
            page.appendChild(section);
            entries.forEach(function (entry) {
                var card = new Lampa.Card(Object.assign({}, entry.card));
                card.onEnter = function () { openEntry(entry); };
                card.create();
                var node = nodeOf(card.render(true));
                focus(node, entryKey(entry));
                grid.appendChild(node);
                cards.push(card);
            });
        }

        function refreshPage() {
            var folders = readFolders();
            var folder = object.folderId && findFolder(folders, object.folderId);
            var current = JSON.stringify(object.folderId ? folder || null : folders.map(function (item) {
                return [item.id, item.name];
            }));
            if (current === snapshot) return;
            snapshot = current;
            clearCards();
            page.textContent = '';
            controls = Object.create(null);
            var header = element('div', 'lampa-collections-header');
            header.appendChild(element('h1', 'lampa-collections-heading', folder ? folder.name : title));
            page.appendChild(header);

            if (object.folderId) {
                addAction(header, 'К папкам', 'folders', function () { Lampa.Activity.backward(); });
                if (!folder || !folder.items.length) {
                    page.appendChild(element('p', 'lampa-collections-empty', folder ? emptyFolderText : 'Папка не найдена.'));
                    return;
                }
                addSection('Фильмы', folder.items.filter(function (entry) { return entry && entry.card && entry.method === 'movie'; }));
                addSection('Сериалы', folder.items.filter(function (entry) { return entry && entry.card && entry.method === 'tv'; }));
            } else {
                addAction(header, createLabel, 'create', function () {
                    createFolder(function (added) {
                        if (added) focusKey = 'folder-' + added.id;
                        Lampa.Controller.toggle('content');
                    });
                });
                var grid = element('div', 'lampa-collections-grid');
                page.appendChild(grid);
                folders.forEach(function (item) {
                    addAction(grid, item.name, 'folder-' + item.id, function () { openCollections(item); }, true);
                });
                if (!folders.length) page.appendChild(element('p', 'lampa-collections-empty', emptyFolderText));
            }
        }

        function move(direction, fallback) {
            var navigation = Lampa.Navigator || window.Navigator;
            if (fallback && !navigation.canmove(direction)) Lampa.Controller.toggle(fallback);
            else navigation.move(direction);
        }

        this.create = function () {
            scroll.minus();
            scroll.append(page);
            scroll.onScroll = function () { Lampa.Layer.visible(viewport); };
            refreshPage();
            self.activity.loader(false);
            return self.render();
        };
        this.start = function () {
            Lampa.Controller.add('content', {
                link: self,
                toggle: function () {
                    refreshPage();
                    Lampa.Controller.collectionSet(page);
                    Lampa.Controller.collectionFocus(controls[focusKey] || false, page);
                    Lampa.Layer.visible(viewport);
                },
                left: function () { move('left', 'menu'); },
                up: function () { move('up', 'head'); },
                right: function () { move('right'); },
                down: function () { move('down'); },
                back: function () { Lampa.Activity.backward(); }
            });
            Lampa.Controller.toggle('content');
        };
        this.pause = this.stop = function () {};
        this.render = function (js) { return js ? viewport : $(viewport); };
        this.destroy = function () { clearCards(); scroll.destroy(); };
    }

    function init() {
        var list = document.querySelector('.menu .menu__list');
        if (!list || list.querySelector('.lampa-collections-menu')) return;
        Lampa.Component.add(componentName, Collections);
        Lampa.Listener.follow('full', addFullCardButton);

        var item = element('li', 'menu__item selector lampa-collections-menu');
        var icon = element('div', 'menu__ico');
        icon.appendChild(folderIcon());
        item.appendChild(icon);
        item.appendChild(element('div', 'menu__text', title));
        $(item).on('hover:enter', function () { openCollections(); });
        $(item).on('hover:focus', function () {
            var menu = $(item).closest('.scroll')[0];
            if (menu && menu.Scroll) menu.Scroll.update(item, true);
        });
        var bookmarks = list.querySelector('[data-action="favorite"]');
        list.insertBefore(item, bookmarks ? bookmarks.nextSibling : null);
    }

    if (window.appready) init();
    else Lampa.Listener.follow('app', function (event) {
        if (event.type === 'ready') init();
    });
}());
