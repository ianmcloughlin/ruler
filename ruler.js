
// (function() {


  /***************************************************************************
   * Drawing parameters and setup.
  ***************************************************************************/
  // Colours.
  let colors = {
    purple: 'rgb(142,  67, 231)',
    blue: 'rgb(  0, 174, 255)',
    cyan: 'rgb( 28, 199, 208)',
    green: 'rgb( 77, 197, 148)',
    orange: 'rgb(255, 108,  95)',
    pink: 'rgb(252,  99, 107)',
    red: 'rgb(255,  79, 129)',
  };

  // Number of pixels between 0 and 1.
  let zero_to_one = 100;


  var stage = new Konva.Stage({
    container: '.stage',
    width: window.innerWidth,
    height: window.innerHeight,
    draggable: true,
  });

  // Allow zooming.
  let scaleBy = 1.2;
  stage.on('wheel', (e) => {
    e.evt.preventDefault();

    var oldScale = stage.scaleX();
    var pointer = stage.getPointerPosition();

    var mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    // Zoom in or out.
    let direction = e.evt.deltaY < 0 ? 1 : -1;

    // when we zoom on trackpad, e.evt.ctrlKey is true
    // in that case lets revert direction
    if (e.evt.ctrlKey) {
      direction = -direction;
    }

    var newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    stage.scale({ x: newScale, y: newScale });

    var newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
  });



  /***************************************************************************
   * Initial ponts, lines, and circles.
  ***************************************************************************/

  // Constructed points.
  let points = {
    '0': {
      x: 200,
      y: 200,
      labelx: -15,
      labely: 15,
    }, 
    '1': {
      x: 300,
      y: 200,
      labelx: -15,
      labely: 15,
    }, 
    '2': {
      x: 400,
      y: 200,
      labelx: -15,
      labely: 15,
    },
    'A': {
      x: 300,
      y: 300,
      labelx: -15,
      labely: 15,
    },
    'B': {
      x: 400,
      y: 100,
      labelx: -15,
      labely: 15,
    },
  };
  
  // Constructed lines.
  let lines = [
    ['0', '1'],
    ['0', 'A'],
    ['1', 'B'],
  ];

  // Constructed circles.
  let circles = [
    ['1', '0'],
    ['0', '1']
  ];

  /***************************************************************************
   * Functions for geometry etc.
  ***************************************************************************/

  // Slope and y-intercept of line from two points - checks for vertical lines.
  function equation_of_line(p1, p2) {    
    
    // Slope and y intercept.
    let m, c;
    
    // Vertical line check.
    if (p1.x === p2.x) {
      
      // Slope is infinite or something like that.
      m = Infinity;
      // Set c to the x intercept.
      c = p1.x;
    
    } else {
      
      // Slope: (y2 - y1) / (x2 - x1).
      m = (p2.y - p1.y) / (p2.x - p1.x);
      // Y intercept: y - y1 = m(x - x1) => c = y1 - m(x1).
      c = p1.y - m * p1.x;
    
    }
    
    // Return.
    return {m, c};
  }

  // Point of intersection of two lines.
  function intersection(L1, L2) {

    // x and y coords of points of intersection.
    let x, y;

    // Non intersection or same line check.
    if (L1.m == L2.m) {
      
      // Use null to signify no such point.
      x = null;
      y = null;

    } else {
      
      // x of intercept.
      let x = (L1.c - L2.c) / (L2.m - L1.m);
      
      // y of intercept.
      let y = L1.m * x + L1.c;
      
    }

    // Return.
    return {x, y};

  }

  // Extreme points in viewbox of line from two points.
  function extreme_points(p1, p2) {
    
    let extreme = 10000;

    // The four values we're going to calculate.
    let x1, y1, x2, y2;

    // Equation of the line.
    let {m, c} = equation_of_line(p1, p2)
        
    // Check if line is vertical.
    if (m === Infinity) {

      // The y values are just the top and bottom.
      y1 = -extreme;
      y2 = extreme;
      
      // The x values are the x intercept.
      x1 = c;
      x2 = c;

    } else {

      // If the line is steep then use the y's as inputs.
      if (Math.abs(m) > 1) {
        
        // The y values are the top and bottom of the viewbox.
        y1 = -extreme;
        y2 = extreme;
        
        // x = (y - c) / m
        x1 = (y1 - c) / m;
        x2 = (y2 - c) / m;
      
      } else {
        
        // The x values are the left and right of the viewbox.
        x1 = -extreme;
        x2 = extreme;
        
        // y = mx + c
        y1 = (m * x1) + c;
        y2 = (m * x2) + c;
    
      }
    }

    // Return the extreme line points.
    return [x1, x2, y1, y2];
  }

  // Distance between two points.
  function distance(p1, p2) {
    // Calculate x and y offsets.
    let a = p2.x - p1.x;
    let b = p2.y - p1.y;
    // Pythagoras.
    return Math.sqrt(a * a + b * b);
  }
  


  
  /***************************************************************************
   * Drawing functions.
  ***************************************************************************/
 
  function draw() {
    let layer = new Konva.Layer();

    // Draw the circles.
    for (const circle of circles) {
      // Extract the two points.
      let p1 = points[circle[0]];
      let p2 = points[circle[1]];
      // Create new circle.
      layer.add(new Konva.Circle({
        x: p1.x,
        y: p1.y,
        radius: distance(p1, p2),
        stroke: colors.purple,
        strokewidth: 4,
        dash: [5,5],
      }));
    };

    // Draw the lines.
    for (const line of lines) {
      // Extract the two points.
      let p1 = points[line[0]];
      let p2 = points[line[1]];
      // Draw the line.
      layer.add(new Konva.Line({
        points: extreme_points(p1, p2), // [p1.x, p1.y, p2.x, p2.y],
        stroke: colors.green,
        strokewidth: 4,
        dash: [5,5],
      }));
    };

    // Draw the points.
    for (const [label, point] of Object.entries(points)) {
      // Draw the point.
      let circle = new Konva.Circle({
        x: point.x,
        y: point.y,
        radius: 8,
        fill: colors.blue,
        stroke: colors.purple,
        strokewidth: 1,
        label: label,
      });
      circle.on('pointerdown', function () {
        this.stroke('red');
        
        console.log(stage);
        console.log(layer);

        layer.add(new Konva.Circle({
          x: -stage.attrs.x,
          y: -stage.attrs.y,
          radius: 20,
          fill: colors.cyan,
        }));
      });
      layer.add(circle);
      // Draw the label.
      layer.add(new Konva.Text({
        x: point.x + point.labelx,
        y: point.y + point.labely,
        text: label,
        fontSize: 16,
        fontFamily: 'Calibri',
        fill: colors.pink,
      }));
    };



    stage.add(layer);
  }

  draw();


  /***************************************************************************
   * Parameters and preliminaries for display.
  ***************************************************************************/

  // Number of of SVG units between 0 and 1.
  const unit = 100;

  // Line thickness.
  const thickness = 1;
  
  // Line dashes.
  const dashes = 14;
  
  // Radius of a point.
  const dotradius = 5;
  
  // Label font size.
  const labelfontsize = 14;

  // Toolbar size.
  const tb = 30;

  // Circle mode is false, line mode is true.
  let ui_mode = true;


  
// })(this);