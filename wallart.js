Wallart = new Mongo.Collection('wallart');
var isDown = false;   // Tracks status of mouse button
currentBoardName = "a";

if (Meteor.isClient) {
    Template.boardUI.helpers({
        points: function () {
            return Wallart.find({"name" : currentBoardName}, {limit:1});
        },
        color: function (state) {
          if(state===0)
              return 'state0';
          else
              return 'state1';
        }
    });

    Template.boardUI.events({
        'mousedown .Cell' : function(evt){
            isDown = true;      // When mouse goes down, set isDown to true
            updateCell(evt);
            return false;
        },

        'mouseup .Cell' : function(){
            isDown = false;    // When mouse goes up, set isDown to false
        },

        'mouseover .Cell' : function (evt) {
            if(isDown) {       // When mouse goes over, update the cell
                updateCell(evt);
            }
        }
    });

    Template.boardData.events({
        'click .createBoard' : function(){
            var x = document.getElementById('xLength').value;
            var y = document.getElementById('yLength').value;
            var boardName = document.getElementById('boardName').value;
            console.log("name: " + boardName + " x: " + x + " y: " + y);
            Meteor.call('initializeBoard', parseInt(x), parseInt(y), boardName);
            FlowRouter.go(boardName);
            document.location.reload(false);
        }
    });

    Template.boardData.helpers({
        board: function () {
            var findedBoard = Wallart.findOne({"name" : currentBoardName},{name:1, xSize:1, ySize:1});
            if(findedBoard != undefined) {
                return findedBoard;
            }else{
                return {name: "firstBoard", xSize:7, ySize:7};
            }
        }
    });

    function updateCell(evt) {
        var x = evt.target.getAttribute('data-x');
        var y = evt.target.getAttribute('data-y');
        var state = evt.target.getAttribute('data-state');
        Meteor.call('switchState', parseInt(x), parseInt(y), parseInt(state), currentBoardName);
    }
}

if (Meteor.isServer) {
    Meteor.startup(function () {
        // code to run on server at startup
    });
}

Meteor.methods({
    initializeBoard: function (x, y, boardName) {
        var points = [];
        for (var i = 0; i < x; i++) {
            for (var j = 0; j < y; j++) {
                if(j == y-1) {
                    points.push({position: [i, j], state: 0, lastCol: "true"});
                }
                else {
                    points.push({position: [i, j], state: 0});
                }
            }
        }
        Wallart.insert({name: boardName, xSize: x, ySize: y, points: points});
        currentBoardName = boardName;
    }
})

Meteor.methods({
    switchState: function (a, b, state, boardName) {
        var newState = getNewState(state);
        console.log("boardName: " + boardName + " x: " + a + " y: " + b + " oldState: " + state + " newState: " + newState);
        Wallart.update({"name" : boardName, "points.position" : [a,b]},  {$set: {"points.$.state": newState}});
    }
})

function getNewState(state) {
    return state == 0 ? 1 : 0;
}

FlowRouter.route('/boards/:name', {
    name: 'Boards.show', action(params, queryParams) {
        currentBoardName = params.name;
        console.log("boardName: " + currentBoardName);
    }
});

FlowRouter.route('/boards/', {
    name: 'Boards.show', action(params, queryParams) {
        console.log("boards/");
    }
});