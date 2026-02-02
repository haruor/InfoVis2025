// BarChart.js
class BarChart {
  constructor(config, data) {
    this.config = config;
    this.data = data;
    this.sortDescending = true;
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

    vis.xScale = d3.scaleBand().range([0, vis.innerWidth]).padding(0.2);
    vis.yScale = d3.scaleLinear().range([vis.innerHeight, 0]);

    vis.colorScale = d3.scaleOrdinal()
      .domain(["F", "G", "K", "M", "Other"])
      .range(["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#7f7f7f"]);

    vis.xAxisG = vis.g.append("g")
      .attr("transform", `translate(0,${vis.innerHeight})`);
    vis.yAxisG = vis.g.append("g");

    vis.g.append("text")
      .attr("x", vis.innerWidth / 2)
      .attr("y", vis.innerHeight + 45)
      .attr("text-anchor", "middle")
      .text("Spectral Class (F/G/K/M/Other)");

    vis.g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -vis.innerHeight / 2)
      .attr("y", -45)
      .attr("text-anchor", "middle")
      .text("Number of Planets (count)");
  }

  reverseOrder() {
    this.sortDescending = !this.sortDescending;
    this.update();
  }

  update() {
    const vis = this;

    const showOther = document.getElementById("show-other")?.checked ?? false;

    let base = vis.data || [];
    if (!showOther) base = base.filter(d => d.spec_class !== "Other");

    // rollup counts
    const rolled = d3.rollup(base, v => v.length, d => d.spec_class);
    let arr = Array.from(rolled, ([key, value]) => ({ key, value }));

    // ensure F/G/K/M exist even if zero
    const keys = showOther ? ["F", "G", "K", "M", "Other"] : ["F", "G", "K", "M"];
    keys.forEach(k => {
      if (!arr.find(d => d.key === k)) arr.push({ key: k, value: 0 });
    });

    // sort
    arr.sort((a, b) => vis.sortDescending ? (b.value - a.value) : (a.value - b.value));

    vis.aggregated = arr;

    vis.xScale.domain(arr.map(d => d.key));
    vis.yScale.domain([0, d3.max(arr, d => d.value) || 1]).nice();

    vis.render();
  }

  render() {
    const vis = this;

    vis.xAxisG.call(d3.axisBottom(vis.xScale));
    vis.yAxisG.call(d3.axisLeft(vis.yScale));

    const bars = vis.g.selectAll(".bar")
      .data(vis.aggregated, d => d.key);

    bars.exit().remove();

    const enter = bars.enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => vis.xScale(d.key))
      .attr("width", vis.xScale.bandwidth())
      .attr("y", vis.yScale(0))
      .attr("height", 0)
      .attr("fill", d => vis.colorScale(d.key))
      .style("cursor", "pointer");

    // click toggles filter -> calls global Filter()
    enter.on("click", (event, d) => {
      const f = window.filter || [];
      const idx = f.indexOf(d.key);
      if (idx >= 0) f.splice(idx, 1);
      else f.push(d.key);
      window.filter = f;

      vis.updateActiveStyle();
      window.Filter?.();
    });

    bars.merge(enter)
      .transition()
      .duration(400)
      .attr("x", d => vis.xScale(d.key))
      .attr("width", vis.xScale.bandwidth())
      .attr("y", d => vis.yScale(d.value))
      .attr("height", d => vis.innerHeight - vis.yScale(d.value))
      .attr("fill", d => vis.colorScale(d.key));

    vis.updateActiveStyle();
  }

  updateActiveStyle() {
    const vis = this;
    const active = window.filter || [];
    vis.g.selectAll(".bar")
      .classed("active", d => active.includes(d.key));
  }
}
