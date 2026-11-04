---
layout:       post
title:        "一次 Skill 迭代的全过程：从一篇文章到审查与测试护栏改造"
subtitle:     "读文章、逐条批注讨论、实测 Codex hook，最后改了 3 个仓库、2 个 hook 和全局规则"
date:         2026-11-04 11:00:00 -0500
author:       "LuckyE"
header-style: text
catalog:      true
tags:
    - AI Agent
    - AI Engineering
    - Agent Skills
    - Claude Code
    - Codex
    - 软件工程
---

> 本文由我和 Claude Code 一起整理。引用的对话来自 2026-11-04 那次会话，只删减了与主题无关的部分。改动都在 GitHub 上：[design-integrity-guardrails](https://github.com/a1024053774/design-integrity-guardrails)、[reality-evidence-engineering](https://github.com/a1024053774/reality-evidence-engineering)、[agent-skills-index](https://github.com/a1024053774/agent-skills-index)。

我在[《我的 Agent Skills 工作流》](/2026/10/11/agent-skills-workflow/)里介绍过自己维护的一套 Skill：决策、证据、项目记忆和交付各有分工。那篇写的是某一刻的快照。这套东西其实一直在改，这篇记录其中一次完整的迭代：起因是什么，问题怎么被发现，决定怎么敲定，最后改了哪些地方，又怎么证明改对了。

## 起点：一篇文章和一个抱怨

11 月 4 日早上，我读了 Addy Osmani 的文章（我的读后笔记见[《当智能体代劳时，如何保持批判性思维》](/2026/11/04/critical-thinking-with-agents/)），在 Notion 里整理了译文，也写了几条批注。其中两条后来成了这次迭代的主线：

> 测试绿了不代表软件功能正确，尤其是 Codex 还会改验收测试，即使功能没完成它也会改造测试来作弊，说自己完成了任务。
>
> 当前测试绿了，要找到它没覆盖的地方。

同时我还有一个憋了很久的抱怨，一起丢给了 Claude：

> 为什么现在的 AI 总是改一点点代码就喜欢跑一遍全量测试？明明 99.9% 的时候都会通过……在它眼里硬件又不是它的，消耗的时间它也没有感知，脑子里只有以防万一求个安全，怪不得行事风格这么防御性。

## 第一轮：先把机制说清楚

Claude 的回应里有三段，后来几乎每个决定都能追溯到它们。

第一段解释为什么模型爱跑全量。它认为我只说对了一半：

> 激励不对称。训练时漏掉一次回归，任务就算失败；多跑一遍测试几乎没有惩罚。"测试通过了"又是对话记录里最显眼的完成证据。对模型来说，多跑永远是划算的。跑全量还是在替代思考：想清楚"这次改动会影响哪些测试"需要做影响分析，跑全量就不用分析了。

第二段反驳了我：

> "AI 能读懂测试，写出来基本就是对的"，这正是文章里说的那条滑坡，一开始是认知卸载，最后变成认知放弃。编译错误确实基本没了，但剩下的错误都是意图层面的：默认值反了、事务顺序变了、需求理解偏了。这些错误现有测试同样抓不到。
>
> 所以全量重跑浪费的真正原因不是"AI 已经够准"，而是它在检验一个错误的假设。小改动之后最可能出的问题是"新行为不是你要的"，而现有测试套件按定义就不覆盖新行为。

第三段指向我自己的规则：

> 你的 CLAUDE.md 里写的是"在有意义的检查点跑相关测试"，但"有意义"太模糊，模型会觉得每次编辑都算。更隐蔽的一点：你的规则要求有证据才能报 `PASS`，而最容易造出来的证据就是跑一遍全量。你自己的规则可能在把它往那个方向推。

最后这句让我意识到，问题不只在模型的习惯，也在我写给它的规则里。

## 怎么发现现有这套的问题

接下来几轮，我在 Claude 的回复上逐条批注，它逐条去翻代码、git 历史和前一天的会话记录核实。下面这些问题都不是凭印象说的，每一条都有出处。

### 1. 审查方式在一天前被改坏了

我记得前一天改过 design-integrity-review。Claude 核对 git 历史后告诉我：11 月 3 日的提交 [`e2b3402`](https://github.com/a1024053774/design-integrity-guardrails/commit/e2b3402c2e16d08f60ec9ff73ad31b14cd955f5c) 把它从"派一个只读 reviewer 在新上下文里审"改成了"实现的 agent 在完成检查点自查"。我的第一反应是：

> 这点不好，最好还是干净上下文审，我当时是怎么同意了这个改动？

Claude 翻出了前一天的会话记录：我当时觉得对抗式审查在浪费 token，审查者不了解意图，容易陷进挑刺；当时的分析认为，这个 skill 派出去的 reviewer 只拿到仓库路径和候选版本，等于被设计成不知道我的意图，可它要判断的架构和改动比例偏偏离不开目标和非目标。于是我选了"改成写代码的 agent 收尾时自己过一遍"。

回头看，两边都有道理，也都有问题。盲审会脱离意图挑刺；自查则是自己批改自己的作业，正是我在 Notion 里骂 Codex 的那种情况。Claude 的建议是两个问题一起解决：

> 恢复 fork，但调用方必须传入目标、非目标和验收条件，不传实现理由；每条 FAIL 必须附上一个真能走到那个 fallback 或异常分支的输入，只靠读代码推出来的问题记为"待验证"。这样它就从"提意见的审查者"变成了"证伪者"。

这其实是这个 skill 第二次来回摆：10 月 2 日（[`3b7694b`](https://github.com/a1024053774/design-integrity-guardrails/commit/3b7694b)）两个审查都改成了 fork 只读，11 月 3 日改成自查，这次又回到干净上下文。区别在于，这次想清楚了审查者缺的是意图，不是实现者的上下文。

### 2. 管住测试的 hook，偏偏管不到会改测试的那个 agent

Claude 起初建议在已有的 `stop_checks` hook 里把"本次 diff 改到了测试文件"标红。核实时它发现：我的规则文件是共用的（`~/.claude/CLAUDE.md` 软链到 `~/.codex/AGENTS.md`），可 hook 挂在 `~/.claude/settings.json`，只有 Claude Code 会跑。偏偏我抓到改测试的是 Codex，它根本不经过这个 hook。

我的要求是：

> 这个 hook 最好还是做成 skill 附属的脚本，这样 skill 都能读到，就都能加载了。

Claude 补了一个区分：skill 里的脚本只有模型主动去跑才会执行，属于建议；hook 才能保证每次都跑。所以分工是"逻辑放在 skill 脚本里，只维护一份；每个支持 hook 的 harness 在自己的 hook 里调用它"。至于 Codex 能不能用 Stop hook 把"阻断 + 原因"回传给模型，它说要真跑一次才算数，不能只看文档。

### 3. scanner 有一个盲区，还有半个没接上的功能

我问这个 scanner 是谁设计的。答案是我自己：2026-08-27 随 guardrails 仓库首次发布，这次改动前有 612 行 Python，用正则定位新增的异常处理、宽泛的 catch、吞掉的错误和默认返回。翻代码时 Claude 发现三件事：

- 它拿工作区和 `HEAD` 比，agent 一 commit，改动就从视野里消失了；
- "验收面"识别其实已经写好了：`requires_acceptance_review()` 会把 `eval`、`golden`、`benchmark` 这类目录里的改动识别出来，也有测试，但没有任何地方调用它；
- `acceptance_diff_digest()` 会给验收面的 diff 算一个 SHA-256，整个仓库也没有调用方。这是删掉旧 lifecycle hook 时的遗留，恰好是我在规则里反对的那种哈希仪式。

### 4. 只看"碰了测试文件"会太吵，也太死板

Claude 一开始想标得更细：删掉或放宽了断言、新加了 skip、改了期望值。我觉得方向不对：

> 也不能太死板地走脚本断言，很难覆盖所有情况。应该分为两类，比如说正常开发测试可以改，但最终的验收测试它不能乱改。

这个分法让检查变得简单：开发测试 agent 随意改；验收测试在实现之前从需求写出来，由我确认，实现过程中冻结。脚本只需要回答一个是非题："从会话开始到现在，验收面有没有文件变过"。断言改得合不合理这种需要判断力的问题，交给干净上下文的验收复审。

### 5. 打转检测在奖励跑测试

`spin_signals.py` 是 10 月 2 日单独装的一个 hook，用来提醒模型"你可能在原地打转"。Claude 发现它按编辑次数计数，任何测试命令通过就清零：

> 等于把"测试绿了就是有进展"写进了 hook。而且分 5 次编辑写一个新功能很正常，现在也会被判成"在打转"，收到"停止修补、先说根因"的提醒，可那时根本没有失败。

这和我之前定的"多轮修改是正常的"直接冲突。

### 6. 规则里的虚词，和只罚不奖的状态词

"meaningful checkpoints"之外，AGENTS.md 里还有几处偏虚的说法。我的态度是：

> 给模型写提示词尽量不要用这种假大空的词，应该具体，或者用正反例来告诉它。

状态词那边，我注意到 `PASS`、`INCOMPLETE` 这些词只有惩罚，没有写怎样才能得到：

> 像这种也得给它正向的奖励，这个倒是和 RL 很像了。

Claude 同意这个类比，但补了一句分寸：提示词不会在会话里训练模型，只是模型会顺着文字所定义的"成功"走阻力最小的路。只罚不奖，它自然会去买保险，最便宜的保险就是跑一遍全量。核对时它还发现一处真正的不一致：reality-first-engineering 把"证据否定了这个方向"归进了 `BLOCKED`，而 AGENTS.md 里这种情况应该叫 `NO_GO`。

## 怎么敲定：四轮批注，一个账本

整个讨论我一直说"先不着急改"。每一轮 Claude 给出方案和理由，我在原文上逐条批注同意、反对或追问；敲定的写进一份决策账本（D1–D12），已核实的事实单列（F1–F9），没定的留成问题（Q1–Q4）。最后一轮我才说开始实施。几个值得记下的来回：

**"许愿式编程"。** 文章结尾建议"提问前写下你认为会发生什么"。我问：如果我写"期望这个功能正确实现"算不算？Claude 说不算：

> 那是一个愿望，永远不可能被证伪，所以校准不了任何东西。预测要具体到事后能对答案：会改哪里（"只改 export.py，不动数据库 schema"）、最容易出错的地方（"难点在大文件内存"）、做完会看到什么（"导出 10 万行在 5 秒内完成，中文不乱码"）。另外要和需求简述分开：验收条件是写给 agent 看的，预测是写给你自己看的。

我的回复是："确实，我感觉我现在有点许愿式编程了。"

**不要写死的阈值。** Claude 为了让模型"看得见成本"，提议写"全量超过 1 分钟时每个任务只跑一次"。我否掉了：

> 写超过几分钟这种太死板了，我不喜欢这种写得很死的措辞。可以写业界分层的做法呀。写成本主要还是让模型能考虑到在合适的时候再用全量测试，如果能正确引导，成本不写也行，要清楚我们这么做的目的。

最后的措辞只讲目的和业界做法：迭代时跑覆盖改动的测试；在合入点跑一次全量（CI 会跑就交给 CI）；改到很多测试依赖的共享面时跑全量；全量通过只证明已有行为没回归，不证明新行为是对的。

**REVIEW.md 从哪来。** 我让 Claude 读了另一篇文章：Anthropic 的[《Solving code review at Anthropic》](https://claude.dev/blog/solving-code-review-at-anthropic/)（我的笔记见[《Claude Code 团队怎么做代码审查》](/2026/11/04/claude-code-code-review/)），里面提到每个仓库有一份由代码负责人写的 `REVIEW.md`。我们在它的基础上加了一节机器可读的验收面清单，scanner 只读这一节。至于每个仓库怎么初始化，我不想每次手动说：

> 是否可以做个 skill，类似于我那个 grilling 一样，我用这个 skill 触发让仓库初始化这个 REVIEW.md？

于是有了 `review-md`：只在我点名时运行，先扫仓库列出候选，只问代码答不出的问题，我批准后才保存。不让审查 skill 自动生成，是因为 REVIEW.md 的核心内容（哪些是验收测试、每块代码失败长什么样）只有负责人知道。一份自动生成的草稿，我很可能扫一眼就批了，这正是文章说的认知放弃。

**从那篇文章吸纳什么、不吸纳什么。** 吸纳五点：pre-existing 标记、标出问题的类别并一次修完、审查深度看改动本身而不是作者、报告先给数量、全量测试放在合入点。不吸纳三点：多 agent 找 bug 再投票（成本高，"问题必须先复现才算数"更便宜也更硬）、风险分类器和 CODEOWNERS 这类团队基础设施、把事故做成审查器的 eval 集（需要数据量）。

**报告格式和 STE。** 我本来想让审查报告结合 asd-ste100（受控英语改写）。讨论后发现报告有两种：审查者写给实现方 agent 的，和 agent 写给我的完成报告。前一种沿用现有格式，只加一条：

> 没有复现的问题必须写"may"，不能写成事实。这和我们的"待验证"规则正好是同一回事。

asd-ste100 仍然只在我点名时运行。

## 实测：Codex 的 hook 会悄悄失效

规则可以讨论，Codex 的行为只能实测。Claude 在一个隔离仓库里，只给那一次运行挂上测试用的 Stop hook，没碰我的全局配置。第一次跑，Codex 接受了配置，但 hook 根本没执行，模型回了一句 HELLO 就结束了。原因是 hook 必须先被信任，`codex exec` 里未被信任的 hook 会被静默跳过，没有任何警告。

我批准它加上 `--dangerously-bypass-hook-trust` 只跑那一次。这次 Stop hook 返回 block 和原因后，Codex 续跑了一轮，按原因输出了约定的暗号 `CODEX-STOP-OK-7731`；第二次 Stop 时 `stop_hook_active` 为真，hook 不再阻断，运行正常结束。

这个结论本身比"能用"更重要：在 Codex 上挂检查，如果没信任，它会悄悄失效。所以以后不管装什么检查，都要用一次真实运行确认它确实跑了。

## 最后改了什么

| 位置 | 改动 | 提交 |
| --- | --- | --- |
| `design-integrity-review` | 恢复干净上下文；调用方传目标、非目标、验收条件，不传理由；FAIL 要附能走到被标代码的输入；没复现的写 "may"；`[pre-existing]` 标记；标类别、列全部实例、不重复报；报告第二行 `SUMMARY` 先给数量 | [`4dcd99e`](https://github.com/a1024053774/design-integrity-guardrails/commit/4dcd99e570afa71f88c3ed4d0e543c32fed38a3f) |
| `behavioral-acceptance-review` | 读 `REVIEW.md`：验收面被改且没有我的批准就是一条发现；同样的报告规则 | 同上 |
| `design_integrity.py` | `--base <起点提交>`；新增 `acceptance_changes`，按 `REVIEW.md` 的 glob 判定，没有时退回目录约定；`REVIEW.md` 本身始终冻结；删掉 `acceptance_diff_digest` | 同上 |
| `review-md`（新） | 只在点名时运行，起草仓库的 `REVIEW.md` | 同上 |
| `evidence-first-testing` | 开发测试和验收测试分开，验收测试冻结；全量放在合入点；报告分"改动生效"和"没有回归"；整类修复；pre-existing 单独开票 | [`0c706d8`](https://github.com/a1024053774/reality-evidence-engineering/commit/0c706d89cc5ec4c2135c0e8087cef4e515de46fd)、[`d52db57`](https://github.com/a1024053774/reality-evidence-engineering/commit/d52db5737fa242db8a56ebcc71851d3462157f64) |
| `reality-first-engineering` | `NO_GO` 从 `BLOCKED` 里拆出来；每个状态先写怎样才能得到它 | 同上 |
| `stop_checks.py` hook | SessionStart 记下会话起点；Stop 时从起点跑 scanner；验收面被改就阻断一次；Claude Code 和 Codex 共用 | [`bbef91c`](https://github.com/a1024053774/agent-skills-index/commit/bbef91c) |
| `spin_signals.py` hook | 编辑计数换成"同一测试命令连续失败 3 次，且中间改过代码" | 同上 |
| 全局 AGENTS.md | 状态词正向定义；完成报告写 Works / No regression / Risk / undo；验收测试冻结；"跑测试前先说这次要证明什么"；全量测试的分层；按改动分低、中、高三级审查深度 | 本机文件，不在仓库里 |
| 索引仓库 | 收录 `review-md`；两个 hook 放进 `hooks/`（它们会调用两个仓库里的 skill）；中英文 README，加一张 skill 如何配合的 mermaid 图 | [`bbef91c`](https://github.com/a1024053774/agent-skills-index/commit/bbef91c) 起 |

每个 skill 的职责和它们之间的配合，画在了[索引仓库的 README](https://github.com/a1024053774/agent-skills-index/blob/main/README.zh-CN.md) 里。

## 怎么证明改对了

我的规则要求：新测试必须在已知坏的实现上失败，否则它什么也没证明。这次的每组测试都对照了改动前的版本：

- **scanner**：新增的验收面测试先写下 9 种可能出错的方式（A1–A9），再写代码和测试。共 23 个测试通过；两个故意改坏的版本（让 `*` 跨目录匹配、让目录路径不再覆盖其下的文件）都会让测试失败。
- **stop_checks**：端到端测试从 14 项扩到 24 项场景（30 个检查点），覆盖会话起点、恢复会话保留起点、`REVIEW.md` 的 glob、`REVIEW.md` 本身被改、没有起点时的退回、Codex 格式的输入。新版全部通过；旧版 hook 在 F15–F18 和 F22 上失败。
- **spin_signals**：18 个检查点全部通过；旧版在 F1、F2、F3、F5、F11 上失败，其中 F1 就是"多次编辑、没跑测试"被误判成打转。
- **真实的 Codex 运行**：让 Codex 写一个带 `except Exception: pass` 的函数。SessionStart 记下了会话起点；Stop 时 hook 报出 3 条发现并阻断；Codex 续跑时调用了 design-integrity-review，用"文件不存在、传入目录"两个输入说明这些分支能被走到，并以"这是你明确要求的行为"为由判定不在范围内。这正是我们想要的：判断有输入作证，而不是一句"看起来没问题"。
- **规则有没有丢**：索引仓库的指令预算检查带一个 `lost` 检查，列出 SKILL.md 改写后不再原样出现的句子。逐条对照后，大部分是有意改写，其中 3 条是改写时无意中丢掉的规则（"按契约而不是按你偏好的设计评判"、"不要为了让 scanner 安静而删掉合理的异常处理"、"只有契约、边界或失败模式需要时才扩大测试范围"），都已补回。

中间还有一个小插曲：推送 guardrails 仓库时 GitHub 连续返回 Internal Server Error，同一时间另一个仓库能推上去。我没有改用强推，查了对象完整性和分支保护后先去做别的，过一会儿再推就成功了。

## 还没做完的

- **含糊措辞的清理。** AGENTS.md 里 "read enough … for the task's size and risk" 和 "substantive edit" 这类说法，按约定先列候选、说明理由，由我确认后再改。
- **Codex hook 的信任。** 新挂的 SessionStart 和 Stop hook 要在交互式 Codex 里信任一次，否则在 `codex exec` 里会被静默跳过。
- **AGENTS.md 变长了。** 从 96 行变成 134 行。我同意"稍微多点没问题"，但这次多出的不只一点，下一轮要看哪些细节可以挪进 skill。

## 附：这套 Skill 的迭代时间线

| 日期 | 改动 |
| --- | --- |
| 2026-08-27 | 发布 design-integrity-guardrails，带结构风险 scanner |
| 2026-08-29 | 加入行为验收复审和 reality-first 决策门 |
| 2026-09-04 | reality-first 和 evidence-first 拆成独立仓库 |
| 2026-09-12 | 建立 Agent Skills 索引；发布 grilling |
| 2026-09-23 | 删掉 lifecycle hook，审查瘦身；索引收录 project-map 和 document-writing；skill 统一装到 `~/.agents/skills` |
| 2026-10-02 | 两个审查改成 fork 只读；加入指令预算检查；装上 stop_checks 和 spin_signals 两个 hook |
| 2026-10-15 | 两个前端 skill 合并为 frontend-production |
| 2026-10-31 | 收录 asd-ste100 |
| 2026-11-03 | design-integrity-review 改成自查；审查结论必须先复现；顺序契约要系统搜索 |
| 2026-11-04 | 本文这一轮 |

回头看，这套东西不是一次设计出来的。每一轮都是在真实使用里撞到问题，比如 Codex 改测试、模型爱跑全量、自查变成自己批改作业，然后回到规则和代码里找原因。这次最大的收获不是某条新规则，而是一个顺序：先核实事实，再讨论方案，敲定了再动手，动手后用一个已知会失败的版本证明测试有效。
