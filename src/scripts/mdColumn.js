'use strict';

angular.module('md.data.table').directive('mdColumn', mdColumn);

function mdColumn($compile) {
  
  function compile(tElement) {
    tElement.addClass('md-column');
    return postLink;
  }

  function postLink(scope, element, attrs, ctrls) {
    var headCtrl = ctrls.shift();
    var tableCtrl = ctrls.shift();
    
    function attachSortIcon() {
      var sortIcon = angular.element('<md-icon md-svg-icon="arrow-up.svg">');
      
      $compile(sortIcon.addClass('md-sort-icon').attr('ng-class', 'getDirection()'))(scope);
      
      if(element.hasClass('md-numeric')) {
        element.prepend(sortIcon);
      } else {
        element.append(sortIcon);
      }
    }
    
    function detachSortIcon() {
      Array.prototype.some.call(element.find('md-icon'), function (icon) {
        return icon.classList.contains('md-sort-icon') && element[0].removeChild(icon);
      });
    }
    
    function disableSorting() {
      detachSortIcon();
      element.removeClass('md-sort').off('click', setOrder);
    }
    
    function enableSorting() {
      attachSortIcon();
      element.addClass('md-sort').on('click', setOrder);
    }
    
    function getIndex() {
      return Array.prototype.indexOf.call(element.parent().children(), element[0]);
    }
    
    function isActive() {
      if(!scope.orderBy) {
        return false;
      }
      
      return headCtrl.order === scope.orderBy || headCtrl.order === '-' + scope.orderBy;
    }
    
    function isNumeric() {
      if(attrs.hasOwnProperty('mdNumeric') && attrs.mdNumeric === '') {
        return true;
      }
      
      return scope.numeric;
    }
    
    function setOrder() {
      scope.$applyAsync(function () {
        if(!isActive()) {
          headCtrl.order = scope.getDirection() === 'md-asc' ? scope.orderBy : '-' + scope.orderBy;
        } else {
          headCtrl.order = scope.getDirection() === 'md-asc' ? '-' + scope.orderBy : scope.orderBy;
        }
        
        if(angular.isFunction(headCtrl.onReorder)) {
          headCtrl.onReorder(headCtrl.order);
        }
      });
    }
    
    function updateColumn(index, column) {
      tableCtrl.$$columns[index] = column;
      
      if(column.numeric) {
        element.addClass('md-numeric');
      } else {
        element.removeClass('md-numeric');
      }
    }
    
    scope.getDirection = function () {
      if(!isActive()) {
        return attrs.hasOwnProperty('mdDesc') ? 'md-desc' : 'md-asc';
      }
      
      return headCtrl.order === '-' + scope.orderBy ? 'md-desc' : 'md-asc';
    };
    
    scope.$watch(isActive, function (active) {
      if(active) {
        element.addClass('md-active');
      } else {
        element.removeClass('md-active');
      }
    });
    
    scope.$watch(getIndex, function (index) {
      updateColumn(index, {'numeric': isNumeric()});
    });
    
    scope.$watch(isNumeric, function (numeric) {
      updateColumn(getIndex(), {'numeric': numeric});
    });
    
    scope.$watch('orderBy', function (orderBy) {
      if(orderBy) {
        enableSorting();
      } else {
        disableSorting();
      }
    });
  }

  return {
    compile: compile,
    require: ['^^mdHead', '^^mdTable'],
    restrict: 'A',
    scope: {
      numeric: '=?mdNumeric',
      orderBy: '@?mdOrderBy'
    }
  };
}

mdColumn.$inject = ['$compile'];