"""Download official Android build tools and Eclipse Temurin JDK into .tools only."""
from pathlib import Path
import concurrent.futures, hashlib, json, subprocess, zipfile, xml.etree.ElementTree as ET, argparse

ROOT = Path(__file__).resolve().parent
DEST = ROOT / '.tools'
DEST.mkdir(exist_ok=True)
parser=argparse.ArgumentParser()
parser.add_argument('--proxy',default='',help='Optional HTTP proxy URL, for example http://127.0.0.1:7890')
options=parser.parse_args()

def get(url, path):
    args=['curl.exe', '--fail', '--ssl-no-revoke', '-L', '--retry', '2', '--max-time', '600', '-sS', '-o', str(path), url]
    if options.proxy:args.extend(['--proxy',options.proxy])
    subprocess.run(args, check=True)

def package(name, url, digest, algorithm):
    archive = DEST / (name + '.zip')
    get(url, archive)
    actual = hashlib.new(algorithm, archive.read_bytes()).hexdigest()
    if actual.lower() != digest.lower():
        raise RuntimeError('Checksum mismatch: ' + name)
    target = DEST / name
    target.mkdir(exist_ok=True)
    with zipfile.ZipFile(archive) as z:
        z.extractall(target)
    print('READY: ' + name, flush=True)

if not (DEST/'repository.xml').exists():get('https://dl.google.com/android/repository/repository2-1.xml',DEST/'repository.xml')
if not (DEST/'jdk.json').exists():get('https://api.adoptium.net/v3/assets/latest/17/hotspot?architecture=x64&image_type=jdk&os=windows',DEST/'jdk.json')
repo = ET.parse(DEST / 'repository.xml').getroot()
jobs = []
for remote in repo:
    path = remote.attrib.get('path')
    if path not in ['platforms;android-35', 'build-tools;35.0.0']:
        continue
    if path == 'platforms;android-35' and any(x.tag.endswith('url') and x.text != 'platform-35_r02.zip' for x in remote.iter() if x.tag.endswith('url')):
        continue
    for archive in remote.iter():
        if not archive.tag.endswith('archive'):
            continue
        host = next((x.text for x in archive if x.tag.endswith('host-os')), None)
        if host not in [None, 'windows']:
            continue
        url = next(x.text for x in archive.iter() if x.tag.endswith('url'))
        checksum = next(x.text for x in archive.iter() if x.tag.endswith('checksum'))
        jobs.append(('platform' if path.startswith('platforms') else 'build-tools', 'https://dl.google.com/android/repository/' + url, checksum, 'sha1'))
asset = json.loads((DEST / 'jdk.json').read_text('utf-8'))[0]['binary']['package']
jobs.append(('jdk', asset['link'], asset['checksum'], 'sha256'))
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
    for result in pool.map(lambda args: package(*args), jobs):
        pass
