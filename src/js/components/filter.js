export function initFilter() {
    $('.filter__button').on('click', function (e) {
        e.preventDefault()

        const $filter = $(this).parents('.filter')

        $filter.toggleClass('filter--active')
    })
}
