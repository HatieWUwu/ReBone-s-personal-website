# 编辑指南 · 不写代码也能改

这个站点所有"文字内容"都在 `content/zh/` 里。**直接改 JSON / HTML 文件、commit，GitHub Pages 会自动重新发布**——你不需要碰 HTML / CSS / JS。

最简单的修改方式：去 GitHub 网页打开下面的文件 → 点右上角铅笔图标 → 改 → "Commit changes" 到 `main` 分支。一两分钟后 https://rebone0522.com 自动刷新。

---

## 1. 改首页（前言、菜单条目、更新时间、信箱文案）

文件：**`content/zh/home.json`**

```json
{
  "heading": "整理我看见、思考、创造的一切，\n给现在或未来某个生命的启发。",
  "intro_label": "这个网站的初衷：",
  "intro_points": [
    "如果有一天我不在了，那些未完成的事与想法，就这么一起消失，有点可惜",
    "所以我把它们记下来。如果有人从里面获得点什么，就足够"
  ],
  "sections": [
    {
      "title": "Solutions",
      "href": "solutions.html",
      "description": "听见真实声音，改善客观困境。",
      "last_updated": "2026-05-22"   // ← 这一栏每次改了对应栏目的内容，就把日期改新
    },
    ...
  ],
  "inbox_endpoint": ""   // ← 见下面「让匿名提问箱真的能收信」
}
```

- `heading` 里 `\n` = 换行。
- `intro_points` 是数组：加一条就在数组里加一行。
- 每个 section 的 `last_updated` 控制首页卡片右上角显示的"YYYY-MM-DD 更新"。

## 2. 加 / 改"更新日志"

文件：**`content/zh/updates.json`**

每条更新长这样：
```json
{
  "date": "2026.05.22",
  "datetime": "2026-05-22",
  "lines": [
    "网站正式开放 :3",
    "我 19 岁了。"
  ]
}
```

- `lines` 数组里的每一行都用同一种 bullet 显示。不要分主次。
- 加新的更新就在 `items` 数组**最前面**插一条新的对象（最近的在最上面）。

## 3. 改 Solutions 项目列表与筛选标签

文件：**`content/zh/solutions.json`**

```json
{
  "filters": ["全部","实物产品","活动组织","志愿服务","照料生命","健康生活"],
  "cards": [
    {
      "ref": "S1",                    // 左上角小编号，自由命名
      "title": "失能老人约束手套",
      "subtitle": "在必要的约束中，提供舒适、安抚与自主权",
      "href": "solutions_restraint.html",
      "tags": ["实物产品","照料生命"], // ← 可以多个，会被对应筛选按钮捕获
      "date": "2023.10 — 进行中",
      "summary": "……一句话讲清这个项目……",
      "moves": [
        "三条最关键的进展 / 动作",
        "一行一条",
        "保持节奏"
      ]
    }
  ]
}
```

- 改 `filters` 数组就能改左侧的筛选按钮文字。
- 每个 card 的 `tags` 只要里面出现 filter 名，点那个 filter 时就会被显示。
- 想新增一个项目：在 `cards` 数组里复制一段对象、改字段就行。

## 4. 改单个项目详情页（约束手套 / ElectroMap）

文件：
- **`content/zh/solutions_restraint.json`**（失能老人约束手套）
- **`content/zh/solutions_electromap.json`**（ElectroMap：世界的故事）

每个 section 长这样：
```json
{
  "id": "overview",       // URL hash 用，不要改
  "title": "项目概要",     // 页面里的小标题
  "eyebrow": "OVERVIEW",  // 标题上方那行 mono 字
  "lede": "可选，一句导语",
  "blocks": [             // 内容块，按顺序渲染
    {"type": "paragraph", "text": "正文段落。"},
    {"type": "quote", "text": "引用一句话。", "cite": "可选署名"},
    {"type": "subheading", "text": "小节标题"},
    {"type": "list", "items": ["一", "二", "三"]},
    {"type": "list", "items": [{"label": "关键词", "text": "解释"}]},
    {"type": "meta", "items": [{"label": "日期", "value": "2026.05"}]},
    {"type": "two-col", "columns": [
      {"title": "左边的标题", "items": ["要点一","要点二"]},
      {"title": "右边的标题", "items": ["要点三","要点四"]}
    ]},
    {"type": "image-placeholder", "label": "【图】"},
    {"type": "image", "src": "assets/xxx.png", "alt": "描述", "caption": "可选图注"},
    {"type": "callout", "title": "特别说明", "text": "……", "link": {"href": "https://...", "label": "查看 ↗"}},
    {"type": "details", "summary": "可折叠的标题", "blocks": [
      {"type": "paragraph", "text": "折叠区里的内容"}
    ]}
  ]
}
```

- 想加一段正文：在 `blocks` 里加一个 `{"type": "paragraph", "text": "..."}`。
- 想加一张图：放 `assets/images/solutions/xxx.png`，然后用 `image` block。
- 想加一个可点开的"附录"：用 `details` block。

## 5. 公开提问箱归档

文件：**`content/zh/inbox.json`**

每次有人投递公开提问、你回复完，把问答加到这里：

```json
{
  "items": [
    {
      "date": "2026.05.22",
      "question": "原始问题文字",
      "answer": "你的回答"
    }
  ]
}
```

新条目放在 `items` 数组**最上面**就行。

## 6. 让匿名提问箱真的能收信（一次性配置）

匿名信箱默认走 mailto，会打开你访客的邮箱客户端——这是兜底，不算"匿名"。要真的能匿名收信，配一次 **Formspree**（免费，每月 50 封够用）：

1. 打开 https://formspree.io → "Sign up"，用你的邮箱注册
2. 登录后点 **+ New Form** → 给表单起个名 → 邮箱选你想接收的邮箱 → 创建
3. 创建好之后会得到一个 endpoint，长这样：`https://formspree.io/f/xxxxxxxx`
4. 把这个 URL 填进 `content/zh/home.json` 里 `"inbox_endpoint": ""` 的引号之间
5. commit → 网站自动重发布。之后访客投递的提问会直接发到你的邮箱

如果哪天想换服务，把这个 endpoint 换掉就行；想关掉重新走 mailto，清空 `inbox_endpoint` 即可。

## 7. README 正文

文件：**`content/zh/readme.article.html`**

这一份是 HTML 不是 JSON——直接改里面的文字就行，结构（h1/h2/p 等）保持不动。

## 8. 改其他页面

| 页面 | 文件 |
|------|------|
| Expressions 入口 | `content/zh/expressions.json` |
| Expressions → 视觉 | `content/zh/expressions_visual.json` |
| Expressions → 音乐 | `content/zh/expressions_sound.json` |
| Expressions → 为爱发电 | `content/zh/expressions_fandom.json` |
| Reflections | `content/zh/reflections.json` |

每个 JSON 文件结构都跟它对应的页面"长得像"，按现有条目复制改字段即可。

---

## 常见坑

- **JSON 语法**：双引号、逗号最容易出错。改完后 GitHub 网页保存时如果报错，就是 JSON 格式不对。检查：
  - 字符串外面用 `"` 不是 `'`
  - 每一行结尾如果不是最后一项就要有 `,`，最后一项**不要**逗号
  - 想换行用 `\n`，不要按回车
- **图片**：放 `assets/images/solutions/`、`assets/images/fandom/` 等已有目录里，命名小写英文+数字+横线，不要中文不要空格
- **改完看不到**：浏览器 cache，强制刷新 ⌘+Shift+R（Mac）或 Ctrl+F5（Win）

## 想加东西但 JSON 里没有这个字段

告诉我要加什么，我加 schema + 渲染逻辑，下次你就能直接改 JSON 自助了。
