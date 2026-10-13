"""Build the offline reference library. Timetables are source-bound, never inferred."""
from pathlib import Path
import json

ROOT=Path(__file__).resolve().parent
ALL=list(range(1,13))
def S(months, peak='', valley='', sharp='', note='', deep=''):
    return dict(months=months,peak=peak,valley=valley,sharp=sharp,note=note,deep=deep)
def R(name,scope,url,policy='',effective='',seasons=None,note='',reason=''):
    return dict(name=name,scope=scope,url=url,policy=policy,effective=effective,seasons=seasons or [],note=note,reason=reason)
def P(name,*regions): return dict(name=name,regions=list(regions))
pending=lambda name,url,reason='本次检索未完成最新适用时段核实，请查看官方资料与具体站点价格。': P(name,R('政策待核实','尚未核实最新充电设施适用时段',url,reason=reason))
provinces=[
P('北京',R('工商业','工商业分时电价；站点零售收费另行公示','https://www.beijing.gov.cn/zhengce/zcjd/202308/t20230822_3227446.html','京发改规〔2023〕11号','2023年政策',[
 S([2,3,4,5,6,9,10,11],'10:00—13:00、17:00—22:00','23:00—07:00'),
 S([7,8],'10:00—13:00、17:00—22:00','23:00—07:00','11:00—13:00、16:00—17:00'),
 S([1,12],'10:00—13:00、17:00—22:00','23:00—07:00','18:00—21:00')],note='按2023年政策资料整理；北京2026年交易工作方案仍引用该政策。')),
pending('天津','https://fzgg.tj.gov.cn/','已检索到津发改价管〔2025〕277号更新，需核对官方原文完整季节时段。'),
pending('河北','https://fgw.sjz.gov.cn/','河北南网与冀北电网分别执行；2025年出现时段更新，需按供电区域核实。'),
pending('山西','https://www.dt.gov.cn/dtszf/sxyw/202603/8280e05664be449c824db9198d48e4d5.shtml','2026年5月起调整为春夏秋冬四季时段，需核对完整新时段，暂不使用旧版。'),
pending('内蒙古','https://kdl.gov.cn/ztzl/zsyz/zyzc/202404/t20240407_837273.html','蒙西、蒙东电网分别执行，需核对内发改价费字〔2023〕1630、1631号完整时段。'),
P('辽宁',R('工商业','100千伏安及以上工商业；部分用户可选择','https://fgw.ln.gov.cn/fgw/index/tzgg/2023083014061818174/index.shtml','辽发改价格〔2023〕441号','2023-09-01',[
 S([2,3,4,5,6,9,10,11],'07:30—10:30、16:00—21:00','11:30—12:30、22:00—05:00'),
 S([1,7,8,12],'07:30—10:30、16:00—21:00','11:30—12:30、22:00—05:00','17:00—19:00')])),
P('吉林',R('工商业','非居民充换电设施按工商业规则执行；居民设施可选择其他规则','https://xxgk.jl.gov.cn/zcbm/fgw/xxgkmlqy/202501/t20250123_9045671.html','吉发改价格〔2025〕11号','2025-02-01；代理购电2025-04-01',[S(ALL,'08:00—10:00、16:00—21:00','23:00—05:00、11:00—14:00',note='尖峰按供需状况灵活启动，以提前公告为准。')])),
P('黑龙江',R('工商业','工商业政策参考；具体接电类型以原文为准','https://www.hlj.gov.cn/hljzqc/c100117/202410/c00_31778258.shtml','2024年峰谷分时电价调整文件','2024年调整资料',[S(ALL,'07:00—08:00、09:00—11:30、15:30—20:00','12:00—14:00、23:30—05:30')],note='本条仅录入已核实的峰、谷基本时段；特殊尖峰机制请查原文。')),
P('上海',R('两部制','一般工商业及其他两部制、大工业两部制','https://fgw.sh.gov.cn/fgw_jggl/20221216/e2652e3ab7ee49438d6e82af8880b160.html','沪发改价管〔2022〕50号','2023-01-01',[
 S([2,3,4,5,6,10,11],'08:00—11:00、18:00—21:00','22:00—06:00'),
 S([7,8],'08:00—15:00、18:00—21:00','22:00—06:00','12:00—14:00'),
 S([9],'08:00—15:00、18:00—21:00','22:00—06:00'),
 S([1,12],'08:00—11:00、18:00—21:00','22:00—06:00','19:00—21:00')]),
 R('单一制','一般工商业及其他单一制','https://fgw.sh.gov.cn/fgw_jggl/20221216/e2652e3ab7ee49438d6e82af8880b160.html','沪发改价管〔2022〕50号','2023-01-01',[S(ALL,'06:00—22:00','22:00—06:00')])),
pending('江苏','https://www.jsxishan.gov.cn/doc/2025/06/04/4586208.shtml'),
P('浙江',R('集中式充换电','向电网直接报装的经营性集中式充换电设施代理购电用户','https://zjjcmspublic.oss-cn-hangzhou-zwynet-d01-a.internet.cloud.zj.gov.cn/jcms_files/jcms1/web3235/site/attach/0/74750626b30849a79d2910a77092f6b1.pdf','浙发改价格〔2023〕316号；2025年11月公示附表3','2025年11月公示资料',[
 S([2,3,4,5,6,9,10,11],'08:00—11:00、13:00—17:00','11:00—13:00、22:30—08:00'),
 S([1,7,8,12],'08:00—09:00、21:00—22:30','11:00—13:00、22:30—08:00','09:00—11:00、13:00—17:00')],note='春节、劳动节、国庆节假期10:00—14:00为深谷；具体假期以国家公布为准。此处不将节假日时段显示为整月通用。'),
 R('普通工商业','普通工商业政策；不套用集中式充换电专用时段','https://zjjcmspublic.oss-cn-hangzhou-zwynet-d01-a.internet.cloud.zj.gov.cn/jcms_files/jcms1/web3235/site/attach/0/74750626b30849a79d2910a77092f6b1.pdf','浙发改价格〔2024〕21号；公示附表1','2024年政策；2025年公示',[
 S([2,3,4,5,6,9,10,11],'08:00—11:00、13:00—17:00','00:00—08:00、11:00—13:00'),
 S([1,7,8,12],'08:00—09:00、17:00—23:00','00:00—08:00、11:00—13:00','09:00—11:00、15:00—17:00')],note='节假日深谷另行执行；请核对站点是否属于专用充换电类型。')),
P('安徽',R('工商业','100千伏安及以上工商业；以下可按年度选择','https://fgw.huainan.gov.cn/tzgg/551823170.html','皖发改价格〔2025〕302号','2025-07-01',[
 S([2,3,4,5,6,10,11],'06:00—08:00、16:00—22:00','11:00—14:00、23:00—06:00'),
 S([7,8,9],'16:00—24:00','02:00—09:00、11:00—13:00'),
 S([1,12],'15:00—23:00','12:00—14:00、23:00—06:00')],note='315千伏安及以上两部制工业用电另有尖峰与节假日深谷：7/15—8/31的20:00—22:00、12/15—1/31的19:00—21:00为尖峰；三天及以上节假日11:00—15:00为深谷。不将限定工业规则直接套用于所有充电站。')),
P('福建',R('工商业','工商业政策参考；市场已形成分时价格的按市场规则','https://fgw.fujian.gov.cn/jdhy/zcwd/jggl_60675/202312/t20231220_6362350.htm','闽发改规〔2023〕8号政策解读','2023年政策资料',[
 S([1,2,3,4,5,6,10,11,12],'10:00—12:00、15:00—20:00、21:00—22:00','00:00—08:00'),
 S([7,8,9],'10:00—12:00、15:00—20:00、21:00—22:00','00:00—08:00','11:00—12:00、17:00—18:00')])),
pending('江西','https://www.chaisang.gov.cn/zwgk/zfxxgk/xzxxgk/czz/zdgk_149095/fgzc/zcwj/202510/t20251014_7030914.html'),
pending('山东','https://jndpc.jinan.gov.cn/col/col2191/art/2026/art_34386df0ed6d4a3ea80720d55da3709e.html','2026-10-01起实施新时段，需核对最新全年表，暂不采用2025年旧表。'),
pending('河南','https://public.zhengzhou.gov.cn/D300201X/8452948.jhtml'),
pending('湖北','https://jxt.hubei.gov.cn/bmdt/zngz/202504/t20250411_5612993.shtml'),
P('湖南',R('工商业','工商业用电；小容量及特定行业可选择','https://fgw.hunan.gov.cn/fgw/jgzc11/202507/t20250702_33733479.html','2025年优化分时电价政策','2025-08-01',[
 S([2,3,4,5,6,9,10,11],'16:00—24:00','00:00—06:00、12:00—14:00'),
 S([7,8],'16:00—24:00','00:00—06:00、12:00—14:00','20:00—24:00'),
 S([1,12],'16:00—24:00','00:00—06:00、12:00—14:00','18:00—22:00')])),
P('广东',R('广东（不含深圳）','工商业峰谷时段；公用站另有服务费','https://www.gzns.gov.cn/zwgk/zdlyxxgk/jghsf/jgzf/content/post_7760625.html','粤发改价格〔2021〕331号','2021-10-01',[S(ALL,'10:00—12:00、14:00—19:00','00:00—08:00')],note='夏季及其他月份高温天可能执行尖峰规则，具体行业与条件见原文。'),
 R('深圳','深圳工业用户政策参考；具体站点收费以公示为准','https://www.sz.gov.cn/hdjlpt/detail?pid=3465596&via=pc','深发改〔2021〕1005号；2026年政府答复','2021年政策；2026年答复',[
 S([1,2,3,4,5,6,10,11,12],'10:00—12:00、14:00—19:00','00:00—08:00',note='其他月份日最高气温达到35℃及以上时，规定用户可能执行11:00—12:00、15:00—17:00尖峰。'),
 S([7,8,9],'10:00—12:00、14:00—19:00','00:00—08:00','11:00—12:00、15:00—17:00',note='尖峰适用于大量、高需求工业及普通工业专变用户，不能直接等同所有公用站规则。')])),
pending('广西','https://fgw.gxzf.gov.cn/'),
pending('海南','https://plan.hainan.gov.cn/','2024年电动汽车峰谷政策按迎峰度夏和其他月份区分，需核对新文件，不能沿用2020年旧表。'),
pending('重庆','https://fzggw.cq.gov.cn/hdjl/gkxx/lxxd/detail_wap.html?metadataId=1071705'),
pending('四川','https://fgw.sc.gov.cn/'),
pending('贵州','https://www.leishan.gov.cn/xwzx/tzgg/202504/t20250411_87506760.html'),
pending('云南','https://www.baoshan.gov.cn/info/5278/10098344.htm'),
pending('西藏','https://drc.xizang.gov.cn/zwgk_1941/tadf/202409/t20240918_437047.html','大工业按丰枯季节设置不同时段；一般工商业的分季节价格不能等同日内峰谷时段。'),
pending('陕西','https://fgw.ankang.gov.cn/Content-2839938.html'),
pending('甘肃','https://linxia.gov.cn/lxz/zwgk/bmwj/art/2024/art_e81d003a037d49e6b58cd2cb5265d21c.html'),
pending('青海','https://xbj.nea.gov.cn/xxgk/zcjd/202603/t20260320_298288.html','2026年直接参与市场交易的主体不再人为规定分时电价水平与时段；代理购电另行核实。'),
pending('宁夏','https://fzggw.nx.gov.cn/'),
P('新疆',R('新疆电网','工商业政策参考；北京时间；其他电网需单独核实','https://xjdrc.xinjiang.gov.cn/xjfgw/c108361/202205/8b04057426994741a337e65414673938.shtml','2022年改革方案；2023年进一步完善分时电价通知','2022年基本时段；2023年调整',[
 S([1,2,3,4,9,10,11,12],'08:00—11:00、19:00—24:00','02:00—08:00、14:00—16:00'),
 S([5,6,7,8],'08:00—11:00、19:00—24:00','02:00—08:00、14:00—16:00',deep='14:00—16:00')],note='尖峰机制与执行范围请核对2023年通知；未把兵团或地方电网视为统一规则。')),
pending('香港','https://www.emsd.gov.hk/','香港由不同电力公司供电，没有可直接套用内地省级规则的统一公用充电峰谷表；按运营商收费核对。'),
pending('澳门','https://www.cem-macau.com/','澳门按当地电力及充电运营商收费执行，不能套用内地省级峰谷政策。'),
pending('台湾','https://www.taipower.com.tw/','当地时间电价及公用充电收费与内地制度不同，需按运营商、计价种类和季节核对。')
]
# Optional additional source-verified entries are maintained separately.
extra=ROOT/'tariff-additions.json'
if extra.exists():
    additions=json.loads(extra.read_text('utf-8'))
    for i,p in enumerate(provinces):
        if p['name'] in additions: provinces[i]=dict(name=p['name'],regions=additions[p['name']])
data=dict(version=1,checkedAt='2026-10-13',provinces=provinces)
(ROOT/'web'/'tariffs.js').write_text('window.TARIFFS = '+json.dumps(data,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
print('Regions:',len(provinces),'with schedules:',sum(any(r['seasons'] for r in p['regions']) for p in provinces))
