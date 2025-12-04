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

        // スケールの設定
        this.xscale = d3.scaleLinear()
            .range([0, this.inner_width]);

        this.yscale = d3.scaleLinear()
            .range([this.inner_height, 0]);

        // 軸の設定
        this.xaxis = d3.axisBottom(this.xscale).ticks(5);
        this.yaxis = d3.axisLeft(this.yscale).ticks(5);

        // 軸グループの追加
        this.xaxis_group = this.chart.append('g')
            .attr('transform', `translate(0, ${this.inner_height})`);

        this.yaxis_group = this.chart.append('g');
    }

    update() {
        // スケールのドメインをデータに基づいて設定
        this.xscale.domain([0, d3.max(this.data, d => d.x)]);
        this.yscale.domain([0, d3.max(this.data, d => d.y)]);
    }

    render() {
        // 折れ線の生成
        const line = d3.line()
            .x(d => this.xscale(d.x))
            .y(d => this.yscale(d.y));

        // 折れ線グラフの領域を塗るためのエリア生成
        const area = d3.area()
            .x(d => this.xscale(d.x))
            .y1(d => this.yscale(d.y))
            .y0(this.inner_height); // x軸に接するように設定

        // 領域を描画
        this.chart.append('path')
            .datum(this.data)
            .attr('d', area)
            .attr('fill', 'lightblue') // 領域の色
            .attr('opacity', 0.5);

        // 折れ線を描画
        this.chart.append('path')
            .datum(this.data)
            .attr('d', line)
            .attr('stroke', 'blue') // 折れ線の色（濃い色）
            .attr('fill', 'none')
            .attr('stroke-width', 2);

        // 点を描画
        this.chart.selectAll('circle')
            .data(this.data)
            .join('circle')
            .attr('cx', d => this.xscale(d.x))
            .attr('cy', d => this.yscale(d.y))
            .attr('r', 4) // 点の半径
            .attr('fill', 'blue'); // 点の色（折れ線と同じ濃い色）

        // 軸を描画
        this.xaxis_group.call(this.xaxis);
        this.yaxis_group.call(this.yaxis);
    }
}

// 外部CSVファイルからデータを読み込む
d3.csv("w08_task02.csv").then(data => {
    // データを数値に変換
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
