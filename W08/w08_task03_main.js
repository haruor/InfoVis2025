class PieChart {
    constructor(config, data) {
        this.config = {
            parent: config.parent,
            width: config.width || 256,
            height: config.height || 256,
            margin: config.margin || {top: 10, right: 10, bottom: 10, left: 10}
        };
        this.data = data;
        this.init();
    }

    init() {
        const { width, height } = this.config;

        this.radius = Math.min(width, height) / 2;

        this.svg = d3.select(this.config.parent)
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${width / 2}, ${height / 2})`);

        // Set up the pie chart
        this.pie = d3.pie()
            .value(d => d.value);

        // Set up the arc for the donut chart
        this.arc = d3.arc()
            .innerRadius(this.radius / 2) // Inner radius (for the donut hole)
            .outerRadius(this.radius); // Outer radius

        // Set up the arc for label positioning
        this.labelArc = d3.arc()
            .innerRadius((this.radius * 3) / 4) // Adjust label position
            .outerRadius((this.radius * 3) / 4);
    }

    update() {
        // Update the data for the pie chart
        this.pie_data = this.pie(this.data);
    }

    render() {
        // Set up the color scale
        const color = d3.scaleOrdinal(d3.schemeCategory10);

        // Draw the pie chart
        this.svg.selectAll('path')
            .data(this.pie_data)
            .join('path')
            .attr('d', this.arc)
            .attr('fill', (d, i) => color(i)) // Apply different colors to each segment
            .attr('stroke', 'white')
            .style('stroke-width', '2px');

        // Draw the labels
        this.svg.selectAll('text')
            .data(this.pie_data)
            .join('text')
            .attr('transform', d => `translate(${this.labelArc.centroid(d)})`) // Calculate label position
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .text(d => d.data.label) // Set the label text
            .attr('fill', 'black') // Set the label color to black
            .attr('font-size', '12px');
    }
}

// Load data from an external CSV file
d3.csv("w08_task03.csv").then(data => {
    // Convert data to numbers
    data.forEach(d => {
        d.value = +d.value; // Convert to numeric values
    });

    const config = {
        parent: '#drawing_region',
        width: 256,
        height: 256,
        margin: {top: 10, right: 10, bottom: 10, left: 10}
    };

    const pieChart = new PieChart(config, data);
    pieChart.update();
    pieChart.render();
});
