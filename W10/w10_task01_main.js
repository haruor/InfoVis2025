var svg = d3.select('#drawing_region');

var data = []; // CSV 読み込み後に設定

// CSV を読み込み、value を数値に変換して data に格納して表示（color も読み込む）
d3.csv('w10_task01.csv', d => ({ value: +d.value, label: d.label, color: d.color }))
  .then(rows => {
    data = rows; // オブジェクト配列 [{value,label,color}, ...]
    update(data);
  })
  .catch(err => console.error('CSV読み込みエラー:', err));

function update(data) {
    let svgW = +svg.attr('width');
    let svgH = +svg.attr('height');

    // マージン（軸表示のため）
    let margin = { top: 20, right: 10, bottom: 40, left: 40 };
    let innerW = svgW - margin.left - margin.right;
    let innerH = svgH - margin.top - margin.bottom;

    // スケール
    let xScale = d3.scaleBand()
        .domain(data.map(d => d.label))
        .range([margin.left, margin.left + innerW])
        .padding(0.1);

    let maxV = d3.max(data, d => d.value) || 0;
    let yScale = d3.scaleLinear()
        .domain([0, maxV])
        .nice()
        .range([margin.top + innerH, margin.top]); // 下 -> 上

    // 棒
    svg.selectAll("rect")
        .data(data, d => d.label)
        .join("rect")
        .attr("x", d => xScale(d.label))
        .attr("y", d => yScale(d.value))
        .attr("width", xScale.bandwidth())
        .attr("height", d => (yScale(0) - yScale(d.value)))
        .attr("fill", d => d.color || "steelblue");

    // X軸（カテゴリ）: 軸自体とラベル
    svg.selectAll("g.x-axis").data([null])
        .join("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${margin.top + innerH})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("font-size", 10);

    // X軸の説明ラベル（中央）
    svg.selectAll("text.x-label").data([null])
        .join("text")
        .attr("class", "x-label")
        .attr("x", margin.left + innerW / 2)
        .attr("y", svgH - 6)
        .attr("text-anchor", "middle")
        .attr("font-size", 12)
        .text("Category");

    // Y軸（値）: 目盛り表示
    svg.selectAll("g.y-axis").data([null])
        .join("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale).ticks(5))
        .selectAll("text")
        .attr("font-size", 10);

    // Y軸の説明ラベル（回転して中央に）
    svg.selectAll("text.y-label").data([null])
        .join("text")
        .attr("class", "y-label")
        .attr("transform", `translate(${10}, ${margin.top + innerH/2}) rotate(-90)`)
        .attr("text-anchor", "middle")
        .attr("font-size", 12)
        .text("Value");
}

d3.select('#reverse')
    .on('click', () => {
        data.reverse();
        update(data);
    });

// Descend: 値の降順でソート
d3.select('#descend')
    .on('click', () => {
        data.sort((a,b) => b.value - a.value);
        update(data);
    });

// Ascend: 値の昇順でソート
d3.select('#ascend')
    .on('click', () => {
        data.sort((a,b) => a.value - b.value);
        update(data);
    });
