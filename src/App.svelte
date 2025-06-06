<script lang="ts">
  export let name: string;

  interface DataPoint {
    x: number;
    y: number;
  }

  interface LinearFit {
    slope: number;
    intercept: number;
  }

  // Sample data points for curve fitting
  let dataPoints: DataPoint[] = [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
    { x: 2, y: 4 },
    { x: 3, y: 9 },
    { x: 4, y: 16 },
  ];

  let newX: string = '';
  let newY: string = '';

  function addPoint(): void {
    if (newX !== '' && newY !== '') {
      dataPoints = [...dataPoints, { x: parseFloat(newX), y: parseFloat(newY) }];
      newX = '';
      newY = '';
    }
  }

  function removePoint(index: number): void {
    dataPoints = dataPoints.filter((_, i) => i !== index);
  }

  // Simple linear regression
  function calculateLinearFit(points: DataPoint[]): LinearFit | null {
    if (points.length < 2) return null;

    const n = points.length;
    const sumX = points.reduce((sum, p) => sum + p.x, 0);
    const sumY = points.reduce((sum, p) => sum + p.y, 0);
    const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumX2 = points.reduce((sum, p) => sum + p.x * p.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  $: linearFit = calculateLinearFit(dataPoints);
  $: equation = linearFit
    ? `y = ${linearFit.slope.toFixed(3)}x + ${linearFit.intercept.toFixed(3)}`
    : 'Need at least 2 points';
</script>

<main>
  <h1>🔍 {name}</h1>
  <p>Interactive Curve Fitting Tool</p>

  <section class="input-section">
    <h2>Add Data Points</h2>
    <div class="input-group">
      <input type="number" bind:value={newX} placeholder="X value" step="any" />
      <input type="number" bind:value={newY} placeholder="Y value" step="any" />
      <button on:click={addPoint}>Add Point</button>
    </div>
  </section>

  <section class="data-section">
    <h2>Data Points ({dataPoints.length})</h2>
    <div class="points-grid">
      {#each dataPoints as point, i}
        <div class="point-card">
          <span>({point.x}, {point.y})</span>
          <button class="remove-btn" on:click={() => removePoint(i)}>×</button>
        </div>
      {/each}
    </div>
  </section>

  <section class="results-section">
    <h2>Linear Fit Result</h2>
    <div class="equation">
      <strong>{equation}</strong>
    </div>
    {#if linearFit}
      <div class="stats">
        <p>Slope: {linearFit.slope.toFixed(6)}</p>
        <p>Y-intercept: {linearFit.intercept.toFixed(6)}</p>
      </div>
    {/if}
  </section>

  <section class="visualization">
    <h2>Visualization</h2>
    <div class="plot-container">
      <svg viewBox="0 0 400 300" class="plot">
        <!-- Grid lines -->
        {#each Array(11) as _, i}
          <line x1={i * 40} y1="0" x2={i * 40} y2="300" stroke="#e0e0e0" stroke-width="0.5" />
          <line x1="0" y1={i * 30} x2="400" y2={i * 30} stroke="#e0e0e0" stroke-width="0.5" />
        {/each}

        <!-- Data points -->
        {#each dataPoints as point}
          <circle
            cx={point.x * 40 + 40}
            cy={280 - point.y * 20}
            r="4"
            fill="#ff6b6b"
            stroke="#fff"
            stroke-width="2"
          />
        {/each}

        <!-- Fit line -->
        {#if linearFit && dataPoints.length >= 2}
          {@const minX = Math.min(...dataPoints.map(p => p.x))}
          {@const maxX = Math.max(...dataPoints.map(p => p.x))}
          {@const y1 = linearFit.slope * minX + linearFit.intercept}
          {@const y2 = linearFit.slope * maxX + linearFit.intercept}
          <line
            x1={minX * 40 + 40}
            y1={280 - y1 * 20}
            x2={maxX * 40 + 40}
            y2={280 - y2 * 20}
            stroke="#4ecdc4"
            stroke-width="2"
          />
        {/if}
      </svg>
    </div>
  </section>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    color: #333;
  }

  main {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    border-radius: 15px;
    padding: 30px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }

  h1 {
    text-align: center;
    margin-bottom: 10px;
    color: #2c3e50;
    font-size: 2.5em;
  }

  p {
    text-align: center;
    color: #7f8c8d;
    margin-bottom: 30px;
    font-size: 1.1em;
  }

  section {
    margin-bottom: 30px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 10px;
    border: 1px solid #e9ecef;
  }

  h2 {
    margin-top: 0;
    color: #2c3e50;
    border-bottom: 2px solid #3498db;
    padding-bottom: 10px;
  }

  .input-group {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  input {
    padding: 12px;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
    flex: 1;
    min-width: 120px;
  }

  input:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }

  button {
    padding: 12px 20px;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  button:hover {
    background: #2980b9;
    transform: translateY(-2px);
  }

  .points-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
    margin-top: 15px;
  }

  .point-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    background: white;
    border-radius: 8px;
    border: 1px solid #dee2e6;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .remove-btn {
    background: #e74c3c;
    color: white;
    border: none;
    border-radius: 50%;
    width: 25px;
    height: 25px;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  .remove-btn:hover {
    background: #c0392b;
  }

  .equation {
    font-size: 1.5em;
    text-align: center;
    padding: 20px;
    background: #e8f4f8;
    border-radius: 8px;
    border-left: 4px solid #3498db;
    margin: 15px 0;
  }

  .stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin-top: 15px;
  }

  .stats p {
    margin: 0;
    padding: 10px;
    background: white;
    border-radius: 6px;
    text-align: center;
    border: 1px solid #dee2e6;
  }

  .plot-container {
    background: white;
    border-radius: 8px;
    padding: 20px;
    border: 1px solid #dee2e6;
    margin-top: 15px;
  }

  .plot {
    width: 100%;
    height: auto;
    border: 1px solid #ddd;
    border-radius: 6px;
  }

  @media (max-width: 600px) {
    main {
      margin: 0;
      border-radius: 0;
    }

    .input-group {
      flex-direction: column;
    }

    .stats {
      grid-template-columns: 1fr;
    }
  }
</style>
