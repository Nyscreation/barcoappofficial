(function () {
    'use strict';

    function improveAdminSidebar() {
        if (!document.body.classList.contains('page-admin')) return;
        const sidebar = document.getElementById('sidebar');
        const toggle = document.querySelector('.mobile-toggle');
        if (!sidebar || !toggle) return;

        const backdrop = document.createElement('button');
        backdrop.type = 'button';
        backdrop.className = 'admin-sidebar-backdrop';
        backdrop.setAttribute('aria-label', 'Fechar menu');
        document.body.appendChild(backdrop);

        function syncBackdrop() {
            backdrop.classList.toggle('active', sidebar.classList.contains('active') && window.innerWidth <= 768);
        }

        const originalToggle = window.toggleSidebar;
        window.toggleSidebar = function () {
            if (typeof originalToggle === 'function') originalToggle();
            syncBackdrop();
        };
        backdrop.addEventListener('click', window.toggleSidebar);
        window.addEventListener('resize', syncBackdrop);
    }

    function improveModalKeyboard() {
        document.addEventListener('keydown', function (event) {
            if (event.key !== 'Escape') return;
            const shareModal = document.getElementById('share-card-modal');
            if (shareModal && shareModal.style.display === 'flex' && typeof window.closeShareCardModal === 'function') {
                window.closeShareCardModal();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        improveAdminSidebar();
        improveModalKeyboard();
    });
})();
