 fetch('/data')
            .then(response => response.json())
            .then(data => {
                // Task 1: Histogram
                function createHistograms(data) {
                    const japaneseShips = data.filter(d => d.Country === "Japan" && d.Displacement)
                        .map(d => {
                            const displacement = d.Displacement.split(" ")[0].replace(",", "");
                            return parseFloat(displacement) || 0; // Default to 0 if parsing fails
                        });

                    const usShips = data.filter(d => d.Country === "United States" && d.Displacement)
                        .map(d => {
                            const displacement = d.Displacement.split(" ")[0].replace(",", "");
                            return parseFloat(displacement) || 0; // Default to 0 if parsing fails
                        });

                    function drawHistogram(data, containerId, color, title, xLabel, yLabel) {
                        const bins = d3.bin().thresholds(10)(data);
                        const width = 400, height = 300, margin = {top: 20, right: 20, bottom: 60, left: 70};

                        const x = d3.scaleLinear()
                            .domain([0, d3.max(data)])
                            .range([0, width]);
                        const y = d3.scaleLinear()
                            .domain([0, d3.max(bins, d => d.length)])
                            .range([height, 0]);

                        const svg = d3.select(containerId)
                            .append("svg")
                            .attr("width", width + margin.left + margin.right)
                            .attr("height", height + margin.top + margin.bottom)
                            .append("g")
                            .attr("transform", `translate(${margin.left},${margin.top})`);

                        svg.selectAll(".bar")
                            .data(bins)
                            .join("rect")
                            .attr("class", "bar")
                            .attr("x", d => x(d.x0))
                            .attr("y", d => y(d.length))
                            .attr("width", d => x(d.x1) - x(d.x0) - 1)
                            .attr("height", d => height - y(d.length))
                            .attr("fill", color);

                        svg.append("g")
                            .attr("transform", `translate(0,${height})`)
                            .call(d3.axisBottom(x));
                        svg.append("g").call(d3.axisLeft(y));

                        svg.append("text")
                            .attr("x", width / 2)
                            .attr("y", height + margin.bottom - 20)
                            .attr("text-anchor", "middle")
                            .style("font-size", "14px")
                            .text(xLabel);

                        svg.append("text")
                            .attr("x", -height / 2)
                            .attr("y", -margin.left + 20)
                            .attr("text-anchor", "middle")
                            .style("font-size", "14px")
                            .attr("transform", "rotate(-90)")
                            .text(yLabel);

                        svg.append("text")
                            .attr("x", width / 2)
                            .attr("y", -margin.top / 2)
                            .attr("text-anchor", "middle")
                            .style("font-size", "16px")
                            .style("font-weight", "bold")
                            .text(title);
                    }

                    drawHistogram(japaneseShips, "#chart-task1-japanese", "steelblue", "Japanese Ships Displacement", "Displacement (binned)", "Count of Records");
                    drawHistogram(usShips, "#chart-task1-us", "orange", "U.S. Ships Displacement", "Displacement (binned)", "Count of Records");
                }

                createHistograms(data);

                // Task 2: Length-to-Beam Ratio
                function createLengthToBeamRatioChart(data) {
                    const aggregatedData = d3.rollups(
                        data.filter(d => d.Length && d.Beam),
                        v => d3.mean(v, d => parseFloat(d.Length) / parseFloat(d.Beam)),
                        d => d['Ship Class']
                    ).sort((a, b) => b[1] - a[1]);

                    const width = 800, height = 1000, margin = { top: 20, right: 30, bottom: 60, left: 200 };
                    const svg = d3.select("#chart-task2")
                        .append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", `translate(${margin.left},${margin.top})`);

                    const y = d3.scaleBand()
                        .domain(aggregatedData.map(d => d[0]))
                        .range([0, height])
                        .padding(0.2);

                    const x = d3.scaleLinear()
                        .domain([0, d3.max(aggregatedData, d => d[1])])
                        .range([0, width]);

                    svg.append("g").call(d3.axisLeft(y));
                    svg.append("g")
                        .attr("transform", `translate(0,${height})`)
                        .call(d3.axisBottom(x));

                    svg.selectAll(".bar")
                        .data(aggregatedData)
                        .join("rect")
                        .attr("class", "bar")
                        .attr("y", d => y(d[0]))
                        .attr("x", 0)
                        .attr("width", d => x(d[1]))
                        .attr("height", y.bandwidth())
                        .attr("fill", "steelblue");

                    svg.append("text")
                        .attr("x", width / 2)
                        .attr("y", height + margin.bottom - 20)
                        .attr("text-anchor", "middle")
                        .style("font-size", "14px")
                        .text("Average Length-to-Beam Ratio");

                    svg.append("text")
                        .attr("x", -height / 2)
                        .attr("y", -margin.left + 20)
                        .attr("text-anchor", "middle")
                        .style("font-size", "14px")
                        .attr("transform", "rotate(-90)")
                        .text("Ship Class");

                    svg.append("text")
                        .attr("x", width / 2)
                        .attr("y", -margin.top / 2)
                        .attr("text-anchor", "middle")
                        .style("font-size", "16px")
                        .style("font-weight", "bold")
                        .text("Length-to-Beam Ratio by Ship Class");
                }

                createLengthToBeamRatioChart(data);

                // Task 3: Ship Class Count
                function createShipClassCountChart(data) {
                    const aggregatedData = d3.rollups(
                        data,
                        v => v.length,
                        d => d['Ship Class']
                    ).sort((a, b) => b[1] - a[1])
                        .slice(0, 20);

                    const width = 800, height = 800, margin = { top: 20, right: 30, bottom: 60, left: 200 };
                    const svg = d3.select("#chart-task3")
                        .append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", `translate(${margin.left},${margin.top})`);

                    const y = d3.scaleBand()
                        .domain(aggregatedData.map(d => d[0]))
                        .range([0, height])
                        .padding(0.2);

                    const x = d3.scaleLinear()
                        .domain([0, d3.max(aggregatedData, d => d[1])])
                        .range([0, width]);

                    svg.append("g").call(d3.axisLeft(y));
                    svg.append("g")
                        .attr("transform", `translate(0,${height})`)
                        .call(d3.axisBottom(x));

                    svg.selectAll(".bar")
                        .data(aggregatedData)
                        .join("rect")
                        .attr("class", "bar")
                        .attr("y", d => y(d[0]))
                        .attr("x", 0)
                        .attr("width", d => x(d[1]))
                        .attr("height", y.bandwidth())
                        .attr("fill", "steelblue");

                    svg.append("text")
                        .attr("x", width / 2)
                        .attr("y", height + margin.bottom - 20)
                        .attr("text-anchor", "middle")
                        .style("font-size", "14px")
                        .text("Number of Ships");

                    svg.append("text")
                        .attr("x", -height / 2)
                        .attr("y", -margin.left + 20)
                        .attr("text-anchor", "middle")
                        .style("font-size", "14px")
                        .attr("transform", "rotate(-90)")
                        .text("Ship Class");

                    svg.append("text")
                        .attr("x", width / 2)
                        .attr("y", -margin.top / 2)
                        .attr("text-anchor", "middle")
                        .style("font-size", "16px")
                        .style("font-weight", "bold")
                        .text("Number of Ships by Ship Class");
                }

                createShipClassCountChart(data);

                // Task 4: Exploratory Visualization
                function createExploratoryChart(data) {
                    const commissioningYears = data.map(d => {
                        if (!d.Commissioned) return null; // Skip undefined entries
                        const yearMatch = d.Commissioned.match(/\d{4}/);
                        return yearMatch ? parseInt(yearMatch[0], 10) : null;
                    }).filter(year => year);

                    const yearCounts = d3.rollups(commissioningYears, v => v.length, d => d)
                        .sort((a, b) => a[0] - b[0]);

                    const width = 600, height = 300, margin = { top: 20, right: 20, bottom: 60, left: 70 };
                    const x = d3.scaleLinear().domain(d3.extent(yearCounts, d => d[0])).range([0, width]);
                    const y = d3.scaleLinear().domain([0, d3.max(yearCounts, d => d[1])]).range([height, 0]);

                    const svg = d3.select("#chart-task4")
                        .append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", `translate(${margin.left},${margin.top})`);

                    const line = d3.line()
                        .x(d => x(d[0]))
                        .y(d => y(d[1]));

                    svg.append("path")
                        .datum(yearCounts)
                        .attr("d", line)
                        .attr("fill", "none")
                        .attr("stroke", "steelblue")
                        .attr("stroke-width", 2);

                    svg.append("g")
                        .attr("transform", `translate(0,${height})`)
                        .call(d3.axisBottom(x));
                    svg.append("g").call(d3.axisLeft(y));

                    svg.append("text")
                        .attr("x", width / 2)
                        .attr("y", height + margin.bottom - 20)
                        .attr("text-anchor", "middle")
                        .style("font-size", "14px")
                        .text("Year");

                    svg.append("text")
                        .attr("x", -height / 2)
                        .attr("y", -margin.left + 20)
                        .attr("text-anchor", "middle")
                        .style("font-size", "14px")
                        .attr("transform", "rotate(-90)")
                        .text("Number of Ships Commissioned");

                    svg.append("text")
                        .attr("x", width / 2)
                        .attr("y", -margin.top / 2)
                        .attr("text-anchor", "middle")
                        .style("font-size", "16px")
                        .style("font-weight", "bold")
                        .text("Ship Commissioning Trend Over Time");
                }

                createExploratoryChart(data);
            })
            .catch(err => console.error("Error fetching or processing data:", err));
