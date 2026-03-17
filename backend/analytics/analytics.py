"""
analytics.py
Запуск:      python3 analytics.py
Залежності:  pip install numpy pandas matplotlib scikit-learn scipy
Графіки:     папка charts/

ПРИНЦИП КОЖНОГО ГРАФІКУ:
  • Заголовок = конкретне твердження або питання дослідження
  • Підзаголовок = що зображено і як читати
  • Висновок прямо на графіку (рамка) — що це означає для дослідження
  • Осі підписані зрозумілою мовою, без скорочень
"""

import json, os, warnings
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import matplotlib.colors as mcolors
from sklearn.cluster import KMeans
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from scipy import stats

warnings.filterwarnings("ignore")
np.random.seed(42)

HERE       = os.path.dirname(os.path.abspath(__file__))
CHARTS_DIR = os.path.join(HERE, "charts")
os.makedirs(CHARTS_DIR, exist_ok=True)

C = {
    "bg":      "#F2EBD9", "surface": "#FAF6EE", "dark":   "#2C3E2D",
    "green":   "#4A7C59", "sage":    "#7FAF8A",  "muted":  "#7A8C7B",
    "clay":    "#C4835A", "light":   "#D4E8D8",  "grid":   "#E8DFC8",
    "amber":   "#D4A847", "blue":    "#5B8FA8",
}

plt.rcParams.update({
    "figure.facecolor":   C["bg"],     "axes.facecolor":    C["surface"],
    "axes.edgecolor":     C["muted"],  "axes.labelcolor":   C["dark"],
    "xtick.color":        C["muted"],  "ytick.color":       C["muted"],
    "text.color":         C["dark"],   "grid.color":        C["grid"],
    "grid.alpha":         0.7,         "font.family":       "serif",
    "axes.spines.top":    False,       "axes.spines.right": False,
    "axes.titlesize":     11,          "axes.labelsize":    10,
    "figure.titlesize":   14,          "figure.titleweight":"bold",
})

def save(fig, name):
    fig.savefig(os.path.join(CHARTS_DIR, name), dpi=150,
                bbox_inches="tight", facecolor=C["bg"])
    plt.close(fig)
    print(f"  ✅  {name}")

def conclusion(ax, lines, loc="upper left"):
    """Рамка з висновком прямо на графіку."""
    x  = 0.03 if "left"  in loc else 0.97
    y  = 0.97 if "upper" in loc else 0.05
    ha = "left" if "left" in loc else "right"
    va = "top"  if "upper" in loc else "bottom"
    ax.text(x, y, lines, transform=ax.transAxes,
            fontsize=9, va=va, ha=ha, color=C["dark"],
            bbox=dict(boxstyle="round,pad=0.5",
                      facecolor=C["light"], edgecolor=C["sage"], alpha=0.95))

def footnote(ax, text):
    ax.text(0.5, -0.14, text, transform=ax.transAxes,
            fontsize=8, ha="center", color=C["muted"], style="italic")

# ═══════════════════════════════════════════════════════════════════════════
# ЗАВАНТАЖЕННЯ ДАНИХ
# ═══════════════════════════════════════════════════════════════════════════
with open(os.path.join(HERE, "analytics_data.json")) as f:
    raw = json.load(f)

users = pd.DataFrame(raw["users"]).rename(columns={
    "currentStreak": "cur_streak", "longestStreak": "max_streak",
    "totalGoals":    "n_goals",    "completedGoals": "n_done",
    "avgProgress":   "avg_prog",   "aiGoals":        "n_ai",
    "manualGoals":   "n_manual",
})
users["user_id"]   = users["id"]
users["short"]     = users["name"].apply(
    lambda n: n.split()[0] + " " + n.split()[1][0] + "."
    if len(n.split()) > 1 else n)
users["goal_cr"]   = users["n_done"]  / users["n_goals"].replace(0, 1) * 100
users["ai_pct"]    = users["n_ai"]    / users["n_goals"].replace(0, 1) * 100

goals = pd.DataFrame(raw["goals"]).rename(columns={
    "isAI": "is_ai", "userId": "user_id",
    "taskCount": "n_tasks", "tasksDone": "n_done_t",
})
goals["is_ai"]     = goals["is_ai"].astype(bool)
goals["completed"] = goals["completed"].astype(bool)
goals["progress"]  = goals["progress"].astype(float)

tasks = pd.DataFrame(raw["tasks"]).rename(columns={
    "isAI": "is_ai", "userId": "user_id", "goalId": "goal_id",
})
tasks["is_ai"] = tasks["is_ai"].astype(bool)
tasks["done"]  = tasks["status"] == "done"

# task completion rate per user
tcr = (tasks.groupby("user_id")["done"]
       .mean().mul(100).reset_index(name="task_cr"))
users = users.merge(tcr, on="user_id", how="left").fillna({"task_cr": 0})

# createdAt → місяць (якщо є в даних)
has_date = "createdAt" in goals.columns
if has_date:
    goals["created_month"] = pd.to_datetime(
        goals["createdAt"], errors="coerce").dt.to_period("M")

# Категорії цілей
CATS = {
    "Фітнес і здоров'я": ["shape","run","sleep","fitness","workout","weight","sport"],
    "Кар'єра і навички": ["ux","design","sql","typescript","react","data","career","job"],
    "Фінанси":           ["save","fund","budget","money","financial"],
    "Вивчення мови":     ["english","french","spanish","language","interview"],
    "Особистий проєкт":  ["blog","side project","launch","startup","write"],
    "Ментальне здоров'я":["anxiety","meditat","mental","stress","resilience"],
    "Навчання/Академічне":["thesis","dissertation","study","research","essay"],
    "Соціальне":         ["social","friend","network","connect","relation"],
}
def categorize(title):
    t = title.lower()
    for cat, kws in CATS.items():
        if any(k in t for k in kws):
            return cat
    return "Інше"
goals["cat"] = goals["title"].apply(categorize)

# Гейміфікаційний score = (норм. стрік + норм. монети) / 2 × 100
def norm01(s):
    mn, mx = s.min(), s.max()
    return (s - mn) / (mx - mn + 1e-9)
users["gami"] = (norm01(users["cur_streak"]) + norm01(users["money"])) / 2 * 100

print(f"\n📦  {len(users)} юзерів · {len(goals)} цілей · {len(tasks)} тасок")
print("📊  Генерація графіків...\n")

# ═══════════════════════════════════════════════════════════════════════════
# 01. СТРІКИ — ХТО ЗАЙМАЄТЬСЯ РЕГУЛЯРНО?
# ═══════════════════════════════════════════════════════════════════════════
u = users.sort_values("cur_streak", ascending=True)
fig, ax = plt.subplots(figsize=(12, 9))
fig.suptitle("Стріки користувачів: хто займається регулярно?",
             x=0.05, ha="left")
ax.set_title(
    "Поточний стрік = к-сть днів підряд, коли юзер виконав хоча б одне завдання.\n"
    "Рекорд = найдовша серія за весь час. Якщо рекорд >> поточного — юзер «впав».",
    color=C["muted"], fontsize=9, pad=8, loc="left")

y = np.arange(len(u)); h = 0.38
ax.barh(y + h/2, u["max_streak"],  h, color=C["light"], label="Рекордний стрік", zorder=2)
cols = [C["clay"] if s >= 15 else C["green"] if s >= 7 else C["sage"]
        for s in u["cur_streak"]]
ax.barh(y - h/2, u["cur_streak"], h, color=cols, zorder=3)
ax.set_yticks(y); ax.set_yticklabels(u["short"], fontsize=9)
ax.set_xlabel("Кількість днів підряд")
ax.grid(axis="x", zorder=1)
for i, (c, m) in enumerate(zip(u["cur_streak"], u["max_streak"])):
    ax.text(c + 0.3, i - h/2, str(c), va="center", fontsize=8, fontweight="bold")
    ax.text(m + 0.3, i + h/2, str(m), va="center", fontsize=8, color=C["muted"])
ax.legend(handles=[
    mpatches.Patch(color=C["clay"],  label="🔥 ≥15 днів — дуже активний"),
    mpatches.Patch(color=C["green"], label="📈 7–14 днів — стабільний"),
    mpatches.Patch(color=C["sage"],  label="🌱 <7 днів — тільки починає / впав"),
    mpatches.Patch(color=C["light"], label="Рекорд (максимальний стрік)"),
], loc="lower right", fontsize=9)
fig.tight_layout(); save(fig, "01_streaks.png")

# ═══════════════════════════════════════════════════════════════════════════
# 02. AI vs MANUAL — ЧИ AI ДАЄ КРАЩИЙ РЕЗУЛЬТАТ?
# ═══════════════════════════════════════════════════════════════════════════
ag = goals[goals["is_ai"]];  mg = goals[~goals["is_ai"]]
at = tasks[tasks["is_ai"]];  mt = tasks[~tasks["is_ai"]]

vals = {
    "Середній прогрес\nпо цілях":
        (ag["progress"].mean(), mg["progress"].mean(),
         "Наскільки далеко юзер\nпросунувся в середньому (0–100%)"),
    "% цілей\nповністю завершено":
        (ag["completed"].mean()*100, mg["completed"].mean()*100,
         "Яка частка цілей\nдійшла до 100% прогресу"),
    "% завдань\nвиконано":
        (at["done"].mean()*100, mt["done"].mean()*100,
         "Яка частка завдань\nвсередині цілей виконана"),
}

fig, axes = plt.subplots(1, 3, figsize=(14, 6))
fig.suptitle("AI-планування vs Ручне: чи AI дає кращий результат?",
             x=0.05, ha="left")
for ax, (title, (ai_v, mn_v, sub)) in zip(axes, vals.items()):
    bars = ax.bar(["🤖 AI", "✍️ Вручну"], [ai_v, mn_v],
                  color=[C["green"], C["clay"]], width=0.5, zorder=2)
    ax.set_ylim(0, 110); ax.set_title(title, pad=6)
    ax.grid(axis="y", zorder=1); footnote(ax, sub)
    for bar, v in zip(bars, [ai_v, mn_v]):
        ax.text(bar.get_x() + bar.get_width()/2, v + 1.5,
                f"{v:.1f}%", ha="center", fontsize=13, fontweight="bold")
    d = ai_v - mn_v
    ax.text(0.5, 0.07,
            f"AI {'краще' if d >= 0 else 'гірше'} на {abs(d):.1f} п.п.",
            ha="center", transform=ax.transAxes, fontsize=10, fontweight="bold",
            color=C["green"] if d >= 0 else C["clay"],
            bbox=dict(boxstyle="round,pad=0.3", facecolor=C["light"], alpha=0.85))
fig.tight_layout(rect=[0, 0, 1, 0.93]); save(fig, "02_ai_vs_manual.png")

# ═══════════════════════════════════════════════════════════════════════════
# 03. ЧАСТОТА ВИКОРИСТАННЯ AI vs MANUAL — ПО МІСЯЦЯХ
# ═══════════════════════════════════════════════════════════════════════════
n_ai_total = int(goals["is_ai"].sum())
n_mn_total = int((~goals["is_ai"]).sum())
total_g    = n_ai_total + n_mn_total

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
fig.suptitle("Як часто юзери обирають AI-планування, а як — ручне?",
             x=0.05, ha="left")

# Ліво: загальні числа (великі та чіткі)
b = ax1.bar(["🤖 AI-планування", "✍️ Ручне планування"],
            [n_ai_total, n_mn_total],
            color=[C["green"], C["clay"]], width=0.5, zorder=2)
ax1.set_ylim(0, max(n_ai_total, n_mn_total) * 1.35)
ax1.set_ylabel("Кількість цілей створено")
ax1.set_title("Загальна к-сть цілей по типу", pad=8)
ax1.grid(axis="y", zorder=1)
for bar, v, pct in zip(b, [n_ai_total, n_mn_total],
                        [n_ai_total/total_g*100, n_mn_total/total_g*100]):
    ax1.text(bar.get_x() + bar.get_width()/2, v + 0.5,
             f"{v} цілей\n{pct:.0f}% від усіх",
             ha="center", fontsize=13, fontweight="bold")
footnote(ax1, f"Всього цілей у системі: {total_g}")

# Право: по місяцях або по юзерах (залежно від наявності createdAt)
if has_date:
    monthly = (goals.groupby(["created_month", "is_ai"])
               .size().unstack(fill_value=0)
               .rename(columns={False: "Вручну", True: "AI"}))
    monthly.index = monthly.index.astype(str)
    x_m = np.arange(len(monthly))
    w   = 0.38
    ax2.bar(x_m - w/2, monthly.get("Вручну", 0),
            w, color=C["clay"],  label="✍️ Ручне", zorder=2)
    ax2.bar(x_m + w/2, monthly.get("AI", 0),
            w, color=C["green"], label="🤖 AI",     zorder=2)
    ax2.set_xticks(x_m)
    ax2.set_xticklabels(monthly.index, rotation=30, ha="right", fontsize=9)
    ax2.set_ylabel("К-сть нових цілей")
    ax2.set_title("Динаміка по місяцях:\nскільки цілей кожного типу створювали", pad=8)
    ax2.legend(fontsize=10); ax2.grid(axis="y", zorder=1)
    footnote(ax2, "Кожна пара стовпчиків = один місяць. Зелений = AI, помаранчевий = вручну.")
else:
    # Якщо createdAt немає — показуємо розподіл по юзерах
    us = users.sort_values("ai_pct", ascending=True)
    y2 = np.arange(len(us))
    ax2.barh(y2, us["n_manual"], color=C["clay"],  height=0.6, zorder=2, label="✍️ Ручне")
    ax2.barh(y2, us["n_ai"],     color=C["green"], height=0.6, zorder=2,
             left=us["n_manual"], label="🤖 AI")
    ax2.set_yticks(y2); ax2.set_yticklabels(us["short"], fontsize=8)
    ax2.set_xlabel("К-сть цілей")
    ax2.set_title("По кожному юзеру\n(від менше AI до більше AI)", pad=8)
    ax2.legend(fontsize=10, loc="lower right"); ax2.grid(axis="x", zorder=1)
    for i, (_, row) in enumerate(us.iterrows()):
        if row["n_goals"] > 0:
            ax2.text(row["n_goals"] + 0.1, i,
                     f"{row['ai_pct']:.0f}% AI",
                     va="center", fontsize=8, color=C["dark"])
    footnote(ax2, "⚠️ Додайте createdAt в analytics_data.json для графіку по місяцях")

fig.tight_layout(rect=[0, 0.03, 1, 0.93]); save(fig, "03_ai_usage_frequency.png")

# ═══════════════════════════════════════════════════════════════════════════
# 04. ВОРОНКА — ДЕ ЮЗЕРИ КИДАЮТЬ ЦІЛІ?
# ═══════════════════════════════════════════════════════════════════════════
stages = [
    ("Всього цілей поставлено",    len(goals)),
    ("Розпочали (прогрес > 0%)",   int((goals["progress"] > 0).sum())),
    ("Дійшли до чверті (≥25%)",    int((goals["progress"] >= 25).sum())),
    ("Дійшли до половини (≥50%)",  int((goals["progress"] >= 50).sum())),
    ("Майже готово (≥80%)",        int((goals["progress"] >= 80).sum())),
    ("Повністю завершили (100%)",   int(goals["completed"].sum())),
]
labels = [s[0] for s in stages]
values = [s[1] for s in stages]
total  = values[0]

fig, ax = plt.subplots(figsize=(12, 7))
fig.suptitle("Де юзери кидають цілі? Воронка прогресу", x=0.05, ha="left")
ax.set_title(
    "Кожен рядок — скільки цілей дійшло до певного рівня прогресу.\n"
    "Стрілки між рядками показують, скільки цілей «загинуло» на кожному переході.",
    color=C["muted"], fontsize=9, pad=8, loc="left")

stage_colors = [C["green"], "#5A9B6E", "#7FAF8A", "#A8C9B0", C["amber"], C["clay"]]
y = np.arange(len(labels))
bars = ax.barh(y, values, color=stage_colors, height=0.6, zorder=2)
ax.set_yticks(y); ax.set_yticklabels(labels, fontsize=11)
ax.set_xlabel("Кількість цілей"); ax.grid(axis="x", zorder=1)
ax.set_xlim(0, total * 1.38)
for bar, val in zip(bars, values):
    ax.text(val + 0.5, bar.get_y() + bar.get_height()/2,
            f"{val} цілей  ({val/total*100:.0f}%)",
            va="center", fontsize=11, fontweight="bold")
for i in range(1, len(values)):
    drop = values[i-1] - values[i]
    if drop > 0:
        ax.text(values[i] / 2, i - 0.46,
                f"▼ тут зупинилось {drop} цілей ({drop/values[i-1]*100:.0f}% від попереднього кроку)",
                ha="center", fontsize=8, color=C["muted"], style="italic")
# Підсумок
biggest_drop_idx = max(range(1, len(values)), key=lambda i: values[i-1]-values[i])
conclusion(ax,
    f"Найбільший відсів:\n"
    f"  між «{labels[biggest_drop_idx-1]}»\n"
    f"  і «{labels[biggest_drop_idx]}»\n"
    f"  — {values[biggest_drop_idx-1]-values[biggest_drop_idx]} цілей\n"
    f"  ({(values[biggest_drop_idx-1]-values[biggest_drop_idx])/values[biggest_drop_idx-1]*100:.0f}% загинуло)",
    loc="lower right")
fig.tight_layout(); save(fig, "04_goal_dropout_funnel.png")

# ═══════════════════════════════════════════════════════════════════════════
# 05. SURVIVAL CURVE — AI vs MANUAL: КОГО КИДАЮТЬ РІДШЕ?
# ═══════════════════════════════════════════════════════════════════════════
def survival(df):
    n = len(df)
    return [100] + [(df["progress"] >= t).sum() / n * 100
                    for t in [1, 25, 50, 80, 100]]

surv_ai = survival(goals[goals["is_ai"]])
surv_mn = survival(goals[~goals["is_ai"]])
x_labels = [
    "Ціль\nпоставлена",
    "Зроблено\nхоч щось\n(≥1%)",
    "Пройдено\nчверть\n(≥25%)",
    "Пройдено\nполовину\n(≥50%)",
    "Майже\nготово\n(≥80%)",
    "Повністю\nзавершено\n(100%)",
]
xs = range(len(x_labels))

fig, ax = plt.subplots(figsize=(13, 6))
fig.suptitle("AI-цілі доходять до кінця частіше, ніж ручні?",
             x=0.05, ha="left")
ax.set_title(
    "Крива показує, яка частка цілей (%) ще «жива» на кожному рівні прогресу.\n"
    "Чим вища лінія — тим рідше юзери кидають цілі. Зелений = AI, помаранчевий = вручну.",
    color=C["muted"], fontsize=9, pad=8, loc="left")

ax.plot(xs, surv_ai, color=C["green"], linewidth=3, marker="o",
        markersize=10, zorder=3, label="🤖 AI-планування")
ax.plot(xs, surv_mn, color=C["clay"],  linewidth=3, marker="s",
        markersize=10, zorder=3, label="✍️ Ручне планування")

# Зафарбовуємо зону різниці
ax.fill_between(xs, surv_ai, surv_mn,
                where=[a >= m for a, m in zip(surv_ai, surv_mn)],
                alpha=0.12, color=C["green"], label="AI краще тут")
ax.fill_between(xs, surv_ai, surv_mn,
                where=[a < m  for a, m in zip(surv_ai, surv_mn)],
                alpha=0.12, color=C["clay"], label="Ручне краще тут")

ax.set_xticks(xs); ax.set_xticklabels(x_labels, fontsize=10)
ax.set_ylabel("% цілей, які ще продовжують виконуватись")
ax.set_ylim(0, 115); ax.grid(zorder=1); ax.legend(fontsize=10, loc="upper right")

# Підписи значень
for i, (a, m) in enumerate(zip(surv_ai, surv_mn)):
    ax.text(i, a + 3,  f"{a:.0f}%", ha="center", fontsize=9,
            color=C["green"], fontweight="bold")
    ax.text(i, m - 7,  f"{m:.0f}%", ha="center", fontsize=9,
            color=C["clay"],  fontweight="bold")

diff = surv_ai[-1] - surv_mn[-1]
conclusion(ax,
    f"Результат на фінальному кроці (100%):\n"
    f"  🤖 AI-планування:  {surv_ai[-1]:.0f}% цілей завершено\n"
    f"  ✍️ Ручне:          {surv_mn[-1]:.0f}% цілей завершено\n\n"
    f"  → AI {'краще' if diff >= 0 else 'гірше'} на {abs(diff):.0f} п.п.\n"
    f"  {'Юзери з AI-планом рідше кидають цілі.' if diff >= 0 else 'Ручне планування утримує краще.'}",
    loc="upper right")
fig.tight_layout(); save(fig, "05_survival_curve.png")

# ═══════════════════════════════════════════════════════════════════════════
# 06. РЕГУЛЯРНІСТЬ (СТРІК) → ПРОГРЕС
# ═══════════════════════════════════════════════════════════════════════════
xv = users["cur_streak"].values.astype(float)
yv = users["avg_prog"].values.astype(float)
r, p = stats.pearsonr(xv, yv)
reg  = LinearRegression().fit(xv.reshape(-1, 1), yv)
xl   = np.linspace(xv.min(), xv.max(), 100)

fig, ax = plt.subplots(figsize=(11, 7))
fig.suptitle("Юзери з довшим стріком досягають більшого прогресу?",
             x=0.05, ha="left")
ax.set_title(
    "Кожна точка = один юзер. Горизонталь = стрік (к-сть днів підряд).\n"
    "Вертикаль = середній % прогресу по всіх його цілях. Лінія = загальний тренд.",
    color=C["muted"], fontsize=9, pad=8, loc="left")

med = np.median(yv)
colors = [C["clay"] if v >= med else C["sage"] for v in yv]
ax.scatter(xv, yv, c=colors, s=110, zorder=4, alpha=0.9)
ax.plot(xl, reg.predict(xl.reshape(-1, 1)),
        color=C["dark"], linewidth=2, linestyle="--", zorder=3, label="Лінія тренду")
for _, row in users.iterrows():
    ax.annotate(row["short"],
                (row["cur_streak"], row["avg_prog"]),
                xytext=(5, 4), textcoords="offset points",
                fontsize=7.5, color=C["muted"])
ax.set_xlabel("Поточний стрік — к-сть днів підряд з виконаними завданнями")
ax.set_ylabel("Середній прогрес по всіх цілях (%)")
ax.grid(zorder=1)

r_str = "сильний" if abs(r) >= 0.5 else "помірний" if abs(r) >= 0.3 else "слабкий"
p_str = "зв'язок статистично підтверджений ✅" if p < 0.05 else "зв'язок може бути випадковим ❌"
conclusion(ax,
    f"r = {r:.2f}  ({r_str} зв'язок)\n"
    f"де r = 0 → зв'язку немає,  r = 1 → ідеальний\n\n"
    f"p = {p:.3f} → {p_str}\n\n"
    f"{'→ Довший стрік пов'+'язаний з вищим прогресом' if r > 0.3 and p < 0.05 else '→ Стрік сам по собі не гарантує прогрес'}")
ax.legend(handles=[
    mpatches.Patch(color=C["clay"], label=f"Прогрес вищий за середній (>{med:.0f}%)"),
    mpatches.Patch(color=C["sage"], label="Прогрес нижчий за середній"),
], fontsize=9, loc="lower right")
fig.tight_layout(); save(fig, "06_streak_vs_progress.png")

# ═══════════════════════════════════════════════════════════════════════════
# 07. КАТЕГОРІЇ ЦІЛЕЙ — ЯКИМ AI ДОВІРЯЮТЬ БІЛЬШЕ?
# ═══════════════════════════════════════════════════════════════════════════
cat_agg = (goals.groupby(["cat", "is_ai"]).size()
           .unstack(fill_value=0)
           .rename(columns={False: "Вручну", True: "AI"}))
cat_agg["total"]  = cat_agg["AI"] + cat_agg["Вручну"]
cat_agg["ai_pct"] = cat_agg["AI"] / cat_agg["total"] * 100
cat_agg = cat_agg[cat_agg["total"] >= 2].sort_values("ai_pct", ascending=True)

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 7))
fig.suptitle("Яким цілям юзери довіряють AI, а яким планують вручну?",
             x=0.05, ha="left")

y = np.arange(len(cat_agg))

# Ліво: скільки цілей кожного типу
ax1.barh(y, cat_agg["Вручну"], color=C["clay"],  height=0.55, zorder=2, label="✍️ Вручну")
ax1.barh(y, cat_agg["AI"],     color=C["green"], height=0.55, zorder=2,
         left=cat_agg["Вручну"], label="🤖 AI")
ax1.set_yticks(y); ax1.set_yticklabels(cat_agg.index, fontsize=10)
ax1.set_xlabel("Кількість цілей")
ax1.set_title("К-сть AI і ручних цілей\nв кожній категорії", pad=8)
ax1.legend(fontsize=10); ax1.grid(axis="x", zorder=1)
for i, (ai_v, mn_v) in enumerate(zip(cat_agg["AI"], cat_agg["Вручну"])):
    if mn_v > 0:
        ax1.text(mn_v/2, i, str(int(mn_v)), ha="center", va="center",
                 fontsize=9, fontweight="bold", color="white")
    if ai_v > 0:
        ax1.text(mn_v + ai_v/2, i, str(int(ai_v)), ha="center", va="center",
                 fontsize=9, fontweight="bold", color="white")

# Право: % AI — відхилення від 50%
ax2.set_title(
    "% AI-планування в кожній категорії\n"
    "Правіше 0 = юзери частіше обирають AI для цих цілей", pad=8)
colors_div = [C["green"] if v >= 50 else C["clay"] for v in cat_agg["ai_pct"]]
bars2 = ax2.barh(y, cat_agg["ai_pct"] - 50, color=colors_div, height=0.55, zorder=2)
ax2.axvline(0, color=C["dark"], linewidth=2, zorder=3)
ax2.set_yticks(y); ax2.set_yticklabels(cat_agg.index, fontsize=10)
ax2.set_xlabel("Відхилення від 50% (п.п.)\n0 = порівну AI і вручну")
ax2.grid(axis="x", zorder=1)
for bar, pct, tot in zip(bars2, cat_agg["ai_pct"], cat_agg["total"]):
    xp = bar.get_width()
    ha = "left" if xp >= 0 else "right"
    ax2.text(xp + (0.5 if xp >= 0 else -0.5),
             bar.get_y() + bar.get_height()/2,
             f"{pct:.0f}%  (n={int(tot)})",
             va="center", ha=ha, fontsize=9, fontweight="bold")
footnote(ax2, "← Частіше вручну  |  Частіше AI →")

most_ai  = cat_agg["ai_pct"].idxmax()
least_ai = cat_agg["ai_pct"].idxmin()
conclusion(ax2,
    f"Найбільше довіряють AI:\n  → {most_ai}\n"
    f"  ({cat_agg.loc[most_ai,'ai_pct']:.0f}% цілей з AI)\n\n"
    f"Найменше довіряють AI:\n  → {least_ai}\n"
    f"  ({cat_agg.loc[least_ai,'ai_pct']:.0f}% цілей з AI)",
    loc="lower right")
fig.tight_layout(rect=[0, 0.03, 1, 0.93]); save(fig, "07_goal_categories.png")

# ═══════════════════════════════════════════════════════════════════════════
# 08. ГЕЙМІФІКАЦІЯ + AI — ЩО ДАЄ НАЙКРАЩИЙ РЕЗУЛЬТАТ?
# ═══════════════════════════════════════════════════════════════════════════
r_g, p_g = stats.pearsonr(users["gami"], users["avg_prog"])

med_ai   = users["ai_pct"].median()
med_gami = users["gami"].median()

def quad(row):
    hi_ai   = row["ai_pct"] >= med_ai
    hi_gami = row["gami"]   >= med_gami
    if hi_ai and hi_gami:    return "AI + гейміфікація"
    if hi_ai:                return "Тільки AI"
    if hi_gami:              return "Тільки гейміфікація"
    return "Ні AI, ні гейміфікації"

users["quad"] = users.apply(quad, axis=1)
q_order  = ["AI + гейміфікація", "Тільки AI",
            "Тільки гейміфікація", "Ні AI, ні гейміфікації"]
q_colors = [C["clay"], C["green"], C["blue"], C["sage"]]
q_stats  = (users.groupby("quad")["avg_prog"]
            .agg(["mean", "count"]).reindex(q_order).fillna(0))

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
fig.suptitle("AI + гейміфікація разом дають кращий результат, ніж окремо?",
             x=0.05, ha="left")

# Ліво: scatter гейміфікація → прогрес
xv2 = users["gami"].values; yv2 = users["avg_prog"].values
reg2 = LinearRegression().fit(xv2.reshape(-1,1), yv2)
xl2  = np.linspace(0, 100, 100)
sc = ax1.scatter(xv2, yv2, c=users["ai_pct"], cmap="YlGn",
                 vmin=0, vmax=100, s=90, zorder=4)
ax1.plot(xl2, reg2.predict(xl2.reshape(-1,1)),
         color=C["clay"], linewidth=2, linestyle="--", zorder=3)
cb = fig.colorbar(sc, ax=ax1, fraction=0.04, pad=0.02)
cb.set_label("% цілей юзера з AI-планом", fontsize=8)
for _, row in users.iterrows():
    ax1.annotate(row["short"], (row["gami"], row["avg_prog"]),
                 xytext=(4, 3), textcoords="offset points",
                 fontsize=7, color=C["muted"])
ax1.set_xlabel(
    "Рівень гейміфікації (0–100)\n"
    "= середнє між нормалізованим стріком і к-стю монет")
ax1.set_ylabel("Середній прогрес по всіх цілях (%)")
ax1.set_title("Активніші «гравці» досягають більше?", pad=8)
ax1.grid(zorder=1)
rg_str = "сильний" if abs(r_g) >= 0.5 else "помірний" if abs(r_g) >= 0.3 else "слабкий"
conclusion(ax1,
    f"r = {r_g:.2f}  ({rg_str} зв'язок)\n"
    f"{'✅ Гейміфікація пов'+'язана з прогресом' if p_g < 0.05 else '❌ Прямого зв'+'язку немає'}\n\n"
    f"Колір точки = скільки % цілей\nюзер планує через AI\n"
    f"(темніший зелений = більше AI)")

# Право: 4 квадранти — барчарт
bars3 = ax2.bar(range(len(q_stats)), q_stats["mean"],
                color=q_colors, width=0.6, zorder=2)
ax2.set_xticks(range(len(q_stats)))
ax2.set_xticklabels(q_stats.index, rotation=12, ha="right", fontsize=9)
ax2.set_ylabel("Середній прогрес по цілях (%)")
ax2.set_title(
    "4 типи юзерів: хто досягає найбільшого?\n"
    "AI + гейміфікація — це максимум?", pad=8)
ax2.set_ylim(0, 100); ax2.grid(axis="y", zorder=1)
for bar, (mv, cnt) in zip(bars3, q_stats.itertuples(index=False)):
    ax2.text(bar.get_x() + bar.get_width()/2, mv + 2,
             f"{mv:.1f}%\nn={int(cnt)}", ha="center", fontsize=10, fontweight="bold")
best_q = q_stats["mean"].idxmax()
conclusion(ax2,
    f"Найвищий прогрес:\n  → {best_q}\n"
    f"  ({q_stats.loc[best_q,'mean']:.1f}%)\n\n"
    f"{'→ AI і гейміфікація підсилюють одне одного' if best_q == 'AI + гейміфікація' else '→ Несподіваний переможець'}",
    loc="lower right")
fig.tight_layout(rect=[0, 0, 1, 0.93]); save(fig, "08_gamification_impact.png")

# ═══════════════════════════════════════════════════════════════════════════
# 09. КЛАСТЕРИЗАЦІЯ — 3 ТИПИ ЮЗЕРІВ
# ═══════════════════════════════════════════════════════════════════════════
feats = users[["cur_streak", "avg_prog", "task_cr"]].fillna(0)
users["cluster"] = KMeans(n_clusters=3, random_state=42, n_init=10).fit_predict(
    StandardScaler().fit_transform(feats))
scores = {c: users.loc[users["cluster"]==c,
              ["cur_streak","avg_prog","task_cr"]].mean().sum() for c in range(3)}
rank = sorted(scores, key=scores.get, reverse=True)
cl   = {rank[0]: ("🏆 Чемпіони",   C["clay"]),
        rank[1]: ("📈 Зростають",  C["green"]),
        rank[2]: ("🌱 Початківці", C["sage"])}

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 7))
fig.suptitle("Три типи юзерів за рівнем активності та результатами",
             x=0.05, ha="left")
ax1.set_title(
    "Алгоритм автоматично розбив юзерів на 3 групи за трьома показниками:\n"
    "стрік (регулярність), прогрес (результат), виконання завдань.",
    color=C["muted"], fontsize=9, pad=8, loc="left")

for c in range(3):
    mask = users["cluster"] == c
    lbl, col = cl[c]
    ax1.scatter(users.loc[mask,"cur_streak"], users.loc[mask,"avg_prog"],
                color=col, s=110, zorder=3, label=lbl, alpha=0.9)
    for _, row in users[mask].iterrows():
        ax1.annotate(row["short"],
                     (row["cur_streak"], row["avg_prog"]),
                     xytext=(4,3), textcoords="offset points",
                     fontsize=7, color=C["muted"])
ax1.set_xlabel("Стрік — к-сть днів підряд з виконаними завданнями")
ax1.set_ylabel("Середній прогрес по цілях (%)")
ax1.legend(fontsize=10); ax1.grid(zorder=1)

ax2.axis("off")
rows_t = []
for c in range(3):
    lbl, _ = cl[c]
    sub = users[users["cluster"]==c]
    rows_t.append([lbl, str(len(sub)),
                   f"{sub['cur_streak'].mean():.1f} дн.",
                   f"{sub['avg_prog'].mean():.1f}%",
                   f"{sub['task_cr'].mean():.1f}%",
                   f"{sub['money'].mean():.0f}"])
tbl = ax2.table(
    cellText=rows_t,
    colLabels=["Група", "Юзерів", "Середній\nстрік",
               "Середній\nпрогрес", "Виконано\nзавдань %", "Монети\n(сер.)"],
    loc="center", cellLoc="center")
tbl.auto_set_font_size(False); tbl.set_fontsize(10); tbl.scale(1.2, 3.0)
for (row, col), cell in tbl.get_celld().items():
    cell.set_edgecolor(C["grid"])
    if row == 0:
        cell.set_facecolor(C["dark"])
        cell.set_text_props(color="white", fontweight="bold")
    else:
        _, col_c = cl[row-1]
        cell.set_facecolor(col_c + "33")
ax2.set_title("Середні показники кожної групи\n(таблиця підтверджує поділ)", pad=20)
fig.tight_layout(); save(fig, "09_user_clusters.png")

# ═══════════════════════════════════════════════════════════════════════════
# 10. ТИПИ ЗАВДАНЬ — ЩО ВИКОНУЮТЬ, ЩО ІГНОРУЮТЬ?
# ═══════════════════════════════════════════════════════════════════════════
type_ua = {"learn":"Вивчення","practice":"Практика","review":"Повторення",
           "reflect":"Рефлексія","daily":"Щоденні","manual":"Ручні"}
type_col = {"learn":C["green"],"practice":C["clay"],"review":C["sage"],
            "reflect":"#A0785A","daily":C["blue"],"manual":C["muted"]}

cr_ai  = (tasks[tasks["is_ai"]].groupby("type")["done"]
           .mean().mul(100).rename("AI"))
cr_mn  = (tasks[~tasks["is_ai"]].groupby("type")["done"]
           .mean().mul(100).rename("Вручну"))
cr_all = tasks.groupby("type")["done"].mean().mul(100).rename("Всі")
cnt    = tasks.groupby("type").size().rename("count")
cr_df  = pd.concat([cr_ai, cr_mn, cr_all, cnt], axis=1).fillna(0)
cr_df.index = [type_ua.get(t, t) for t in cr_df.index]
cr_df  = cr_df.sort_values("Всі", ascending=False)

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
fig.suptitle("Які типи завдань виконують охоче, а які ігнорують?",
             x=0.05, ha="left")
ax1.set_title(
    "Для кожного типу завдань: яка частка відмічена як «виконано».\n"
    "Зелений = AI-завдання, помаранчевий = ручні завдання.",
    color=C["muted"], fontsize=9, pad=8, loc="left")

x3 = np.arange(len(cr_df)); w = 0.32
b1 = ax1.bar(x3 - w/2, cr_df["AI"],     w, color=C["green"],
             label="🤖 AI-завдання",    zorder=2)
b2 = ax1.bar(x3 + w/2, cr_df["Вручну"], w, color=C["clay"],
             label="✍️ Ручні завдання", zorder=2)
ax1.set_xticks(x3); ax1.set_xticklabels(cr_df.index, fontsize=10)
ax1.set_ylabel("% завдань, відмічених як «виконано»")
ax1.set_ylim(0, 115); ax1.grid(axis="y", zorder=1); ax1.legend(fontsize=10)
for bar in list(b1) + list(b2):
    h = bar.get_height()
    ax1.text(bar.get_x() + bar.get_width()/2, h + 1.5,
             f"{h:.0f}%", ha="center", fontsize=8, fontweight="bold")
best  = cr_df["Всі"].idxmax()
worst = cr_df["Всі"].idxmin()
conclusion(ax1,
    f"Найкраще виконують:\n  → {best} ({cr_df.loc[best,'Всі']:.0f}%)\n\n"
    f"Найгірше виконують:\n  → {worst} ({cr_df.loc[worst,'Всі']:.0f}%)\n\n"
    f"→ Де треба покращити\n  мотивацію або UX?")

# Права: радарна карта — ТІЛЬКИ загальні значення, великі підписи
categories_r = list(cr_df.index)
N  = len(categories_r)
vr = list(cr_df["Всі"].values) + [cr_df["Всі"].values[0]]
angles = [n / float(N) * 2 * np.pi for n in range(N)] + [0]
ax2.remove()
ax2 = fig.add_subplot(1, 2, 2, polar=True)
ax2.set_facecolor(C["surface"])
ax2.plot(angles, vr, color=C["green"], linewidth=2.5, zorder=3)
ax2.fill(angles, vr, color=C["green"], alpha=0.25, zorder=2)
ax2.set_xticks(angles[:-1])
ax2.set_xticklabels(categories_r, fontsize=11, color=C["dark"])
ax2.set_ylim(0, 100)
ax2.set_yticks([25, 50, 75])
ax2.set_yticklabels(["25%", "50%", "75%"], fontsize=8, color=C["muted"])
ax2.grid(color=C["grid"], alpha=0.6)
ax2.set_title(
    "Радарна карта виконання завдань:\nвершини — найкраще виконані типи,\n"
    "провали — де юзери зупиняються.",
    pad=20, fontsize=10)
for angle, val, lbl in zip(angles[:-1], cr_df["Всі"].values, categories_r):
    ax2.text(angle, val + 10, f"{val:.0f}%",
             ha="center", va="center", fontsize=10, fontweight="bold", color=C["dark"])
fig.tight_layout(); save(fig, "10_task_types.png")

# ═══════════════════════════════════════════════════════════════════════════
# 11. ТЕПЛОВА КАРТА — ХТО І ЯКУ ЦІЛЬ ЯК ВИКОНУЄ?
# ═══════════════════════════════════════════════════════════════════════════
ph = goals.pivot_table(index="user_id", columns="title",
                       values="progress", aggfunc="mean")
ph.index = ph.index.map(users.set_index("user_id")["short"])

fig, ax = plt.subplots(figsize=(17, 9))
fig.suptitle("Прогрес кожного юзера по кожній цілі",
             x=0.05, ha="left")
ax.set_title(
    "Кожна клітинка = середній прогрес одного юзера по одній конкретній цілі (%).\n"
    "«—» = юзер не ставив цю ціль. Темно-зелений = близько до 100%, «—» = немає цілі.",
    color=C["muted"], fontsize=9, pad=8, loc="left")

cmap   = mcolors.LinearSegmentedColormap.from_list(
    "c", [C["surface"], C["sage"], C["green"], C["clay"]])
data   = ph.fillna(-1).values
masked = np.ma.masked_where(data < 0, data)
im = ax.imshow(masked, cmap=cmap, vmin=0, vmax=100, aspect="auto")
ax.set_xticks(range(len(ph.columns)))
ax.set_xticklabels(ph.columns, rotation=32, ha="right", fontsize=9)
ax.set_yticks(range(len(ph.index)))
ax.set_yticklabels(ph.index, fontsize=9)
for i in range(len(ph.index)):
    for j in range(len(ph.columns)):
        val = data[i, j]
        if val >= 0:
            ax.text(j, i, f"{val:.0f}%", ha="center", va="center",
                    fontsize=8, fontweight="bold",
                    color="white" if val > 55 else C["dark"])
        else:
            ax.text(j, i, "—", ha="center", va="center",
                    fontsize=10, color=C["muted"])
cbar = fig.colorbar(im, ax=ax, pad=0.01, fraction=0.02)
cbar.set_label("Прогрес (%)\n0% = не почав, 100% = завершив", fontsize=9)
fig.tight_layout(); save(fig, "11_progress_heatmap.png")

# ═══════════════════════════════════════════════════════════════════════════
# 12. МОНЕТИ — ЧИ НАГОРОДА ПОВ'ЯЗАНА З АКТИВНІСТЮ?
# ═══════════════════════════════════════════════════════════════════════════
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
fig.suptitle("Монети: чи активніші юзери заробляють більше нагород?",
             x=0.05, ha="left")

def money_plot(ax, x_col, xlabel, title, note):
    xv3 = users[x_col].values.astype(float)
    yv3 = users["money"].values.astype(float)
    r3, p3 = stats.pearsonr(xv3, yv3)
    reg3 = LinearRegression().fit(xv3.reshape(-1,1), yv3)
    ax.scatter(xv3, yv3, c=C["green"],
               s=users["n_goals"]*20+20, zorder=3, alpha=0.85)
    ax.plot(np.linspace(xv3.min(), xv3.max(), 100),
            reg3.predict(np.linspace(xv3.min(), xv3.max(), 100).reshape(-1,1)),
            color=C["clay"], linewidth=2, linestyle="--", zorder=2)
    for _, row in users.iterrows():
        ax.annotate(row["short"], (row[x_col], row["money"]),
                    xytext=(4,3), textcoords="offset points",
                    fontsize=7, color=C["muted"])
    r3_str = "сильний" if abs(r3) >= 0.5 else "помірний" if abs(r3) >= 0.3 else "слабкий"
    conclusion(ax,
        f"r = {r3:.2f} ({r3_str})\n"
        f"{'✅ Є зв'+'язок' if p3 < 0.05 else '❌ Зв'+'язку немає'}")
    ax.set_xlabel(xlabel); ax.set_ylabel("Монети 💰")
    ax.set_title(title, pad=8); ax.grid(zorder=1); footnote(ax, note)

money_plot(ax1, "cur_streak",
           "Поточний стрік (к-сть днів підряд)",
           "Довший стрік → більше монет?",
           "Розмір точки = к-сть цілей у цього юзера")
money_plot(ax2, "avg_prog",
           "Середній прогрес по всіх цілях (%)",
           "Більший прогрес → більше монет?",
           "Монети = індикатор загальної активності в системі")
fig.tight_layout(rect=[0, 0.03, 1, 0.93]); save(fig, "12_money_correlation.png")

# ═══════════════════════════════════════════════════════════════════════════
print(f"\n🎉  Готово! 12 графіків збережено в  {CHARTS_DIR}\n")

# ── Summary ─────────────────────────────────────────────────────────────────
print("=" * 65)
print("📋  SUMMARY ДЛЯ ВИСНОВКІВ ДОСЛІДЖЕННЯ")
print("     Тема: AI-планування цілей + гейміфікація")
print("=" * 65)

ai_prog_v = ag["progress"].mean();  mn_prog_v = mg["progress"].mean()
ai_comp_v = ag["completed"].mean()*100; mn_comp_v = mg["completed"].mean()*100
r_s, p_s  = stats.pearsonr(users["cur_streak"], users["avg_prog"])
r_g2,p_g2 = stats.pearsonr(users["gami"],       users["avg_prog"])

print(f"\n[03] Частота вибору:")
print(f"     AI-планування: {n_ai_total} цілей ({n_ai_total/total_g*100:.0f}%)")
print(f"     Вручну:        {n_mn_total} цілей ({n_mn_total/total_g*100:.0f}%)")

print(f"\n[02] Ефективність AI vs Manual:")
print(f"     Прогрес    — AI: {ai_prog_v:.1f}%  | Вручну: {mn_prog_v:.1f}%  | Δ = {ai_prog_v-mn_prog_v:+.1f}пп")
print(f"     Completion — AI: {ai_comp_v:.1f}%  | Вручну: {mn_comp_v:.1f}%  | Δ = {ai_comp_v-mn_comp_v:+.1f}пп")

print(f"\n[05] Survival (% цілей завершено):")
print(f"     AI: {surv_ai[-1]:.0f}%  | Вручну: {surv_mn[-1]:.0f}%  | Δ = {surv_ai[-1]-surv_mn[-1]:+.0f}пп")

print(f"\n[06] Стрік → Прогрес:        r={r_s:.2f}  p={p_s:.3f}  {'✅' if p_s<0.05 else '❌'}")
print(f"\n[08] Гейміфікація → Прогрес: r={r_g2:.2f}  p={p_g2:.3f}  {'✅' if p_g2<0.05 else '❌'}")
print(f"     Найкращий квадрант: {best_q} ({q_stats.loc[best_q,'mean']:.1f}%)")

print(f"\n[10] Типи завдань:")
print(f"     Найкраще виконують: {cr_df['Всі'].idxmax()} ({cr_df['Всі'].max():.0f}%)")
print(f"     Найгірше виконують: {cr_df['Всі'].idxmin()} ({cr_df['Всі'].min():.0f}%)")

print(f"\n[07] Категорії — AI adoption:")
for cat, row in cat_agg.sort_values("ai_pct", ascending=False).iterrows():
    bar_str = "█" * int(row["ai_pct"] / 10)
    print(f"     {cat:<26} {row['ai_pct']:4.0f}%  {bar_str}")
print()