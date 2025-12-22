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
            const tip = d3.select('#tooltip');
            tip.html(`<div class="tooltip-label">Position</div>(${d.x}, ${d.y})`)
               .classed('visible', true);
            // 初回位置更新（mousemove でも更新されるので必須ではない）
            positionTooltip(e, tip.node());
        })
        .on('mousemove', (e,d) => {
            const tip = d3.select('#tooltip');
            positionTooltip(e, tip.node());
        })
        .on('mouseleave', () => {
            d3.select('#tooltip')
              .classed('visible', false);
        });
}

// 左上に収めるなどオーバーフロー対策を行う補助関数
function positionTooltip(event, tipNode) {
    if (!tipNode) return;
    const padding = 10;
    const tooltipRect = tipNode.getBoundingClientRect();
    let left = event.pageX + 12;
    let top = event.pageY + 12;

    // 右端に収める
    const maxLeft = window.pageXOffset + window.innerWidth - tooltipRect.width - padding;
    if (left > maxLeft) left = Math.max(window.pageXOffset + padding, maxLeft);

    // 下端に収める（ツールチップが画面下に出る場合は上に表示）
    const maxTop = window.pageYOffset + window.innerHeight - tooltipRect.height - padding;
    if (top > maxTop) top = event.pageY - tooltipRect.height - 12;
    if (top < window.pageYOffset + padding) top = window.pageYOffset + padding;

    d3.select(tipNode)
      .style('left', left + 'px')
      .style('top', top + 'px');
}
