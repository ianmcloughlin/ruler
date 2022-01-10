
// (function() {

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

  // SVG viewbox.
  let viewbox = [-400, -400, 800, 800];

  var stage = new Konva.Stage({
    container: 'plane',
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // add canvas element
  var layer = new Konva.Layer();
  stage.add(layer);

  // create shape
  var box = new Konva.Rect({
    x: 50,
    y: 50,
    width: 100,
    height: 50,
    fill: '#00D2FF',
    stroke: 'black',
    strokeWidth: 4,
    draggable: true,
  });
  layer.add(box);

  // add cursor styling
  box.on('mouseover', function () {
    document.body.style.cursor = 'pointer';
  });
  box.on('mouseout', function () {
    document.body.style.cursor = 'default';
  });


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
    
    // The four values we're gonig to calculate.
    let x1, y1, x2, y2;

    // Equation of the line.
    let {m, c} = equation_of_line(p1, p2)
        
    // Check if line is vertical.
    if (m === Infinity) {

      // The y values are just the top and bottom of the viewbox.
      y1 = viewbox[1];
      y2 = viewbox[1] + viewbox[3];
      
      // The x values are the x intercept.
      x1 = c;
      x2 = c;

    } else {

      // If the line is steep then use the y's as inputs.
      if (Math.abs(m) > 1) {
        
        // The y values are the top and bottom of the viewbox.
        y1 = viewbox[1];
        y2 = viewbox[1] + viewbox[3];
        
        // x = (y - c) / m
        x1 = (y1 - c) / m;
        x2 = (y2 - c) / m;
      
      } else {
        
        // The x values are the left and right of the viewbox.
        x1 = viewbox[0];
        x2 = viewbox[0] + viewbox[2];
        
        // y = mx + c
        y1 = (m * x1) + c;
        y2 = (m * x2) + c;
    
      }
    }

    // Return the extreme line points.
    return {x1, x2, y1, y2};
  }

  // Centre and radius of a circle from two points in an array.
  function centre_and_radius(p1, p2) {
  
    // Calculate radius.
    let a = p2.x - p1.x;
    let b = p2.y - p1.y;
    let r = Math.sqrt(a * a + b * b);

    // Return the circle parameters for the SVG element.
    return {cx: p1.x, cy: p1.y, r};

  }
  

  
  /***************************************************************************
   * Initial ponts, lines, and circles.
  ***************************************************************************/

  // Constructed points.
  let points = [{
    '0': {
      x: 0,
      y: 0,
      labelx: -15,
      labely: 15,
    }, 
    '1': {
      x: 100,
      y: 0,
      labelx: -15,
      labely: 15,
    }, 
    '2': {
      x: 200,
      y: 0,
      labelx: -15,
      labely: 15,
    },
    'A': {
      x: 100,
      y: 100,
      labelx: -15,
      labely: 15,
    },
    'B': {
      x: 200,
      y: -100,
      labelx: -15,
      labely: 15,
    },
  }];
  
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
   * Painting the ponts, lines, and circles.
  ***************************************************************************/

  function paint() {

    // The coordinates of the lines and circles in the SVG.
    let svg_lines, svg_circles ;

    // Calculate the SVG lines from the lines.
    svg_lines = lines.map(line => {
      // Get the points with the labels in line.
      let p1 = points.filter(obj => obj.label == line[0])[0];
      let p2 = points.filter(obj => obj.label == line[1])[0];
      // Calculate the extreme points.
      return extreme_points(p1, p2);
    });

    // Calculate the SVG circles from the circles.  
    svg_circles = circles.map(circle => {
      // Get the points with the labels in line.
      let p1 = points.filter(obj => obj.label == circle[0])[0];
      let p2 = points.filter(obj => obj.label == circle[1])[0];
      // Calculate the radius and centre.
      return centre_and_radius(p1, p2);
    });
  }



  /***************************************************************************
   * Toolbar.
  ***************************************************************************/
  // Status of straightedge situation.
  let status_straightedge = {
    active: true,
    pointone: null,
  }

  // Point click handler.
  function point_click(e) {
    me = d3.select(this);
    if (status_straightedge.pointone) {
      if (status_straightedge.pointone !== me.datum().label) {
        // Push line.
        lines.push([status_straightedge.pointone, me.datum().label]);
        // Clear status.
        status_straightedge.active = false;
        status_straightedge.pointone = null;
        paint();
      }
    } else {
      // Save point.
      status_straightedge.pointone = me.datum().label;
    }
  }

  
  // The straightedge button.
  function button_straightedge(e) {
    let me = d3.select(this);
    me.classed("toolbar-button-inactive", !me.classed("toolbar-button-inactive"));
    me.classed("toolbar-button-active", !me.classed("toolbar-button-active"));
  }


  
// })(this);