var svg = d3.select('#drawing_region');

var data = []; // CSV 読み込み後に設定

// CSV を読み込み、value を数値に変換して data に格納して表示
d3.csv('w10_task01.csv', d => ({ value: +d.value, label: d.label }))
  .then(rows => {
    data = rows.map(r => r.value);
    update(data);
  })
  .catch(err => console.error('CSV読み込みエラー:', err));

function update(data) {
    let padding = 10;
    let height = 20;
    svg.selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", padding)
        .attr("y", (d,i) => padding + i * ( height + padding ))
        .attr("width", d => d)
        .attr("height", height);
}

d3.select('#reverse')
    .on('click', () => {
        data.reverse();
        update(data);
    });

// Descend: 値の降順でソート
d3.select('#descend')
    .on('click', () => {
        data.sort((a,b) => b - a);
        update(data);
    });

// Ascend: 値の昇順でソート
d3.select('#ascend')
    .on('click', () => {
        data.sort((a,b) => a - b);
        update(data);
    });
