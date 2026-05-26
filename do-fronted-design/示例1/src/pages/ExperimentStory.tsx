import styles from './ExperimentStory.module.css';

const activationSeries = [
  { day: 'D1', control: 11.4, variant: 13.2 },
  { day: 'D2', control: 12.1, variant: 14.6 },
  { day: 'D3', control: 12.5, variant: 15.1 },
  { day: 'D4', control: 13.0, variant: 15.5 },
  { day: 'D5', control: 13.6, variant: 16.0 },
  { day: 'D6', control: 13.9, variant: 16.2 },
  { day: 'D7', control: 14.1, variant: 16.7 },
];

const retentionSegments = [
  { segment: '轻度访问', control: 36.4, variant: 42.8 },
  { segment: '移动端新客', control: 31.2, variant: 39.5 },
  { segment: '高意向来源', control: 44.1, variant: 47.4 },
  { segment: '低速网络', control: 28.9, variant: 30.3 },
];

const confidenceIntervals = [
  { metric: '注册完成率', low: 1.8, mean: 3.2, high: 4.5 },
  { metric: '首单转化率', low: 0.6, mean: 1.5, high: 2.7 },
  { metric: '7日激活率', low: 2.9, mean: 4.1, high: 5.3 },
];

const limitations = [
  '节假日流量仅覆盖 3 天，长期波动尚未完全吸收。',
  '低速网络用户提升有限，说明页面素材仍偏重。',
  '样本来自新用户首访，不能直接外推到老用户召回场景。',
];

const actionItems = [
  '按来源渠道进行灰度放量，优先移动端新客。',
  '补做低速网络轻量版本并复测。',
  '在次月复盘中加入 14 日留存与收入指标。',
];

const chartMin = 8;
const chartMax = 20;
const chartStartX = 52;
const chartGapX = 72;

const toY = (value: number) => 28 + ((chartMax - value) / (chartMax - chartMin)) * 194;

const controlPoints = activationSeries
  .map((point, index) => `${chartStartX + index * chartGapX},${toY(point.control)}`)
  .join(' ');

const variantPoints = activationSeries
  .map((point, index) => `${chartStartX + index * chartGapX},${toY(point.variant)}`)
  .join(' ');

const intervalMin = -1;
const intervalMax = 6;
const toIntervalPercent = (value: number) => ((value - intervalMin) / (intervalMax - intervalMin)) * 100;

export default function ExperimentStory() {
  return (
    <main className={styles.page}>
      <div className={styles.texture} aria-hidden="true" />
      <article className={styles.story}>
        <header className={`${styles.hero} ${styles.reveal}`}>
          <p className={styles.kicker}>实验叙事 · 增长实验 042</p>
          <h1 className={styles.title}>首屏文案改版，让新用户 7 日激活率提升 18.4%</h1>
          <p className={styles.lead}>
            在 42,816 名新访客随机对照实验中，实验组显著优于对照组，结论可在 3 分钟内被业务团队直接采纳并执行。
          </p>

          <dl className={styles.stats}>
            <div className={styles.statItem}>
              <dt>样本量</dt>
              <dd>42,816</dd>
            </div>
            <div className={styles.statItem}>
              <dt>统计置信度</dt>
              <dd>95%</dd>
            </div>
            <div className={styles.statItem}>
              <dt>净提升</dt>
              <dd>+2.6pp</dd>
            </div>
          </dl>
        </header>

        <section className={`${styles.method} ${styles.revealSoft}`} aria-labelledby="method-title">
          <div>
            <p className={styles.sectionTag}>方法说明</p>
            <h2 id="method-title">我们如何确保这个结论可靠</h2>
          </div>
          <ul className={styles.methodList}>
            <li>随机分流 50/50，对照组与实验组流量质量一致。</li>
            <li>以首访后 7 日激活行为为主指标，避免短期点击噪声。</li>
            <li>剔除异常会话与机器人流量，维持口径统一。</li>
            <li>结果按设备、来源、网络条件分层复核。</li>
          </ul>
        </section>

        <section className={`${styles.chartSection} ${styles.revealSoftLate}`} aria-labelledby="chart-title">
          <div className={styles.chartHeader}>
            <p className={styles.sectionTag}>关键证据</p>
            <h2 id="chart-title">3 个图，快速看懂提升来自哪里</h2>
          </div>

          <div className={styles.chartGrid}>
            <article className={`${styles.chartCard} ${styles.chartWide}`}>
              <h3>图 1 · 7 日激活率趋势</h3>
              <p className={styles.chartDesc}>实验组在第 2 天后稳定拉开差距，说明改版不仅提高首日触发，也改善后续完成路径。</p>
              <svg
                viewBox="0 0 560 280"
                className={styles.chartSvg}
                role="img"
                aria-labelledby="line-chart-title line-chart-desc"
              >
                <title id="line-chart-title">对照组与实验组 7 日激活率趋势线</title>
                <desc id="line-chart-desc">实验组曲线全程高于对照组，D7 达到 16.7%，对照组为 14.1%。</desc>
                {[8, 10, 12, 14, 16, 18, 20].map((tick) => (
                  <g key={tick}>
                    <line x1="52" y1={toY(tick)} x2="520" y2={toY(tick)} className={styles.gridLine} />
                    <text x="22" y={toY(tick) + 4} className={styles.axisLabel}>
                      {tick}%
                    </text>
                  </g>
                ))}
                <line x1="52" y1="222" x2="520" y2="222" className={styles.axisStrong} />
                <polyline points={controlPoints} className={styles.lineControl} />
                <polyline points={variantPoints} className={styles.lineVariant} />
                {activationSeries.map((point, index) => {
                  const x = chartStartX + index * chartGapX;
                  return (
                    <g key={point.day}>
                      <circle cx={x} cy={toY(point.control)} r="3" className={styles.dotControl} />
                      <circle cx={x} cy={toY(point.variant)} r="3.5" className={styles.dotVariant} />
                      <text x={x - 10} y="246" className={styles.axisLabel}>
                        {point.day}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div className={styles.legend}>
                <span><i className={styles.legendControl} />对照组</span>
                <span><i className={styles.legendVariant} />实验组</span>
              </div>
            </article>

            <article className={`${styles.chartCard} ${styles.chartTall}`}>
              <h3>图 2 · 分人群留存对比</h3>
              <p className={styles.chartDesc}>移动端新客受益最明显，低速网络提升偏小，是下阶段优化重点。</p>
              <div className={styles.retentionWrap} role="img" aria-label="分人群留存率：每行包含对照组和实验组两条横向条形。">
                {retentionSegments.map((segment) => (
                  <div className={styles.retentionRow} key={segment.segment}>
                    <div className={styles.retentionTop}>
                      <span className={styles.rowLabel}>{segment.segment}</span>
                      <span className={styles.rowDelta}>+{(segment.variant - segment.control).toFixed(1)}pp</span>
                    </div>
                    <div className={styles.barTrack}>
                      <span className={styles.barControl} style={{ width: `${segment.control}%` }} />
                      <span className={styles.barVariant} style={{ width: `${segment.variant}%` }} />
                    </div>
                    <p className={styles.rowValues}>对照 {segment.control}% · 实验 {segment.variant}%</p>
                  </div>
                ))}
              </div>
            </article>

            <article className={`${styles.chartCard} ${styles.chartNarrow}`}>
              <h3>图 3 · 置信区间</h3>
              <p className={styles.chartDesc}>核心指标区间均高于 0，提升具有统计意义，其中 7 日激活率最稳健。</p>
              <div className={styles.intervalWrap} role="img" aria-label="各指标 uplift 置信区间，横轴范围为 -1 到 +6 个百分点。">
                {confidenceIntervals.map((item) => {
                  const left = toIntervalPercent(item.low);
                  const width = toIntervalPercent(item.high) - toIntervalPercent(item.low);
                  const mean = toIntervalPercent(item.mean);

                  return (
                    <div className={styles.intervalRow} key={item.metric}>
                      <span className={styles.rowLabel}>{item.metric}</span>
                      <div className={styles.intervalTrack}>
                        <span className={styles.intervalZero} style={{ left: `${toIntervalPercent(0)}%` }} />
                        <span className={styles.intervalRange} style={{ left: `${left}%`, width: `${width}%` }} />
                        <span className={styles.intervalDot} style={{ left: `${mean}%` }} />
                      </div>
                      <span className={styles.rowDelta}>{item.mean.toFixed(1)}pp</span>
                    </div>
                  );
                })}
              </div>
            </article>
          </div>
        </section>

        <section className={`${styles.limitSection} ${styles.revealSoftLate}`} aria-labelledby="limit-title">
          <div>
            <p className={styles.sectionTagDark}>反例 / 局限</p>
            <h2 id="limit-title">这份结果不能直接回答的问题</h2>
          </div>
          <ul className={styles.limitList}>
            {limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className={`${styles.cta} ${styles.revealSoftLate}`} aria-labelledby="cta-title">
          <div>
            <p className={styles.sectionTag}>最终建议</p>
            <h2 id="cta-title">建议本周进入分渠道灰度上线</h2>
            <p className={styles.ctaText}>优先扩展移动端新客入口，同时设定低速网络保护策略，确保收益可持续放大。</p>
          </div>
          <ol className={styles.actionList}>
            {actionItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
          <div className={styles.ctaActions}>
            <button type="button" className={styles.primaryButton}>发起灰度评审</button>
            <button type="button" className={styles.ghostButton}>下载摘要给业务团队</button>
          </div>
        </section>
      </article>
    </main>
  );
}
