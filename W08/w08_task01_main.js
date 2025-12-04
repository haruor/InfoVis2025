class BarChart {
    constructor(config, data) {
        this.config = {
            parent: config.parent,
            width: config.width || 256,
            height: config.height || 128,
            margin: config.margin || {top: 10, right: 10, bottom: 20, left: 60}
        };
        this.data = data;
        this.init();
    }

    init() {
        const { width, height, margin } = this.config;

        this.svg = d3.select(this.config.parent)
            .attr('width', width)
            .attr('height', height);

        this.chart = this.svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        this.inner_width = width - margin.left - margin.right;
        this.inner_height = height - margin.top - margin.bottom;

        // Initialize axis scales
        this.xscale = d3.scaleLinear()
            .range([0, this.inner_width]);

        this.yscale = d3.scaleBand()
            .range([0, this.inner_height])
            .paddingInner(0.1);

        // Initialize axes
        this.xaxis = d3.axisBottom(this.xscale)
            .ticks(5)
            .tickSizeOuter(0);

        this.yaxis = d3.axisLeft(this.yscale)
            .tickSizeOuter(0);

        // Append axis groups
        this.xaxis_group = this.chart.append('g')
            .attr('transform', `translate(0, ${this.inner_height})`);

        this.yaxis_group = this.chart.append('g');
    }

    update() {
        // Update scales based on the data
        this.xscale.domain([0, d3.max(this.data, d => d.value)]);
        this.yscale.domain(this.data.map(d => d.label));

        // Update axes
        this.xaxis_group.call(this.xaxis);
        this.yaxis_group.call(this.yaxis);
    }

    render() {
        // Draw bars
        this.chart.selectAll("rect")
            .data(this.data)
            .join("rect")
            .attr("x", 0)
            .attr("y", d => this.yscale(d.label))
            .attr("width", d => this.xscale(d.value))
            .attr("height", this.yscale.bandwidth());
    }
}

// Import data from an external CSV file
d3.csv("w08_task01.csv").then(data => {
    // Convert data to numbers
    data.forEach(d => {
        d.value = +d.value; // Convert value to a number
    });

    const config = {
        parent: '#drawing_region',
        width: 256,
        height: 128,
        margin: {top: 10, right: 10, bottom: 20, left: 60}
    };

    const barChart = new BarChart(config, data);
    barChart.update();
    barChart.render();
});
