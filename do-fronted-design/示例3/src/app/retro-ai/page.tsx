import styles from './page.module.css';

const features = [
  {
    title: 'One-Click Launch Canvas',
    description:
      '把模糊想法在 60 秒内落地成可执行策略图，自动串联目标、路径和度量。',
    badge: '核心卖点',
  },
  {
    title: 'Signal Radar',
    description:
      '实时聚合产品反馈、竞品动态与团队节奏，帮助你在变化发生前先做决策。',
    badge: '差异化能力 01',
  },
  {
    title: 'Decision Playback',
    description:
      '关键决策全链路可回放，清晰展示“为什么这样做”，让跨团队对齐更快。',
    badge: '差异化能力 02',
  },
] as const;

const steps = [
  {
    title: '输入目标',
    description: '写下业务目标与约束，系统会自动拆分成可执行任务。',
  },
  {
    title: '生成方案',
    description: 'AI 同步产出路线图、优先级和风险提示，支持即时调参。',
  },
  {
    title: '一键推进',
    description: '将方案推送到团队工作流并持续追踪结果，避免“计划即停滞”。',
  },
] as const;

const faqs = [
  {
    question: '这个工具适合已经有成熟流程的团队吗？',
    answer:
      '适合。它不会替换你的流程，而是把已有流程变得更快、更可追踪，尤其适合跨职能协作。',
  },
  {
    question: '数据安全和权限如何保障？',
    answer:
      '默认最小权限访问，支持角色分层查看。所有关键操作都可审计回溯，满足企业级治理需求。',
  },
  {
    question: '从试用到正式上线需要多长时间？',
    answer:
      '通常当天可完成试用配置，1-3 天可接入团队真实工作流并开始产出可衡量结果。',
  },
] as const;

const socialProof = [
  '服务 420+ AI 产品团队',
  '平均 2.7 倍提案通过率提升',
  '上线首周决策周期缩短 38%',
];

export default function RetroAiPage() {
  return (
    <main className={styles.page}>
      <div className={styles.backgroundLayer} aria-hidden="true">
        <div className={styles.orbA} />
        <div className={styles.orbB} />
        <div className={styles.grid} />
      </div>

      <section className={styles.hero}>
        <p className={styles.kicker}>RETRO-FUTURISTIC PRODUCT OPS</p>
        <h1 className={styles.title}>让 AI 产品策略从想法，直接进入执行轨道</h1>
        <p className={styles.subtitle}>
          为 AI 产品经理打造的策略中枢：更快对齐目标、更稳推进落地、更清晰衡量价值。
        </p>
        <div className={styles.heroActions}>
          <a className={styles.primaryButton} href="#final-cta">
            免费开始试用
          </a>
          <a className={styles.secondaryButton} href="#features">
            查看核心能力
          </a>
        </div>
        <div className={styles.heroMetricWrap} role="list" aria-label="关键指标">
          <div className={styles.metricCard} role="listitem">
            <span className={styles.metricValue}>60s</span>
            <span className={styles.metricLabel}>从目标到执行草案</span>
          </div>
          <div className={styles.metricCard} role="listitem">
            <span className={styles.metricValue}>99.9%</span>
            <span className={styles.metricLabel}>任务链路可追踪率</span>
          </div>
          <div className={styles.metricCard} role="listitem">
            <span className={styles.metricValue}>38%</span>
            <span className={styles.metricLabel}>决策周期平均缩短</span>
          </div>
        </div>
      </section>

      <section className={styles.socialProof} aria-label="客户与结果">
        <ul className={styles.socialProofList}>
          {socialProof.map((item) => (
            <li key={item} className={styles.socialProofItem}>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} id="features" aria-labelledby="features-title">
        <div className={styles.sectionHeading}>
          <p className={styles.sectionEyebrow}>FEATURES</p>
          <h2 id="features-title">三个能力，覆盖 AI 产品落地关键链路</h2>
        </div>
        <div className={styles.featureGrid}>
          {features.map((feature) => (
            <article key={feature.title} className={styles.featureCard}>
              <p className={styles.featureBadge}>{feature.badge}</p>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="flow-title">
        <div className={styles.sectionHeading}>
          <p className={styles.sectionEyebrow}>WORKFLOW</p>
          <h2 id="flow-title">三步完成从规划到推进</h2>
        </div>
        <ol className={styles.steps}>
          {steps.map((step, index) => (
            <li key={step.title} className={styles.stepCard}>
              <span className={styles.stepIndex} aria-hidden="true">
                0{index + 1}
              </span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.section} aria-labelledby="faq-title">
        <div className={styles.sectionHeading}>
          <p className={styles.sectionEyebrow}>FAQ</p>
          <h2 id="faq-title">你可能关心的问题</h2>
        </div>
        <div className={styles.faqList}>
          {faqs.map((faq) => (
            <details key={faq.question} className={styles.faqItem}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={styles.finalCta} id="final-cta" aria-labelledby="cta-title">
        <p className={styles.sectionEyebrow}>READY TO SHIP FASTER</p>
        <h2 id="cta-title">把下一次关键发布，变成一次可预测的成功</h2>
        <p>
          现在开始，你的团队可以在同一个 AI 决策界面里，统一目标、计划与执行节奏。
        </p>
        <a className={styles.primaryButton} href="#" aria-label="注册并开始免费试用">
          立即注册免费试用
        </a>
      </section>
    </main>
  );
}
