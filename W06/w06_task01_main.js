d3.csv("https://haruor.github.io/InfoVis2025/W06/w06_task01.csv")
    .then( data => {
        data.forEach( d => { d.x = +d.x; d.y = +d.y; });

        // XとYの最小値を取得してマージンに設定
        const x_min_margin = d3.min(data, d => d.x);
        const y_min_margin = d3.min(data, d => d.y);

        var config = {
            parent: '#drawing_region',
            width: 256 + x_min_margin * 2, // 左右に最小値分のマージンを追加
            height: 256 + y_min_margin * 2, // 上下に最小値分のマージンを追加
            margin: {top: y_min_margin, right: x_min_margin, bottom: y_min_margin, left: x_min_margin}
        };

        const scatter_plot = new ScatterPlot( config, data );
        scatter_plot.update();
    })
    .catch( error => {
        console.log( error );
    });

class ScatterPlot {

    constructor( config, data ) {
        this.config = {
            parent: config.parent,
            width: config.width || 256,
            height: config.height || 256,
            margin: config.margin || {top:0, right:0, bottom:0, left:0}
        }
        this.data = data;
        this.init();
    }

    init() {
        let self = this;

        self.svg = d3.select( self.config.parent )
            .attr('width', self.config.width)
            .attr('height', self.config.height);

        self.chart = self.svg.append('g')
            .attr('transform', `translate(${self.config.margin.left}, ${self.config.margin.top})`);

        self.inner_width = self.config.width - self.config.margin.left - self.config.margin.right;
        self.inner_height = self.config.height - self.config.margin.top - self.config.margin.bottom;

        self.xscale = d3.scaleLinear()
            .range( [0, self.inner_width] );

        self.yscale = d3.scaleLinear()
            .range( [self.inner_height, 0] ); // Y軸を上に行くほど大きくする

        self.xaxis = d3.axisBottom( self.xscale )
            .ticks(6);

        self.yaxis = d3.axisLeft( self.yscale )
            .ticks(6);

        self.xaxis_group = self.chart.append('g')
            .attr('transform', `translate(0, ${self.inner_height})`);

        self.yaxis_group = self.chart.append('g')
            .attr('transform', `translate(0, 0)`);
    }

    update() {
        let self = this;

        // X軸とY軸の最小値と最大値をマージンで拡張
        const xmin = 0;
        const xmax = d3.max( self.data, d => d.x ) + self.config.margin.right; // 右側にマージンを追加
        self.xscale.domain( [xmin - self.config.margin.left, xmax] ); // 左側にもマージンを追加

        const ymin = 0;
        const ymax = d3.max( self.data, d => d.y ) + self.config.margin.top; // 上側にマージンを追加
        self.yscale.domain( [ymin - self.config.margin.bottom, ymax] ); // 下側にもマージンを追加

        self.render();
    }

    render() {
        let self = this;

        self.chart.selectAll("circle")
            .data(self.data)
            .enter()
            .append("circle")
            .attr("cx", d => self.xscale( d.x ) )
            .attr("cy", d => self.yscale( d.y ) )
            .attr("r", d => d.r )
            .attr("fill", d => d.color); // 色を設定

        self.xaxis_group
            .call( self.xaxis );

        self.yaxis_group
            .call( self.yaxis );
    }
}
