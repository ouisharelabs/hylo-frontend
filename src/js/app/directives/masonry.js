// adapted from https://github.com/klederson/angular-masonry-directive

var Masonry = require('masonry-layout/masonry');

var directive = function($timeout) {
  return {
    restrict: 'AC',
    link: function(scope, elem, attrs) {
      var container = elem[0];
      var options = angular.extend({
        itemSelector: '.item'
      }, angular.fromJson(attrs.masonry));

      var masonry = scope.masonry = new Masonry(container, options);

      var debounceTimeout = 0;
      scope.update = function() {
        if (debounceTimeout) {
          $timeout.cancel(debounceTimeout);
        }
        debounceTimeout = $timeout(function() {
          debounceTimeout = 0;

          masonry.reloadItems();
          masonry.layout();

          elem.children(options.itemSelector).css('visibility', 'visible');
        }, 120);
      };

      scope.removeBrick = function() {
        $timeout(function() {
          masonry.reloadItems();
          masonry.layout();
         }, 500);
      };

      scope.appendBricks = function(ele) {
        masonry.appended(ele);
      };

      scope.$on('masonry.layout', function() {
        masonry.layout();
      });

      masonry.on('layoutComplete', function() {
        elem.addClass('layout-complete');
        return true;
      })

      scope.update();
    }
  };
}

var tileDirective = function() {
  return {
    restrict: 'AC',
    link: function(scope, elem) {
      elem.css('visibility', 'hidden');
      var master = elem.parent('*[masonry]:first').scope(),
        update = master.update,
        removeBrick = master.removeBrick,
        appendBricks = master.appendBricks;
      if (update) {
        imagesLoaded( elem.get(0), update);
        elem.ready(update);
      }
      if (appendBricks) {
        imagesLoaded( elem.get(0), appendBricks(elem));
      }
      scope.$on('$destroy', function() {
        if (removeBrick) {
          removeBrick();
        }
      });
    }
  };
};

module.exports = function(angularModule) {
  angularModule.directive('masonry', directive).directive('masonryTile', tileDirective);
}