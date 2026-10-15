---
layout:       post
title:        "我的 Agent Skills 工作流：决策、证据、项目记忆与交付"
subtitle:     "9 个索引收录的 Skill、1 个外部 Skill，以及它们各自应该出场和停下的位置"
date:         2026-10-11 08:00:00 -0400
author:       "LuckyE"
header-style: text
catalog:      true
tags:
    - AI Engineering
    - Agent Skills
    - 软件工程
---

一个 Agent 能写代码，还需要知道当前的问题有没有说清、关键假设有没有验证、测试究竟证明了什么，以及下一次会话该从哪里接着做。这套 Skill 围绕这些具体问题分工：让决策有记录，让实现有证据，让交付物能被核对。

截至 2026 年 10 月 15 日，我维护的 [Agent Skills Index](https://github.com/a1024053774/agent-skills-index) 收录了 **9 个 Skill，来自 7 个独立仓库**。索引保存入口、用途、安装命令和核对过的提交；每个 Skill 的规则、脚本与参考资料仍留在来源仓库里。另有一个来自他人仓库、尚未收入索引的 `asd-ste100`，放在写作部分单独说明。

下面按一次任务的先后顺序介绍：动手之前、实现时、完成时，最后是交付物。文中的版本指文末列出的 Git 提交，不代表统一的发布版本，也不意味着每个任务都要把九个 Skill 跑一遍。

## 总览：按问题找 Skill

| 阶段 | 要回答的问题 | Skill |
| --- | --- | --- |
| 动手之前 | 人的取舍有没有说清 | `grilling` |
| | 会改变方向的事实有没有验证 | `reality-first-engineering` |
| | 项目状态如何跨会话保留 | `project-map` |
| | 已有代码究竟怎么运行 | `architecture-flow-map` |
| 实现时 | 修复有没有能拒绝错误行为的证据 | `evidence-first-testing` |
| 完成时 | 改动有没有绕开根因 | `design-integrity-review` |
| | 验收能否独立证明所声称的行为 | `behavioral-acceptance-review` |
| 交付物 | 文字怎么写才准确、不被误读 | `document-writing`、`asd-ste100` |
| | 界面怎么从方向做到可上线 | `frontend-production` |


![从决策与事实到授权实现，再按改动类型选择完成审查]({{ site.baseurl }}/img/in-post/2026-10-11-agent-skills-workflow/workflow.svg)

*图 1：一条需要决策、事实核验和实现的工作路径。小任务可以省去不适用的环节；长期项目的状态由 project-map 持续维护。[Mermaid 源文件]({{ site.baseurl }}/img/in-post/2026-10-11-agent-skills-workflow/workflow.mmd)。*

## 一、动手之前：先分清缺的是什么

同样一句“还没想清楚”，可能对应三种不同的缺口。

**缺人的取舍。** 例如，第一版要覆盖多少用户、是否接受某项成本、两种交互方案选哪一个。这类问题由人决定，`grilling` 帮助把选择和代价摆到桌面上。

**缺事实依据。** 例如，目标 API 是否提供所需字段、某种格式能否保留批注、现有环境能否满足延迟要求。这类问题需要查证或实验，由 `reality-first-engineering` 组织最小探针。

**缺持续记录。** 方向已经确定，但决定散落在聊天里，任务之间的依赖不明确，README 也逐渐落后于代码。这是 `project-map` 管的事。

这几个 Skill 的边界很重要。查资料不能替用户做取舍；用户接受了一项建议，也不能反过来证明建议所依赖的假设已经成立。

### grilling：把问题问到可以交接为止

[`grilling`](https://github.com/a1024053774/grilling-skill) 只在用户明确点名时使用。它先确定讨论的终点，再把问题分成当前可讨论的问题、被前置条件阻塞的问题、还无法具体表述的模糊区域，以及范围之外的工作。

它会区分“用户自己提出的决定”和“用户接受了 Agent 的推荐”。最新版要求记录推荐背后的假设，并把新决定与已有约束逐项对照。有冲突就重新明确优先级，不能让两个互相矛盾的答案同时留在基线里。

推荐一旦被采纳，它依赖的假设就会成为下一轮的前提，讨论也就在不知不觉中偏离。为此，grilling 设有**漂移检查**（drift check）：用户询问进度或要求检查时，以及交接之前，它会原样引用用户对目的地和目标的描述，把“用户自己做的决定”与“只采纳了推荐的决定”分开列出，并写明后者携带的假设，请用户重点核对。它不会自行定期触发。

它的结束条件是人确认了可交接的结果。**讨论结束后交接并停下，进入实现需要用户另行授权。** 如果问题本来就能在一次会话内说清，也没有必要先创建一套庞大的问题账本。

### reality-first-engineering：先验证会改变方向的事实

[`reality-first-engineering`](https://github.com/a1024053774/reality-evidence-engineering/tree/main/reality-first-engineering) 用在错误假设可能带来明显返工、数据损失或错误验收的地方。

它要求区分已经观察到的事实、测量结果、推断和未知项，然后优先验证影响最大的未知项。一个探针要写清输入、方法、通过条件、失败条件、停止条件，以及证据保存在哪里。

例如，要基于某个外部服务做文档导出，可以先拿一份包含表格、图片和批注的样本验证格式保真。这个探针的结果可能直接改变方案。在本地模拟一个“导出成功”的返回值，无法回答外部服务是否真的保留了批注。

它也有明确的成本边界：普通文案修改、输入和契约都清楚的小改动，不需要额外经过这道流程。

### project-map：让下一次会话能接上当前状态

[`project-map`](https://github.com/a1024053774/project-map-skill) 用本地 Markdown 保存长期项目的目的地、决策索引、待办和关键文档。项目已有 `.project-map/` 时继续使用；新建则由用户提出。

```text
.project-map/
  MAP.md                  # 目的地、决策索引、未明确事项、活文档
  tickets/                # 决策、研究、前置任务和实现任务
  specs/                  # 从已确认决策整理出的规格
  archive/                # 已退出当前工作的记录
CONTEXT.md                # 项目术语表
```

`MAP.md` 是索引，有 150 行预算。细节放进对应 ticket 或文档，同一事实只在一个地方维护。开始会话和准备结束时都运行 `status`，检查结构问题和可能过期的活文档。

从决策走向实现时，它先整理规格，再切出接下来两三个纵向实现任务，让用户调整后写入；每次会话推进一个实现任务。这里的 **Tracer bullet（曳光弹）** 指一条穿过必要层次、能从真实入口运行的最薄路径。例如，一条任务同时打通输入、处理、存储和结果展示，再逐步扩大覆盖面。

`CONTEXT.md` 则维持 **Ubiquitous language（统一领域语言）**：同一个业务概念在讨论、代码、测试和文档中使用同一个名字，避免一次会话叫“任务”，下一次又在没有说明的情况下把它写成“作业”。

### architecture-flow-map：接手已有代码时，先还原它怎么运行

[`architecture-flow-map`](https://github.com/a1024053774/architecture-flow-map-skill) 面向已经存在的代码库。它把主要模块、业务对象和 3—5 个关键场景整理成可逐步回放的交互地图。

它有两个主要产物：作为事实来源的 `map.json`，以及由固定查看器和构建脚本生成的 HTML。代码引用包含路径、行号和该行的字面符号；构建时会检查文件是否存在、行号是否越界、符号是否仍在对应位置。之后还要在浏览器运行自检并检查实际呈现。

地图中的结论分为 `confirmed`、`inferred` 和 `unknown`。前两者要有引用或运行依据，未知项则写明需要什么证据才能解决。文档说有登录校验、代码却没有时，地图画出代码实际行为，并记录这处文档偏差。

因此，它适合回答“点这个按钮之后，数据到底经过哪里”。如果要讨论一个尚未实现的新架构，就应回到设计和决策工作，不能把设想画成项目现状。

## 二、实现时：先有能拒绝错误行为的证据


[`evidence-first-testing`](https://github.com/a1024053774/reality-evidence-engineering/tree/main/evidence-first-testing) 处理实现过程中的证据。它要求先保存能暴露问题的信号，再改行为，然后用同一个信号确认修复。

假设导出流程在遇到空单元格时错移了后续列。预期列位置应来自输入文件和格式约定。若直接把当前程序的输出抄成预期值，测试即使全绿，也没有证明列位置是对的。

![独立契约产生预期值，同一检查先拒绝错误行为再接受修复]({{ site.baseurl }}/img/in-post/2026-10-11-agent-skills-workflow/evidence.svg)

*图 2：预期值来自独立契约；失败与通过必须对应同一个行为信号。[Mermaid 源文件]({{ site.baseurl }}/img/in-post/2026-10-11-agent-skills-workflow/evidence.mmd)。*

如果代码已经先改好了，就补做反事实验证：在父版本、临时撤掉相关修复的版本，或重现缺陷的定向变异上运行测试。无法安全恢复错误行为时，保留修复后通过的事实，同时说明回归证明还不完整。

这套要求也区分三种红灯：已有缺陷的复现、新需求尚未实现的预期失败，以及偶发或环境相关的失败。环境没装好导致的报错，不能算作成功复现了业务缺陷。

## 三、完成时：按改动类型选择审查

完成检查按候选改动的类型选择审查方式：

| Skill | 核心问题 | 需要的证据 |
| --- | --- | --- |
| [`design-integrity-review`](https://github.com/a1024053774/design-integrity-guardrails/tree/main/design-integrity-review) | 这次改动有没有绕开根因，或者把复杂度放错位置？ | 真实调用方、可达输入、职责归属和具体维护成本 |
| [`behavioral-acceptance-review`](https://github.com/a1024053774/design-integrity-guardrails/tree/main/behavioral-acceptance-review) | 当前验收能否独立证明所声称的行为？ | 独立预期、真实入口、能拒绝错误实现的输入，以及必要的外部边界证据 |

结构审查看新增的异常边界、吞错、重试、回退、兼容分支和并行 API。扫描脚本只负责定位候选问题；没扫描到结果，不等于审查通过。这里的 **Deep modules（深模块）** 是一个判断标准：小接口应隐藏足够多的实现复杂度，只有一层转发的包装也会增加设计成本。

如果改动涉及 eval、benchmark、grader 或其他明确的验收表面，结构审查会转交行为验收审查。两者都针对冻结的候选，在新的只读上下文中工作，不沿用实现会话的解释作为结论。

对于模型驱动的 Agent 产品，行为验收还要检查生成结果是否依赖真实输入。例如，换掉一个关键字段后，输出应在相应位置改变；永远返回同一段“成功”文本的实现，不能通过验收。纯本地 mock 能证明的范围，也不能被扩大成真实服务边界已经验证。

## 四、交付物：文字与界面

写作和前端的三个 Skill 处理不同的问题，可以按产物单独使用。

**[`document-writing`](https://github.com/a1024053774/document-writing-skill)** 覆盖起草、润色、翻译和编码保护。自然表达必须服从语义保真：“小样本下可能有效”不能被润色成“已经证明有效”；数量、否定、例外和不确定程度都要留下。保存文件后还要回读，检查实际文字、BOM 和换行方式。

**[`asd-ste100`](https://github.com/danyuchn/asd-ste100-skill)** 的读者是模型或程序：工具描述、系统提示词、子 Agent 指令，以及供机器解析的错误和状态字符串。它按 ASD-STE100（简化技术英语）的结构规则改写英文：主动语态、一句一个指令、限制句长、不用分号和短语动词，并保留“可能”这类不确定程度。它只覆盖英文，也不内置 ASD 的核准词典，所以词汇规则只能作为方向，不能当作合规证明；仓库附有 `scripts/ste-lint.py` 检查脚本。给人读的 README、邮件和报告不在默认范围，除非用户明确点名 STE。它是第三方 Skill，我只在本机安装使用，没有收入索引。

**[`frontend-production`](https://github.com/a1024053774/frontend-production-skill/tree/main/frontend-production)** 把前端做到能上线、也审到能上线：先根据读者、主行动和真实内容确定文案与视觉方向，再按需要处理多来源区块的同族、动效、手机端和逐页工程审查。它支持 `build`、`quick`、`full`、`implement` 四种模式；审查默认只读，问题按 P0—P3 分级，并把未验证的范围写清楚。它要求沿用项目已有的品牌、token、组件库和约定，事实缺口不能用虚构数字、客户或评价填补。

索引中的 `frontend-production` 已把原先分开的内容/视觉方向与同族工作收在一个入口，原来的两个来源仓库已归档，并补上动效、手机端和工程审查。组件来自同一个库，也不能自动证明页面已经一致或可以上线；每个结论仍需要与它相称的证据。

## 五、放进一次具体任务里

假设要给一个已有知识库工具增加“上传文档并返回可定位的引用”功能。下面是使用方式示例，不是这些 Skill 已经完成过的项目实测。

1. **先看现有实现。** 如果入口、存储和检索关系已经难以追踪，用 `architecture-flow-map` 还原上传与查询路径。
2. **把产品取舍说清。** 如果用户点名 grilling，就讨论首版支持的格式、引用粒度和失败时的用户体验，确认结果后交接并停下。
3. **验证关键事实。** 用带跨页段落、表格和扫描图片的样本，检查解析能力以及引用定位能否保留。结果不足以支持方向时，先解决未知项。
4. **获得实现授权后打通薄路径。** 已有项目地图负责记录任务。先完成一种格式从上传到显示引用的完整路径，再增加格式和边界场景。
5. **保存能拒绝错误行为的证据。** 预期引用来自人工核对的样本位置，测试要能发现错页、错段和固定返回同一引用的实现。
6. **按候选改动验收。** 涉及生成结果及引用正确性时，使用行为验收审查；说明文档交给写作规则，界面按需要使用 `frontend-production`。

在这个例子中，项目地图贯穿多次会话，其他 Skill 在对应问题出现时进入。任务大小决定需要多少环节；结束条件由要交付的行为和证据决定。

## 六、来源仓库、索引与本地安装

这套目录采用“独立来源仓库 + 一个索引”的组织方式。修改规则时回到来源仓库；索引只记录去哪里找、何时使用，以及安装哪个 Skill。

![来源仓库提供技能正文，索引提供元数据，本地 hub 通过符号链接供工具使用]({{ site.baseurl }}/img/in-post/2026-10-11-agent-skills-workflow/repositories.svg)

*图 3：索引仓库与本地链接的职责。工具目录的处理方式由同步脚本中的配置决定。[Mermaid 源文件]({{ site.baseurl }}/img/in-post/2026-10-11-agent-skills-workflow/repositories.mmd)。*

只安装需要的 Skill 即可。例如下面两个命令分别安装写作和回归证据相关的 Skill；`-g` 表示全局安装，`-y` 跳过交互确认，参数含义见 [Skills CLI 文档](https://github.com/vercel-labs/skills)。

```bash
npx skills add a1024053774/document-writing-skill --skill document-writing -g -y
npx skills add a1024053774/reality-evidence-engineering --skill evidence-first-testing -g -y
```

完整安装列表在 [索引 README](https://github.com/a1024053774/agent-skills-index#install-examples)。这些命令跟随来源仓库的默认分支，不会锁定到本文核对的提交。

如果需要维护源码，可以把每个来源仓库放到 `~/Documents/SKILLS/<repository>`，再在索引仓库里查看链接计划：

```bash
python3 scripts/sync_skills.py
```

确认计划后，添加 `--apply` 才会实际调整链接。脚本把目录中收录的 Skill 链接到 `~/.agents/skills`，并按 `MIRRORS` 与 `HUB_READERS` 配置处理其他工具目录。真实目录只报告，不会自动搬走。换机器或更换工具时，应先检查这份配置与本机布局是否一致。

维护正文时还可以运行：

```bash
python3 scripts/check_skill_budget.py
```

它检查 `SKILL.md` 的字节预算、frontmatter、相对链接、锚点和未从入口链接的参考文件。2026 年 10 月 15 日，本次整理中的 9 个 Skill 全部通过了这些静态检查。这只说明目录和文件满足这些检查项，不能代替 Skill 的实际行为验证。

这也解释了为什么核心规则放在 `SKILL.md` 前部，阶段性细节放进 `references/`：进入任务时先能看见不能违反的边界，到具体阶段再读取所需说明。预算需要服务使用方式；例如 `grilling` 每轮都要用到的问题类型和提问规则保留在入口，因此索引给它单独设置了 11264 字节预算。

### 本文核对的版本

以下 7 个本地来源仓库的 `HEAD`，在 2026 年 10 月 15 日核对时均与 GitHub `main` 一致。`_archive` 中的历史副本未纳入索引。提交链接固定本文所依据的内容；之后的更新以来源仓库为准。

| 来源仓库 | 本文依据的提交 | 包含的 Skill |
| --- | --- | --- |
| reality-evidence-engineering | [`82819b7`](https://github.com/a1024053774/reality-evidence-engineering/tree/82819b7cda870fab6bb34d8d76fd18d20fdf6e60) | reality-first-engineering、evidence-first-testing |
| design-integrity-guardrails | [`3b7694b`](https://github.com/a1024053774/design-integrity-guardrails/tree/3b7694b28db1a063da39e3ca3e3ddb096dd18385) | design-integrity-review、behavioral-acceptance-review |
| grilling-skill | [`f1e01bb`](https://github.com/a1024053774/grilling-skill/tree/f1e01bb6b94deb15769eee552125535c2c80ef42) | grilling |
| project-map-skill | [`c16779a`](https://github.com/a1024053774/project-map-skill/tree/c16779a296f43a91b20da2cabbe70223a7569f9a) | project-map |
| architecture-flow-map-skill | [`8b3a0c5`](https://github.com/a1024053774/architecture-flow-map-skill/tree/8b3a0c5df60ee762461b39613614741b2f715f4b) | architecture-flow-map |
| document-writing-skill | [`5fc4ea0`](https://github.com/a1024053774/document-writing-skill/tree/5fc4ea0cacfb9d1dd331a772ee0b34120799ec48) | document-writing |
| frontend-production-skill | [`b291300`](https://github.com/a1024053774/frontend-production-skill/tree/b2913002abd3767c1e9272201568695e58232e48) | frontend-production |

外部 Skill `asd-ste100` 不在上表和索引之内。我本机的副本基于上游 [`7d4a135`](https://github.com/danyuchn/asd-ste100-skill/commit/7d4a135a199a5d7447c4886bcd7ffe742a627bc9)，另有一处未提交的本地修改：把 `SKILL.md` 的触发描述收窄到“用户点名 STE，或文本供机器解析”。上游 `HEAD` 此后已经更新到 `32511c6`，我没有对照这两个版本之间的差异，所以文中对它的描述以本地副本为准。

<!-- Mermaid 维护说明（不显示在文章正文）：
先编辑 img/in-post/2026-10-11-agent-skills-workflow/ 中对应的 .mmd。
在博客仓库根目录使用 Mermaid CLI 12.0.0 重新生成三张 SVG：

for diagram in workflow evidence repositories; do
  npx --yes --package @mermaid-js/mermaid-cli@12.0.0 mmdc \
    -i "img/in-post/2026-10-11-agent-skills-workflow/$diagram.mmd" \
    -o "img/in-post/2026-10-11-agent-skills-workflow/$diagram.svg" \
    -c img/in-post/2026-10-11-agent-skills-workflow/mermaid-config.json \
    -b '#f5f1e8'
done

Mermaid CLI：https://github.com/mermaid-js/mermaid-cli
文章使用静态 SVG，站点无需加载 Mermaid 运行时。
-->
