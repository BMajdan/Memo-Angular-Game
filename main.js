(function(){

	function shuffle(a) {
		var j, x, i;
		for (i = a.length - 1; i > 0; i--) {
			j = Math.floor(Math.random() * (i + 1));
			x = a[i];
			a[i] = a[j];
			a[j] = x;
		}
		return a;}
	var intervals = [];

	var app = angular.module("MemoGame", ["ngRoute"]);
	app.config(function($routeProvider) {
	    $routeProvider
	    .when("/", {
	        templateUrl : "gameMenu.htm"
	    })
	    .when("/tryb/30", {
	        templateUrl : "gameField.htm",
	        controller : "gameController"
	    })
	    .when("/tryb/60", {
	        templateUrl : "gameField.htm",
	        controller : "gameController"
	    })
	    .when("/tryb/90", {
	        templateUrl : "gameField.htm",
	        controller : "gameController"
	    })
	    .otherwise({
			templateUrl: 'gameMenu.htm'
		});});

	app.controller("gameController", function ($scope, $location, $interval, $timeout) {
		$scope.time = $location.path().split("/")[2];
		$scope.emptyTab = [
			"img/0.jpg", "img/0.jpg", "img/0.jpg", "img/0.jpg", "img/0.jpg", "img/0.jpg", "img/0.jpg", "img/0.jpg",
			"img/0.jpg", "img/0.jpg", "img/0.jpg", "img/0.jpg", "img/0.jpg", "img/0.jpg", "img/0.jpg", "img/0.jpg"
		]
		var imageTab = [
			"img/1.jpg", "img/2.jpg", "img/3.jpg", "img/4.jpg", "img/5.jpg", "img/6.jpg", "img/7.jpg", "img/8.jpg",
			"img/1.jpg", "img/2.jpg", "img/3.jpg", "img/4.jpg", "img/5.jpg", "img/6.jpg", "img/7.jpg", "img/8.jpg"
		]

		startGame();

		$scope.$on('refGame', function(){
			var images = angular.element(document.getElementsByClassName('gameImages'));
			for(var i = 0; i < images.length; i++){
				images[i].src = "img/0.jpg";
				images[i].className = "gameImages"
			}
			startGame();
		})

		function startGame(){
			
			angular.forEach(intervals, function(interval) {
			    $interval.cancel(interval);
			});
			intervals.length = 0;

			$scope.shuffleTab = shuffle(imageTab)
			var click = 1;
			var openImageTable = [];
			var goodOpen = [];
			var firstClick = false;
			$scope.openImage = function(openID, event){
				if(click < 3){
					if(click == 1){
						if(event.target.className.split(" ")[1] != 'isClicked'){

							if(firstClick == false){
								$scope.$broadcast('startClock', $scope.time);
								firstClick = true;
							}

							click++;
							event.target.src = $scope.shuffleTab[openID];
							openImageTable.push(event.target);
							event.target.className += ' isClicked';
						}
					}

					if(click == 2){
						if(event.target.className.split(" ")[1] != 'isClicked'){
							click++;
							event.target.src = $scope.shuffleTab[openID];
							openImageTable.push(event.target);
							event.target.className += ' isClicked';

							if(openImageTable[0].src == openImageTable[1].src){
								var obj = {
									id: (openImageTable[0].id).split("_")[1],
									src: openImageTable[0].src
								}
								goodOpen.push(obj);
								obj = {
									id: (openImageTable[1].id).split("_")[1],
									src: openImageTable[1].src
								}
								goodOpen.push(obj)
								click = 1;
								openImageTable.length = 0;
							}else{
								$timeout(function() { 
									var images = angular.element(document.getElementsByClassName('gameImages'));
									var change = true;
									for(var i = 0; i < images.length; i++){
										images[i].src = "img/0.jpg";
									}

									for(var i = 0; i < goodOpen.length; i++){
										images[goodOpen[i].id].src = goodOpen[i].src
									}
									openImageTable[0].className = "gameImages";
									openImageTable[1].className = "gameImages";
									click = 1;
									openImageTable.length = 0;

								}, 500);
							}
						}
						if(goodOpen.length == imageTab.length){
							$scope.$broadcast('winGame');
						}}
				}}}})
	.directive('gameField', function() {
	  return {
	    templateUrl: 'field.htm'
	  };
	})

	app.controller('timerElement', function($scope, $interval, $document){
		var initial;
		var count;
		var counter;
		var initialMillis;
		$scope.$on('winGame', function(event, data) {
			var newCount = initial - count;
			var min = Math.floor(newCount / 60000);
			if(min < 10){
				min = "0" + min
			}
			var milsc = newCount % 1000
			if(milsc < 10){
				milsc = "0" + milsc
			}
			if(milsc < 100){
				milsc = "0" + milsc
			}
			newCount = Math.floor(newCount / 1000 - (min * 60))
			if(newCount < 10){
				newCount = "0" + newCount
			}
			$scope.winTime = min + ":"  + newCount + "." + milsc
			angular.forEach(intervals, function(interval) {
			    $interval.cancel(interval);
			});
			intervals.length = 0;
			$scope.endType = "Koniec gry!"
			$scope.alertText = "Wygrałeś w: " + $scope.winTime
			dumbElement("showAlert").style.display = "block";})

		function endGame(){
			angular.forEach(intervals, function(interval) {
			    $interval.cancel(interval);
			});
			intervals.length = 0;
			$scope.timerText = "00:00:00"
			dumbElement("timerBar").style.border = "none"
			dumbElement("timerBar").style.background = "#e4e4e4"
			$scope.end = "Koniec czasu!"
			$scope.alertText = "Spróbuj jescze raz "
			dumbElement("showAlert").style.display = "block"; }

		$scope.$on('startClock', function(event, data) {
		    var time = parseInt(data)
			initial = time * 1000;
			displayCount(initial);
			count = initial;
			dumbElement("timerBar").style.width = "100%"
			dumbElement("timerBar").style.borderRight = "2px solid black"
			dumbElement("timer").style.display = "block"
			angular.forEach(intervals, function(interval) {
			    $interval.cancel(interval);
			});
			intervals.length = 0;
			initialMillis = Date.now();
			intervals.push($interval(timer, 1));});

		$scope.refreshGame = function(time){
			initial = undefined;
			count = undefined;
			counter = undefined;
			initialMillis = undefined;
			dumbElement("timer").style.display = "none"
			dumbElement("showAlert").style.display = "none";
			dumbElement("timerBar").style.width = "100%"
			dumbElement("timerBar").style.background = "#e4e4e4"
			$scope.$emit('refGame');}

		function dumbElement(id){
			var queryResult = $document[0].getElementById(id)
			var wrappedID = angular.element(queryResult);
			return wrappedID[0];};

		function timer() {
			if (count <= 0) {
			   	endGame();
			    return;
			}
			var current = Date.now();
			count = count - (current - initialMillis);
			initialMillis = current;
			displayCount(count);}

		function displayCount(count) {
			dumbElement("timerBar").style.width = count / initial * 100  + "%"
			if(count / initial * 100 <= 20){
				dumbElement("timerBar").style.background = "#ff6666"
			}
			
			var min = Math.floor(count / 60000);
			if(min < 10){
				min = "0" + min
			}

			var milsc = count % 1000
			if(milsc < 10){
				milsc = "0" + milsc
			}

			if(milsc < 100){
				milsc = "0" + milsc
			}

			count = Math.floor(count / 1000 - (min * 60))
			if(count < 10){
				count = "0" + count
			}
			$scope.timerText = min + ":"  + count + "." + milsc
			$scope.$watch(function(scope) { return scope.timerText }, function(timer) { dumbElement("timerText").innerHTML = timer;});
		}})

	app.directive('gameCountdown', function () {
	  return {
	    restrict: 'A',
	    controller: 'timerElement',
	    templateUrl: 'gameCountdown.htm'
	  };});

	app.directive('gameAlert', function () {
	  return {
	    restrict: 'A',
	    controller: 'timerElement',
	    templateUrl: 'gameAlert.htm'
	  };});}())