var svg = d3.select('#drawing_region');

var data = []; // CSV 読み込み後に設定

// CSV を読み込み、数値化して r を既定値 6 に設定、color は指定がなければ 'black'
d3.csv('w10_task02.csv', d => ({ x: +d.x, y: +d.y, r: 6, color: d.color || 'black' }))
  .then(rows => {
    data = rows; // [{x,y,r,color}, ...]
    render();
  })
  .catch(err => console.error('CSV読み込みエラー:', err));

function render() {
    const svgW = +svg.attr('width');
    const svgH = +svg.attr('height');

    // マージン確保（軸・ラベル・タイトル用）
    const margin = { top: 30, right: 20, bottom: 50, left: 50 };
    const innerW = svgW - margin.left - margin.right;
    const innerH = svgH - margin.top - margin.bottom;

    // データ範囲（少しパディングを入れて端に点が重ならないようにする）
    const xExtent = d3.extent(data, d => d.x);
    const yExtent = d3.extent(data, d => d.y);
    const xPad = (xExtent[1] - xExtent[0]) * 0.05 || 1;
    const yPad = (yExtent[1] - yExtent[0]) * 0.05 || 1;
    const xDomain = [xExtent[0] - xPad, xExtent[1] + xPad];
    const yDomain = [yExtent[0] - yPad, yExtent[1] + yPad];

    // スケール（描画領域に収める）
    const xScale = d3.scaleLinear()
        .domain(xDomain)
        .range([margin.left, margin.left + innerW]);

    const yScale = d3.scaleLinear()
        .domain(yDomain)
        .range([margin.top + innerH, margin.top]); // SVG の y は上方向に小さいので反転

    // 軸表示領域（再利用可能な g 要素）
    svg.selectAll('g.x-axis').data([null])
        .join('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${margin.top + innerH})`)
        .call(d3.axisBottom(xScale).ticks(6))
        .selectAll('text')
        .attr('font-size', 10);

    svg.selectAll('g.y-axis').data([null])
        .join('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale).ticks(6))
        .selectAll('text')
        .attr('font-size', 10);

    // 軸ラベル
    svg.selectAll('text.x-label').data([null])
        .join('text')
        .attr('class', 'x-label')
        .attr('x', margin.left + innerW / 2)
        .attr('y', svgH - 12)
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
        .text('X');

    svg.selectAll('text.y-label').data([null])
        .join('text')
        .attr('class', 'y-label')
        .attr('transform', `translate(${12}, ${margin.top + innerH / 2}) rotate(-90)`)
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
        .text('Y');

    // タイトル
    svg.selectAll('text.title').data([null])
        .join('text')
        .attr('class', 'title')
        .attr('x', margin.left + innerW / 2)
        .attr('y', 16)
        .attr('text-anchor', 'middle')
        .attr('font-size', 14)
        .attr('font-weight', '600')
        .text('Sample Data');

    // 円の描画（スケールで座標をマップ）
    const sel = svg.selectAll('circle.data-point')
        .data(data, d => `${d.x}-${d.y}`);

    sel.join(
        enter => enter.append('circle')
                      .attr('class', 'data-point')
                      .attr('cx', d => xScale(d.x))
                      .attr('cy', d => yScale(d.y))
                      .attr('r', d => d.r)
                      .attr('fill', d => d.color || 'black')
                      .attr('stroke', '#00000000'), // 境界不要だが保険
        update => update
                      .attr('cx', d => xScale(d.x))
                      .attr('cy', d => yScale(d.y))
                      .attr('r', d => d.r)
                      .attr('fill', d => d.color || 'black'),
        exit => exit.remove()
    );

    // イベントを付与（ツールチップ・クリック）
    svg.selectAll('circle.data-point').call(attachTooltipEvents);
}

function attachTooltipEvents(selection) {
    selection
        .on('mouseover', (e,d) => {
            const tip = d3.select('#tooltip');
            tip.html(`<div class="tooltip-label">Position</div>(${d.x}, ${d.y})`)
               .classed('visible', true);
            positionTooltip(e, tip.node());
        })
        .on('mousemove', (e,d) => {
            const tip = d3.select('#tooltip');
            positionTooltip(e, tip.node());
        })
        .on('mouseleave', () => {
            d3.select('#tooltip').classed('visible', false);
        })
        .on('click', (e,d) => {
            // クリックで色をトグル（黒 <-> 赤）
            d.color = (d.color === 'red') ? 'black' : 'red';
            d3.select(e.currentTarget).attr('fill', d.color);
        });
}

// ツールチップ位置補正（画面端に収める）
function positionTooltip(event, tipNode) {
    if (!tipNode) return;
    const padding = 8;
    const tooltipRect = tipNode.getBoundingClientRect();
    let left = event.pageX + 12;
    let top = event.pageY + 12;

    const maxLeft = window.pageXOffset + window.innerWidth - tooltipRect.width - padding;
    if (left > maxLeft) left = Math.max(window.pageXOffset + padding, maxLeft);

    const maxTop = window.pageYOffset + window.innerHeight - tooltipRect.height - padding;
    if (top > maxTop) top = event.pageY - tooltipRect.height - 12;
    if (top < window.pageYOffset + padding) top = window.pageYOffset + padding;

    d3.select(tipNode)
      .style('left', left + 'px')
      .style('top', top + 'px');
}
