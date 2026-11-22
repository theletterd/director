// Reader-facing chapter controls: a small menu showing the current chapter
// (click to open, pick one to jump), and ←/→ to skip between chapters.
// Does nothing for stories without chapter markers.

class ChapterNavigator {
    constructor(sceneHandler, { root = document.body } = {}) {
        this.sceneHandler = sceneHandler;
        this.root = root;
        this.menu = null;
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onDocumentClick = this.onDocumentClick.bind(this);
    }

    get chapters() {
        return this.sceneHandler.chapters;
    }

    attach() {
        if (!this.chapters.length) return this;
        this.buildMenu();
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('click', this.onDocumentClick);
        this.sceneHandler.onChapterChange = chapter => this.highlight(chapter);
        this.highlight(this.sceneHandler.currentChapter());
        return this;
    }

    detach() {
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('click', this.onDocumentClick);
        if (this.menu) this.menu.remove();
        this.menu = null;
        this.sceneHandler.onChapterChange = null;
    }

    label(chapter) {
        return chapter ? `${chapter.number}. ${chapter.title}` : 'Chapters';
    }

    buildMenu() {
        const menu = document.createElement('nav');
        menu.className = 'chapter-menu';
        menu.setAttribute('aria-label', 'Chapters');

        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'chapter-toggle';
        toggle.setAttribute('aria-expanded', 'false');
        toggle.title = 'Chapters (← → to skip)';
        toggle.addEventListener('click', () => this.setOpen(!this.isOpen()));

        const list = document.createElement('ol');
        list.className = 'chapter-list';
        list.hidden = true;
        this.chapters.forEach(chapter => {
            const item = document.createElement('li');
            const button = document.createElement('button');
            button.type = 'button';
            button.dataset.index = String(chapter.index);
            button.textContent = this.label(chapter);
            button.addEventListener('click', () => {
                this.setOpen(false);
                this.sceneHandler.jumpToChapter(chapter);
            });
            item.appendChild(button);
            list.appendChild(item);
        });

        menu.append(toggle, list);
        this.root.appendChild(menu);
        this.menu = menu;
        this.toggle = toggle;
        this.list = list;
    }

    isOpen() {
        return this.list && !this.list.hidden;
    }

    setOpen(open) {
        if (!this.list) return;
        this.list.hidden = !open;
        this.toggle.setAttribute('aria-expanded', String(open));
    }

    highlight(chapter) {
        if (!this.menu) return;
        this.toggle.textContent = this.label(chapter);
        this.list.querySelectorAll('button').forEach(button => {
            const current = chapter && button.dataset.index === String(chapter.index);
            if (current) button.setAttribute('aria-current', 'true');
            else button.removeAttribute('aria-current');
        });
    }

    onKeyDown(event) {
        if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        const tag = event.target && event.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (event.target && event.target.isContentEditable)) return;

        if (event.key === 'ArrowRight') {
            event.preventDefault();
            this.sceneHandler.nextChapter();
        } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            this.sceneHandler.previousChapter();
        } else if (event.key === 'Escape') {
            this.setOpen(false);
        }
    }

    onDocumentClick(event) {
        if (this.isOpen() && !this.menu.contains(event.target)) this.setOpen(false);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChapterNavigator;
}
