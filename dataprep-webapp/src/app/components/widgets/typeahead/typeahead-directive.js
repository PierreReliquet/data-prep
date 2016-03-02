/*  ============================================================================

 Copyright (C) 2006-2016 Talend Inc. - www.talend.com

 This source code is available under agreement available at
 https://github.com/Talend/data-prep/blob/master/LICENSE

 You should have received a copy of the agreement
 along with this program; if not, write to Talend SA
 9 rue Pages 92150 Suresnes, France

 ============================================================================*/

/**
 * @ngdoc directive
 * @name talend.widget.directive:TalendDropdown
 * @description This directive create a dropdown element.<br/>
 * Key action :
 * <ul>
 *     <li>ESC : close the dropdown</li>
 * </ul>
 * @restrict EA
 * @usage
     <talend-dropdown close-on-select="false" on-open="onOpen()">
 <div class="dropdown-container">
 <div class="dropdown-action">
 <div class="dropdown-button">{{ column.id }}</div>
 <div>{{ column.type }}</div>
 </div>
 <ul class="dropdown-menu">
 <li><a href="#">Hide Column {{ column.id | uppercase }}</a></li>
 <li class="divider"></li>
 <li<a href="#">Split first Space</a></li>
 <li><a href="#">Uppercase</a></li>
 </ul>
 </talend-dropdown>
 * @param {boolean} closeOnSelect Default `true`. If set to false, dropdown will not close on inner item click
 * @param {function} onOpen The callback to execute on dropdown open
 * @param {string} forceSide Force display on the specified side (left | right)
 *
 * @param {class} dropdown-action Action zone that trigger menu toggle
 * @param {class} dropdown-button Add a caret at the end off element
 * @param {class} dropdown-menu The menu to open
 * @param {class} divider `dropdown-menu > li.divider` : menu items divider
 */
export default function Typeahead($window) {
    'ngInject';

    return {
        restrict: 'E',
        transclude: true,
        templateUrl: 'app/components/widgets/typeahead/typeahead.html',
        scope: {
            searchString: '=',
            onChange: '=',
            forceSide: '@',
            closeOnSelect: '='
        },
        bindToController: true,
        controller: () => {
        },
        controllerAs: 'ctrl',
        link: {
            post: function (scope, iElement, iAttrs, ctrl) {
                var body = angular.element('body').eq(0);
                var windowElement = angular.element($window);
                var input = iElement.find('.input-search');
                var menu = iElement.find('.dropdown-menu');

                //Hide current dropdown menu
                function hideMenu() {
                    menu.removeClass('show-menu');
                    windowElement.off('scroll', positionMenu);
                }

                //Show current dropdown menu and set focus on it
                function showMenu() {
                    menu.addClass('show-menu');
                    positionMenu();
                    windowElement.on('scroll', positionMenu);
                }

                function positionMenu() {
                    positionHorizontalMenu();
                    positionVerticalMenu();
                }

                function alignMenuRight(position) {
                    menu.addClass('right');
                    menu.css('right', $window.innerWidth - position.right);
                    menu.css('left', 'auto');
                }

                function alignMenuLeft(position) {
                    menu.removeClass('right');
                    menu.css('left', position.left);
                    menu.css('right', 'auto');
                }

                //Move the menu to the left if its left part is out of the window
                //Otherwise it is positionned to the right
                //if a side is forced by input, the position follows
                function positionHorizontalMenu() {
                    var position = input[0].getBoundingClientRect();

                    switch (ctrl.forceSide) {
                        case 'left':
                            alignMenuLeft(position);
                            break;
                        case 'right':
                            alignMenuRight(position);
                            break;
                        default:
                            alignMenuRight(position);
                            var menuPosition = menu[0].getBoundingClientRect();
                            if (menuPosition.left < 0) {
                                alignMenuLeft(position);
                            }
                    }
                }

                //Move the menu to the top if its bottom is not visible (out of the window)
                //Otherwise it is positionned at the bottom of trigger button
                function positionVerticalMenu() {
                    var position = input[0].getBoundingClientRect();
                    var menuHeight = menu[0].getBoundingClientRect().height;
                    var menuTopPosition = position.bottom;

                    //when menu bottom is outside of the window, we position the menu at the top of the button
                    if (menuTopPosition + menuHeight > windowElement.height()) {
                        menuTopPosition = position.top - menuHeight;
                        menu.addClass('top');
                    }
                    else {
                        menu.removeClass('top');
                    }
                    menu.css('top', menuTopPosition);
                }

                //Click : hide menu on item select if 'closeOnSelect' is not false
                menu.click(function (event) {
                    event.stopPropagation();
                    if (ctrl.closeOnSelect !== false) {
                        hideMenu();
                    }
                });

                //Mousedown : stop propagation not to hide dropdown
                menu.mousedown(function (event) {
                    event.stopPropagation();
                });

                //ESC keydown : hide menu, set focus on dropdown action and stop propagation
                menu.keydown(function (event) {
                    if (event.keyCode === 27) {
                        hideMenu();
                        event.stopPropagation();
                    }
                });

                //make input and menu focusable
                input.attr('tabindex', '1');
                menu.attr('tabindex', '2');

                //hide menu on body mousedown
                body.mousedown(hideMenu);

                //on element destroy, we destroy the scope which unregister body mousedown and window scroll handlers
                iElement.on('$destroy', function () {
                    scope.$destroy();
                });
                scope.$on('$destroy', function () {
                    body.off('mousedown', hideMenu);
                    windowElement.off('scroll', positionMenu);
                });

                scope.$watch(
                    function () {
                        return ctrl.searchString;
                    },
                    function (value) {
                        if (value) {
                            var isVisible = menu.hasClass('show-menu');
                            if (!isVisible) {
                                showMenu();
                            }
                        } else {
                            hideMenu();
                        }
                    });
            }
        }
    };
}