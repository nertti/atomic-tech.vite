import '../css/main.css'
import './jquery-global.js'
import 'slick-carousel'
import './vendor/jquery.marquee.min.js'
import './vendor/jquery.fancybox.min.js'
import { initMenu } from './components/menu.js'
import { initFilter } from './components/filter.js'
import { initSliders } from './components/sliders.js'
import { initMarquee } from './components/marquee.js'

initMenu()
initFilter()
initSliders()
initMarquee()
