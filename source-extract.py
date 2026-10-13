"""Read official reference pages locally when the research service cannot fetch them."""
from pathlib import Path
import concurrent.futures, subprocess, re, json, sys
sys.stdout.reconfigure(encoding='utf-8')
from html.parser import HTMLParser
root=Path(__file__).resolve().parent
out=root/'.tools'/'references';out.mkdir(exist_ok=True)
urls={
'jiangxi':'https://www.hukou.gov.cn/fgw/fdzdgknr/zdlyxx/jgsf/202506/t20250625_6936174.html',
'chongqing':'https://fzggw.cq.gov.cn/hdjl/gkxx/lxxd/detail_wap.html?metadataId=1071705',
'gansu':'https://linxia.gov.cn/lxz/zwgk/bmwj/art/2024/art_e81d003a037d49e6b58cd2cb5265d21c.html',
'shaanxi':'https://fgw.ankang.gov.cn/Content-2839938.html',
'ningxia':'https://fzggw.nx.gov.cn/tzgg/202301/t20230104_3903225.html',
'guizhou':'https://fgw.guizhou.gov.cn/zwgk2025/zdlyxx/jffw/qt/202307/P020250806595063477426.pdf',
'shanxi':'https://www.lvliang.gov.cn/llxxgk/zfxxgk/xxgkml/ggsydwxx_67083/gd_67091/202605/t20260515_2033389.html',
'neimenggu':'https://kdl.gov.cn/ztzl/zsyz/zyzc/202404/t20240407_837273.html',
'hubei':'https://media.hubei.gov.cn/zyxmt/push/weixin/202403/t20240329_5139254.shtml',
'qinghai':'https://www.qhzwfw.gov.cn/ygzw/008001/008001001/008001001001/20231208/dcb36787-83c1-416e-80ba-50713ec1d485.html',
'tibet':'https://drc.xizang.gov.cn/zwgk_1941/tadf/202510/P020251030384808860401.pdf',
}
class TextParser(HTMLParser):
 def __init__(self):super().__init__();self.ignore=0;self.parts=[]
 def handle_starttag(self,t,a):
  if t in ('script','style'):self.ignore+=1
  if t in ('p','div','br','tr','h1','h2','h3'):self.parts.append('\n')
 def handle_endtag(self,t):
  if t in ('script','style'):self.ignore=max(0,self.ignore-1)
 def handle_data(self,d):
  if not self.ignore:self.parts.append(d)
def extract(item):
 name,url=item;extension='.pdf' if '.pdf' in url else '.html';file=out/(name+extension)
 try:
  subprocess.run(['curl.exe','--fail','--ssl-no-revoke','--proxy','http://127.0.0.1:7890','-L','--max-time','35','-sS','-o',str(file),url],check=True,capture_output=True)
  if extension=='.pdf':
   import pypdf
   data='\n'.join(p.extract_text() or '' for p in pypdf.PdfReader(file).pages)
  else:
   raw=file.read_bytes();s=raw.decode('utf-8',errors='replace')
   if s.count('\ufffd')>20:s=raw.decode('gb18030',errors='replace')
   p=TextParser();p.feed(s);data=''.join(p.parts)
  (out/(name+'.txt')).write_text(data,encoding='utf-8')
  snippets=[x.strip() for x in data.splitlines() if re.search(r'\d{1,2}\s*[:：∶]\s*\d{2}|高峰时段|低谷时段|谷时段|深谷|尖峰',x)]
  return dict(name=name,url=url,snippets=snippets)
 except Exception as e:return dict(name=name,error=str(e))
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
 results=list(pool.map(extract,urls.items()))
(out/'extraction.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
for r in results:print(json.dumps(r,ensure_ascii=False))
