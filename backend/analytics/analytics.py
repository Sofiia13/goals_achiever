"""
analytics.py — запускається одним скриптом, зберігає кожен графік окремо
Використання: python3 analytics.py
Графіки зберігаються в папці charts/
"""

import json, os, sys, warnings
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
    "bg":      "#F2EBD9", "surface": "#FAF6EE", "dark":  "#2C3E2D",
    "green":   "#4A7C59", "sage":    "#7FAF8A",  "muted": "#7A8C7B",
    "clay":    "#C4835A", "light":   "#D4E8D8",  "grid":  "#E8DFC8",
}

plt.rcParams.update({
    "figure.facecolor": C["bg"],  "axes.facecolor": C["surface"],
    "axes.edgecolor":   C["muted"], "axes.labelcolor": C["dark"],
    "xtick.color":      C["muted"], "ytick.color":     C["muted"],
    "text.color":       C["dark"],  "grid.color":      C["grid"],
    "grid.alpha": 0.7, "font.family": "serif",
    "axes.spines.top": False, "axes.spines.right": False,
    "axes.titlesize": 13, "axes.labelsize": 11,
})

def save(fig, filename):
    path = os.path.join(CHARTS_DIR, filename)
    fig.savefig(path, dpi=150, bbox_inches="tight", facecolor=C["bg"])
    plt.close(fig)
    print(f"  ✅  {filename}")

# ── Дані ──────────────────────────────────────────────────────────────────
with open(os.path.join(HERE, "analytics_data.json")) as f:
    raw = json.load(f)

users = pd.DataFrame(raw["users"]).rename(columns={
    "currentStreak":"current_streak","longestStreak":"longest_streak",
    "totalGoals":"total_goals","completedGoals":"completed_goals",
    "avgProgress":"avg_progress","aiGoals":"ai_goals","manualGoals":"manual_goals",
})
users["short_name"] = users["name"].apply(
    lambda n: n.split()[0]+" "+n.split()[1][0]+"." if len(n.split())>1 else n)
users["user_id"] = users["id"]
users["goal_completion_rate"] = users["completed_goals"] / users["total_goals"].replace(0,1) * 100

goals = pd.DataFrame(raw["goals"]).rename(columns={
    "isAI":"is_ai","userId":"user_id","taskCount":"task_count","tasksDone":"tasks_done"})
goals["is_ai"]     = goals["is_ai"].astype(bool)
goals["completed"] = goals["completed"].astype(bool)
goals["progress"]  = goals["progress"].astype(float)

tasks = pd.DataFrame(raw["tasks"]).rename(columns={
    "isAI":"is_ai","userId":"user_id","goalId":"goal_id"})
tasks["is_ai"] = tasks["is_ai"].astype(bool)

tcr = tasks.groupby("user_id").apply(lambda df: (df["status"]=="done").mean()*100).reset_index(name="task_completion_rate")
users = users.merge(tcr, on="user_id", how="left").fillna({"task_completion_rate": 0})

print(f"\n📦  Завантажено: {len(users)} юзерів · {len(goals)} цілей · {len(tasks)} тасок")
print("📊  Генерація графіків...\n")

# ══════════════════════════════════════════════════════════════════════════
# 1. СТРІКИ
# ══════════════════════════════════════════════════════════════════════════
u = users.sort_values("current_streak", ascending=True)
fig, ax = plt.subplots(figsize=(12, 9))
fig.suptitle("Стріки користувачів", fontsize=16, fontweight="bold", color=C["dark"])
y = np.arange(len(u)); h = 0.38
ax.barh(y+h/2, u["longest_streak"], h, color=C["light"], label="Найдовший стрік", zorder=2)
bar_colors = [C["clay"] if s>=15 else C["green"] if s>=8 else C["sage"] for s in u["current_streak"]]
ax.barh(y-h/2, u["current_streak"], h, color=bar_colors, zorder=3)
ax.set_yticks(y); ax.set_yticklabels(u["short_name"], fontsize=9)
ax.set_xlabel("Кількість днів підряд")
ax.set_title("Порівняння поточного і максимального стріку", color=C["muted"], pad=8)
ax.grid(axis="x", zorder=1)
for i,(cur,lng) in enumerate(zip(u["current_streak"],u["longest_streak"])):
    ax.text(cur+0.2, i-h/2, str(cur), va="center", fontsize=8)
    ax.text(lng+0.2, i+h/2, str(lng), va="center", fontsize=8, color=C["muted"])
ax.legend(handles=[
    mpatches.Patch(color=C["clay"],  label="≥ 15 днів 🔥"),
    mpatches.Patch(color=C["green"], label="8–14 днів 📈"),
    mpatches.Patch(color=C["sage"],  label="< 8 днів 🌱"),
    mpatches.Patch(color=C["light"], label="Максимальний стрік"),
], loc="lower right", fontsize=9)
fig.tight_layout(); save(fig, "01_streaks.png")

# ══════════════════════════════════════════════════════════════════════════
# 2. AI vs MANUAL
# ══════════════════════════════════════════════════════════════════════════
ai_g=goals[goals["is_ai"]]; manual_g=goals[~goals["is_ai"]]
ai_t=tasks[tasks["is_ai"]]; manual_t=tasks[~tasks["is_ai"]]
metrics = {
    "Виконано цілей\n(completion rate)": (ai_g["completed"].mean()*100, manual_g["completed"].mean()*100),
    "Середній прогрес\nпо цілях (%)":    (ai_g["progress"].mean(),       manual_g["progress"].mean()),
    "Виконано тасок\n(task done rate)":  (ai_t["status"].eq("done").mean()*100, manual_t["status"].eq("done").mean()*100),
}
fig, axes = plt.subplots(1,3,figsize=(14,6))
fig.suptitle("AI-планування vs Ручне планування", fontsize=16, fontweight="bold", color=C["dark"])
for ax,(label,(ai_v,manual_v)) in zip(axes,metrics.items()):
    bars = ax.bar(["🤖 AI","✍️ Manual"],[ai_v,manual_v],color=[C["green"],C["clay"]],width=0.5,zorder=2)
    ax.set_ylim(0,105); ax.set_title(label,fontsize=11,pad=10); ax.grid(axis="y",zorder=1); ax.set_ylabel("%")
    for bar,val in zip(bars,[ai_v,manual_v]):
        ax.text(bar.get_x()+bar.get_width()/2, val+1.5, f"{val:.1f}%", ha="center", fontsize=13, fontweight="bold")
    diff=ai_v-manual_v; sign="+" if diff>=0 else ""
    ax.text(0.5,0.06,f"Різниця: {sign}{diff:.1f}pp",ha="center",transform=ax.transAxes,fontsize=10,
            color=C["green"] if diff>=0 else C["clay"],fontweight="bold",
            bbox=dict(boxstyle="round,pad=0.3",facecolor=C["light"],alpha=0.8))
fig.tight_layout(rect=[0,0,1,0.95]); save(fig, "02_ai_vs_manual.png")

# ══════════════════════════════════════════════════════════════════════════
# 3. ВОРОНКА
# ══════════════════════════════════════════════════════════════════════════
stages=[("Всього цілей",len(goals)),("Розпочато (>0%)",int((goals["progress"]>0).sum())),
        ("Чверть (≥25%)",int((goals["progress"]>=25).sum())),("Половина (≥50%)",int((goals["progress"]>=50).sum())),
        ("Майже (≥80%)",int((goals["progress"]>=80).sum())),("Завершено (100%)",int(goals["completed"].sum()))]
labels=[s[0] for s in stages]; values=[s[1] for s in stages]; total=values[0]
fig,ax=plt.subplots(figsize=(11,7))
fig.suptitle("Воронка виконання цілей",fontsize=16,fontweight="bold",color=C["dark"])
bar_colors=[C["green"],"#5A9B6E","#7FAF8A","#A8C9B0",C["clay"],"#8B5A3A"]
y=np.arange(len(labels))
bars=ax.barh(y,values,color=bar_colors,height=0.6,zorder=2)
ax.set_yticks(y); ax.set_yticklabels(labels,fontsize=11)
ax.set_xlabel("Кількість цілей"); ax.grid(axis="x",zorder=1); ax.set_xlim(0,total*1.3)
ax.set_title("Де втрачаються користувачі на шляху до мети?",color=C["muted"],pad=8)
for bar,val in zip(bars,values):
    ax.text(val+0.3,bar.get_y()+bar.get_height()/2,f"{val}  ({val/total*100:.0f}%)",va="center",fontsize=11,fontweight="bold")
for i in range(1,len(values)):
    drop=values[i-1]-values[i]
    if drop>0:
        ax.text(values[i]/2,i-0.47,f"▼ відсів {drop} ({drop/values[i-1]*100:.0f}%)",
                ha="center",fontsize=8,color=C["muted"],style="italic")
fig.tight_layout(); save(fig, "03_goal_funnel.png")

# ══════════════════════════════════════════════════════════════════════════
# 4. РЕГРЕСІЯ стрік → прогрес
# ══════════════════════════════════════════════════════════════════════════
x=users["current_streak"].values.astype(float); yv=users["avg_progress"].values.astype(float)
r,p=stats.pearsonr(x,yv)
reg=LinearRegression().fit(x.reshape(-1,1),yv)
xl=np.linspace(x.min(),x.max(),100)
fig,ax=plt.subplots(figsize=(11,7))
fig.suptitle("Регресія: чи впливає стрік на прогрес?",fontsize=16,fontweight="bold",color=C["dark"])
median_p=np.median(yv)
sc_colors=[C["clay"] if v>=median_p else C["sage"] for v in yv]
ax.scatter(x,yv,c=sc_colors,s=100,zorder=4,alpha=0.9)
ax.plot(xl,reg.predict(xl.reshape(-1,1)),color=C["dark"],linewidth=2,linestyle="--",zorder=3)
for _,row in users.iterrows():
    ax.annotate(row["short_name"],(row["current_streak"],row["avg_progress"]),
                xytext=(5,4),textcoords="offset points",fontsize=7.5,color=C["muted"])
ax.set_xlabel("Поточний стрік (днів підряд)"); ax.set_ylabel("Середній прогрес по цілях (%)")
ax.grid(zorder=1)
sig="статистично значуща ✅" if p<0.05 else "незначуща (p>0.05) ❌"
direction="позитивна" if r>0 else "негативна"
ax.text(0.03,0.92,f"Кореляція Пірсона:  r = {r:.2f}   p = {p:.3f}\nЗалежність {direction} — {sig}",
        transform=ax.transAxes,fontsize=9,
        bbox=dict(boxstyle="round,pad=0.4",facecolor=C["light"],alpha=0.85))
ax.legend(handles=[mpatches.Patch(color=C["clay"],label=f"Вищий за медіану ({median_p:.0f}%)"),
                   mpatches.Patch(color=C["sage"],label="Нижчий за медіану")],fontsize=9)
fig.tight_layout(); save(fig, "04_regression.png")

# ══════════════════════════════════════════════════════════════════════════
# 5. КЛАСТЕРИЗАЦІЯ
# ══════════════════════════════════════════════════════════════════════════
features=users[["current_streak","avg_progress","task_completion_rate"]].fillna(0)
users["cluster"]=KMeans(n_clusters=3,random_state=42,n_init=10).fit_predict(StandardScaler().fit_transform(features))
scores={c:users.loc[users["cluster"]==c,["current_streak","avg_progress","task_completion_rate"]].mean().sum() for c in range(3)}
rank=sorted(scores,key=scores.get,reverse=True)
cl_meta={rank[0]:("🏆 Чемпіони",C["clay"]),rank[1]:("📈 Зростають",C["green"]),rank[2]:("🌱 Початківці",C["sage"])}
fig,(ax1,ax2)=plt.subplots(1,2,figsize=(14,7))
fig.suptitle("Кластеризація користувачів (K-Means, k=3)",fontsize=16,fontweight="bold",color=C["dark"])
for c in range(3):
    mask=users["cluster"]==c; label,color=cl_meta[c]
    ax1.scatter(users.loc[mask,"current_streak"],users.loc[mask,"avg_progress"],color=color,s=110,zorder=3,label=label,alpha=0.9)
    for _,row in users[mask].iterrows():
        ax1.annotate(row["short_name"],(row["current_streak"],row["avg_progress"]),xytext=(4,3),textcoords="offset points",fontsize=7,color=C["muted"])
ax1.set_xlabel("Поточний стрік (днів)"); ax1.set_ylabel("Середній прогрес (%)")
ax1.set_title("Стрік vs Прогрес",pad=8); ax1.legend(fontsize=10); ax1.grid(zorder=1)
ax2.axis("off")
rows=[[cl_meta[c][0],str(int((users["cluster"]==c).sum())),
       f"{users.loc[users['cluster']==c,'current_streak'].mean():.1f} д.",
       f"{users.loc[users['cluster']==c,'avg_progress'].mean():.1f}%",
       f"{users.loc[users['cluster']==c,'task_completion_rate'].mean():.1f}%",
       f"{users.loc[users['cluster']==c,'money'].mean():.0f}"] for c in range(3)]
table=ax2.table(cellText=rows,colLabels=["Кластер","Юзерів","Стрік","Прогрес","Таски done","Монети"],loc="center",cellLoc="center")
table.auto_set_font_size(False); table.set_fontsize(11); table.scale(1.3,2.5)
for (row,col),cell in table.get_celld().items():
    cell.set_edgecolor(C["grid"])
    if row==0: cell.set_facecolor(C["dark"]); cell.set_text_props(color="white",fontweight="bold")
    else: cell.set_facecolor(cl_meta[row-1][1]+"33")
ax2.set_title("Характеристики кожного кластера",pad=20)
fig.tight_layout(); save(fig, "05_clusters.png")

# ══════════════════════════════════════════════════════════════════════════
# 6. ТИПИ ТАСОК
# ══════════════════════════════════════════════════════════════════════════
ai_tasks=tasks[tasks["is_ai"]].copy().merge(goals[["id","title"]],left_on="goal_id",right_on="id")
pivot=ai_tasks.groupby(["title","type"]).size().unstack(fill_value=0)
pivot_pct=pivot.div(pivot.sum(axis=1),axis=0)*100
type_colors={"learn":C["green"],"practice":C["clay"],"review":C["sage"],"reflect":"#A0785A","daily":C["muted"],"manual":"#BBBFBA"}
type_ua={"learn":"Вивчення","practice":"Практика","review":"Повторення","reflect":"Рефлексія","daily":"Щоденні","manual":"Ручні"}
fig,(ax1,ax2)=plt.subplots(1,2,figsize=(16,7))
fig.suptitle("Типи тасок у AI-цілях",fontsize=16,fontweight="bold",color=C["dark"])
bottom=np.zeros(len(pivot_pct))
for col in pivot_pct.columns:
    vals=pivot_pct[col].values
    ax1.bar(pivot_pct.index,vals,bottom=bottom,color=type_colors.get(col,"#aaa"),label=type_ua.get(col,col),zorder=2,width=0.6)
    for i,(v,b) in enumerate(zip(vals,bottom)):
        if v>10: ax1.text(i,b+v/2,f"{v:.0f}%",ha="center",va="center",fontsize=8,color="white",fontweight="bold")
    bottom+=vals
ax1.set_xticklabels(pivot_pct.index,rotation=35,ha="right",fontsize=9)
ax1.set_ylabel("Частка тасок (%)"); ax1.set_title("Структура тасок по кожній цілі",pad=8)
ax1.legend(title="Тип таски",fontsize=9); ax1.set_ylim(0,115); ax1.grid(axis="y",zorder=1)
tbt=ai_tasks["type"].value_counts()
wedges,texts,autotexts=ax2.pie(tbt.values,labels=[f"{type_ua.get(t,t)}\n({v})" for t,v in tbt.items()],
    colors=[type_colors.get(t,"#aaa") for t in tbt.index],autopct="%1.0f%%",startangle=140,pctdistance=0.75,
    wedgeprops={"edgecolor":C["bg"],"linewidth":2})
for at in autotexts: at.set_fontsize(10); at.set_color("white"); at.set_fontweight("bold")
ax2.set_title("Загальний розподіл типів\n(всі AI-таски)",pad=8)
fig.tight_layout(); save(fig, "06_task_types.png")

# ══════════════════════════════════════════════════════════════════════════
# 7. ТЕПЛОВА КАРТА
# ══════════════════════════════════════════════════════════════════════════
ph=goals.pivot_table(index="user_id",columns="title",values="progress",aggfunc="mean")
ph.index=ph.index.map(users.set_index("user_id")["short_name"])
fig,ax=plt.subplots(figsize=(16,9))
fig.suptitle("Теплова карта: прогрес кожного юзера по кожній цілі",fontsize=16,fontweight="bold",color=C["dark"])
cmap=mcolors.LinearSegmentedColormap.from_list("c",[C["surface"],C["sage"],C["green"],C["clay"]])
data=ph.fillna(-1).values; masked=np.ma.masked_where(data<0,data)
im=ax.imshow(masked,cmap=cmap,vmin=0,vmax=100,aspect="auto")
ax.set_xticks(range(len(ph.columns))); ax.set_xticklabels(ph.columns,rotation=35,ha="right",fontsize=9)
ax.set_yticks(range(len(ph.index))); ax.set_yticklabels(ph.index,fontsize=9)
for i in range(len(ph.index)):
    for j in range(len(ph.columns)):
        val=data[i,j]
        if val>=0: ax.text(j,i,f"{val:.0f}%",ha="center",va="center",fontsize=8,fontweight="bold",color="white" if val>55 else C["dark"])
        else: ax.text(j,i,"—",ha="center",va="center",fontsize=10,color=C["muted"])
cbar=fig.colorbar(im,ax=ax,pad=0.02,fraction=0.03); cbar.set_label("Прогрес (%)",fontsize=10)
ax.set_title("«—» = ціль не призначена юзеру",color=C["muted"],pad=8)
fig.tight_layout(); save(fig, "07_progress_heatmap.png")

# ══════════════════════════════════════════════════════════════════════════
# 8. МОНЕТИ
# ══════════════════════════════════════════════════════════════════════════
fig,axes=plt.subplots(1,2,figsize=(14,6))
fig.suptitle("Монети 💰 — звідки вони беруться?",fontsize=16,fontweight="bold",color=C["dark"])
def scatter_reg(ax,x_col,x_label,title):
    xv=users[x_col].values.astype(float); yv=users["money"].values.astype(float)
    r,p=stats.pearsonr(xv,yv)
    reg=LinearRegression().fit(xv.reshape(-1,1),yv)
    xl=np.linspace(xv.min(),xv.max(),100)
    ax.scatter(xv,yv,c=C["green"],s=users["total_goals"]*22,zorder=3,alpha=0.85)
    ax.plot(xl,reg.predict(xl.reshape(-1,1)),color=C["clay"],linewidth=2,linestyle="--",zorder=2)
    for _,row in users.iterrows():
        ax.annotate(row["short_name"],(row[x_col],row["money"]),xytext=(4,3),textcoords="offset points",fontsize=7,color=C["muted"])
    ax.text(0.03,0.93,f"r = {r:.2f}   p = {p:.3f}   {'✅ є зв`язок' if p<0.05 else '❌ зв`язку немає'}",
            transform=ax.transAxes,fontsize=9,bbox=dict(boxstyle="round,pad=0.3",facecolor=C["light"],alpha=0.85))
    ax.set_xlabel(x_label); ax.set_ylabel("Монети 💰"); ax.set_title(title,pad=8); ax.grid(zorder=1)
    ax.text(0.03,0.05,"Розмір точки = кількість цілей",transform=ax.transAxes,fontsize=8,color=C["muted"],style="italic")
scatter_reg(axes[0],"current_streak","Поточний стрік (днів)","Більший стрік → більше монет?")
scatter_reg(axes[1],"avg_progress","Середній прогрес (%)","Кращий прогрес → більше монет?")
fig.tight_layout(); save(fig, "08_money_correlation.png")

print(f"\n🎉  Готово! Графіки збережено в  {CHARTS_DIR}\n")