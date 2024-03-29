function FileTree(data) {
  let margin = { top: 10, right: 20, bottom: 30, left: 20 },
    width = 150,
    height = 1000,
    barHeight = 20;

  let i = 0,
    duration = 50,
    root;

  let nodeEnterTransition = d3.transition()
    .duration(duration)
    .ease(d3.easeLinear);


  let svg = d3.select(".start").append("svg")
    .attr("width", width) // + margin.left + margin.right)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  root = d3.hierarchy(data);
  root.x0 = 0;
  root.y0 = 0;
  update(root);



  function update(source) {
    // Compute the flattened node list.
    var nodes = root.descendants();

    var height = Math.max(500, nodes.length * barHeight + margin.top + margin.bottom);

    d3.select("svg").transition()
      .attr("height", height);

    var index = -1;
    root.eachBefore((n) => {
      n.x = ++index * barHeight;
      n.y = n.depth * 20;
    });

    // Update the nodes…
    var node = svg.selectAll(".node")
      .data(nodes, (d) => d.id || (d.id = ++i));

    var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", () => "translate(" + source.y0 + "," + source.x0 + ")")
      .on("click", click)
      ;

    // adding arrows
    nodeEnter.append('text')
      .attr('x', -20)
      .attr('y', 2)
      .attr('fill', 'grey')
      .attr('class', 'arrow')
      .attr('class', 'fas')
      .attr('font-size', '12px')
      .text((d) => d.children ? '\uf107' : d._children ? '\uf105' : "");

    // adding file or folder
    nodeEnter.append('text')
      .attr('x', -10)
      .attr('y', 2)
      .attr('fill', (d) => d.children || d._children ? '#e60000' : '#ff4d4d')
      .attr('class', 'fas')
      .attr('font-size', '12px')
      .text((d) => d.children || d._children ? '\uf07b' : '\uf15b');

    // adding file or folder names
    nodeEnter.append("text")
      .attr("dy", 3.5)
      .attr("dx", 5.5)
      .text((d) => d.data.name)
      .on("mouseover", function (d) {
        d3.select(this).classed("selected", true);
      })
      .on("mouseout", function (d) {
        d3.selectAll(".selected").classed("selected", false);
      });


    // Transition nodes to their new position.
    nodeEnter.transition(nodeEnterTransition)
      .attr("transform", (d) => "translate(" + d.y + "," + d.x + ")")
      .style("opacity", 1);

    node.transition()
      .duration(duration)
      .attr("transform", (d) => "translate(" + d.y + "," + d.x + ")")
      .style("opacity", 1);


    // Transition exiting nodes to the parent's new position.
    node.exit().transition()
      .duration(duration)
      .attr("transform", () => "translate(" + source.y + "," + source.x + ")")
      .style("opacity", 0)
      .remove();


    // Stash the old positions for transition.
    root.each((d) => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  // Toggle children on click.
  function click(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }

    // If file, send navigate event
    if (d.data.path) {
      sendEvent('filetree:navigate', d.data.path);
    }

    // editor.SetCurrentPage(d.data.path);
    // window.location.href = '...'
    d3.select(this).remove()
    update(d);
  }
}