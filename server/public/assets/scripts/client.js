/**
 * Created by Scott on 1/26/16.
 */

var app = angular.module('getApp', []);

app.controller('MainController', function($scope, $http){
    $http.get('getUser').then(function(response){
        console.log(response);
        $scope.user = response;
    });
});