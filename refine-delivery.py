from pathlib import Path
root=Path(__file__).resolve().parent
app=root/'web'/'app.js'
text=app.read_text('utf-8')
changes=[
 ("<span>加权均价 / 元每度</span>","<span>均价 / 元每度</span>"),
 ("const native = typeof window.Android === 'object' ? window.Android : null;","const native = window.Android && typeof window.Android.load === 'function' ? window.Android : null;"),
 ("${ready?'daily':'warning'}\">${ready?'政策资料':'待核实'}", "${ready&&region.verified!==false?'daily':'warning'}\">${ready?(region.verified===false?'转载待核':'政策资料'):'待核实'}"),
 ("<span><i class=\"legend-dot sharp\"></i>尖峰</span></div>","<span><i class=\"legend-dot sharp\"></i>尖峰</span>${s.deep?'<span><i class=\"legend-dot deep\"></i>深谷</span>':''}</div>"),
 ("查看官方来源</a>","${region.verified===false?'查看转载来源':'查看官方来源'}</a>"),
 ("尚未核实的地区不填写推测时段。", "转载资料已单独标为待核；未收录的区域不填写推测时段。"),
 ("native.copy(exportContent);toast('Markdown 已复制');", "if(native.copy(exportContent))toast('Markdown 已复制');else toast('内容过长或复制未成功，请导出文件。');"),
]
for old,new in changes:
 if old==new:continue
 if old not in text:
  if new in text:continue
  raise RuntimeError('Missing replacement: '+old)
 if text.count(old)!=1:raise RuntimeError('Ambiguous replacement: '+old)
 text=text.replace(old,new)
app.write_text(text,encoding='utf-8')
css=root/'web'/'styles.css'
text=css.read_text('utf-8')
if '.record-title,.record-energy{display:block}' not in text:
 text+='\n.record-title,.record-energy{display:block}.record-meta{font-size:12px}.record-energy{font-size:12px}.nav-button{font-size:12px}.station-row>div{min-width:0}.station-row strong,.detail-grid strong{overflow-wrap:anywhere}.station-row>strong{white-space:nowrap}.legend-dot.deep{background:#138f88}\n'
css.write_text(text,encoding='utf-8')
java=root/'android/app/src/main/java/cn/chargeledger/app/MainActivity.java'
text=java.read_text('utf-8').replace('Executors.newSingleThreadExecutor()', 'Executors.newFixedThreadPool(2)')
java.write_text(text,encoding='utf-8')
print('UI and source labels updated')
