class LineChart {
    constructor(config, data) {
        this.config = {
            parent: config.parent,
            width: config.width || 256,
            height: config.height || 128,
            margin: config.margin || {top: 10, right: 10, bottom: 10, left: 10}
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

        // Set up scales
        this.xscale = d3.scaleLinear()
            .range([0, this.inner_width]);

        this.yscale = d3.scaleLinear()
            .range([this.inner_height, 0]);

        // Set up axes
        this.xaxis = d3.axisBottom(this.xscale).ticks(5);
        this.yaxis = d3.axisLeft(this.yscale).ticks(5);

        // Add axis groups
        this.xaxis_group = this.chart.append('g')
            .attr('transform', `translate(0, ${this.inner_height})`);

        this.yaxis_group = this.chart.append('g');
    }

    update() {
        // Set the domain of the scales based on the data
        this.xscale.domain([0, d3.max(this.data, d => d.x)]);
        this.yscale.domain([0, d3.max(this.data, d => d.y)]);
    }

    render() {
        // Generate the line
        const line = d3.line()
            .x(d => this.xscale(d.x))
            .y(d => this.yscale(d.y));

        // Generate the area to fill under the line chart
        const area = d3.area()
            .x(d => this.xscale(d.x))
            .y1(d => this.yscale(d.y))
            .y0(this.inner_height); // Set the bottom of the area to the x-axis

        // Draw the area
        this.chart.append('path')
            .datum(this.data)
            .attr('d', area)
            .attr('fill', 'lightblue') // Color of the area
            .attr('opacity', 0.5);

        // Draw the line
        this.chart.append('path')
            .datum(this.data)
            .attr('d', line)
            .attr('stroke', 'blue') // Color of the line (darker)
            .attr('fill', 'none')
            .attr('stroke-width', 2);

        // Draw the points
        this.chart.selectAll('circle')
            .data(this.data)
            .join('circle')
            .attr('cx', d => this.xscale(d.x))
            .attr('cy', d => this.yscale(d.y))
            .attr('r', 4) // Radius of the points
            .attr('fill', 'blue'); // Color of the points (same as the line)

        // Draw the axes
        this.xaxis_group.call(this.xaxis);
        this.yaxis_group.call(this.yaxis);
    }
}

// Load data from an external CSV file
d3.csv("w08_task02.csv").then(data => {
    // Convert data to numbers
    data.forEach(d => {
        d.x = +d.x;
        d.y = +d.y;
    });

    const config = {
        parent: '#drawing_region',
        width: 256,
        height: 128,
        margin: {top: 10, right: 10, bottom: 20, left: 30}
    };

    const lineChart = new LineChart(config, data);
    lineChart.update();
    lineChart.render();
});
