// Lampa TV — плавное появление заголовка при открытии карточки.
(function () {
    'use strict';

    var Lampa = window.Lampa;
    var styleId = 'lampa-title-intro-style';
    var heroes = '.full-start-new, .full-start';
    var titles = '.full-start-new__title, .full-start__title';
    var pendingClass = 'lampa-title-intro-pending';
    var playingClass = 'lampa-title-intro-playing';
    var animation = 'lampa-title-intro-rise';
    if (!Lampa || !Lampa.Listener || typeof Lampa.Listener.follow !== 'function' ||
        document.getElementById(styleId)) return;

    var style = document.createElement('style');
    style.id = styleId;
    style.textContent = [
        '.lampa-title-intro-pending .full-start-new__title,',
        '.lampa-title-intro-pending .full-start__title,',
        '.lampa-title-intro-pending .lampa-cinema-title-slot { visibility: hidden; }',
        '.lampa-title-intro-playing {',
        '    animation: lampa-title-intro-rise .58s cubic-bezier(.22,.67,.27,1) .12s both;',
        '}',
        '.activity--load .lampa-title-intro-playing { visibility: hidden; animation: none; }',
        '@keyframes lampa-title-intro-rise {',
        '    from { opacity: 0; transform: translate3d(0, 3.2vh, 0); }',
        '    to { opacity: 1; transform: translate3d(0, 0, 0); }',
        '}',
        '@media (prefers-reduced-motion: reduce) {',
        '    .lampa-title-intro-playing { animation-duration: 1ms; animation-delay: 0s; }',
        '}'
    ].join('\n');
    document.head.appendChild(style);
    Lampa.Listener.follow('full', intro);

    function intro(event) {
        if (!event || (event.type !== 'complite' && event.type !== 'complete')) return;
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        var body = event.body;
        var root = body && (body.nodeType === 1 ? body : body[0]);
        if (!root || root.nodeType !== 1) return;
        var hero = root.matches && root.matches(heroes) ? root : root.querySelector(heroes);
        var title = hero && hero.querySelector(titles);
        if (!title || title.__lampaTitleIntro) return;
        title.__lampaTitleIntro = true;
        hero.classList.add(pendingClass);

        function reveal() {
            hero.classList.remove(pendingClass);
            if (!hero.contains(title) || !root.contains(hero)) return;
            // The whole slot rises together when Cinema Card supplies a crossfading logo.
            var parent = title.parentNode;
            var stage = parent.classList.contains('lampa-cinema-title-slot') ? parent : title;
            function settle(ended) {
                if (ended.target !== stage || ended.animationName !== animation) return;
                stage.classList.remove(playingClass);
                stage.removeEventListener('animationend', settle);
                stage.removeEventListener('animationcancel', settle);
            }
            stage.addEventListener('animationend', settle);
            stage.addEventListener('animationcancel', settle);
            stage.classList.add(playingClass);
        }

        // Resolve the slot after the other full-card listeners have finished building the title.
        if (window.requestAnimationFrame) window.requestAnimationFrame(reveal);
        else setTimeout(reveal, 0);
    }
}());
