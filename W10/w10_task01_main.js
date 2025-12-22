var svg = d3.select('#drawing_region');

var data = []; // CSV 読み込み後に設定

// CSV を読み込み、value を数値に変換して data に格納して表示
d3.csv('w10_task01.csv', d => ({ value: +d.value, label: d.label }))
  .then(rows => {
    // オブジェクト配列として保持（label をキーにできる想定）
    data = rows.map(r => ({ value: r.value, label: r.label }));
    update(data);
  })
  .catch(err => console.error('CSV読み込みエラー:', err));

function update(data) {
    let padding = 10;
    let height = 20;
    // label をキーにしてバインドし、属性を更新
    svg.selectAll("rect")
        .data(data, d => d.label)
        .join("rect")
        .attr("x", padding)
        .attr("y", (d,i) => padding + i * ( height + padding ))
        .attr("width", d => d.value)
        .attr("height", height);

    // DOM の並び順をデータの順に合わせて並べ替え（これで見た目の上下順が変わる）
    svg.selectAll("rect").order();
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
