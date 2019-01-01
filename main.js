function draw_function() {
    var vis = d3.select("#graph")
        .append("svg")
        .attr("width", 500).attr("height", 500);

    // make nodes (list of pixel changes to display)
    var idx = 0;
    // width in elements.  should be odd.
    var element_width = 301;
    // height in elements.  should be odd.
    var element_height = 251;
    var delta_generator = maze_function(
        element_width,
        // height in elements
        element_height,
        // complexity: # of components (0 to 1)
        0.5,
        // density: size of components (0 to 1)
        0.5
        );
    // width of a rectangle
    // also used for height of a rectangle
    var rectwidth = vis.attr("width") / element_width;
    // space between pixels
    var spacer = 0;

    let delta = delta_generator.next();
    var nodes = [];
    // drawing speed.  0 is as fast as possible, higher than 0 is slower.
    var drawing_speed = 0.05;
    while (!delta.done) {
        var node = {x: delta.value[1] * (rectwidth+spacer),
                    y: delta.value[0] * (rectwidth+spacer),
                    color: delta.value[2] == 1 ? 'black' : 'lightgrey',
                    delay: idx * drawing_speed};
        nodes.push(node);
        delta = delta_generator.next();
        idx += 1;
    }

    // display nodes
    // delay each node to animate it.
    // see https://stackoverflow.com/a/53990733/34935
    vis.selectAll("rect.nodes")
        .data(nodes)
        .enter()
        .append("svg:rect")
        .attr("x", function(d) { return d.x; })
        .attr("y", function(d) { return d.y; })
        .attr("height", rectwidth)
        .attr("width", rectwidth)
        .attr("fill","none")
        .transition()
        .delay(function(d,i) { return d.delay; })
        .attr("fill", function(d) { return d.color; })

}

// Return pixel "deltas" of the form [y, x, value]
// to draw a maze.
// Based on https://en.wikipedia.org/wiki/Maze_generation_algorithm#Python_code_example
function* maze_function(width, height, complexity, density) {
    // Only odd shapes
    var shape = [Math.floor(height / 2) * 2 + 1, Math.floor(width / 2) * 2 + 1];
    // Adjust complexity and density relative to maze size
    // number of components
    var complexity = Math.floor(complexity * (5 * (shape[0] + shape[1])));
    // size of components
    var density    = Math.floor(density * (Math.floor(shape[0] / 2)
                                           * Math.floor(shape[1] / 2)));
    // Build actual maze
    var the_maze = [];
    for (var idx = 0; idx < shape[0]; idx++) {
        var row = [];
        for (var jdx = 0; jdx < shape[1]; jdx++) {
            yield [idx, jdx, 0];
            row.push(0);
        }
        the_maze.push(row);
    }

    // Fill borders: top/bottom (columns), then sides (rows)
    for (var idx = 0; idx < shape[0]; idx++) {
        yield [idx, 0, 1];
        yield [idx, the_maze[0].length-1, 1];
    }
    for (var jdx = 0; jdx < shape[1]; jdx++) {
        yield [0, jdx, 1];
        yield [the_maze.length-1, jdx, 1];
    }

    // Make aisles
    for (var idx = 0; idx < density; idx++) {
        // pick a random position on the even part of the grid
        var x = Math.floor(Math.random() * shape[1] / 2) * 2;
        var y = Math.floor(Math.random() * shape[0] / 2) * 2;
        yield [y, x, 1];
        the_maze[y][x] = 1;
        for (var jdx = 0; jdx < complexity; jdx++) {
            var neighbours = [];
            if (x > 1) {
                neighbours.push( [y, x - 2] );
            }
            if (x < (shape[1] - 2)) {
                neighbours.push( [y, x + 2] );
            }
            if (y > 1) {
                neighbours.push( [y - 2, x] );
            }
            if (y < (shape[0] - 2)) {
                neighbours.push( [y + 2, x] );
            }
            if (neighbours.length > 0) {
                var kdx = Math.floor(Math.random() * neighbours.length);
                var y_ = neighbours[kdx][0];
                var x_ = neighbours[kdx][1];
                if (the_maze[y_][x_] == 0) {
                    the_maze[y_][x_] = 1;
                    yield [y_, x_, 1];

                    var y1 = y_ + Math.floor((y - y_) / 2);
                    var x1 = x_ + Math.floor((x - x_) / 2);
                    yield [y1, x1, 1];
                    the_maze[y1][x1] = 1;

                    x = x_;
                    y = y_;
                }
            }
        }
    }
}

// function has to execute after dom is loaded
// see https://stackoverflow.com/a/29851693/34935
window.onload = draw_function
