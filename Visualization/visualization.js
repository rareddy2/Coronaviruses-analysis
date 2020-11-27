// Command to run locally: python -m http.server

// From the algorithm: There will be a len(w) + 1 by len(v) + 1 2d array of pointers and scores

var alignButton = $('#alignSequences')
var sequence1TextBox = $('#sequence1')
var sequence2TextBox = $('#sequence2')
var bandwidthTextBox = $('#bandwidth')

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
        if (pointers[curX][curY][0] == LEFT[0] && pointers[curX][curY][1] == LEFT[1]) {
            curY = curY - 1
        } else if (pointers[curX][curY][0] == UP[0] && pointers[curX][curY][1] == UP[1]) {
            curX = curX - 1
        } else {
            curX = curX - 1
            curY = curY - 1
        }
    }
    path.push([0, 0])
    return path
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

var createGrid = function(width, height, sequenceWidth, sequenceHeight, scores, pointers) {
    var heightPixels = window.innerHeight / 1.2
    var widthPixels = window.innerWidth / 2.0
    var margin = {top: 20, right: 50, bottom: 20, left: 50}
    widthPixels = widthPixels - margin.left - margin.right
    heightPixels = heightPixels - margin.top - margin.bottom
    var gridData = getGridData(width, height, widthPixels, heightPixels, sequenceWidth, sequenceHeight, scores, pointers)

    var svg = d3.select('#output').append('svg')
        .attr('id', 'svg')
        .attr('width', widthPixels + margin.left + margin.right)
        .attr('height', heightPixels + margin.top + margin.bottom)

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
}

alignButton.on('click', function() {
    sequence1 = sequence1TextBox.val()
    sequence2 = sequence2TextBox.val()
    bandwidth = bandwidthTextBox.val()
    result = calculateAlignment(sequence1, sequence2, bandwidth)
    scores = result[0]
    pointers = result[1]

    createGrid(scores.length, scores[0].length, sequence1, sequence2, scores, pointers)
})
