// Command to run locally: python -m http.server

// From the algorithm: There will be a len(w) + 1 by len(v) + 1 2d array of pointers and scores

var alignButton = $('#alignSequences')
var sequence1TextBox = $('#sequence1')
var sequence2TextBox = $('#sequence2')
var bandwidthTextBox = $('#bandwidth')
var matchTextBox = $('#match')
var mismatchTextBox = $('#mismatch')
var gapTextBox = $('#gap')

var ORIGIN = [0, 0]
var UP = [-1, 0]
var LEFT = [0, -1]
var TOPLEFT = [-1, -1]

var getPathCells = function(pointers) {
    path = []
    var curX = pointers.length - 1
    var curY = pointers[0].length - 1
    while (curX > 0 || curY > 0) {
        path.push([curX, curY])
        if (pointers[curX][curY][0] == UP[0] && pointers[curX][curY][1] == UP[1]) {
            curX = curX - 1
        } else if (pointers[curX][curY][0] == LEFT[0] && pointers[curX][curY][1] == LEFT[1]) {
            curY = curY - 1
        } else {
            curX = curX - 1
            curY = curY - 1
        }
    }
    path.push([0, 0])
    return path
}

var getOptimalAlignment = function(pointers, sequence1, sequence2) {
    var alignment1 = ""
    var alignment2 = ""
    var curY = sequence1.length
    var curX = sequence2.length
    while (curY > 0 || curX > 0) {
        if (pointers[curY][curX][0] == UP[0] && pointers[curY][curX][1] == UP[1]) {
            alignment1 = sequence1[curY - 1] + alignment1
            alignment2 = "-" + alignment2
            curY = curY - 1
        } else if (pointers[curY][curX][0] == LEFT[0] && pointers[curY][curX][1] == LEFT[1]) {
            alignment1 = "-" + alignment1
            alignment2 = sequence2[curX - 1] + alignment2
            curX = curX - 1
        } else {
            alignment1 = sequence1[curY - 1] + alignment1
            alignment2 = sequence2[curX - 1] + alignment2
            curY = curY - 1
            curX = curX - 1
        }
    }
    return [alignment1, alignment2]
}

var isOnPath = function(path, x, y) {
    for (var i = 0; i < path.length; i++) {
        if (path[i][0] == x && path[i][1] == y) {
            return true
        }
    }
    return false
}

var getGridData = function(numX, numY, widthPixels, heightPixels, sequenceWidth, sequenceHeight, scores, pointers) {

    // Add an extra row/column
    numX = numX + 1
    numY = numY + 1

    var data = new Array()
    var xpos = 1
    var ypos = 1
    var width = widthPixels / numX
    var height = heightPixels / numY

    var pathCells = getPathCells(pointers)

    for (var row = 0; row < numY; row++) {
        data.push(new Array())
        for (var column = 0; column < numX; column++) {
            var letter = null
            if (row == 0 && column == 0) {
                letter = null
            } else if (row == 0 && column >= 1) {
                letter = sequenceWidth[column - 2]
            } else if (column == 0 && row >= 1) {
                letter = sequenceHeight[row - 2]
            } else {
                letter = scores[column - 1][row - 1]
            }
            var x1 = null
            var y1 = null
            var x2 = null
            var y2 = null
            if (column > 0 && row > 0) {
                if ((column == 1 && row != 1) || (pointers[column - 1][row - 1][0] == LEFT[0] && pointers[column - 1][row - 1][1] == LEFT[1]) && row != 1) {
                    x1 = (xpos + (width / 2.0))
                    y1 = ypos + 7
                    x2 = (xpos + (width / 2.0))
                    y2 = ypos - 7
                } else if ((row == 1 && column != 1) || (pointers[column - 1][row - 1][0] == UP[0] && pointers[column - 1][row - 1][1] == UP[1]) && column != 1) {
                    x1 = xpos + 7
                    y1 = (ypos + (height / 2.0))
                    x2 = xpos - 7
                    y2 = (ypos + (height / 2.0))
                } else if (pointers[column - 1][row - 1][0] == TOPLEFT[0] && pointers[column - 1][row - 1][1] == TOPLEFT[1]) {
                    x1 = xpos + 5
                    y1 = ypos + 5
                    x2 = xpos - 5
                    y2 = ypos - 5
                }
            }

            var isPath = isOnPath(pathCells, column - 1, row - 1)

            data[row].push({
                x: xpos,
                y: ypos,
                width: width,
                height: height,
                letter: letter,
                x1: x1,
                y1: y1,
                x2: x2,
                y2: y2,
                isOnPath: isPath
            })
            xpos += width
        }
        xpos = 1
        ypos += height
    }
    return data
}

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
            pointerColumns.push(null)
        }
        scoreRows.push(scoreColumns)
        pointerRows.push(pointerColumns)
    }
    return [scoreRows, pointerRows]
}

var getLimits = function(sequence1, sequence2, bandwidth) {
    var xLim = sequence1.length + 1
    var yLim = sequence2.length + 1
    if (bandwidth < Math.min(sequence1.length, sequence2.length)) {
        if (sequence1.length < sequence2.length) {
            xLim = bandwidth
            yLim = sequence2.length + 1 - (sequence1.length + 1 - bandwidth)
        } else {
            yLim = bandwidth
            xLim = sequence1.length + 1 - (sequence2.length + 1 - bandwidth)
        }
    }
    return [xLim, yLim]
}

var calculateAlignment = function(sequence1, sequence2, bandwidth) {
    var grids = getGrids(sequence1.length + 1, sequence2.length + 1)
    var scoreGrid = grids[0]
    var pointerGrid = grids[1]
    var limits = getLimits(sequence1, sequence2, bandwidth)
    var xLim = limits[0]
    var upperYLim = limits[1]
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
        if (i <= xLim) {
            if (upperYLim < sequence2.length + 1) {
                upperYLim++
            }
        } else if (lowerYLim < sequence2.length + 1) {
            lowerYLim++
        }
        for (var j = lowerYLim; j < upperYLim; j++) {
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


var createGrid = function(width, height, sequenceWidth, sequenceHeight, scores, pointers, sequence1, sequence2) {
    var heightPixels = window.innerHeight / 1.2
    var widthPixels = window.innerWidth / 2.0
    var margin = {top: 20, right: 50, bottom: 20, left: 50}
    widthPixels = widthPixels - margin.left - margin.right
    heightPixels = heightPixels - margin.top - margin.bottom
    var gridData = getGridData(width, height, widthPixels, heightPixels, sequenceWidth, sequenceHeight, scores, pointers)

    d3.select('svg').remove()

    var svg = d3.select('#output').append('svg')
        .attr('id', 'svg')
        .attr('width', window.innerWidth)
        .attr('height', window.innerHeight)

    svg.append('defs')
        .append('marker')
        .attr('id', 'arrow')
        .attr('viewBox', [0, 0, 20, 20])
        .attr('refX', 10)
        .attr('refY', 10)
        .attr('markerWidth', 3)
        .attr('markerHeight', 3)
        .attr('orient', 'auto-start-reverse')
        .append('path')
        .attr('d', d3.line()([[0, 0], [0, 20], [20, 10]]))
        .attr('stroke', 'black')

    var row = svg.selectAll('.row')
        .data(gridData)
        .enter().append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .attr('class', 'row')

    var column = row.selectAll('.square')
        .data(function(d) {return d})
        .enter().append('rect')
        .attr('class', 'square')
        .attr('x', function(d) {
            return d.x
        })
        .attr('y', function(d) {
            return d.y
        })
        .attr('width', function(d) {
            return d.width
        })
        .attr('height', function(d) {
            return d.height
        })
        .style('fill', function(d) {
            if (d.isOnPath) {
                return "#f7e672"
            } else if (!isNaN(d.letter) && !isNaN(parseFloat(d.letter))) {
                return "#b8e8a5"
            } else {
                return "#fff"
            }
        })
        .style('stroke', '#222')

    var letters = row.selectAll('.letter')
        .data(function(d) {return d})
        .enter().append('text')
        .attr('class', 'letter')
        .attr('x', function(d) {return (d.x + (d.width / 2.0))})
        .attr('y', function(d) {return (d.y + (d.height / 2.0))})
        .text(function (d) {
            return d.letter
        })

    var lines = row.selectAll('.pointer')
        .data(function(d) {return d})
        .enter().append('line')
        .attr('class', 'pointer')
        .attr('x1', function(d) {return d.x1})
        .attr('y1', function(d) {return d.y1})
        .attr('x2', function(d) {return d.x2})
        .attr('y2', function(d) {return d.y2})
        .attr('stroke', 'black')
        .attr('stroke-width', 2)
        .attr('marker-end', 'url(#arrow)')
        .style('visibility', function(d) {
            if (d.x1 == null || (d.isOnPath == false)) {
                return 'hidden'
            } else {
                return 'visible'
            }
        })

    var optimalAlignment = getOptimalAlignment(pointers, sequence1, sequence2)
    var optimalScore = gridData[height][width].letter
    var outputTextString = "Optimal Alignment is: \n\t\t" + optimalAlignment[0] + "\n\t\t" + optimalAlignment[1] + "\nOptimal Score is: " + optimalScore

    var textBlock = svg.append('text')
        .attr("x", widthPixels + 140)
        .attr("y", heightPixels / 4.0)
        .attr('text-anchor', 'left')
        .attr('font-size', '25px')

    textBlock.append('tspan')
        .text('Optimal Alignment is:')
        .attr('class', 'title')

    textBlock.append('tspan')
        .text(optimalAlignment[0])
        .attr('x', widthPixels + 180)
        .attr('y', (heightPixels / 4.0) + 30)

    textBlock.append('tspan')
        .text(optimalAlignment[1])
        .attr('x', widthPixels + 180)
        .attr('y', (heightPixels / 4.0) + 60)

    textBlock.append('tspan')
        .text("Optimal Score is: " + optimalScore)
        .attr('x', widthPixels + 140)
        .attr('y', (heightPixels / 4.0) + 90)

}

alignButton.on('click', function() {
    sequence1 = sequence1TextBox.val()
    sequence2 = sequence2TextBox.val()
    bandwidth = bandwidthTextBox.val()
    if (bandwidth == "") {
        bandwidth = Number.POSITIVE_INFINITY
    } else {
        bandwidth = parseInt(bandwidth)
    }
    match_score = matchTextBox.val()
    if (match_score == "") {
        match_score = 1
    } else {
        match_score = parseInt(match_score)
    }
    mismatch_score = mismatchTextBox.val()
    if (mismatch_score == "") {
        mismatch_score = -1
    } else {
        mismatch_score = parseInt(mismatch_score)
    }
    gap_score = gapTextBox.val()
    if (gap_score == "") {
        gap_score = -1
    } else {
        gap_score = parseInt(gap_score)
    }
    result = calculateAlignment(sequence1, sequence2, bandwidth, match_score, mismatch_score, gap_score)
    scores = result[0]
    pointers = result[1]

    createGrid(scores.length, scores[0].length, sequence1, sequence2, scores, pointers, sequence1, sequence2)
})
