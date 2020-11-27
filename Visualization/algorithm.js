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
            scoreColumns.push(0)
            pointerColumns.push(ORIGIN)
        }
        scoreRows.push(scoreColumns)
        pointerRows.push(pointerColumns)
    }
    return [scoreRows, pointerRows]
}

var calculateAlignment = function(sequence1, sequence2, bandwidth) {
    grids = getGrids(sequence1.length + 1, sequence2.length + 1)
    scoreGrid = grids[0]
    pointerGrid = grids[1]
    for (var i = 1; i < sequence1.length + 1; i++) {
        scoreGrid[i][0] = scoreGrid[i - 1][0] - 1
        pointerGrid[i][0] = UP
    }
    for (var j = 1; j < sequence2.length + 1; j++) {
        scoreGrid[0][j] = scoreGrid[0][j - 1] - 1
        pointerGrid[0][j] = LEFT
    }
    for (var i = 1; i < sequence1.length + 1; i++) {
        for (var j = 1; j < sequence2.length + 1; j++) {
            insertValue = scoreGrid[i][j - 1] - 1
            deleteValue = scoreGrid[i - 1][j] - 1
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
