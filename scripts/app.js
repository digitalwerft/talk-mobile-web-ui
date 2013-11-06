var todo = angular.module('todo', ['ngRoute', 'ngAnimate', 'ngTouch']);

todo.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/list', {
        templateUrl: 'views/list.html',
        controller: 'ListCtrl'
      }).
      when('/detail', {
        templateUrl: 'views/detail.html',
        controller: 'DetailCtrl'
      }).
      when('/detail/:id', {
        templateUrl: 'views/detail.html',
        controller: 'DetailCtrl'
      }).
      otherwise({
        redirectTo: '/list'
      });
  }]);

todo.controller('ListCtrl', function ($scope, $rootScope, TodoStore) {
    $rootScope.view = 'list';
    $scope.$on('$routeChangeStart', function(next, current) {
        $rootScope.loading = false; 
        $rootScope.backwards = false;
    });

    $scope.store = TodoStore; 

    $scope.delete = function (id) {
        var index = null;
        for (var t in $scope.store.todos) {
            if ($scope.store.todos[t].id === id) {
                index = t;
            }
        }
        if ($scope.store.todos[index] !== null) {
            $scope.store.todos.splice(index, 1);
        }
    };

    $scope.checkAll = function () {
        for(var t in $scope.store.todos) {
           $scope.store.todos[t].checked = true; 
        }
        $rootScope.showNav = false;
    };

    $scope.uncheckAll = function () {
        for(var t in $scope.store.todos) {
           $scope.store.todos[t].checked =  false; 
        }
        $rootScope.showNav = false;
    };

    $scope.deleteCompleted = function () {
        var deleteTasks = confirm("Do you want to delete all completed tasks?");
        var deleteIds = [];
        if (deleteTasks === true) { 
            for(var t in $scope.store.todos) {
                var todo = $scope.store.todos[t];
                if (todo.checked === true) {
                    deleteIds.push(todo.id);
                    //$scope.store.todos.splice(t - delCounter, 1);
                }
            }
            for (var d in deleteIds) {
                $scope.delete(deleteIds[d]);
            }
        }
        $rootScope.showNav = false;
    };
});


todo.controller('DetailCtrl', function ($scope, $rootScope, $routeParams, $location, $filter, TodoStore) {
    $rootScope.view = 'detail';
    $scope.store = TodoStore; 
    $scope.item = {};
    $scope.id = null;

    if ($routeParams.id != null) {
        $scope.id = $routeParams.id;
    } 

    if ($scope.id != null) {
        for (var t in $scope.store.todos) {
            if ($scope.store.todos[t].id == $scope.id) {
                $scope.item = $scope.store.todos[ t];   
            }
        }
    } else {
        $scope.item = {
            checked: false,
            id: uid(),
            task: '',
            date: $filter('date')(new Date, 'yyyy-MM-dd')
        };
        console.log($scope.item);
    }

    $scope.save = function () {
        if ($scope.id === null) {
            $scope.store.todos.push($scope.item);
        }
        $location.path('list');
    };


    $scope.$on('$routeChangeStart', function(next, current) {
        $rootScope.backwards = true;
    });

    function uid() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    };
    
});

todo.factory('TodoStore', function ($rootScope) {
    var key = 'todos';
    var store = $rootScope.$new();
    // Load todos
    var dataString = localStorage[key];
    
    store.todos = [];
    // try to parse todos
    try {
        var parsedTodos = JSON.parse(dataString);
        if (parsedTodos instanceof Array === true) {
            store.todos = parsedTodos;
        }
    } catch (e) {}

    // watch for updates
    store.$watch('todos', function (newTodos) {
        if (newTodos instanceof Array === true) {
            // stringify and store todos
            localStorage[key] = JSON.stringify(newTodos);
        }
    }, true);

    return store;
});

