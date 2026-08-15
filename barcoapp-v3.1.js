(function () {
    'use strict';

    function createConnectionBadge() {
        if (document.getElementById('connection-badge')) return;
        const badge = document.createElement('div');
        badge.id = 'connection-badge';
        badge.className = 'connection-badge';
        badge.setAttribute('role', 'status');
        badge.setAttribute('aria-live', 'polite');
        document.body.appendChild(badge);
    }

    let connectionTimer;
    function showConnectionStatus(isOnline, force) {
        const badge = document.getElementById('connection-badge');
        if (!badge) return;
        if (isOnline && !force) return;
        window.clearTimeout(connectionTimer);
        badge.className = 'connection-badge show' + (isOnline ? '' : ' offline');
        badge.textContent = isOnline
            ? 'Conexão restabelecida'
            : 'Você está offline. Alguns dados podem não atualizar.';
        connectionTimer = window.setTimeout(function () {
            badge.classList.remove('show');
        }, isOnline ? 2500 : 4500);
    }

    function registerServiceWorker() {
        if (!('serviceWorker' in navigator)) return;
        navigator.serviceWorker.register('./sw.js').then(function (registration) {
            registration.update().catch(function () {});
        }).catch(function (error) {
            console.warn('BarcoApp: serviço offline indisponível.', error);
        });
    }

    function improveImageFallbacks() {
        function protect(image) {
            if (!image || image.dataset.fallbackReady) return;
            image.dataset.fallbackReady = 'true';
            image.addEventListener('error', function () {
                if (!image.src.endsWith('/icone.png') && !image.src.endsWith('icone.png')) {
                    image.src = 'icone.png';
                    image.style.objectFit = 'contain';
                    image.style.padding = '10px';
                }
            });
        }

        document.querySelectorAll('img').forEach(protect);
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                mutation.addedNodes.forEach(function (node) {
                    if (!(node instanceof Element)) return;
                    if (node.matches('img')) protect(node);
                    node.querySelectorAll('img').forEach(protect);
                });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function improveKeyboardAccess() {
        const adminPass = document.getElementById('admin-pass');
        if (adminPass) {
            adminPass.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' && typeof window.handleLogin === 'function') {
                    window.handleLogin();
                }
            });
        }

        const phone = document.getElementById('user-phone');
        if (phone) {
            phone.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' && typeof window.launchApp === 'function') {
                    window.launchApp();
                }
            });
        }

        document.addEventListener('keydown', function (event) {
            if (event.key !== 'Escape') return;
            if (typeof window.closeModal === 'function') window.closeModal();
            const profile = document.getElementById('profile-modal');
            if (profile) profile.style.display = 'none';
            if (typeof window.toggleWeek === 'function') window.toggleWeek(false);
        });
    }

    function improveButtonLabels() {
        const labels = [
            ['.mini-fab[onclick*="shareApp"]', 'Compartilhar BarcoApp'],
            ['.mini-fab[onclick*="screen-register"]', 'Publicar nova viagem'],
            ['.fab-profile', 'Abrir meu perfil'],
            ['.fab-agenda', 'Abrir escala semanal'],
            ['.mobile-toggle', 'Abrir ou fechar menu']
        ];
        labels.forEach(function (item) {
            const button = document.querySelector(item[0]);
            if (button && !button.getAttribute('aria-label')) {
                button.setAttribute('aria-label', item[1]);
                button.setAttribute('title', item[1]);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        createConnectionBadge();
        registerServiceWorker();
        improveImageFallbacks();
        improveKeyboardAccess();
        improveButtonLabels();
        if (!navigator.onLine) showConnectionStatus(false, true);
    });

    window.addEventListener('offline', function () { showConnectionStatus(false, true); });
    window.addEventListener('online', function () { showConnectionStatus(true, true); });
})();
