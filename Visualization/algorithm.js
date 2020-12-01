var ORIGIN = [0, 0]
var UP = [-1, 0]
var LEFT = [0, -1]
var TOPLEFT = [-1, -1]

var getGrids = function(numRows, numCols) {
    var scoreRows = [];
    var pointerRows = [];
    for (var i = 0; i < numRows; i++) {
        var scoreColumns = [];
        var pointerColumns = [];
		for (var j = 0; j < numCols; j++) {
            scoreColumns.push(null)
            pointerColumns.push(ORIGIN)
        }
        scoreRows.push(scoreColumns)
        pointerRows.push(pointerColumns)
    }
    return [scoreRows, pointerRows]
}

var getLimits = function(sequence1, sequence2, bandwidth) {
    var yLim = sequence1.length + 1
    var xLim = sequence2.length + 1
    if (bandwidth < Math.min(sequence1.length, sequence2.length)) {
        if (sequence1.length < sequence2.length) {
            yLim = bandwidth
            xLim = sequence2.length + 1 - (sequence1.length + 1 - bandwidth)
        } else {
            xLim = bandwidth
            yLim = sequence1.length + 1 - (sequence2.length + 1 - bandwidth)
        }
    }
    return [xLim, yLim]
}

var calculateAlignment = function(sequence1, sequence2, bandwidth) {
		
    var grids = getGrids(sequence1.length + 1, sequence2.length + 1)
    var scoreGrid = grids[0]
    var pointerGrid = grids[1]
    var limits = getLimits(sequence1, sequence2, bandwidth)
    var xLim = limits[1]
    var upperYLim = limits[0]
    var lowerYLim = 1

    scoreGrid[0][0] = 0
    pointerGrid[0][0] = ORIGIN

    for (var i = 1; i < xLim; i++) {
        scoreGrid[i][0] = scoreGrid[i - 1][0] - 1
        pointerGrid[i][0] = UP
    }
    
    for (var j = 1; j < upperYLim; j++) {
        scoreGrid[0][j] = scoreGrid[0][j - 1] - 1
        pointerGrid[0][j] = LEFT
    }
    
    for (var i = 1; i < sequence1.length + 1; i++) {
        if (i > xLim) {
            if (lowerYLim < sequence2.length + 1) {
            	lowerYLim++
            }
        }
        if (upperYLim < sequence2.length + 1) {
           	upperYLim++
        }

        for (var j = lowerYLim; j < upperYLim; j++) {
        	if (scoreGrid[i][j - 1] == null) {
                insertValue = Number.NEGATIVE_INFINITY
            } else {
            	insertValue = scoreGrid[i][j - 1] - 1
            }
            
            if (scoreGrid[i - 1][j] == null) {
                deleteValue = Number.NEGATIVE_INFINITY
            } else {
            	deleteValue = scoreGrid[i - 1][j] - 1
            }
            
            matchValue = 0
            if (sequence1.charAt(i - 1) == sequence2.charAt(j - 1) ) {
                matchValue = scoreGrid[i - 1][j - 1] + 1
            } else {
                matchValue = scoreGrid[i - 1][j - 1] - 1
            }
            minScore = Math.max(insertValue, deleteValue, matchValue)

            if (minScore == deleteValue) {
                scoreGrid[i][j] = deleteValue
                pointerGrid[i][j] = UP
            } else if (minScore == insertValue) {
                scoreGrid[i][j] = insertValue
                pointerGrid[i][j] = LEFT
            } else {
                scoreGrid[i][j] = matchValue
                pointerGrid[i][j] = TOPLEFT
            }
        }
    }
    return [scoreGrid, pointerGrid]
}