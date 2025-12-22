var svg = d3.select('#drawing_region');

var data = []; // CSV 読み込み後に設定

// CSV を読み込み、数値に変換して r は既定値 10 を設定
d3.csv('w10_task02.csv', d => ({ x: +d.x, y: +d.y, r: 10 }))
  .then(rows => {
    data = rows; // [{x,y,r}, ...]
    render();
  })
  .catch(err => console.error('CSV読み込みエラー:', err));

function render() {
    // データバインド（簡潔に join を使用）
    let circles = svg.selectAll('circle')
        .data(data, (d,i) => `${d.x}-${d.y}`);

    circles.join(
        enter => enter.append('circle')
                      .attr('cx', d => d.x)
                      .attr('cy', d => d.y)
                      .attr('r', d => d.r)
                      .call(sel => attachTooltipEvents(sel)),
        update => update
                      .attr('cx', d => d.x)
                      .attr('cy', d => d.y)
                      .attr('r', d => d.r),
        exit => exit.remove()
    );
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
