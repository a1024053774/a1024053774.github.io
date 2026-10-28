---
layout:       post
title:        "从 PPO 到 GRPO：大模型后训练中的策略优化与偏好对齐"
subtitle:     "从 RLHF-PPO 的四模型架构，到 DPO 的隐式奖励推导，再到 GRPO 的组内相对优势与可验证奖励"
date:         2025-07-05 12:00:00 -0400
author:       "LuckyE"
header-style: text
catalog:      true
tags:
    - 强化学习
    - RLHF
    - PPO
    - DPO
    - GRPO
---

<div class="nb-sheet" markdown="1">

<p class="nb-lede">前文梳理了策略梯度定理与 PPO 的基础推导，这里从 PPO 接着往后讲：DPO 如何把强化学习变成一个分类损失，GRPO 又如何去掉价值网络、改用同一题组内采样的相对优势。</p>

{% include related-reading.html title="前序笔记：策略梯度与 REINFORCE" summary="《PPO、GRPO 的理论基础》从 Value-Based 方法的局限切入，推导了策略梯度定理与 REINFORCE 算法。本文承接这一脉络，继续拆解 PPO 在大模型后训练中的落地形态，以及 DPO 与 GRPO 的推导与演进。" url="/2025/07/04/PPO_GRPO_策略梯度理论基础/" label="回看：PPO、GRPO 与策略梯度理论基础" %}

<div class="nb-kicker">§1</div>

## 大模型后训练全景

预训练学的是“续写”，后训练要它学会“按人想要的方式回答”。现在的主流顺序是先 SFT，再做偏好优化或强化学习。

<div class="nb-flow" role="list">
  <div class="nb-stage" role="listitem"><b>预训练</b><span class="nb-desc">海量文本，预测下一个 token</span></div>
  <div class="nb-arrow" aria-hidden="true">→</div>
  <div class="nb-stage is-hl" role="listitem"><b>SFT 监督微调</b><span class="nb-desc">(指令, 标准答案) 对，交叉熵损失</span></div>
  <div class="nb-arrow" aria-hidden="true">→</div>
  <div class="nb-stage" role="listitem"><b>偏好 / 强化学习</b><span class="nb-desc">三条路：<br>RM + PPO（InstructGPT）<br>DPO 系（离线偏好对）<br>GRPO 系（可验证奖励，R1）</span></div>
</div>

三条路要解决同一个问题：SFT 只告诉模型“这个答案对”，没告诉它“这个比那个好多少”，也没法让模型从自己生成的答案里学习。

<div class="nb-kicker">§2</div>

## PPO 回顾：放到大模型里是什么样

传统的 PPO 多用于 CartPole、Atari 那种环境。换到大模型上，对应关系是这样：

<table>
  <thead>
    <tr><th>RL 概念</th><th>在 LLM 里</th></tr>
  </thead>
  <tbody>
    <tr><td>状态 $s_t$</td><td>prompt + 已经生成的前 $t$ 个 token</td></tr>
    <tr><td>动作 $a_t$</td><td>下一个 token（动作空间 = 词表，十几万）</td></tr>
    <tr><td>策略 $\pi_\theta$</td><td>正在训练的大模型本身</td></tr>
    <tr><td>奖励</td><td>整段回答生成完才有一个分数（奖励模型给），中间每个 token 只有 KL 惩罚</td></tr>
    <tr><td>一条轨迹</td><td>一次完整回答</td></tr>
  </tbody>
</table>

### RLHF-PPO 显存里要放 4 个模型

- **Policy（Actor）**：被训练的模型。
- **Reference**：SFT 后的冻结副本，算 KL，防止模型跑偏到胡言乱语。
- **Reward Model**：用人类偏好对训练出来的打分模型，冻结。
- **Value Model（Critic）**：估计每个位置的 $V(s)$，用来算优势，也要训练。通常和 policy 一样大。

每个 token 的奖励写成：

<div class="nb-math">
$$r_t = -\beta \log\frac{\pi_\theta(a_t\mid s_t)}{\pi_{\text{ref}}(a_t\mid s_t)} \;+\; \mathbb{1}[t=T]\cdot r_{\text{RM}}(x,y)$$
</div>

优势 $A_t$ 用 GAE 从 critic 的 $V$ 值算出来，然后套 PPO 的裁剪目标：

<div class="nb-math">
$$L^{\text{CLIP}} = \mathbb{E}_t\Big[\min\big(\rho_t A_t,\ \operatorname{clip}(\rho_t,1-\varepsilon,1+\varepsilon)A_t\big)\Big],\quad \rho_t=\frac{\pi_\theta(a_t\mid s_t)}{\pi_{\theta_\text{old}}(a_t\mid s_t)}$$
</div>

<div class="nb-lab" id="ppoLab">
  <div class="nb-lab__title">试一下：PPO 的裁剪在做什么（ε = 0.2）</div>
  <div class="nb-ctrl"><label for="ppoA">优势 A</label><input id="ppoA" type="range" min="-2" max="2" step="0.1" value="1"><output id="ppoAv">1.0</output></div>
  <div class="nb-ctrl"><label for="ppoR">新旧概率比 ρ</label><input id="ppoR" type="range" min="0.3" max="2" step="0.01" value="1.5"><output id="ppoRv">1.50</output></div>
  <div class="nb-readout"><span>未裁剪 ρA = <b id="ppoRaw"></b></span><span>PPO 目标 = <b id="ppoClip"></b></span><span id="ppoMsg"></span></div>
  <canvas id="ppoCanvas" class="nb-canvas" width="800" height="180" aria-label="PPO 目标随 ρ 变化的曲线"></canvas>
</div>

一句话记：**好动作（$A>0$）概率最多涨到 $1+\varepsilon$，坏动作（$A<0$）最多压到 $1-\varepsilon$，再往外梯度为零。**这样一批数据可以重复用几轮而不把策略推得太远。

<div class="nb-note nb-note--warn"><b class="nb-tag">PPO 的痛点</b>4 个模型同时在显存里，critic 和 policy 一样大；奖励模型会被钻空子（reward hacking，比如越写越长分越高）；超参多，训练不稳。后面两种方法分别砍掉了其中几块。</div>

<div class="nb-kicker">§3</div>

## DPO：不训练奖励模型，也不做采样

DPO（Rafailov 等，2023）的出发点：带 KL 约束的 RLHF 目标，最优策略其实有解析解。

### 三步推导

1. RLHF 目标是“最大化奖励，同时 KL 别离参考模型太远”。它的最优解是：
   <div class="nb-math">
   $$\pi^*(y\mid x)=\frac{1}{Z(x)}\,\pi_{\text{ref}}(y\mid x)\exp\!\Big(\frac{1}{\beta}r(x,y)\Big)$$
   </div>
2. 反过来，奖励可以用策略表示：
   <div class="nb-math">
   $$r(x,y)=\beta\log\frac{\pi^*(y\mid x)}{\pi_{\text{ref}}(y\mid x)}+\beta\log Z(x)$$
   </div>
   $Z(x)$ 算不出来，但它只跟 $x$ 有关。
3. 人类偏好用 Bradley-Terry 模型：$P(y_w \succ y_l) = \sigma(r_w - r_l)$。两条回答相减，$Z(x)$ 正好消掉，得到 DPO 损失：
   <div class="nb-math">
   $$\mathcal{L}_{\text{DPO}}=-\log\sigma\Big(\beta\Big[\log\frac{\pi_\theta(y_w\mid x)}{\pi_{\text{ref}}(y_w\mid x)}-\log\frac{\pi_\theta(y_l\mid x)}{\pi_{\text{ref}}(y_l\mid x)}\Big]\Big)$$
   </div>

所以 DPO 本质上是一个二分类损失：让模型对“好回答”的相对概率涨得比“坏回答”多。只需要 policy 和 reference 两个模型，数据是现成的 `(prompt, chosen, rejected)` 三元组。

<div class="nb-lab" id="dpoLab">
  <div class="nb-lab__title">试一下：DPO 损失和梯度权重</div>
  <div class="nb-ctrl"><label for="dpoM">对数比差 Δ</label><input id="dpoM" type="range" min="-30" max="30" step="0.5" value="0"><output id="dpoMv">0.0</output></div>
  <div class="nb-ctrl"><label for="dpoB">β</label><input id="dpoB" type="range" min="0.05" max="0.5" step="0.01" value="0.1"><output id="dpoBv">0.10</output></div>
  <div class="nb-readout"><span>损失 −log σ(βΔ) = <b id="dpoL"></b></span><span>梯度权重 σ(−βΔ) = <b id="dpoW"></b></span></div>
  <p class="nb-lab__caption">Δ 是括号里那一项：好回答的对数概率比减去坏回答的。Δ 已经很大时权重趋近 0，模型基本不再管这对样本；Δ 为负（模型把两者排反了）时权重接近 1，梯度最大。β 越大，越快“学满”，模型也更贴近参考模型。</p>
</div>

<div class="nb-note nb-note--warn"><b class="nb-tag">DPO 的坑</b>
<ul>
  <li><b>离线</b>：只在给定偏好对上学，模型自己生成的新回答没被评过，分布一偏就失效。</li>
  <li><b>chosen 的概率也可能下降</b>：损失只要求两者差距变大，两个一起降、rejected 降得更多也满足。实践中常见。</li>
  <li><b>长度偏好</b>：长回答对数概率之和更负，容易学出“越长越好”或反过来的怪偏好。</li>
</ul>
</div>

### 常见变体：各自改了哪一点

<table>
  <thead>
    <tr><th>方法</th><th>改了什么</th><th>要参考模型吗</th></tr>
  </thead>
  <tbody>
    <tr><td>IPO</td><td>把 $-\log \sigma$ 换成平方损失，$\Delta$ 拉到一个固定目标值就停，防止在偏好对上过拟合</td><td>要</td></tr>
    <tr><td>KTO</td><td>不需要成对数据，单条样本标“好/坏”就能训，借了前景理论的损失形状</td><td>要</td></tr>
    <tr><td>ORPO</td><td>SFT 损失 + 一个 odds ratio 惩罚项，SFT 和对齐一步做完</td><td>不要</td></tr>
    <tr><td>SimPO</td><td>用长度归一化后的平均对数概率当隐式奖励，加一个目标间隔 $\gamma$</td><td>不要</td></tr>
  </tbody>
</table>

<div class="nb-kicker">§4</div>

## GRPO：去掉 critic，用同一题的多个回答互相比较

GRPO 出自 DeepSeekMath（2024），DeepSeek-R1（2025）用它把推理能力练了出来，之后成了“推理模型 RL”的默认起点。

### 核心想法

PPO 需要 critic 来估计“这个状态本来值多少分”，作为优势的基线。GRPO 换了个基线：**同一个问题采样 $G$ 个回答（比如 8 个），用这一组的平均分当基线。**

<div class="nb-math">
$$\hat A_{i}=\frac{r_i-\operatorname{mean}(r_1,\dots,r_G)}{\operatorname{std}(r_1,\dots,r_G)}$$
</div>

这个优势赋给第 $i$ 个回答里的每一个 token。比组平均好的回答，所有 token 概率往上推；比平均差的往下压。然后照搬 PPO 的裁剪目标，KL 不再加进奖励，而是直接加在损失里：

<div class="nb-math">
$$\mathcal{J}=\frac1G\sum_{i=1}^{G}\frac{1}{|o_i|}\sum_{t=1}^{|o_i|}\Big[\min\big(\rho_{i,t}\hat A_{i},\ \operatorname{clip}(\rho_{i,t},1\pm\varepsilon)\hat A_{i}\big)-\beta\,\mathbb{D}_{\text{KL}}\big[\pi_\theta\Vert\pi_{\text{ref}}\big]\Big]$$
</div>

KL 用的估计式是 $\frac{\pi_{\text{ref}}}{\pi_\theta} - \log\frac{\pi_{\text{ref}}}{\pi_\theta} - 1$，恒非负，逐 token 就能算。

<div class="nb-lab" id="grpoLab">
  <div class="nb-lab__title">试一下：一道数学题采样 8 次，点按钮切换对错</div>
  <div class="nb-samples" id="grpoBtns"></div>
  <div class="nb-bars" id="grpoBars" aria-label="每个回答的优势值"></div>
  <div class="nb-readout"><span>组均值 <b id="grpoMean"></b></span><span>组标准差 <b id="grpoStd"></b></span><span id="grpoMsg"></span></div>
  <div class="nb-btnrow">
    <button type="button" data-set="10010000">只答对 2 个</button>
    <button type="button" data-set="11111110">答对 7 个</button>
    <button type="button" data-set="11111111">全对</button>
    <button type="button" data-set="00000000">全错</button>
  </div>
</div>

可以观察到两件事：答对的越少，答对的那几个拿到的正优势越大，这正是“难题上做对了要重奖”；全对或全错时，组内标准差为 0，所有优势都是 0（实现里分母加了 $\varepsilon$），这道题没有梯度，白白花了采样算力。后面 DAPO 的动态采样就是针对第二点。

### 奖励从哪来：可验证奖励（RLVR）

R1 没用神经网络奖励模型，用的是规则：数学题比对最终答案，代码题跑单元测试，再加一个格式奖励（思考过程是否放在规定的标签里）。规则奖励没法被“讨好”，reward hacking 少很多。R1-Zero 甚至跳过 SFT，直接在基座上做 GRPO，回答长度和自我检查行为是训练中自己长出来的。

### GRPO 之后的修补（2025）

<table>
  <thead>
    <tr><th>方法</th><th>发现的问题</th><th>改法</th></tr>
  </thead>
  <tbody>
    <tr><td>Dr. GRPO</td><td>按回答长度 $1/|o_i|$ 平均，错误的长回答每个 token 被罚得轻，模型越错越啰嗦；除以 std 让过易、过难的题权重偏高</td><td>去掉长度归一化和 std 归一化</td></tr>
    <tr><td>DAPO</td><td>熵塌缩、全对全错的组浪费算力、长回答被截断时奖励有噪声</td><td>裁剪上下限分开（clip-higher）、过滤全对全错的组（动态采样）、token 级损失、超长惩罚；去掉 KL</td></tr>
    <tr><td>GSPO</td><td>token 级重要性比方差大，MoE 模型上尤其不稳</td><td>重要性比和裁剪都改到整条序列层面（Qwen3 团队）</td></tr>
  </tbody>
</table>

<div class="nb-kicker">§5</div>

## 四种方法对比

<table>
  <thead>
    <tr><th>对比维度</th><th>SFT</th><th>RLHF-PPO</th><th>DPO</th><th>GRPO</th></tr>
  </thead>
  <tbody>
    <tr><td>需要的模型</td><td>1</td><td>4（policy, ref, RM, critic）</td><td>2（policy, ref）</td><td>2 + 奖励函数（policy, ref；ref 可省）</td></tr>
    <tr><td>数据</td><td>标准答案</td><td>prompt + 偏好对训 RM</td><td>(prompt, chosen, rejected)</td><td>prompt + 能判对错的规则</td></tr>
    <tr><td>在线采样</td><td>否</td><td>是</td><td>否</td><td>是，每题 G 个</td></tr>
    <tr><td>基线 / 优势</td><td>—</td><td>critic + GAE</td><td>隐式奖励差</td><td>组内均值与标准差</td></tr>
    <tr><td>适合场景</td><td>学格式、学领域知识</td><td>通用对齐，资源充足</td><td>风格、语气、安全这类偏好</td><td>数学、代码、能自动判分的任务</td></tr>
    <tr><td>常用框架</td><td>LLaMA-Factory / TRL</td><td>LLaMA-Factory / OpenRLHF</td><td>LLaMA-Factory（支持 DPO / KTO / ORPO / SimPO）</td><td>TRL <code>GRPOTrainer</code> / verl / OpenRLHF</td></tr>
  </tbody>
</table>

在线 RL（PPO / GRPO）训练时，采样（rollout）是自回归一个 token 一个 token 生成，GRPO 还要每题生成 $G$ 个回答，耗时往往占整轮训练的大半。因此 verl、OpenRLHF 会把采样交给 vLLM 这类推理引擎，训练用 FSDP / DeepSpeed，两边同步权重。

<div class="nb-kicker">§6</div>

## 工程延伸：从 SFT 到 DPO 的配置与选型

以“文本润色改写”这类任务为例，如果已经做完了 SFT 并配有自动评测裁判（按意思、事实、上下文判是否过关），可以顺着三步把流程延伸到 DPO：

1. 同一条输入，让 SFT 后的模型采样几个润色版本。
2. 用评测裁判打分，过关的当 `chosen`，不过关的当 `rejected`，凑成偏好对。
3. 在 LLaMA-Factory 中把 `stage` 从 `sft` 改成 `dpo`，其他 QLoRA 配置基本不动。

```yaml
# 在原有的 QLoRA SFT 配置上改这几行即可切换到 DPO
stage: dpo
pref_beta: 0.1
pref_loss: sigmoid        # 标准 DPO；也可选 orpo / simpo
dataset: polish_pref      # dataset_info.json 里设 "ranking": true，列 chosen / rejected
learning_rate: 5.0e-6     # 比 SFT 小一个量级左右
```

为什么这类任务选 DPO 而不是 GRPO：润色好不好没有唯一正确答案，没法写规则判分；而裁判给的“过 / 不过”天然能凑成偏好对。反过来，如果任务是“从订单数据里算出某个数”，答案能自动核对，就更适合 GRPO。

<div class="nb-footer">主要出处：InstructGPT（Ouyang 等，2022）、DPO（Rafailov 等，2023）、DeepSeekMath / GRPO（Shao 等，2024）、DeepSeek-R1（2025）、DAPO（2025）、Dr. GRPO（Liu 等，2025）、GSPO（Qwen，2025）。</div>

</div>

<script>
(function() {
  var css = function(n) {
    return getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  };
  var fmt = function(x, d) {
    if (d === undefined) d = 3;
    return (Object.is(x, -0) ? 0 : x).toFixed(d);
  };

  // PPO clip demo
  var drawPpo = null;
  (function() {
    var A = document.getElementById("ppoA");
    var R = document.getElementById("ppoR");
    var cv = document.getElementById("ppoCanvas");
    if (!A || !R || !cv) return;
    var eps = 0.2;
    var obj = function(r, a) {
      return Math.min(r * a, Math.max(1 - eps, Math.min(1 + eps, r)) * a);
    };
    drawPpo = function() {
      var a = +A.value, r = +R.value;
      document.getElementById("ppoAv").textContent = a.toFixed(1);
      document.getElementById("ppoRv").textContent = r.toFixed(2);
      document.getElementById("ppoRaw").textContent = fmt(r * a);
      document.getElementById("ppoClip").textContent = fmt(obj(r, a));
      var clipped = (a > 0 && r > 1 + eps) || (a < 0 && r < 1 - eps);
      document.getElementById("ppoMsg").textContent =
        a === 0 ? "A = 0：这个 token 不贡献梯度" :
        clipped ? "被裁剪：梯度为 0，不再往这个方向推" :
        "在信任区间内：正常更新";
      var dpr = window.devicePixelRatio || 1;
      var w = cv.clientWidth || 600, h = cv.clientHeight || 180;
      cv.width = w * dpr;
      cv.height = h * dpr;
      var g = cv.getContext("2d");
      g.scale(dpr, dpr);
      g.clearRect(0, 0, w, h);
      var pad = 28, x0 = 0.3, x1 = 2, ymax = 4.2;
      var X = function(v) { return pad + (v - x0) / (x1 - x0) * (w - pad * 2); };
      var Y = function(v) { return h / 2 - v / ymax * (h / 2 - 14); };
      var lineColor = css("--line") || "#d8cfbc";
      var mutedColor = css("--muted-foreground") || "#686354";
      var accentColor = css("--zhu") || "#b93a24";
      var monoFont = css("--mono-font") || "monospace";

      g.strokeStyle = lineColor;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(pad, h / 2);
      g.lineTo(w - pad, h / 2);
      g.stroke();

      g.setLineDash([3, 4]);
      [1 - eps, 1, 1 + eps].forEach(function(v) {
        g.beginPath();
        g.moveTo(X(v), 8);
        g.lineTo(X(v), h - 8);
        g.stroke();
      });
      g.setLineDash([]);

      g.fillStyle = mutedColor;
      g.font = "11px " + monoFont;
      g.textAlign = "center";
      [[1 - eps, "0.8"], [1, "1"], [1 + eps, "1.2"], [2, "2"], [0.3, "0.3"]].forEach(function(pair) {
        g.fillText(pair[1], Math.min(Math.max(X(pair[0]), pad), w - pad), h - 2);
      });

      g.strokeStyle = mutedColor;
      g.globalAlpha = 0.6;
      g.beginPath();
      for (var v = x0; v <= x1; v += 0.01) {
        var y = Y(v * a);
        if (v === x0) g.moveTo(X(v), y);
        else g.lineTo(X(v), y);
      }
      g.stroke();
      g.globalAlpha = 1;

      g.strokeStyle = accentColor;
      g.lineWidth = 2.5;
      g.beginPath();
      for (var v2 = x0; v2 <= x1 + 1e-9; v2 += 0.01) {
        var y2 = Y(obj(v2, a));
        if (v2 === x0) g.moveTo(X(v2), y2);
        else g.lineTo(X(v2), y2);
      }
      g.stroke();

      g.fillStyle = accentColor;
      g.beginPath();
      g.arc(X(r), Y(obj(r, a)), 5, 0, 7);
      g.fill();

      g.textAlign = "left";
      g.fillStyle = mutedColor;
      g.fillText("灰线 ρA，朱砂线 PPO 目标", pad, 14);
    };
    A.addEventListener("input", drawPpo);
    R.addEventListener("input", drawPpo);
    window.addEventListener("resize", drawPpo);
    drawPpo();
  })();

  // DPO loss demo
  (function() {
    var M = document.getElementById("dpoM");
    var B = document.getElementById("dpoB");
    if (!M || !B) return;
    var sig = function(z) { return 1 / (1 + Math.exp(-z)); };
    function up() {
      var m = +M.value, b = +B.value;
      document.getElementById("dpoMv").textContent = m.toFixed(1);
      document.getElementById("dpoBv").textContent = b.toFixed(2);
      document.getElementById("dpoL").textContent = fmt(-Math.log(sig(b * m)));
      document.getElementById("dpoW").textContent = fmt(sig(-b * m));
    }
    M.addEventListener("input", up);
    B.addEventListener("input", up);
    up();
  })();

  // GRPO group advantage demo
  var renderGrpo = null;
  (function() {
    var btns = document.getElementById("grpoBtns");
    var bars = document.getElementById("grpoBars");
    if (!btns || !bars) return;
    var s = [1, 0, 0, 1, 1, 0, 0, 0];
    s.forEach(function(_, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.addEventListener("click", function() {
        s[i] = 1 - s[i];
        renderGrpo();
      });
      btns.appendChild(b);
      var bar = document.createElement("div");
      bar.className = "nb-bar";
      bar.innerHTML = "<i></i><small></small>";
      bars.appendChild(bar);
    });
    Array.prototype.forEach.call(document.querySelectorAll("#grpoLab [data-set]"), function(b) {
      b.addEventListener("click", function() {
        s = b.dataset.set.split("").map(Number);
        renderGrpo();
      });
    });
    renderGrpo = function() {
      var n = s.length;
      var mean = s.reduce(function(a, b) { return a + b; }, 0) / n;
      var std = Math.sqrt(s.reduce(function(a, b) { return a + Math.pow(b - mean, 2); }, 0) / n);
      var adv = s.map(function(r) { return (r - mean) / (std + 1e-6); });
      var maxAbs = 2.7;
      var okColor = css("--nb-ok") || "#1b6b47";
      var badColor = css("--nb-bad") || "#b93a24";
      Array.prototype.forEach.call(btns.children, function(b, i) {
        b.setAttribute("aria-pressed", s[i] ? "true" : "false");
        b.textContent = (i + 1) + (s[i] ? " 对" : " 错");
        b.setAttribute("aria-label", "回答 " + (i + 1) + (s[i] ? "，答对，点击改为答错" : "，答错，点击改为答对"));
      });
      Array.prototype.forEach.call(bars.children, function(bar, i) {
        var v = adv[i];
        var ratio = Math.max(Math.min(Math.abs(v) / maxAbs, 0.72), 0.012);
        var hpct = ratio * 50;
        var el = bar.querySelector("i");
        var lab = bar.querySelector("small");
        el.style.backgroundColor = v >= 0 ? okColor : badColor;
        el.style.transform = "scaleY(" + ratio.toFixed(4) + ")";
        if (v >= 0) {
          el.style.bottom = "50%";
          el.style.top = "auto";
          el.style.transformOrigin = "bottom";
          lab.style.bottom = (50 + hpct + 2) + "%";
          lab.style.top = "";
        } else {
          el.style.top = "50%";
          el.style.bottom = "auto";
          el.style.transformOrigin = "top";
          lab.style.top = (50 + hpct + 2) + "%";
          lab.style.bottom = "";
        }
        lab.textContent = (v >= 0 ? "+" : "") + v.toFixed(2);
      });
      document.getElementById("grpoMean").textContent = mean.toFixed(3);
      document.getElementById("grpoStd").textContent = std.toFixed(3);
      var k = s.reduce(function(a, b) { return a + b; }, 0);
      document.getElementById("grpoMsg").textContent =
        std === 0 ? "全组一样：优势全为 0，这题没有梯度" :
        "答对 " + k + "/" + n + "，每个答对的回答优势 +" + ((1 - mean) / std).toFixed(2);
    };
    renderGrpo();
  })();

  // Re-render canvas and bars when theme toggles between light and dark
  if (typeof MutationObserver !== "undefined") {
    var obs = new MutationObserver(function() {
      if (drawPpo) drawPpo();
      if (renderGrpo) renderGrpo();
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }
})();
</script>
