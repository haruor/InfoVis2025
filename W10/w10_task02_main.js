var svg = d3.select('#drawing_region');

var data = []; // CSV 読み込み後に設定

// CSV を読み込み、数値化して r を既定値 10 に設定、color も読み込む
d3.csv('w10_task02.csv', d => ({ x: +d.x, y: +d.y, r: 10, color: d.color }))
  .then(rows => {
    data = rows; // [{x,y,r,color}, ...]
    render();
  })
  .catch(err => console.error('CSV読み込みエラー:', err));

function render() {
    // データバインド（key は座標の組み合わせ）
    let sel = svg.selectAll('circle')
        .data(data, d => `${d.x}-${d.y}`);

    sel.join(
        enter => enter.append('circle')
                      .attr('cx', d => d.x)
                      .attr('cy', d => d.y)
                      .attr('r', d => d.r)
                      .attr('fill', d => d.color || 'steelblue'),
        update => update
                      .attr('cx', d => d.x)
                      .attr('cy', d => d.y)
                      .attr('r', d => d.r)
                      .attr('fill', d => d.color || 'steelblue'),
        exit => exit.remove()
    );

    // すべての円にツールチップイベントを付与
    svg.selectAll('circle').call(attachTooltipEvents);
}

function attachTooltipEvents(selection) {
    selection
        .on('mouseover', (e,d) => {
            d3.select('#tooltip')
                .style('opacity', 1)
                .html(`<div class="tooltip-label">Position</div>(${d.x}, ${d.y})`);
        })
        .on('mousemove', (e) => {
            const padding = 10;
            d3.select('#tooltip')
                .style('left', (e.pageX + padding) + 'px')
                .style('top', (e.pageY + padding) + 'px');
        })
        .on('mouseleave', () => {
            d3.select('#tooltip')
                .style('opacity', 0);
        });
}
