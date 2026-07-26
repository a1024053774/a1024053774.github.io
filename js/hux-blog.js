/*!
 * Clean Blog v1.0.0 (http://startbootstrap.com)
 * Copyright 2015 Start Bootstrap
 * Licensed under Apache 2.0 (https://github.com/IronSummitMedia/startbootstrap/blob/gh-pages/LICENSE)
 */

 /*!
 * Hux Blog v1.6.0 (http://startbootstrap.com)
 * Copyright 2016 @huxpro
 * Licensed under Apache 2.0 
 */

// Tooltip Init
// Unuse by Hux since V1.6: Titles now display by default so there is no need for tooltip
// $(function() {
//     $("[data-toggle='tooltip']").tooltip();
// });


// make all images responsive
/* 
 * Unuse by Hux
 * actually only Portfolio-Pages can't use it and only post-img need it.
 * so I modify the _layout/post and CSS to make post-img responsive!
 */
// $(function() {
//  $("img").addClass("img-responsive");
// });

// responsive tables
$(document).ready(function() {
    $("table").wrap("<div class='table-responsive'></div>");
    $("table").addClass("table");
});

// responsive embed videos
$(document).ready(function() {
    $('iframe[src*="youtube.com"]').wrap('<div class="embed-responsive embed-responsive-16by9"></div>');
    $('iframe[src*="youtube.com"]').addClass('embed-responsive-item');
    $('iframe[src*="vimeo.com"]').wrap('<div class="embed-responsive embed-responsive-16by9"></div>');
    $('iframe[src*="vimeo.com"]').addClass('embed-responsive-item');
});

// Navigation Scripts to Show Header on Scroll-Up
jQuery(document).ready(function($) {
    var MQL = 1170;

    //primary navigation slide-in effect
    if (window.innerWidth <= MQL) return;

    var navbar = document.querySelector('.navbar-custom');
    if (!navbar) return;

    var catalog = document.querySelector('.side-catalog');
    var banner = document.querySelector('.intro-header .container');
    var headerHeight = navbar.offsetHeight;
    var catalogThreshold = (banner ? banner.offsetHeight : 0) + 41;

    var previousTop = 0;
    var ticking = false;

    function onScroll() {
        ticking = false;
        var currentTop = window.pageYOffset;

        //check if user is scrolling up by mouse or keyboard
        if (currentTop < previousTop) {
            //if scrolling up...
            if (currentTop > 0 && navbar.classList.contains('is-fixed')) {
                navbar.classList.add('is-visible');
            } else {
                navbar.classList.remove('is-visible', 'is-fixed');
            }
        } else if (currentTop > previousTop) {
            //if scrolling down...
            navbar.classList.remove('is-visible');
            if (currentTop > headerHeight) navbar.classList.add('is-fixed');
        }
        previousTop = currentTop;

        //adjust the appearance of side-catalog
        if (catalog) catalog.classList.toggle('fixed', currentTop > catalogThreshold);
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(onScroll);
        }
    }, { passive: true });

    onScroll();
});