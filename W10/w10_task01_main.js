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
    let padding = 10;
    let n = data.length;
    let gap = 10;
    let barWidth = Math.max(4, (svgW - padding * 2 - gap * (n - 1)) / n);

    // 値の最大を取得して高さスケールを作る
    let maxV = d3.max(data, d => d.value) || 0;
    let valueToHeight = d3.scaleLinear()
        .domain([0, maxV])
        .range([0, svgH - padding * 2]);

    // データに基づいて位置・サイズ・色を設定（縦向き）
    svg.selectAll("rect")
        .data(data, d => d.label)
        .join("rect")
        .attr("x", (d, i) => padding + i * (barWidth + gap))
        .attr("y", d => svgH - padding - valueToHeight(d.value)) // 下揃え
        .attr("width", barWidth)
        .attr("height", d => valueToHeight(d.value))
        .attr("fill", d => d.color || "steelblue");

    // ラベル（下に表示）
    svg.selectAll("text.label").data(data, d => d.label)
        .join(
            enter => enter.append("text").attr("class", "label"),
            update => update,
            exit => exit.remove()
        )
        .attr("x", (d, i) => padding + i * (barWidth + gap) + barWidth / 2)
        .attr("y", svgH - 2) // 下端付近
        .attr("text-anchor", "middle")
        .attr("font-size", 10)
        .text(d => d.label);
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
