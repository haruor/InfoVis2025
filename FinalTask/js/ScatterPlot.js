// ScatterPlot.js
class ScatterPlot {
  constructor(config, data) {
    this.config = config;
    this.data = data;
    this.initVis();
  }

  setData(data) {
    this.data = data;
  }

  initVis() {
    const vis = this;

    vis.width = vis.config.width;
    vis.height = vis.config.height;
    vis.margin = vis.config.margin;

    vis.innerWidth = vis.width - vis.margin.left - vis.margin.right;
    vis.innerHeight = vis.height - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select(vis.config.parent)
      .attr("width", vis.width)
      .attr("height", vis.height);

    vis.g = vis.svg.append("g")
      .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

    // scales
    vis.xScale = d3.scaleLinear().range([0, vis.innerWidth]);
    vis.yScale = d3.scaleLinear().range([vis.innerHeight, 0]);
    vis.rScale = d3.scaleSqrt().range([2.5, 8]);

    // colors by spec_class
    vis.colorScale = d3.scaleOrdinal()
      .domain(["F", "G", "K", "M", "Other"])
      .range(["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#7f7f7f"]);

    // axes
    vis.xAxisG = vis.g.append("g")
      .attr("transform", `translate(0,${vis.innerHeight})`);
    vis.yAxisG = vis.g.append("g");

    // labels
    vis.g.append("text")
      .attr("x", vis.innerWidth / 2)
      .attr("y", vis.innerHeight + 45)
      .attr("text-anchor", "middle")
      .text("Equilibrium Temperature (K)");

    vis.g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -vis.innerHeight / 2)
      .attr("y", -50)
      .attr("text-anchor", "middle")
      .text("Planet Radius (Earth radii)");

    // tooltip div (exists in index.html)
    vis.tooltip = d3.select("#tooltip");
  }

  update() {
    const vis = this;

    if (!vis.data || vis.data.length === 0) {
      vis.g.selectAll(".point").remove();
      return;
    }

    // domains
    vis.xScale.domain(d3.extent(vis.data, d => d.pl_eqt)).nice();
    vis.yScale.domain(d3.extent(vis.data, d => d.pl_rade)).nice();

    // radius scale by orbital period if present
    const orb = vis.data.filter(d => Number.isFinite(d.pl_orbper)).map(d => d.pl_orbper);
    if (orb.length > 0) vis.rScale.domain(d3.extent(orb)).nice();
    else vis.rScale.domain([0, 1]);

    vis.render();
  }

  render() {
    const vis = this;

    vis.xAxisG.call(d3.axisBottom(vis.xScale));
    vis.yAxisG.call(d3.axisLeft(vis.yScale));

    const points = vis.g.selectAll(".point")
      .data(vis.data, d => d.pl_name);

    points.exit().remove();

    const enter = points.enter()
      .append("circle")
      .attr("class", "point")
      .attr("opacity", 0.85)
      .attr("cx", d => vis.xScale(d.pl_eqt))
      .attr("cy", d => vis.yScale(d.pl_rade))
      .attr("r", d => Number.isFinite(d.pl_orbper) ? vis.rScale(d.pl_orbper) : 4)
      .attr("fill", d => vis.colorScale(d.spec_class));

    // tooltip events
    enter
      .on("mouseover", (event, d) => {
        vis.tooltip
          .style("opacity", 1)
          .html(`
            <div><b>${d.pl_name}</b></div>
            <div>spec: ${d.spec_class} (${d.st_spectype ?? "n/a"})</div>
            <div>R: ${d.pl_rade}</div>
            <div>Teq: ${d.pl_eqt}</div>
            <div>Porb: ${Number.isFinite(d.pl_orbper) ? d.pl_orbper : "n/a"}</div>
          `);
      })
      .on("mousemove", (event) => {
        vis.tooltip
          .style("left", (event.pageX + 12) + "px")
          .style("top", (event.pageY + 12) + "px");
      })
      .on("mouseleave", () => vis.tooltip.style("opacity", 0));

    // update + transition
    points.merge(enter)
      .transition()
      .duration(400)
      .attr("cx", d => vis.xScale(d.pl_eqt))
      .attr("cy", d => vis.yScale(d.pl_rade))
      .attr("r", d => Number.isFinite(d.pl_orbper) ? vis.rScale(d.pl_orbper) : 4)
      .attr("fill", d => vis.colorScale(d.spec_class));
  }
}
