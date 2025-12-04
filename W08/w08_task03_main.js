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

        // パイチャートの設定
        this.pie = d3.pie()
            .value(d => d.value);

        // ドーナツ状の円弧の設定
        this.arc = d3.arc()
            .innerRadius(this.radius / 2) // 内側の半径（ドーナツの中心部分）
            .outerRadius(this.radius); // 外側の半径

        // ラベルの位置を計算するための円弧
        this.labelArc = d3.arc()
            .innerRadius((this.radius * 3) / 4) // ラベルの位置を調整
            .outerRadius((this.radius * 3) / 4);
    }

    update() {
        // データを更新する場合に必要な処理を記述
        this.pie_data = this.pie(this.data);
    }

    render() {
        // カラースケールを設定
        const color = d3.scaleOrdinal(d3.schemeCategory10);

        // 円グラフを描画
        this.svg.selectAll('path')
            .data(this.pie_data)
            .join('path')
            .attr('d', this.arc)
            .attr('fill', (d, i) => color(i)) // 各セグメントに異なる色を適用
            .attr('stroke', 'white')
            .style('stroke-width', '2px');

        // ラベルを描画
        this.svg.selectAll('text')
            .data(this.pie_data)
            .join('text')
            .attr('transform', d => `translate(${this.labelArc.centroid(d)})`) // ラベルの位置を計算
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .text(d => d.data.label) // ラベルのテキスト
            .attr('fill', 'black') // ラベルの色を黒に設定
            .attr('font-size', '12px');
    }
}

// 外部CSVファイルからデータを読み込む
d3.csv("w08_task03.csv").then(data => {
    // データを数値に変換
    data.forEach(d => {
        d.value = +d.value; // 数値に変換
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
