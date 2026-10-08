export function initMenu() {
    const burger = document.querySelector('.head__burger');

    if (!burger) {
        return;
    }

    burger.addEventListener('click', (event) => {
        event.preventDefault();

        document.documentElement.classList.toggle('menu-is-opened');
    });
}